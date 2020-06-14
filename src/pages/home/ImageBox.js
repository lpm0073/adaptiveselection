import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';

class ImageBox extends Component {

  _timeoutID;

  constructor(props) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.getNextZOrder = this.getNextZOrder.bind(this);
    
    var d = new Date();

    this.state = {
      clickTimeStamp: d.setDate(d.getDate()-5), // make sure initial date is stale,
      imageContainerStyle: {
        zIndex: this.getNextZOrder()
      },
      imageFrameStyle: {
        backgroundImage: "url('" + this.props.url + "')",
        height: this.props.height,
        width: this.props.width
      }      
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

    console.log("getNextZOrder()", zIndex);
    return zIndex;
  }
  
  handleMouseDown() {
    console.log("handleMouseDown()");
    clearTimeout(this._timeoutID);
    this.setState({
      clickTimeStamp: new Date(),
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

  render() {
    // React key
    const key = "image-box-" + this.props.imageKey;
    const label = "Box " + this.props.imageKey;

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
                className="image-container m-2 p-2" 
                style={this.state.imageContainerStyle}
                >
                <div className="image-frame m-0 p-0" 
                      style={this.state.imageFrameStyle}>{label}
                </div>
              </div>

          </Draggable>
        </React.Fragment>
    );
    }
}

export default ImageBox;
