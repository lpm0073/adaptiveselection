import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';


import './styles.css';
import {ImageBox} from './ImageBox';
import { wpGetExclusions } from '../../shared/categories';
import { mediaUrl } from '../../shared/urls';
import { wpGetImage } from './wpImageLib';

const mapStateToProps = state => ({
    ...state
});
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
});


class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isCategoryInitialized: false,
      fetcherDelay: null,
      queueDelay: null,
      level: 0,
      page_number: Math.floor(Math.random() * 40),
      num_pages: 1000,   // <---- start high and interpolate downwards based on success/failure
      highest_confirmed_page: 0,
      category_exclusions: [],
      media_query: '',
      image_working_set: [],
      image_carousel: [],
      number_of_images: 10,
      image_last_position: 0, // the ordinal position of the most recently used image in the working set.
    }

    this.imageFetcher = this.imageFetcher.bind(this);
    this.handleChangeLevel = this.handleChangeLevel.bind(this);
    this.queueImage = this.queueImage.bind(this);
    this.isImageCollision = this.isImageCollision.bind(this);
    this.getNextImage = this.getNextImage.bind(this);
    this.addToImageCarousel = this.addToImageCarousel.bind(this);
    this.imagePositioning = this.imagePositioning.bind(this);
    this.removeFromImageCarousel = this.removeFromImageCarousel.bind(this);

  }


  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.level !== nextState.level) {
      console.log("the level changed.");
    }
    return true;
  }

  componentDidMount() {

    const self = this;
    const fetcherDelay = setTimeout(function() {
        self.handleChangeLevel();
        self.imageFetcher();
    }, 250);    
    this.setState({
      fetcherDelay: fetcherDelay
    });
  }

  componentWillUnmount() {
    clearTimeout(this.state.fetcherDelay);
    clearTimeout(this.state.queueDelay);
  }

  render() {
      return(
          <div className="home-page mt-5 pt-5">
            {this.state.image_carousel.length > 0 ? this.state.image_carousel.map((image) => {
                const images_per_row = this.state.number_of_images <= 3 ? this.state.number_of_images : 3;
                const maxWidth = (window.innerWidth / images_per_row) * .90;
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
                  />
                );
              })
              :
              <div>i am waiting</div>
            }
        </div>
      );
  
  }

  queueImage() {
    /* place a random image on a random imageKey at a random point in time. */
    if (this.state.image_working_set.length > 0 && this.state.image_carousel.length < this.state.number_of_images) {
      const imageKey = Math.floor(Math.random() * 1000000);
      const image = this.getNextImage();

      if (imageKey !== null && image !== null) {
        const images_per_row = this.state.number_of_images < 3 ? this.state.number_of_images : 3;
        const max_height = this.state.number_of_images > 3 ? window.screen.height / 2 : Math.floor((2/3) * window.screen.height);
        const max_width = Math.floor((2/3) * window.screen.width);
        const newImage = wpGetImage(image, images_per_row, max_height, max_width);
    
        if (!newImage) {
          console.log("queueImage() internal error: wpGetImage() did not return a value");
          return;
        }
    
        const obj = {
          key: imageKey,
          id: newImage.id,
          source_url: newImage.source_url,
          height: newImage.height,
          width: newImage.width,
          timestamp: new Date(),
          image_data: newImage,
          position: this.imagePositioning(newImage.width, newImage.height)
        }        
        
        this.addToImageCarousel(obj);
      }

      /* setup the dequeue event */
      const dequeueDelay = Math.floor(Math.random() * 30000);;
      const self = this;
      setTimeout(function() {self.removeFromImageCarousel(imageKey);}, dequeueDelay);   
    }
    
    /* queue the next iteration */
    const delay = this.state.image_carousel.length === 0 ? 500 : 10000;
    const self = this;
    const queueDelay = setTimeout(function() {self.queueImage();}, delay * Math.random());   
    this.setState({queueDelay: queueDelay});
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
    const images = this.state.image_working_set;
    if (images === null || images.length === 0) return null;
    var image, 
        i = this.state.image_last_position + 1,
        attempts = 0;
    do {
        if (i >= (images.length - 1)) i = 0;
        image = images[i];
        i++;
        if (!this.isImageCollision(image)) {
          this.setState({
            image_last_position: i
          });
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
    // interior 2/3 of curr viewpane.
    const X = window.innerWidth;
    const Y = window.innerHeight;
    const x_begin = ((1/6) * X);
    const x_end = X - ((1/6) * X);
    const y_begin = ((1/6) * Y);
    const y_end = Y - ((1/6) * Y);

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

    if (this.props.categories.isLoading && !this.state.isCategoryInitialized) {
      // we're not ready, so wait 500ms and then try again.
      const self = this;
      setTimeout(function() {
          self.handleChangeLevel();
      }, 500);
      return;
    }

    const cats = this.props.categories.items;
    const exclusions = wpGetExclusions(this.state.level, cats);
    this.setState({
      category_exclusions: exclusions,
      media_query: mediaUrl + "&" + exclusions,
      isCategoryInitialized: true
    });
  
  }

  imageFetcher() {

      const url = this.state.media_query + "&page=" + this.state.page_number;
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
        var image_working_set = images.filter(image => !(image.id in this.state.image_working_set.map(worker => {
          return worker.id;
        })))
        image_working_set = this.state.image_working_set.concat(image_working_set);

        if (this.state.image_carousel.length === 0) this.queueImage();

        this.setState({
          highest_confirmed_page: this.state.page_number,
          image_working_set: image_working_set,
          page_number:  Math.floor(Math.random() * this.state.num_pages)
        });
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
       var num_pages = this.state.num_pages > this.state.page_number ? this.state.num_pages - (this.state.num_pages - this.state.page_number)/2  : this.state.num_pages;
        num_pages = num_pages > this.state.highest_confirmed_page ? num_pages : this.state.highest_confirmed_page;
        const page_number = Math.floor(Math.random() * num_pages);

        this.setState({
          page_number: page_number,
          num_pages: num_pages
        });
      });
  
    const delay = this.state.image_working_set.length < (10 * this.state.number_of_images) ? 3000: 15000;

    const self = this;
    const fetcherDelay = setTimeout(function() {
        self.imageFetcher();
    }, delay * Math.random());
    this.setState({
      fetcherDelay: fetcherDelay
    });

  }


}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

