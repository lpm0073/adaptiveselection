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
import ImageBox from '../../components/ImageBox';
import { WPImages, wpGetImage, wpGetExclusionArray } from '../../shared/wpImages';
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
const RANKTILE = 3            // groupings between ranked image selection

class Home extends Component {

  queueDelay = null;
  masterContent = [];
  wpImages = null;

  constructor(props) {
    super(props);

    // content management
    this.handleChangeLevel = this.handleChangeLevel.bind(this);
    this.addMasterContent = this.addMasterContent.bind(this);

    // real-time analytics
    this.processAnalytics = this.processAnalytics.bind(this);
    this.weightCategory = this.weightCategory.bind(this);
    this.rankWorkingSet = this.rankWorkingSet.bind(this);
    this.getCategoryScore = this.getCategoryScore.bind(this);
    this.getRankPercentile = this.getRankPercentile.bind(this);

    // content selection
    this.getNextItem = this.getNextItem.bind(this);
    this.getMaxDimensions = this.getMaxDimensions.bind(this);
    this.serializedImage = this.serializedImage.bind(this);
    this.nextSerialNumber = this.nextSerialNumber.bind(this);

    // UI
    this.fetchRow = this.fetchRow.bind(this);
    this.undoFetchRow = this.undoFetchRow.bind(this);
    this.redoFetchRow = this.redoFetchRow.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.requeueRange = this.requeueRange.bind(this);

    this.existsClass = this.existsClass.bind(this);
    this.handleMasonryLayoutComplete = this.handleMasonryLayoutComplete.bind(this);

    this.state = {
      level: 0,
      fetching: false,
      deleting: []
    }

  }


  componentDidMount() {
    this.wpImages = new WPImages(this.level, this.props.categories, this.addMasterContent);
  }
  componentWillUnmount() {
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
  
  addMasterContent(items) {
    this.masterContent = this.masterContent.concat(items);
    if (this.props.imageCarousel.present.items.length === 0) this.fetchRow();
    console.log("addMasterContent()", this.masterContent);
  }

  handleChangeLevel() {

    if (this.props.categories.isLoading) {
      // we're not ready, so wait 500ms and then try again.
      const self = this;
      setTimeout(function() {
          self.handleChangeLevel();
      }, 500);
      return;
    }
    
    // reset content data
    this.masterContent = [];
    this.props.actions.removeImageCarousel(this.props.imageCarousel.present.items.length, "quantity");
    this.wpImages = new WPImages(this.level, this.props.categories, this.addMasterContent);

  }  
  
  redoFetchRow() {
    local_dispatch(Actions.redoImageCarousel(3));
  }
  undoFetchRow() {
    local_dispatch(Actions.undoImageCarousel(3));
  }
  
  fetchRow() {
    this.setState({fetching: true});
    const MAX_ITEMS = 3;

    function shouldFetch(self) {
      if (!self.masterContent.length > 0) return false;
      if (self.existsClass("hovering")) return false ;
      return true;
    }
    function numItems(self) {
      if (self.masterContent.length < MAX_ITEMS) return MAX_ITEMS;
      return 1 + Math.floor((Math.random() * 10)) % MAX_ITEMS;
    }
    function isDuplicate(self,subject) {
      return self.props.imageCarousel.present.items.filter((item) => item.id === subject.id).length > 0;      
    }
    // do this first.
    // gather user analytics signals from class data embedded in the items in props.imageCarousel
    //this.processAnalytics();
    //this.rankWorkingSet();

    // if we have images in our working set, and we need more images on screen
    if (shouldFetch(this)) {
      var n = numItems(this);
      for (var i=1; i<=n; i++) {
        const item = this.getNextItem();
        var obj = {
          key: item.id,
          id: item.id,
          
          source_url: item.source_url,
          height: item.height,
          width: item.width,
      
          api_props: item,
          timestamp: new Date()
        };
        this.props.actions.addImageCarousel(obj);
      }
    }

    if (this.props.imageCarousel.present.items.length < CAROUSEL_SIZE) {

      // keep calling ourselves until we have a full imageCarousel
      const self = this;
      this.queueDelay = setTimeout(function() {
        self.fetchRow();      
      }, this.props.imageCarousel.present.items.length < CAROUSEL_SIZE ? 1000 : 20000);
  
    }
    this.setState({fetching: false});
  }

  // returns true if there is an element in the DOM containing this class
  existsClass(className) {
    const elements = document.getElementsByClassName(className);
    return elements.length > 0;
  }

  nextSerialNumber() {
    return this.masterContent.sort((a, b) =>  Number(b.viewing_sequence) - Number(a.viewing_sequence))[0].viewing_sequence + 1;
  }

  serializedImage(image) {
    var RetVal;


    for (var i=0; i<this.masterContent.length; i++) {
      if (this.masterContent[i].id === image.id) {
        this.masterContent[i].viewing_sequence = this.nextSerialNumber();
        RetVal = this.masterContent[i];
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
    getNextItem() {
    if (this.masterContent === null || this.masterContent.length === 0) return null;
    var images = this.masterContent;
    console.log("getNextItem()", images.length);
    // filter images that were disliked or closed but are still pending analytics processing.
    const disliked = this.props.userSignals.items
                      .filter((image) => (image.signal === 'DISLIKE' || image.signal === 'CLOSE'))
                      .map((image) => {return image.id;});
    
    // negative category ranks
    const bad_categories = this.props.categories.items.categories.filter((category) => category.factor_score < 0);
    const good_categories = this.props.categories.items.categories
                              .filter((category) => category.factor_score > 0)
                              .sort((a, b) => b.factor_score - a.factor_score);
    const on_screen = this.props.imageCarousel.present.items.map(item => {
                                return(item.id);
                              });

    // exclude images that are currently on screen
    images = images.filter((item) => { return on_screen.indexOf(item.id) === -1;});
    console.log("getNextItem() - not on screen", images.length);

    // sort the list based on what's been viewed so far -- put those at the end of the array to avoid dups.
    images = images.sort((a, b) => a.viewing_sequence - b.viewing_sequence);

    // hive off recently viewed so that these cannot be reselected due to high rank.
    if (images.length > 50) {
      images = images
                .sort((a, b) => a.viewing_sequence - b.viewing_sequence)
                .splice(0, Math.floor(images.length * (3/4)));
    }
    console.log("getNextItem() - remove recently viewed", images.length);

    // if list contains not-yet seen images then prioritize these
    const never_viewed = images.filter((image) => image.viewing_sequence === 0);
    if (never_viewed.length > 0) {
      images = never_viewed;
    }
    console.log("getNextItem() - never viewed", images.length);

    // optimize presentation order: either based on image rank
    // or randomization.
    //if (this.props.userSignals.items.length > 10 && Math.random() < (1 / RANKTILE)) {
    //  images = images.sort((a, b) =>  b.rank - a.rank);
    //} else images = images.sort((a, b) =>  Math.random());

    const image = this.serializedImage(images[Math.floor(Math.random() * images.length)]);
    var max_height, max_width, obj = this.getMaxDimensions(image);
    max_height = obj.max_height;
    max_width = obj.max_width;

    const imageProps = wpGetImage(image, max_height, max_width);

    image.source_url = imageProps.source_url;
    image.height = imageProps.height;
    image.width = imageProps.width;
    image.image_props = imageProps;

    console.log("getNextItem()", image);
    return image;
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

    const images = [].concat(this.props.imageCarousel.present.items);

    function isAboveViewport (image) {
      return document.getElementById(image.id).getBoundingClientRect().bottom < 0;
    }

    for (var i=0; i<images.length; i++) {
      const image = images[i];
  
      if (isAboveViewport(image) && !this.state.deleting.includes(image.id)) {
        this.setState({deleting: this.state.deleting.concat(image.id)});
        this.props.actions.removeImageCarousel(image, "item");
        if (this.requeueRange() && !this.state.fetching) this.fetchRow();
        return;
      }

    }
    if (this.requeueRange() && !this.state.fetching) this.fetchRow();

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
    if (this.masterContent.length > 0) {
      const ranked = this.masterContent.sort((a, b) => a.rank - b.rank);
      var idx = ranked.findIndex((obj) => obj.id === image.id);
      return idx / this.masterContent.length;
    }
    return 0;
  }
  
  rankWorkingSet() {
    var rank = 1;
    for (var i=0; i<this.masterContent.length; i++) {
        for (var j=0; j<this.masterContent[i].categories.length; j++) {
          rank += this.getCategoryScore(this.masterContent[i].categories[j]);
        }
        if (this.masterContent[i].categories.length > 0) rank = rank / this.masterContent[i].categories.length
        this.masterContent[i].rank = rank;
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

