import React, {Component}  from 'react';

// redux stuff
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';
import * as Signals from '../../redux/userSignals';
import './styles.css';

// 3rd party stuff
import AnimateHeight from 'react-animate-height';
/* import { CSSTransition } from 'react-transition-group'; */

// my stuff
//import { wpGetImage } from '../../shared/wpImages';

// more redux stuff
const mapStateToProps = state => ({
  ...state
});
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
});

class ImageBox extends Component {

  clickTimeStamp;
  windowCloseDelay = null;
  mouseEnterDelay = null;

  /* behavior tracking */
  _click = false;         // true if user clicked anywhere on window, for any reason
  _like = false;          // true if user click Like
  _dislike = false;       // true if user clicks Dislike
  _move = false;          // true if user moved the window
  _resizing = false;      // true if user is re-sizing the window
  _close = false;         // true if user clicked the close button

  constructor(props) {
    super(props);
    this.resetWindowCloseDelay = this.resetWindowCloseDelay.bind(this);
    this.handleWindowClose = this.handleWindowClose.bind(this);
    this.handleContainerMouseDown = this.handleContainerMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleDislike = this.handleDislike.bind(this);
    this.handleInfoButton = this.handleInfoButton.bind(this);
    this.handleInfoPanelLeave = this.handleInfoPanelLeave.bind(this);
    this.handleResizing = this.handleResizing.bind(this);
    this.CSSTransitionOnEnter = this.CSSTransitionOnEnter.bind(this);
    this.getNextZOrder = this.getNextZOrder.bind(this);
    
    var d = new Date();
    this.clickTimeStamp = d.setDate(d.getDate()-5); // make sure initial date is stale,

    this._like = false;
    this._dislike = false;

    // if the user has already seen this image, and liked it.
    this._like = this.props.userSignals.items.filter((image) => (
      image.id === this.props.image.id && 
      image.signal === 'LIKE'
    )).length > 0;

    //const imageProps = wpGetImage(this.props.image.api_props);
    //this.props.image.source_url = imageProps.source_url;

    const imageFrameStyle = {
    backgroundImage: "url('" + this.props.image.source_url + "')",
    height: Number(this.props.image.height)
    };
    const windowControlsStyle = {height: imageFrameStyle.height};

    this.state = {
      closerHeight: 'auto',
      imageContainerStyle: {
        zIndex: this.getNextZOrder(),
      },
      imageFrameStyle: imageFrameStyle,
      windowControlsStyle: windowControlsStyle,
      isClosed: false,
      isHovering: false,
      showInfoPanel: false,
      isMounted: false
    }

  }

  componentDidMount() {
    this.resetWindowCloseDelay();
    this.setState({
      isMounted: true
    });


  }

  componentWillUnmount() {
    clearTimeout(this.windowCloseDelay);
  }

  render() {
    // React key

    const key = "image-box-" + this.props.image.key;
    var likeStyles = null;
    var dislikeStyles = null;
    var containerClasses = "image-container m-0 p-1 handle " + this.props.containerClasses + " " + this.props.layout;
    var infoPanelClasses = "info-panel m-0 p-5 text-center";

    if (this.state.isClosed) containerClasses += " window-closer window-closing";
    if (this.state.isHovering) containerClasses += " hovering";
    if (this._like) likeStyles = {fontSize: 'larger', color: "black"};
    if (this._dislike) dislikeStyles = {fontSize: 'larger', color: "red"};

    if (!this.state.showInfoPanel) infoPanelClasses += " hidden";

    /* behavior tracking */
    if (this._click) containerClasses += " analytics_click";
    if (this._move) containerClasses += " analytics_move";
    if (this._resizing) containerClasses += " analytics_resize";
    if (this._like) containerClasses += " analytics_like";
    if (this._dislike) containerClasses += " analytics_dislike window-closing";
    if (this._close) containerClasses += " analytics_close";

    
    // CSSTransition
    // https://reactcommunity.org/react-transition-group/css-transition
    /*
    const CSSTransitionClassNames={
      appear: 'CSSTransition-appear',
      appearActive: 'CSSTransition-appear-active',
      appearDone: 'CSSTransition-appear-done',
      enter: 'CSSTransition-enter',
      enterActive: 'CSSTransition-enter-active',
      enterDone: 'CSSTransition-enter-done',
      exit: 'CSSTransition-exit',
      exitActive: 'CSSTransition-exit-active',
      exitDone: 'CSSTransition-exit-done',
     }  
     */

    // See: https://github.com/STRML/react-draggable
              /*defaultPosition={{x: this.props.image.position_props.left, y: this.props.image.position_props.top}}*/
     /*
                <CSSTransition 
                  key={key + '-css-transition'} 
                  in={this.state.isMounted}
                  classNames={CSSTransitionClassNames} 
                  timeout={1000} 
                  onEnter={this.CSSTransitionOnEnter}
                  ></CSSTransition>
     
     */
    return(
        <React.Fragment >

            <div
            key={key}
            id={this.props.image.id}
            className={containerClasses}
            style={this.state.imageContainerStyle}
            onMouseUp={this.handleMouseUp}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
            >
             <AnimateHeight duration={ 1500 } height={ this.state.closerHeight }>
                  <div className={"image-frame m-0 p-0"} 
                    style={this.state.imageFrameStyle}>
                    <div id="info-panel" className={infoPanelClasses} onMouseLeave={this.handleInfoPanelLeave} >
                      I am the info panel.
                      <div>Marketing URL: {this.props.image.api_props.acf["marketing_url"]}</div>
                      <div>Image ID: {this.props.image.id}</div>
                      <div>Categories: {this.props.image.api_props.categories.join()}</div>
                      
                    </div>
                    <div id="window-controls" style={this.state.windowControlsStyle}>
                      <div className="top-left text-center" onMouseDown={this.handleWindowClose}><i className="fa fa-window-close m-0 p-0"></i></div>
                      <div className="top-right" onMouseDown={this.handleResizing}></div>
                      <div className="bottom-left" onMouseDown={this.handleResizing}></div>
                      <div className="bottom-right" onMouseDown={this.handleResizing}></div>
                    </div>
                    <div id="button-bar" className="text-center">
                      <div className="like" style={likeStyles} onMouseDown={this.handleLike}><i className="fa fa-thumbs-up"></i></div>
                      <div className="info" onMouseDown={this.handleInfoButton}><i className="fa fa-info-circle"></i></div>
                      <div className="dislike" style={dislikeStyles} onMouseDown={this.handleDislike}><i className="fa fa-thumbs-down"></i></div>
                    </div>
                
                  </div>
              </AnimateHeight>
            </div>
        </React.Fragment>
    );
    }

  resetWindowCloseDelay(delay = 365 * 24 * 60 * 60 * 1000) {
    clearTimeout(this.windowCloseDelay);
    const self = this;
    this.windowCloseDelay = setTimeout(function() {
        self.handleWindowClose();
      }, delay);   
  }
  
  handleResizing() {
    this._resizing = true;
  }
  handleMouseUp() {
    this._resizing = false;
  }
  handleMouseEnter() {

    // if the user hovers more than 2500ms then 
    // cancel the auto-close behavior.
    this.setState({
      isHovering: true
    });

    const self = this;
    this.mouseEnterDelay = setTimeout(function() {
      clearTimeout(this.windowCloseDelay);
      self.windowCloseDelay = null;
    }, 3000);   

  }
  handleMouseLeave() {
    clearTimeout(this.mouseEnterDelay);
    if (!this.windowCloseDelay) {
      this.resetWindowCloseDelay();
    }
    this.setState({
      isHovering: false
    });

  }
  handleLike() {
    this._like = (!this._like);
    if (this._dislike) this._dislike = false;
    if (this._like) this.props.actions.addUserSignal(Signals.LIKE, this.props.image);
    else this.props.actions.addUserSignal(Signals.UNLIKE, this.props.image);
  }
  handleDislike() {
    this._dislike = (!this._dislike);
    if (this._like) this._like = false;
    if (this._dislike) {
      this.props.actions.addUserSignal(Signals.DISLIKE, this.props.image);
      this.resetWindowCloseDelay(1500);
    }
    this.setState({
      closerHeight: 0,
    });    
  }
  handleInfoButton () {
    this.setState({
      showInfoPanel: true
    });
    this.props.actions.addUserSignal(Signals.INFO, this.props.image);
  }
  handleInfoPanelLeave() {
    const self = this;
    setTimeout(function() {
      self.setState({
        showInfoPanel: false
      });
  
    }, 500);
  }

  getNextZOrder() {
    var imageContainers = document.getElementsByClassName("image-container"),
        zIndex = 1,
        thisZIndex = 0;

    for (var i = 0; i < imageContainers.length; i++) {
      thisZIndex = Number(imageContainers[i].style.zIndex);
      if (thisZIndex > zIndex) zIndex = thisZIndex;
    }
    zIndex += 1;

    return zIndex;
  }
  
  handleWindowClose() {

    this.resetWindowCloseDelay(1500);
    this.setState({
      closerHeight: 0,
    });    
  
    this._close = true;
    this.props.actions.addUserSignal(Signals.CLOSE, this.props.image);

    const idx = this.props.itemCarousel.present.items.findIndex((item) => item.id === this.props.image.id); 
    this.props.actions.removeItemCarousel(idx);
  }


  handleContainerMouseDown() {

    this.clickTimeStamp = new Date();
    this.setState({
      imageContainerStyle: {
        zIndex: this.getNextZOrder()
      }
    });
    this._click = true;
    // FIX NOTE: this breaks the LIKE redux addition.
    //this.props.actions.addUserSignal(Signals.CLICK, this.props.image);
  }


  handleDragStart() {
    this.setState({
      imageContainerStyle: {
        zIndex: this.getNextZOrder()
      }
    });
  }
  handleDrag() {
    // want this to only be called once.
    if (!this._move) this.props.actions.addUserSignal(Signals.MOVE, this.props.image);
    this._move = true;
  }
  handleDragEnd() {
    this._move = false;
    this.setState({
      imageContainerStyle: {
      }
    });
  }

  CSSTransitionOnEnter() {
    // was using this to debug CSSTransition 
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(ImageBox);