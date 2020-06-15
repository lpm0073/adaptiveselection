import React, {Component} from 'react';
import Draggable from 'react-draggable';

class ImageBox extends Component {

  _timeoutID;
  clickTimeStamp;

  constructor(props) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.getNextZOrder = this.getNextZOrder.bind(this);
    this.isOnTop = this.isOnTop.bind(this);
    this.handleWindowClose = this.handleWindowClose.bind(this);
    this.toggleHover = this.toggleHover.bind(this);
    
    var d = new Date();
    this.clickTimeStamp = d.setDate(d.getDate()-5); // make sure initial date is stale,

    this.state = {
      imageContainerStyle: {
        zIndex: this.getNextZOrder()
      },
      imageFrameStyle: {
        backgroundImage: "url('" + this.props.url + "')",
        height: this.props.height,
        width: this.props.width
      },
      grabberStyle: {
        height: this.props.height,
        width: this.props.width
      },
      isClosed: false,
      isHovering: false
    }
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
  }

  toggleHover() {
    this.setState({
      isHovering: !this.state.isHovering
    });
  }

  handleMouseDown() {

    clearTimeout(this._timeoutID);
    this.clickTimeStamp = new Date();
    this.setState({
      imageContainerStyle: {
        zIndex: this.getNextZOrder()
      }
    });
  }


  handleStart() {
    console.log("handleStart()");
  }
  handleDrag() {
    console.log("handleDrag()");
  }
  handleStop() {
    console.log("handleStop()");
  }

  eventLogger = (e: MouseEvent, data: Object) => {
    console.log('Event: ', e);
    console.log('Data: ', data);
  };

  render() {
    // React key
    const key = "image-box-" + this.props.imageKey;
    const label = "Box " + this.props.imageKey;
    var containerClasses = "image-container m-0 p-0 handle";
    if (this.isOnTop()) containerClasses += " hoverable";
    if (this.state.isClosed) containerClasses += " window-closer";
    if (this.state.isHovering) containerClasses += " hovering";

    // See: https://github.com/STRML/react-draggable
    return(
        <React.Fragment >
          <Draggable
            axis="both"
            bounds="parent"
            defaultPosition={{x: this.props.position_left, y: this.props.position_top}}
            cancel=".body"
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
                id={this.props.imageKey}
                className={containerClasses}
                style={this.state.imageContainerStyle}
                onMouseEnter={this.toggleHover} 
                onMouseLeave={this.toggleHover}                
                >
                <div className="image-frame m-0 p-0" 
                      style={this.state.imageFrameStyle}>
                      <div id="grabbers" style={this.state.grabberStyle}>
                        <div className="top-left text-center" onMouseDown={this.handleWindowClose}>X</div>
                        <div className="top-right"></div>
                        <div className="bottom-left"></div>
                        <div className="bottom-right"></div>
                      </div>
                </div>
              </div>

          </Draggable>
        </React.Fragment>
    );
    }
}

export default ImageBox;
