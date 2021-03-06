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
import Loading from '../../components/Loading';
import * as Defaults from '../../appDefaults';
import ContentRow from '../../components/contentRow/ContentRow'
import { ImagesApi, wpGetImage, imagePreFetcher, wpGetExclusionArray } from '../../shared/ImagesApi';

const SUBSCRIPTIONS = ["Wallpapers"];
const LEVEL = 3;

const mapStateToProps = state => ({
    ...state
});
const mapDispatchToProps = (dispatch) => {
  return({
    actions: bindActionCreators(Actions, dispatch)
  });
};
class Feed extends Component {

  idleDelay = null;
  masterContent = [];
  page;
  fetching = false;
  areSubscriptionsRegistered = false;

  constructor(props) {
    super(props);

    // FIX NOTE: DELETE ME!!!
    localStorage.clear();


    // content management
    this.handleChangeLevel = this.handleChangeLevel.bind(this);
    this.addMasterContent = this.addMasterContent.bind(this);
    this.registerSubscriptions = this.registerSubscriptions.bind(this);

    // real-time analytics
    this.processAnalytics = this.processAnalytics.bind(this);
    this.weightCategory = this.weightCategory.bind(this);
    this.rankWorkingSet = this.rankWorkingSet.bind(this);
    this.getCategoryScore = this.getCategoryScore.bind(this);
    this.getRankPercentile = this.getRankPercentile.bind(this);

    // content selection
    this.getNextItem = this.getNextItem.bind(this);
    this.serializedImage = this.serializedImage.bind(this);
    this.nextSerialNumber = this.nextSerialNumber.bind(this);

    // UI
    this.fetchRow = this.fetchRow.bind(this);
    this.removeRow = this.removeRow.bind(this);
    this.addRow = this.addRow.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.requeueRange = this.requeueRange.bind(this);
    this.resetIdleTimeout = this.resetIdleTimeout.bind(this);
    this.doIdle = this.doIdle.bind(this);

    this.existsClass = this.existsClass.bind(this);
    this.handleMasonryLayoutComplete = this.handleMasonryLayoutComplete.bind(this);

    this.state = {
      level: LEVEL,
      subscriptions: SUBSCRIPTIONS,
      nextSerialNumber: 0,
      channel: props.location.pathname.replace("/", ""),
      imageSubscriptions: [],
    }

  }

  componentDidMount() {
    this.resetIdleTimeout();
  }
  componentDidUpdate() {
    if (this.state.channel !== "") return;
    if (!this.areSubscriptionsRegistered) this.registerSubscriptions();
  }

  componentWillUnmount() {
    clearTimeout(this.idleDelay);
  }

  render() {
    const rows = this.props.itemRow.present.items.filter((item) => item.row.length > 0);

    if (rows.length === 0) return(
      <div key="home-page" id="home-page" className="home-page m-0 p-0 row" onScroll={this.handleScroll}>
        <h1 className="text-center text-light">Adaptive Selection (Beta)</h1>
        <Loading />
      </div>
    );
    return(
        <div key="home-page" id="home-page" className="home-page m-0 p-0 row" onScroll={this.handleScroll}>
          <div className="col-sm-12 col-xl-2"></div>
          <div className="col-sm-12 col-xl-8">
          {rows.map((row, idx) => {return (<ContentRow key={row.id} id={row.id} row = {row.row} />);})}
          </div>
          <div className="col-sm-12 col-xl-2"></div>
        </div>
    );
  }

  registerSubscriptions() {
    if (this.areSubscriptionsRegistered) return;
    if (this.props.publishers.items.length === 0) return;
    this.areSubscriptionsRegistered = true;

    const publishers = this.props.publishers.items;
    const imageSubscriptions = [];

    for (var i=0; i<publishers.length; i++) {
      if (this.state.subscriptions.includes(publishers[i].publisher) || publishers[i].required) {
          const obj = new ImagesApi(publishers[i].publisher, publishers[i].id, null, this.addMasterContent, this.state.level, publishers[i].filtered);
          imageSubscriptions.push(obj);
          }
    }
    this.setState({
      imageSubscriptions: imageSubscriptions
    });
    this.fetchRow(3);
  }

  doIdle() {
    console.log("doIdle() short-circuited");
    return;

    this.props.actions.deleteEmptyItemRow();
    const n = this.props.itemRow.present.items.length - Defaults.MAX_ROWS;
    if (n > 0) {
      this.removeRow(n);
    }

    this.resetIdleTimeout();  
  }

  resetIdleTimeout() {
    const self = this;

    clearTimeout(this.idleDelay);

    const idleDelay = setTimeout(function() {
      self.doIdle();
      }, Defaults.IDLE_TIMEOUT);

    this.idleDelay = idleDelay;
  }

  addMasterContent(items) {
    this.masterContent = this.masterContent.concat(items);

    items.map((item) => {
      localStorage.setItem(item.id, JSON.stringify(item));
      return item;
    });
    if (this.props.itemCarousel.present.items.length === 0) this.fetchRow(6);
  }

  handleChangeLevel() {
    localStorage.clear();
    this.masterContent = [];
    this.props.actions.resetItemCarousel();
  }  
  
  addRow(row) {
    this.props.actions.addItemRow(row);
  }
  removeRow(n = 1) {
    this.props.actions.removeItemRow(n);
  }

  fetchRow(n = 1) {
    if (this.fetching) return;
    this.fetching = true;
    var i;

    //this.processAnalytics();
    //this.rankWorkingSet();

    for (i = 0; i<n; i++) {
      /*
      Extra small   <576px	
      Small         ≥576px
      Medium        ≥768px	
      Large         ≥992px	
      Extra large   ≥1200px
      */

      // row item count weighting
      var j = Math.random();
      if (j <= Defaults.IMAGE_CONTENT_3ITEMS) {
        // don't bother with 3-image layouts unless we really need to
        j = window.screen.width >= 1200 ? 3 : 2;
      }
      else {
        if (j <= Defaults.IMAGE_CONTENT_3ITEMS + Defaults.IMAGE_CONTENT_2ITEMS) j = 2;
        else j = 1;
      }

      var row = [];
      for (var k=0; k<j; k++) {
        const item = this.getNextItem();
        if (item) {
          this.props.actions.addItemCarousel(item);
          row.push(item.id);
          }
      }
      this.addRow({
        id: Math.floor(Math.random() * 1000000000).toString(), 
        row: row
      });

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
      key: Math.floor(Math.random() * 100000000).toString(),
      id: image.id,
      api_props: image,
      timestamp: new Date(),
      source_url: imageProps.source_url,
      width: imageProps.width,
      height: imageProps.height,
      orientation: imageProps.aspect_ratio <= 1 ? 'landscape' : 'portrait',
      aspect_ratio: imageProps.aspect_ratio,
      image_props: imageProps
    };
    imagePreFetcher(obj.source_url);
    return(obj);
  }

 
  handleMasonryLayoutComplete(laidOutItems) {
  }


  processAnalytics() {

    if (this.imageSubscriptions.categories) {
      for (var i=0; i<this.imageSubscriptions.categories.categories.length; i++) {
        var category = this.imageSubscriptions.categories.categories[i];
        this.imageSubscriptions.categories.categories[i].factor_score = this.weightCategory(category);
      }  
    }
  }

  getCategoryScore(id) {
    if (this.imageSubscriptions.categories) {
      for (var i=0; i<this.imageSubscriptions.categories.categories.length; i++) {
        if (this.imageSubscriptions.categories.categories[i].id === id) return this.imageSubscriptions.categories.categories[i].factor_score
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

    const viewHeight = this.page.offsetHeight;    // usually around 750px on a laptop
    const scrollHeight = this.page.scrollHeight;  // total height of the DOM
    const scrollTop = this.page.scrollTop;        // our current pixel position within the document

    if ((scrollHeight - scrollTop) < (viewHeight * 1.15)) {
      return true;
    }
  }

  handleScroll() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect

    this.resetIdleTimeout();
    if (this.requeueRange() && !this.fetching) {
      this.fetchRow(10);
    }
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(Feed);