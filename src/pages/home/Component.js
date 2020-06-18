// Masonry layout:
// https://github.com/eiriklv/react-masonry-component

// infinite scroll
// https://www.digitalocean.com/community/tutorials/react-react-infinite-scroll

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';

import Masonry from 'react-masonry-component';

import './styles.css';
import ImageBox from './ImageBox';
import { wpGetExclusions, wpGetExclusionArray } from '../../shared/categories';
import { mediaUrl } from '../../shared/urls';
import { wpGetImage } from './wpImageLib';
import Loading from '../../components/Loading';

const mapStateToProps = state => ({
    ...state
});
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
});

const CAROUSEL_SIZE = 40;
const QUEUE_SIZE = 5;

class Home extends Component {

  isCategoryInitialized = false;
  fetcherDelay = null;
  queueDelay = null;
  image_working_set = [];
  pages_returned = []   // integer page numbers of api page numbers returned so far
  page_number = 1 + Math.floor(Math.random() * 40);
  num_pages = 100;   // <---- start high and interpolate downwards based on success/failure
  category_exclusions = [];
  media_query;

  constructor(props) {
    super(props);

    this.imageFetcher = this.imageFetcher.bind(this);
    this.handleChangeLevel = this.handleChangeLevel.bind(this);
    this.removeExclusions = this.removeExclusions.bind(this);
    this.processAnalytics = this.processAnalytics.bind(this);
    this.setAnalyticsTag = this.setAnalyticsTag.bind(this);

    this.queueImages = this.queueImages.bind(this);
    this.getNextImage = this.getNextImage.bind(this);
    this.existsClass = this.existsClass.bind(this);
    this.serializedImage = this.serializedImage.bind(this);
    this.nextSerialNumber = this.nextSerialNumber.bind(this);
    this.handleMasonryLayoutComplete = this.handleMasonryLayoutComplete.bind(this);
    this.getNextPage = this.getNextPage.bind(this);
    this.handleScroll = this.handleScroll.bind(this);

    this.state = {
      level: 0,
      queueing: false
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
      const images = this.props.imageCarousel.items.map((image) => {
        var max_height, max_width;
        const high_level = wpGetExclusionArray(1, this.props.categories.items);

        const intersection = image.api_props.categories.filter(element => high_level.includes(element))
        if (intersection.length > 0) {
          max_height = (window.screen.height / 5) + (Math.random() * window.screen.height * 4/5);
          max_width = (window.screen.width / 5) + (Math.random() * window.screen.width * 4/5);
        } else {
          if (Math.random() > 0.50) {
            max_height = (window.screen.height / 4) + (Math.random() * window.screen.height * 1/2);
            max_width = (window.screen.width / 4) + (Math.random() * window.screen.width * 1/4);
            } else {
              max_height = (window.screen.height / 6) + (Math.random() * window.screen.height * 1/2);
              max_width = (window.screen.width / 6) + (Math.random() * window.screen.width * 1/4);
          }
        }

        const imageProps = wpGetImage(image, max_height, max_width);

        image.source_url = imageProps.source_url;
        image.height = imageProps.height;
        image.width = imageProps.width;
        image.image_props = imageProps;

        return (image);
      });
      return(
          <div id="home-page" className="home-page m-0 p-0" onScroll={this.handleScroll}>
            <Masonry 
              className={'masonry-container'} 
              onLayoutComplete={laidOutItems => this.handleMasonryLayoutComplete(laidOutItems)}              
            >
              {this.props.imageCarousel.items.length > 0 ? images.map((image) => {
                  return (
                    <div className="masonry-item">
                      <ImageBox key={image.key} image = {image} />
                    </div>
                  );
                })
            :
              <Loading />
            }
            </Masonry>
          </div>
      );
  
  }
  /* add a random image at a random location on the device screen. */
  queueImages() {
    console.log("queueImages() - 1");
    this.setState({queueing: true});
    var i = 0;
    // do this first.
    // gather user analytics signals from class data embedded in the items in props.imageCarousel
    //this.processAnalytics();

    // re-validate the working set and the carousel against our current
    // list of category exclusions.
    //this.removeExclusions();

    // if we have images in our working set, and we need more images on screen
    while (
           this.image_working_set.length > 0    // we have images
        && !this.existsClass("hovering")        // user is not currently hovering over an image
        && this.props.imageCarousel.items.length < (CAROUSEL_SIZE + QUEUE_SIZE) // the carousel is not overloaded
        && this.props.imageCarousel.items.length < this.image_working_set.length // we haven't exhausted our supply of available images
        && i < CAROUSEL_SIZE) {        // stop gap to avoid infinites loops

        const image = this.getNextImage();
        const duplicate = this.props.imageCarousel.items.filter((item) => item.id === image.id).length > 0;
        if (!(duplicate && this.props.imageCarousel.items.length < CAROUSEL_SIZE)) {
          // our working set is too small. we need to wait for more data from the api.
          this.props.actions.addImageCarousel({
            key: image.id,
            id: image.id,
            api_props: image,
            timestamp: new Date()
          } );
        }
        i ++;
    }

    console.log("queueImages() - 2");
    if (this.props.imageCarousel.items.length > CAROUSEL_SIZE) {
      // prune the imageCarousel
      this.props.actions.removeImageCarousel(this.props.imageCarousel.items.length - CAROUSEL_SIZE);
      console.log("queueImages() - 2b");
    }

    console.log("queueImages() - 3");
    if (this.props.imageCarousel.items.length < CAROUSEL_SIZE) {
      // keep calling ourselves until we have a full imageCarousel
      const self = this;
      this.queueDelay = setTimeout(function() {
        self.queueImages();      
      }, this.props.imageCarousel.items.length < CAROUSEL_SIZE ? 1000 : 20000);
  
    }
    console.log("queueImages() - 4");
    this.setState({queueing: false});
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

  nextSerialNumber() {
    return this.image_working_set.sort((a, b) =>  Number(b.viewing_sequence) - Number(a.viewing_sequence))[0].viewing_sequence + 1;
  }

  serializedImage(image) {
    var RetVal;


    for (var i=0; i<this.image_working_set.length; i++) {
      if (this.image_working_set[i].id === image.id) {
        this.image_working_set[i].viewing_sequence = this.nextSerialNumber();
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
    var images = this.image_working_set
                  .filter((image) => 
                        image.analytics.dislike === false && 
                        (image.analytics.close === false || image.analytics.like === true))
                  .filter((image) => !this.props.imageCarousel.items.includes(image));

    // list contains not-yet seen images
    if (images[0].viewing_sequence === 0) {
      images = images.filter((image) => image.viewing_sequence === 0)
                     .sort((a, b) =>  Number(b.sort_key) - Number(a.sort_key));
    }
    const image = this.serializedImage(images[0]);
    return image;
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

  // find the next random page number to query by choosing
  // a random page that has not already been queried.
  getNextPage() {
    var potential_pages = [];
    for (var i=1; i<this.num_pages; i++) {
      if (! this.pages_returned.includes(i)) {
        potential_pages.push(i);
      }
    }
    if (potential_pages.length === 0) return 0;
    var idx = Math.floor(Math.random() * potential_pages.length);
    return potential_pages[idx];

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
          image.sort_key = Math.random * 1000000;
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

        if (!isWorkingSetInitialized) this.queueImages();

        this.pages_returned.push(this.page_number);
        this.page_number = this.getNextPage(); 
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
        var num_pages = this.num_pages > this.page_number ? this.num_pages - Math.floor((this.num_pages - this.page_number)/2)  : this.num_pages;
        num_pages = num_pages > Math.max( ...this.pages_returned ) ? num_pages - 1 : Math.max( ...this.pages_returned );
        this.num_pages = num_pages;
        this.page_number = this.getNextPage();

      });
  

    if (this.page_number !== 0) {
      const delay = 1000;
      const self = this;
      this.fetcherDelay = setTimeout(function() {
          self.imageFetcher();
      }, delay);
    } 

  }

  handleMasonryLayoutComplete(laidOutItems) {
  }
  handleScroll() {
    console.log("handleScroll()");
    const page = document.getElementById("home-page");
    const scrollable_area = page.scrollHeight - page.offsetHeight;
    const scroll_position = scrollable_area > 0 ? page.scrollTop / scrollable_area : 0;

    if (scroll_position > .95 && !this.state.queueing) this.queueImages();

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

