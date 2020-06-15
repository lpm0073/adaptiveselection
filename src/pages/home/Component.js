import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';


import './styles.css';
import ImageBox from './ImageBox';
import { wpGetExclusions, wpGetExclusionArray } from '../../shared/categories';
import { mediaUrl } from '../../shared/urls';
import { wpGetImage } from './wpImageLib';

const mapStateToProps = state => ({
    ...state
});
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
});

class Home extends Component {

  isCategoryInitialized = false;
  fetcherDelay = null;
  queueDelay = null;
  highest_confirmed_page = 0;
  image_working_set = [];
  image_last_position = 0; // the ordinal position of the most recently used image in the working set.
  last_image_queued = null;  // make sure initial date is stale
  page_number = 1 + Math.floor(Math.random() * 40);
  num_pages = 1000;   // <---- start high and interpolate downwards based on success/failure
  category_exclusions = [];
  media_query;

  constructor(props) {
    super(props);
    var d = new Date();
    
    this.last_image_queued = d.setDate(d.getDate()-5);

    this.state = {
      level: 0,
      image_carousel: [],
      number_of_images: 10,
    }

    this.imageFetcher = this.imageFetcher.bind(this);
    this.handleChangeLevel = this.handleChangeLevel.bind(this);
    this.queueImage = this.queueImage.bind(this);
    this.isImageCollision = this.isImageCollision.bind(this);
    this.getNextImage = this.getNextImage.bind(this);
    this.addToImageCarousel = this.addToImageCarousel.bind(this);
    this.imagePositioning = this.imagePositioning.bind(this);
    this.removeFromImageCarousel = this.removeFromImageCarousel.bind(this);
    this.getElapsedTime = this.getElapsedTime.bind(this);
    this.generateNewImageObject = this.generateNewImageObject.bind(this);
    this.existsClass = this.existsClass.bind(this);
    this.removeExclusions = this.removeExclusions.bind(this);

  }

  componentDidMount() {

    const self = this;
    this.fetcherDelay = setTimeout(function() {
        self.handleChangeLevel();
        self.imageFetcher();
    }, 50);    
  }

  componentWillUnmount() {
    clearTimeout(this.fetcherDelay);
    clearTimeout(this.queueDelay);
  }

  /* find any closed windows and remove these from the carousel */
  componentWillUpdate() {

    // window-closer class is added by a mousedown event handler in ImageBox
    var closedWindows = document.getElementsByClassName("window-closer"),
        key = 0;

    for (var i = 0; i < closedWindows.length; i++) {
      key = Number(closedWindows[i].id);
      this.removeFromImageCarousel(key);
    }

    // re-validate the working set and the carousel against our current
    // list of category exclusions.
    this.removeExclusions();
  }

  // returns true if there is an element in the DOM containing this class
  existsClass(className) {
    const elements = document.getElementsByClassName(className);
    return elements.length > 0;
  }

  render() {
      return(
          <div id="home-page" className="home-page mt-5 pt-5">
            {this.state.image_carousel.length > 0 ? this.state.image_carousel.map((image) => {

                var homePage = document.getElementById("home-page");
                const maxWidth = (homePage.offsetWidth * .75);
                const width = image.width < maxWidth ? image.width : maxWidth;
                const height = width === image.width ? image.height : width * image.image_data.aspect_ratio;

                return (
                  <ImageBox 
                    key={image.key}
                    imageKey={image.key}
                    url={image.source_url}
                    height = {height}
                    width = {width}
                    position_left = {image.position.left}
                    position_top = {image.position.top}
                    slope = {image.position.slope}
                    duration = {image.position.duration}
                    image = {image}
                  />
                );
              })
              :
              <div>i am waiting</div>
            }
        </div>
      );
  
  }

  generateNewImageObject() {
    const max_height = this.state.number_of_images > 3 ? window.screen.height / 2 : Math.floor((2/3) * window.screen.height);
    const max_width = Math.floor((2/3) * window.screen.width);
    const image = this.getNextImage();
    const newImage = wpGetImage(image, max_height, max_width);
    const imageKey = newImage.id;

    if (!newImage) {
      console.log("queueImage() internal error: wpGetImage() did not return a value");
      return;
    }

    return {
      key: imageKey,
      id: newImage.id,
      source_url: newImage.source_url,
      height: newImage.height,
      width: newImage.width,
      timestamp: new Date(),
      image_data: newImage,
      position: this.imagePositioning(newImage.width, newImage.height)
    }        

  }
  
  /* add a random image at a random location on the device screen. */
  queueImage() {
    // if we have images in our working set, and we need more images on screen
    if (this.image_working_set.length > 0 &&                                // we have images
        this.state.image_carousel.length < this.state.number_of_images &&   // the desktop wants images
        !this.existsClass("hovering") &&                                    // we're not hovering over an image at the moment
        this.getElapsedTime(this.last_image_queued) > 4500) {               // its been at least 4.5s since the last image was added

      const newImage = this.generateNewImageObject();   
      this.addToImageCarousel(newImage);

      /* setup the dequeue event */
      const dequeueDelay = 15000 + Math.floor(Math.random() * 45000);       // image lifespan of 15 to 60 seconds
      const self = this;
      setTimeout(function() {self.removeFromImageCarousel(newImage.key);}, dequeueDelay);   

      this.last_image_queued = new Date();

    }
    
    /* queue the next iteration */
    var delay = 5000;
    if (this.state.image_carousel.length <= 1) delay = 500;
    if (this.state.image_carousel.length < this.state.number_of_images) delay = 2000;

    const self = this;
    this.queueDelay = setTimeout(function() {self.queueImage();}, delay);   
  }

  // if level has changed downwards then the working set probably contains
  // content that is no longer conforms and needs to be purged.
  removeExclusions() {
    var category_exclusions = wpGetExclusionArray(this.state.level, this.props.categories.items),
        this_categories = [];

    for (var i=0; i < this.image_working_set.length; i++) {
        this_categories = this.image_working_set[i].categories;
        const intersection = this_categories.filter(element => category_exclusions.includes(element))
        if (intersection.length > 0 ) {
          const this_image = this.image_working_set[i]
          this.removeFromImageCarousel(this_image.id);
          this.image_working_set = this.image_working_set.filter(image => image.id !== this_image.id);
        }
    }
  }

  removeFromImageCarousel(key) {
    // build an array of all previous keys except for our new imageKey.
    // then push our newly generated image set onto the end of the array.
    var newImageSet = this.state.image_carousel.filter(carousel_image => carousel_image.key !== key);

    this.setState({
      image_carousel: newImageSet
    });

  }

  addToImageCarousel(newImage) {
    // build an array of all previous keys except for our new imageKey.
    // then push our newly generated image set onto the end of the array.
    var newImageSet = this.state.image_carousel;
    newImageSet.push(newImage);

    this.setState({
      image_carousel: newImageSet
    });

  }

  getNextImage() {
    const images = this.image_working_set;
    if (images === null || images.length === 0) return null;
    var image, 
        i = this.image_last_position + 1,
        attempts = 0;
    do {
        if (i >= (images.length - 1)) i = 0;
        image = images[i];
        i++;
        if (!this.isImageCollision(image)) {
          this.image_last_position = i;
          return image;
        }
        attempts++;
    } while (attempts <= 2 * images.length)

    return null;
  }

  isImageCollision(imageCandidate) {
    var retval = false;

    this.state.image_carousel
    .filter(image => imageCandidate.id === image.id)
    .map(image => {
      retval = true;
      return true;
    });

    return retval;

  }

  imagePositioning(image_width, image_height) {
    // build random trajectory that passes through the
    // interior 2/3 of curr view pane.
    const X = window.innerWidth;
    const Y = window.innerHeight;
    const x_begin = image_width / 2;
    const x_end = X - (image_width / 2);
    const y_begin = image_height / 2;
    const y_end = Y - (image_height / 2);

    const slope = (Math.random() * (2 * Math.PI));
    const duration = Math.floor(Math.random() * 30000);

    const image_center_x = x_begin + Math.floor(Math.random() * x_end);
    const image_center_y = y_begin + Math.floor(Math.random() * y_end);

    const css_absolute_position_x = Math.floor(image_center_x - (image_width / 2));
    const css_absolute_position_y = Math.floor(image_center_y - (image_height / 2));

    const position = {
      left: css_absolute_position_x,
      top: css_absolute_position_y,
      slope: slope,
      duration: duration
    }

    return position;
  }


  handleChangeLevel() {

    if (this.props.categories.isLoading && !this.isCategoryInitialized) {
      // we're not ready, so wait 500ms and then try again.
      const self = this;
      setTimeout(function() {
          self.handleChangeLevel();
      }, 500);
      return;
    }

    const cats = this.props.categories.items;
    this.isCategoryInitialized = true;
    this.category_exclusions = wpGetExclusions(this.state.level, cats);
    this.media_query = mediaUrl + "&" + this.category_exclusions;
    this.removeExclusions();
  
  }

  imageFetcher() {

      const url = this.media_query + "&page=" + this.page_number;
      fetch(url)
      .then(response => {
            if (response.ok) {
                return response;
            } else {
                var error = new Error('Error ' + response.status + ': ' + response.statusText);
                error.response = response;
                throw error;
            }
        },
        error => {
            var errmess = new Error(error.message);
            throw errmess;
      })
      .then(response => response.json())
      .then(images => {
        // only add unique return values, so that we don't accumulated duplicates in the working set
        var new_images = images.filter(image => !(image.id in this.image_working_set.map(worker => {
          return worker.id;
        })))
        this.image_working_set = this.image_working_set.concat(new_images);

        if (this.state.image_carousel.length === 0) this.queueImage();

        this.highest_confirmed_page = this.page_number;
        this.page_number = 1 + Math.floor(Math.random() * this.num_pages)
      })
      .catch(error => {
        /* most common error is when we query for non-existent page (we don't know how many pages there are) */
         /*
            {
              "code": "rest_post_invalid_page_number",
              "message": "The page number requested is larger than the number of pages available.",
              "data": {
                "status": 400
                }
            }
        */

      // try to reverse engineer the total number of pages avaiable.
        var num_pages = this.num_pages > this.page_number ? this.num_pages - (this.num_pages - this.page_number)/2  : this.num_pages;
        num_pages = num_pages > this.highest_confirmed_page ? num_pages : this.highest_confirmed_page;
        this.num_pages = num_pages;
        this.page_number = 1 + Math.floor(Math.random() * num_pages);

      });
  
    const delay = this.image_working_set.length < (10 * this.state.number_of_images) ? 1000: 15000;

    const self = this;
    this.fetcherDelay = setTimeout(function() {
        self.imageFetcher();
    }, delay * Math.random());

  }

  getElapsedTime(timestamp) {
    const d = new Date();
        return d - timestamp;
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

