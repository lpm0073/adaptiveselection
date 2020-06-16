import React, {Component} from 'react';
import Draggable from 'react-draggable';

class ImageBox extends Component {

  clickTimeStamp;
  windowCloseDelay;

  /* behavior tracking */
  _click = false;
  _like = false;
  _dislike = false;
  _move = false;
  _resizing = false;
  _close = false;

  constructor(props) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.getNextZOrder = this.getNextZOrder.bind(this);
    this.isOnTop = this.isOnTop.bind(this);
    this.handleWindowClose = this.handleWindowClose.bind(this);
    this.toggleHover = this.toggleHover.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleDislike = this.handleDislike.bind(this);
    this.handleResizing = this.handleResizing.bind(this);
    this.resetWindowCloseDelay = this.resetWindowCloseDelay.bind(this);
    
    var d = new Date();
    this.clickTimeStamp = d.setDate(d.getDate()-5); // make sure initial date is stale,

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
      isHovering: false
    }
  }

  componentDidMount() {
    this.resetWindowCloseDelay();
  }

  componentWillUnmount() {
    clearTimeout(this.windowCloseDelay);
  }

  render() {
    // React key
    const key = "image-box-" + this.props.image.id;
    const label = "Box " + this.props.image.id;
    var likeStyles = null;
    var dislikeStyles = null;
    var containerClasses = "image-container m-0 p-0 handle";
    if (this.isOnTop()) containerClasses += " hoverable";
    if (this.state.isClosed) containerClasses += " window-closer";
    if (this.state.isHovering) containerClasses += " hovering";
    if (this._like) likeStyles = {fontSize: 'larger', color: "green"};
    if (this._dislike) dislikeStyles = {fontSize: 'larger', color: "red"};

    /* behavior tracking */
    if (this._click) containerClasses += " analytics_click";
    if (this._move) containerClasses += " analytics_move";
    if (this._resizing) containerClasses += " analytics_resize";
    if (this._like) containerClasses += " analytics_like";
    if (this._dislike) containerClasses += " analytics_dislike";
    if (this._close) containerClasses += " analytics_close";
    
    // See: https://github.com/STRML/react-draggable

    return(
        <React.Fragment >
          <Draggable
            axis="both"
            cancel=".body"
            defaultPosition={{x: this.props.image.position_props.left, y: this.props.image.position_props.top}}
            defaultClassName="react-draggable"
            defaultClassNameDragging="react-draggable-dragging"
            defaultClassNameDragged="react-draggable-dragged"
            handle=".handle"
            onMouseDown={this.handleMouseDown}
            onStart={this.handleStart}
            onDrag={this.handleDrag}
            onStop={this.handleStop}
            >

              <div
                key={key}
                id={this.props.image.id}
                className={containerClasses}
                style={this.state.imageContainerStyle}
                onMouseEnter={this.toggleHover}
                onMouseLeave={this.toggleHover}
                onMouseUp={this.handleMouseUp}
                >
                <div className="image-frame m-0 p-0" 
                      style={this.state.imageFrameStyle}>
                      <div id="grabbers" style={this.state.grabberStyle}>
                        <div className="top-left text-center" onMouseDown={this.handleWindowClose}><i class="fa fa-window-close m-0 p-0"></i></div>
                        <div className="top-right" onMouseDown={this.handleResizing}></div>
                        <div className="bottom-left" onMouseDown={this.handleResizing}></div>
                        <div className="bottom-right" onMouseDown={this.handleResizing}></div>
                      </div>
                      <div id="button-bar" className="text-center">
                        <div className="like" style={likeStyles} onMouseDown={this.handleLike}><i class="fa fa-thumbs-up"></i></div>
                        <div className="dislike" style={dislikeStyles} onMouseDown={this.handleDislike}><i class="fa fa-thumbs-down"></i></div>
                      </div>
                </div>
              </div>

          </Draggable>
        </React.Fragment>
    );
    }

  resetWindowCloseDelay() {
    clearTimeout(this.windowCloseDelay);
    const delay = 15000 + Math.floor(Math.random() * 45000);       // image lifespan of 15 to 60 seconds
    const self = this;
    this.windowCloseDelay = setTimeout(function() {self.handleWindowClose();}, delay);   
  }
  
  handleResizing() {
    this._resizing = true;
  }
  handleMouseUp() {
    this._resizing = false;
  }
  handleLike() {
    this._like = (!this._like);
    if (this._dislike) this._dislike = false;
  }
  handleDislike() {
    this._dislike = (!this._dislike);
    if (this._like) this._like = false;
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
  }

  toggleHover() {
    this.setState({
      isHovering: !this.state.isHovering
    });

    if (this.state.isHovering) {
      clearTimeout(this.windowCloseDelay);
    } else {
      if (!this.windowCloseDelay) this.resetWindowCloseDelay();

    }
  }

  handleMouseDown() {

    this.clickTimeStamp = new Date();
    this.setState({
      imageContainerStyle: {
        zIndex: this.getNextZOrder()
      }
    });
    this._click = true;
  }


  handleStart() {
    // Drag start
  }
  handleDrag() {
    this._move = true;

  }
  handleStop() {
    // Drag stop

  }

}


export default ImageBox;

