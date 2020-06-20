// Masonry layout:
// https://github.com/eiriklv/react-masonry-component

// reactjs stuff
import React, { Component } from 'react';

// redux stuff
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';
import * as Signals from '../../redux/userSignals';

// 3rd party stuff
import Masonry from 'react-masonry-component';

// my stuff
import './styles.css';
import ImageBox from './ImageBox';
import { wpGetExclusions, wpGetExclusionArray } from '../../shared/categories';
import { mediaUrl } from '../../shared/urls';
import { wpGetImage } from './wpImageLib';
import Loading from '../../components/Loading';

var local_dispatch;

const mapStateToProps = state => ({
    ...state
});
const mapDispatchToProps = (dispatch) => {
  local_dispatch = dispatch;
  return({
    actions: bindActionCreators(Actions, dispatch)
  });
};

const CAROUSEL_SIZE = 6;      // # of images on screen
const QUEUE_SIZE = 2;         // # of images added to the carousel on each iteration
const RANKTILE = 3            // groupings between ranked image selection

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
    this.processAnalytics = this.processAnalytics.bind(this);
    this.weightCategory = this.weightCategory.bind(this);
    this.rankWorkingSet = this.rankWorkingSet.bind(this);
    this.getCategoryScore = this.getCategoryScore.bind(this);
    this.getRankPercentile = this.getRankPercentile.bind(this);

    this.queueImages = this.queueImages.bind(this);
    this.undoQueueImages = this.undoQueueImages.bind(this);
    this.redoQueueImages = this.redoQueueImages.bind(this);

    this.getNextImage = this.getNextImage.bind(this);
    this.getMaxDimensions = this.getMaxDimensions.bind(this);
    this.serializedImage = this.serializedImage.bind(this);
    this.nextSerialNumber = this.nextSerialNumber.bind(this);

    this.existsClass = this.existsClass.bind(this);
    this.handleMasonryLayoutComplete = this.handleMasonryLayoutComplete.bind(this);
    this.getNextPage = this.getNextPage.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.requeueRange = this.requeueRange.bind(this);

    this.state = {
      level: 4,
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
      const images = this.props.imageCarousel.present.items;
      return(
          <div key="home-page" id="home-page" className="home-page m-0 p-0" onScroll={this.handleScroll}>
            <Masonry 
              className={'masonry-container'} 
              onLayoutComplete={laidOutItems => this.handleMasonryLayoutComplete(laidOutItems)}              
            >
              {images.length > 0 ? images.map((image) => {
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
            {this.requeueRange() && images.length < CAROUSEL_SIZE ?
              <Loading />
              :
              <React.Fragment></React.Fragment>
            }
          </div>
      );
  
  }
  
  redoQueueImages() {
    local_dispatch(Actions.redoImageCarousel(3));
  }
  undoQueueImages() {
    local_dispatch(Actions.undoImageCarousel(3));
  }
  /* add a random image at a random location on the device screen. */
  queueImages() {
    this.setState({queueing: true});
    var i = 0;
    // do this first.
    // gather user analytics signals from class data embedded in the items in props.imageCarousel
    this.processAnalytics();
    this.rankWorkingSet();

    // if we have images in our working set, and we need more images on screen
    while (
           this.image_working_set.length > 0    // we have images
        && !this.existsClass("hovering")        // user is not currently hovering over an image
        && this.props.imageCarousel.present.items.length < (CAROUSEL_SIZE + QUEUE_SIZE) // the carousel is not overloaded
        && this.props.imageCarousel.present.items.length < this.image_working_set.length // we haven't exhausted our supply of available images
        && i < CAROUSEL_SIZE) {        // stop gap to avoid infinites loops

        const image = this.getNextImage();
        const duplicate = this.props.imageCarousel.present.items.filter((item) => item.id === image.id).length > 0;
        if (!(duplicate && this.props.imageCarousel.present.items.length < CAROUSEL_SIZE)) {
          // our working set is too small. we need to wait for more data from the api.
          this.props.actions.addImageCarousel({
            key: image.id,
            id: image.id,
            
            source_url: image.source_url,
            height: image.height,
            width: image.width,
        
            api_props: image,
            timestamp: new Date()
          } );
        }
        i ++;
    }

    if (this.props.imageCarousel.present.items.length > CAROUSEL_SIZE) {
      // prune the imageCarousel
      this.props.actions.removeImageCarousel(this.props.imageCarousel.present.items.length - CAROUSEL_SIZE, "quantity");
    }

    if (this.props.imageCarousel.present.items.length < CAROUSEL_SIZE) {
      // keep calling ourselves until we have a full imageCarousel
      const self = this;
      this.queueDelay = setTimeout(function() {
        self.queueImages();      
      }, this.props.imageCarousel.present.items.length < CAROUSEL_SIZE ? 1000 : 20000);
  
    }
    this.setState({queueing: false});
  }

  // returns true if there is an element in the DOM containing this class
  existsClass(className) {
    const elements = document.getElementsByClassName(className);
    return elements.length > 0;
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

  getMaxDimensions(image) {
    var max_height = window.screen.height, 
        max_width = window.screen.width;

    // full-size for mobile. for everything else however... 
    if (window.screen.width > 768) {
    // priority 1: is this a high-ranking image?
    if (this.props.userSignals.items.length > 10 && this.getRankPercentile(image) > .80) {
      max_height = (window.screen.height / 3) + (Math.random() * window.screen.height * 4/5);
      max_width = (window.screen.width / 2) + (Math.random() * window.screen.width );
    } else {
      // priority 2: explicit content
      const high_level = wpGetExclusionArray(1, this.props.categories.items);
      const intersection = image.categories.filter(element => high_level.includes(element))
      if (intersection.length > 0) {
        max_height = (window.screen.height / 5) + (Math.random() * window.screen.height * 4/5);
        max_width = (window.screen.width / 5) + (Math.random() * window.screen.width * 4/5);
      } else {
        // priority 3: random sizing
        if (Math.random() > 0.50) {
          max_height = (window.screen.height / 4) + (Math.random() * window.screen.height * 1/2);
          max_width = (window.screen.width / 4) + (Math.random() * window.screen.width * 1/4);
          } else {
            max_height = (window.screen.height / 6) + (Math.random() * window.screen.height * 1/2);
            max_width = (window.screen.width / 6) + (Math.random() * window.screen.width * 1/4);
        }
      }
    }  
    }
    return {
      max_height: max_height,
      max_width: max_width
    }
  }
    getNextImage() {
    if (this.image_working_set === null || this.image_working_set.length === 0) return null;
    var images = this.image_working_set;

    // filter images that were disliked or closed but are still pending analytics processing.
    const disliked = this.props.userSignals.items
                      .filter((image) => (image.signal === 'DISLIKE' || image.signal === 'CLOSE'))
                      .map((image) => {return image.id;});
    
    // negative category ranks
    const bad_categories = this.props.categories.items.categories.filter((category) => category.factor_score < 0);
    const good_categories = this.props.categories.items.categories
                              .filter((category) => category.factor_score > 0)
                              .sort((a, b) => b.factor_score - a.factor_score);


    images = images.filter((item) => disliked.indexOf(item.id) === -1);

    // exclude images that are currently on screen
    images = images.filter((image) => !this.props.imageCarousel.present.items.includes(image));

    // sort the list based on what's been viewed so far -- put those at the end of the array to avoid dups.
    images = images.sort((a, b) => a.viewing_sequence - b.viewing_sequence);

    // hive off recently viewed so that these cannot be reselected due to high rank.
    if (images.length > 50) {
      images = images
                .sort((a, b) => a.viewing_sequence - b.viewing_sequence)
                .splice(0, Math.floor(images.length * (3/4)));
    }

    // if list contains not-yet seen images then prioritize these
    if (images[0].viewing_sequence === 0) {
      images = images.filter((image) => image.viewing_sequence === 0);                     
    }

    // optimize presentation order: either based on image rank
    // or randomization.
    if (this.props.userSignals.items.length > 10 && Math.random() < (1 / RANKTILE)) {
      images = images.sort((a, b) =>  b.rank - a.rank);
    } else images = images.sort((a, b) =>  Math.random());

    const image = this.serializedImage(images[0]);
    var max_height, max_width, obj = this.getMaxDimensions(image);
    max_height = obj.max_height;
    max_width = obj.max_width;

    const imageProps = wpGetImage(image, max_height, max_width);

    image.source_url = imageProps.source_url;
    image.height = imageProps.height;
    image.width = imageProps.width;
    image.image_props = imageProps;

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

        new_images = new_images.map((image) => {
          image.viewing_sequence = 0;
          image.rank = 1;   // pre-initialize image rank based on user signals. 
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

  requeueRange() {
    const page = document.getElementById("home-page");
    if (page) {
      const scrollable_area = page.scrollHeight - page.offsetHeight;
      const scroll_position = scrollable_area > 0 ? page.scrollTop / scrollable_area : 0;
      return (scroll_position > .80);
    }
    return false;
  }

  handleScroll() {

    if (this.requeueRange() && !this.state.queueing) this.queueImages();

  }

  processAnalytics() {
    if (!this.props.categories.isLoading) {
      for (var i=0; i<this.props.categories.items.categories.length; i++) {
        var category = this.props.categories.items.categories[i];
        this.props.categories.items.categories[i].factor_score = this.weightCategory(category);
      }  
    }
  }

  getCategoryScore(id) {
    if (!this.props.categories.isLoading) {
      for (var i=0; i<this.props.categories.items.categories.length; i++) {
        if (this.props.categories.items.categories[i].id === id) return this.props.categories.items.categories[i].factor_score
      }
    }
    return 1;
  }

  getRankPercentile(image) {
    if (this.image_working_set.length > 0) {
      const ranked = this.image_working_set.sort((a, b) => a.rank - b.rank);
      var idx = ranked.findIndex((obj) => obj.id === image.id);
      return idx / this.image_working_set.length;
    }
    return 0;
  }
  
  rankWorkingSet() {
    var rank = 1;
    for (var i=0; i<this.image_working_set.length; i++) {
        for (var j=0; j<this.image_working_set[i].categories.length; j++) {
          rank += this.getCategoryScore(this.image_working_set[i].categories[j]);
        }
        if (this.image_working_set[i].categories.length > 0) rank = rank / this.image_working_set[i].categories.length
        this.image_working_set[i].rank = rank;
    }
  }

  weightCategory(category) {
    const user_signals = category.user_signals;

    var factor_weight = 0,
        weighted_signals = 0;

    switch(this.state.level) {
      case 0:
      factor_weight = category.level0_weight;
      break;

      case 1:
      factor_weight = category.level1_weight;
      break;

      case 2:
      factor_weight = category.level2_weight;
      break;

      case 3:
      factor_weight = category.level3_weight;
      break;

      case 4:
      factor_weight = category.level4_weight;
      break;

      default: 
      factor_weight = category.level0_weight;
      break;
    }
    weighted_signals = (Signals.LIKE_WEIGHT * user_signals.like) +
                      (Signals.UNLIKE_WEIGHT * user_signals.unlike) +
                      (Signals.DISLIKE_WEIGHT * user_signals.dislike) +
                      (Signals.INFO_WEIGHT * user_signals.info) +
                      (Signals.CLOSE_WEIGHT * user_signals.close) +
                      (Signals.CLICK_WEIGHT * user_signals.click) +
                      (Signals.MOVE_WEIGHT * user_signals.move) +
                      (Signals.RESIZE_WEIGHT * user_signals.resize);
    weighted_signals = weighted_signals > 0 ? weighted_signals : 1;
    return weighted_signals * factor_weight;
  }  
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

