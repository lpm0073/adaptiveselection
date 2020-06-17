import React, {Component}  from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';


import Draggable from 'react-draggable';
import { CSSTransition } from 'react-transition-group';

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
  _click = false;
  _like = false;
  _dislike = false;
  _move = false;
  _resizing = false;
  _close = false;

  constructor(props) {
    super(props);
    this.handleContainerMouseDown = this.handleContainerMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleWindowClose = this.handleWindowClose.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleDislike = this.handleDislike.bind(this);
    this.handleInfoButton = this.handleInfoButton.bind(this);
    this.handleInfoPanelLeave = this.handleInfoPanelLeave.bind(this);
    this.handleResizing = this.handleResizing.bind(this);
    this.resetWindowCloseDelay = this.resetWindowCloseDelay.bind(this);
    this.CSSTransitionOnEnter = this.CSSTransitionOnEnter.bind(this);
    this.getNextZOrder = this.getNextZOrder.bind(this);
    this.isOnTop = this.isOnTop.bind(this);
    
    var d = new Date();
    this.clickTimeStamp = d.setDate(d.getDate()-5); // make sure initial date is stale,

    this._like = props.image.api_props.analytics.like;
    this._dislike = props.image.api_props.analytics.dislike;

    this.state = {
      imageContainerStyle: {
        zIndex: this.getNextZOrder()
      },
      imageFrameStyle: {
        backgroundImage: "url('" + this.props.image.source_url + "')",
        height: this.props.image.height,
        width: this.props.image.width
      },
      grabberStyle: {
        height: this.props.image.height,
        width: this.props.image.width
      },
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
    const key = "image-box-" + this.props.image.id;
    var likeStyles = null;
    var dislikeStyles = null;
    var containerClasses = "image-container m-0 p-0 handle";
    var infoPanelClasses = "info-panel m-0 p-5 text-center";

    if (this.isOnTop()) containerClasses += " hoverable";
    if (this.state.isClosed) containerClasses += " window-closer";
    if (this.state.isHovering) containerClasses += " hovering";
    if (this._like) likeStyles = {fontSize: 'larger', color: "black"};
    if (this._dislike) dislikeStyles = {fontSize: 'larger', color: "red"};

    if (!this.state.showInfoPanel) infoPanelClasses += " hidden";

    /* behavior tracking */
    if (this._click) containerClasses += " analytics_click";
    if (this._move) containerClasses += " analytics_move";
    if (this._resizing) containerClasses += " analytics_resize";
    if (this._like) containerClasses += " analytics_like";
    if (this._dislike) containerClasses += " analytics_dislike";
    if (this._close) containerClasses += " analytics_close";
    
    // CSSTransition
    // https://reactcommunity.org/react-transition-group/css-transition
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
    // See: https://github.com/STRML/react-draggable

    return(
        <React.Fragment >
            <CSSTransition 
                key={key + '-css-transition'} 
                in={this.state.isMounted}
                classNames={CSSTransitionClassNames} 
                timeout={1000} 
                onEnter={this.CSSTransitionOnEnter}
                >
              <Draggable
              axis="both"
              cancel=".body"
              defaultPosition={{x: this.props.image.position_props.left, y: this.props.image.position_props.top}}
              defaultClassName="react-draggable"
              defaultClassNameDragging="react-draggable-dragging"
              defaultClassNameDragged="react-draggable-dragged"
              handle=".handle"
              onMouseDown={this.handleContainerMouseDown}
              onStart={this.handleDragStart}
              onDrag={this.handleDrag}
              onStop={this.handleDragEnd}
              >
                <div
                key={key}
                id={this.props.image.id}
                className={containerClasses}
                style={this.state.imageContainerStyle}
                onMouseUp={this.handleMouseUp}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                >
                  <div className="image-frame m-0 p-0" 
                    style={this.state.imageFrameStyle}>
                    <div id="info-panel" className={infoPanelClasses} onMouseLeave={this.handleInfoPanelLeave} >
                      I am the info panel.
                      <div>Marketing URL: {this.props.image.api_props.acf["marketing_url"]}</div>
                      <div>Image ID: {this.props.image.id}</div>
                      <div>Categories: {this.props.image.api_props.categories.join()}</div>
                      
                    </div>
                    <div id="grabbers" style={this.state.grabberStyle}>
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
                </div>
              </Draggable>
            </CSSTransition>
        </React.Fragment>
    );
    }

  resetWindowCloseDelay(delay = 15000 + Math.floor(Math.random() * 45000)) {
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
  }
  handleDislike() {
    this._dislike = (!this._dislike);
    if (this._like) this._like = false;
    if (this._dislike) this.resetWindowCloseDelay(1500);
  }
  handleInfoButton () {
    this.setState({
      showInfoPanel: true
    });
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
  
  isOnTop() {

    var imageContainers = document.getElementsByClassName("image-container"),
        thisZIndex = 0;

    for (var i = 0; i < imageContainers.length; i++) {
      thisZIndex = Number(imageContainers[i].style.zIndex);
      if (thisZIndex > this.state.imageContainerStyle.zIndex) return false;
    }
    return true;
  }

  handleWindowClose() {
    this.setState({
      isClosed: true
    });
    this._close = true;

    const idx = this.props.imageCarousel.items.findIndex((item) => item.id === this.props.image.id); 
    this.props.actions.removeImageCarousel(idx);
  }


  handleContainerMouseDown() {

    this.clickTimeStamp = new Date();
    this.setState({
      imageContainerStyle: {
        zIndex: this.getNextZOrder()
      }
    });
    this._click = true;
  }


  handleDragStart() {
    // Drag start
  }
  handleDrag() {
    this._move = true;

  }
  handleDragEnd() {
    // Drag stop

  }

  CSSTransitionOnEnter() {
    // was using this to debug CSSTransition 
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(ImageBox);