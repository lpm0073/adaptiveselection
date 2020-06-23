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

// my stuff
import './styles.css';
import ContentRow from '../../components/contentRow/ContentRow'
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

const RANKTILE = 3            // groupings between ranked image selection
const MAX_ITEMS_PER_ROW = 3;
const MAX_ROWS = 4;

class Home extends Component {

  queueDelay = null;
  masterContent = [];
  wpImages = null;
  page;
  rows = [];
  fetching = false;

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
    this.removeRow = this.removeRow.bind(this);
    this.addRow = this.addRow.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.requeueRange = this.requeueRange.bind(this);

    this.existsClass = this.existsClass.bind(this);
    this.handleMasonryLayoutComplete = this.handleMasonryLayoutComplete.bind(this);

    this.state = {
      level: 0,
      nextSerialNumber: 0
    }

  }

  componentDidMount() {
    this.wpImages = new WPImages(this.state.level, this.addMasterContent);
  }
  componentWillUnmount() {
    clearTimeout(this.queueDelay);
  }

  render() {
    if (this.rows.length === 0) return(<Loading />);
    return(
        <div key="home-page" id="home-page" className="home-page m-0 p-0 row" onScroll={this.handleScroll}>
          <div className="col-1"></div>
          <div className="col-10">
          {this.rows.map((row, idx) => {return (<ContentRow key={idx} row = {row} />);})}
          </div>
          <div className="col-1"></div>
        </div>
    );
  }
  
  addMasterContent(items) {
    this.masterContent = this.masterContent.concat(items);
    if (this.props.imageCarousel.present.items.length === 0) this.fetchRow(3);
  }

  handleChangeLevel() {
    this.masterContent = [];
    this.props.actions.removeImageCarousel(this.props.imageCarousel.present.items.length, "quantity");
    this.wpImages = new WPImages(this.level, this.addMasterContent);
  }  
  
  addRow(row) {
    console.log("addRow()", row, this.rows.length);
    this.rows.push(row);
  }
  removeRow() {
    console.log("removeRow()");
    this.rows.shift()
  }
  fetchRow(n = 1) {
    if (this.fetching) return;
    this.fetching = true;
    var i;

    //this.processAnalytics();
    //this.rankWorkingSet();

    for (i = 0; i<n; i++) {
      const j = Math.floor(Math.random() * 10) % MAX_ITEMS_PER_ROW;
      var row = [];
      for (var k=0; k<=j; k++) {
        const item = this.getNextItem();
        this.props.actions.addImageCarousel(item);
        row.push(item.id);
      }
      this.addRow(row);

      const l = this.rows.length - MAX_ROWS;
      if (l > 0) {
        for (i=0; i<l; i++) {
          this.removeRow();
        }
      }

      this.fetching = false;
    }  
  }

  // returns true if there is an element in the DOM containing this class
  existsClass(className) {
    const elements = document.getElementsByClassName(className);
    return elements.length > 0;
  }

  nextSerialNumber() {
    this.setState({nextSerialNumber: this.state.nextSerialNumber + 1});
    return this.state.nextSerialNumber;
  }

  getMaxDimensions(image) {
    var max_height = window.screen.height, 
        max_width = window.screen.width,
        high_level = [].concat(wpGetExclusionArray(1, this.wpImages.categories));

    // full-size for mobile. for everything else however... 
    if (window.screen.width > 768) {
    // priority 1: is this a high-ranking image?
    if (this.props.userSignals.items.length > 10 && this.getRankPercentile(image) > .80) {
      max_height = (window.screen.height / 3) + (Math.random() * window.screen.height * 4/5);
      max_width = (window.screen.width / 2) + (Math.random() * window.screen.width );
    } else {
      // priority 2: explicit content
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


  serializedImage(image) {
    const idx = this.masterContent.map((item) => {return item.id}).indexOf(image.id);
    if (idx >= 0) {
      this.masterContent[idx].viewing_sequence = this.nextSerialNumber();
      return this.masterContent[idx];
    }
  }


  getNextItem() {

    if (this.masterContent === null || this.masterContent.length === 0) return null;
    var images = this.masterContent;
    // filter images that were disliked or closed but are still pending analytics processing.
    const disliked = this.props.userSignals.items
                      .filter((image) => (image.signal === 'DISLIKE' || image.signal === 'CLOSE'))
                      .map((image) => {return image.id;});
    
    // if list contains not-yet seen images then prioritize these
    const never_viewed = [].concat(images.filter((image) => image.viewing_sequence === 0));
    if (never_viewed.length > 0) {
      images = never_viewed;
    } else images = images.sort((a, b) => a.viewing_sequence - b.viewing_sequence);

    const imageIdx = Math.floor(Math.random() * images.length);
    const image = this.serializedImage(images[imageIdx]);
    const imageProps = wpGetImage(image);
    const obj = {
      key: image.id,
      id: image.id,
      api_props: image,
      timestamp: new Date(),
      source_url: imageProps.source_url,
      width: imageProps.width,
      height: imageProps.height,
      orientation: imageProps.width > imageProps.height ? 'landscape' : 'portrait',
      aspect_ratio: imageProps.height > 0 ? imageProps.width / imageProps.height : 0,
      image_props: imageProps
    };
    return(obj);
  }

 
  handleMasonryLayoutComplete(laidOutItems) {
  }


  processAnalytics() {

    if (this.wpImages.categories) {
      for (var i=0; i<this.wpImages.categories.categories.length; i++) {
        var category = this.wpImages.categories.categories[i];
        this.wpImages.categories.categories[i].factor_score = this.weightCategory(category);
      }  
    }
  }

  getCategoryScore(id) {
    if (this.wpImages.categories) {
      for (var i=0; i<this.wpImages.categories.categories.length; i++) {
        if (this.wpImages.categories.categories[i].id === id) return this.wpImages.categories.categories[i].factor_score
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

  requeueRange() {
    if (!this.page) this.page = document.getElementById("home-page");

    const scrollable_area = this.page.scrollHeight - this.page.offsetHeight;
    const scroll_position = scrollable_area > 0 ? this.page.scrollTop / scrollable_area : 0;

    if (scrollable_area === 0) return true; // not enough content on screen to need a scrollbar
    console.log("scroll_position", scroll_position);
    return (scroll_position > .80);         // we're near the bottom of a scrollable screen 
  }

  handleScroll() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    if (this.state.fetching) return;
    if (this.requeueRange() && !this.state.fetching) {
      const self = this;
      setTimeout(function() {
        self.fetchRow();
      }, 5);
    }
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

