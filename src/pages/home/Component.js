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
  last_image_queued = null;  // make sure initial date is stale
  page_number = 1 + Math.floor(Math.random() * 40);
  num_pages = 1000;   // <---- start high and interpolate downwards based on success/failure
  category_exclusions = [];
  media_query;

  constructor(props) {
    super(props);

    this.imageFetcher = this.imageFetcher.bind(this);
    this.handleChangeLevel = this.handleChangeLevel.bind(this);
    this.removeExclusions = this.removeExclusions.bind(this);
    this.processAnalytics = this.processAnalytics.bind(this);
    this.setAnalyticsTag = this.setAnalyticsTag.bind(this);

    this.queueImage = this.queueImage.bind(this);
    this.getNextImage = this.getNextImage.bind(this);
    this.imagePositioning = this.imagePositioning.bind(this);
    this.existsClass = this.existsClass.bind(this);
    this.serializedImage = this.serializedImage.bind(this);

    var d = new Date();
    
    this.last_image_queued = d.setDate(d.getDate()-5);

    this.state = {
      level: 0,
      number_of_images: 5,
    }
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

  render() {
      return(
          <div id="home-page" className="home-page">
            {this.props.imageCarousel.items.length > 0 ? this.props.imageCarousel.items.map((image) => {
              const max_height = window.screen.height / 2;
              const max_width = window.screen.width / 3;
              const imageProps = wpGetImage(image, max_height, max_width);

              image.source_url = imageProps.source_url;
              image.height = imageProps.height;
              image.width = imageProps.width;
              image.image_props = imageProps;
              if (!image.hasOwnProperty("position_props")) {
                image.position_props = this.imagePositioning(imageProps.width, imageProps.height);
              }

              return (
                <ImageBox key={image.key} image = {image} />
              );
            })
            :
             <div>i am waiting</div>
            }
        </div>
      );
  
  }

  /* add a random image at a random location on the device screen. */
  queueImage() {
    // do this first.
    // gather user analytics signals from class data embedded in the items in props.imageCarousel
    this.processAnalytics();

    // re-validate the working set and the carousel against our current
    // list of category exclusions.
    this.removeExclusions();

    // if we have images in our working set, and we need more images on screen
    if (this.image_working_set.length > 0 &&                                // we have images
        this.props.imageCarousel.items.length < this.state.number_of_images &&   // the desktop wants images
        !this.existsClass("hovering") &&                                    // we're not hovering over an image at the moment
        new Date() - this.last_image_queued > 2500) {               // its been at least 4.5s since the last image was added

      const image = this.getNextImage();

      this.props.actions.addImageCarousel({
        key: image.id,
        id: image.id,
        api_props: image,
        timestamp: new Date()
      } );

      this.last_image_queued = new Date();
    }
    
    /* queue the next iteration */
    var delay = 5000;
    if (this.props.imageCarousel.length <= 1) delay = 500;
    if (this.props.imageCarousel.length < this.state.number_of_images) delay = 2000;

    const self = this;
    this.queueDelay = setTimeout(function() {self.queueImage();}, delay);
  }
  setAnalyticsTag(tag, elements) {

    for (var i = 0; i < elements.length; i++) {
      const id = Number(elements[i].id);
      
      for (var j = 0; j < this.image_working_set.length; j++) {
        if (this.image_working_set[j].id === id) {
          switch (tag) {
            case "click": this.image_working_set[j].analytics.click = true; break;
            case "move": this.image_working_set[j].analytics.move = true; break;
            case "resize": this.image_working_set[j].analytics.resize = true; break;
            case "like": this.image_working_set[j].analytics.like = true; break;
            case "dislike": this.image_working_set[j].analytics.dislike = true; break;
            case "close": this.image_working_set[j].analytics.close = true; break;
            default: break;
          }          
          break;
        }        
      }
    }
  }

  processAnalytics() {
    this.setAnalyticsTag("click", document.getElementsByClassName("analytics_click"));
    this.setAnalyticsTag("move", document.getElementsByClassName("analytics_move"));
    this.setAnalyticsTag("resize", document.getElementsByClassName("analytics_resize"));
    this.setAnalyticsTag("like", document.getElementsByClassName("analytics_like"));
    this.setAnalyticsTag("dislike", document.getElementsByClassName("analytics_dislike"));
    this.setAnalyticsTag("close", document.getElementsByClassName("analytics_close"));

    const clicks = this.image_working_set.filter((image) => image.analytics.click === true);
    const moves = this.image_working_set.filter((image) => image.analytics.move === true);
    const resizes = this.image_working_set.filter((image) => image.analytics.resize === true);
    const likes = this.image_working_set.filter((image) => image.analytics.like === true);
    const dislikes = this.image_working_set.filter((image) => image.analytics.dislike === true);
    const closes = this.image_working_set.filter((image) => image.analytics.close === true);
    
    const analytics = {
      clicks: clicks,
      moves: moves,
      resizes: resizes,
      likes: likes,
      dislikes: dislikes,
      closes: closes
    }
    return analytics;

  }

  // returns true if there is an element in the DOM containing this class
  existsClass(className) {
    const elements = document.getElementsByClassName(className);
    return elements.length > 0;
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
          this.removeFromImageCarousel(this_image);
          this.image_working_set = this.image_working_set.filter(image => image.id !== this_image.id);
        }
    }
  }

  serializedImage(image) {
    var RetVal;

    const next = this.image_working_set.sort((a, b) =>  Number(b.viewing_sequence) - Number(a.viewing_sequence))[0].viewing_sequence + 1;

    for (var i=0; i<this.image_working_set.length; i++) {
      if (this.image_working_set[i].id === image.id) {
        this.image_working_set[i].viewing_sequence = next;
        RetVal = this.image_working_set[i];
        break;
      }
    }
    return RetVal;
  }

  getNextImage() {
    if (this.image_working_set === null || this.image_working_set.length === 0) return null;

    // filter images that were disliked or closed but are still pending analytics processing.
    // sort the list based on what's been viewed so far -- put those at the end of the array to avoid dups.
    this.image_working_set = this.image_working_set.sort((a, b) => Number(a.viewing_sequence) - Number(b.viewing_sequence));
    const images = this.image_working_set
                  .filter((image) => 
                        image.analytics.dislike === false && 
                        (image.analytics.close === false || image.analytics.like === true));


    const image = this.serializedImage(images[0]);
    return image;
  }

  imagePositioning(image_width, image_height) {
    // https://www.npmjs.com/package/rectangle-bin-pack
    //
    // build random trajectory that passes through the
    // interior 2/3 of curr view pane.
    const canvas_area = .90;

    const X = window.innerWidth * canvas_area;
    const Y = window.innerHeight * canvas_area;

    const position_x = Math.floor(Math.random() * (X - image_width));
    const position_y = Math.floor(Math.random() * (Y - image_height));

    const slope = (Math.random() * (2 * Math.PI));

    const position = {
      left: (window.innerWidth * (1 - canvas_area))/2 + position_x,
      top: (window.innerHeight * (1 - canvas_area))/2 + position_y,
      slope: slope
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
        var new_images = [];
        for (var i=0; i<images.length;  i++) {
          const candidate = images[i]
          if (this.image_working_set.filter(image => candidate.id === image.id).length === 0) new_images.push(images[i]);
        }

        // initialize analytics data
        new_images = new_images.map((image) => {
          image.viewing_sequence = 0;
          image.analytics = {
            click: false,
            move: false,
            resize: false,
            like: false,
            dislike: false,
            close: false
          };
          return image;
        })

        const isWorkingSetInitialized = this.image_working_set.length > 0;
        this.image_working_set = this.image_working_set.concat(new_images);

        if (!isWorkingSetInitialized) this.queueImage();

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

}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

