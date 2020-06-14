import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

export const ImageBox = (props) => {

  // React key
  const key = "image-box-" + props.imageKey;

  // styling props: url, height, width
  const imageFrameStyle = {
      backgroundImage: "url('" + props.url + "')",
      height: props.height,
      width: props.width
    }
  const label = "Box " + props.imageKey;

  // positioning props: position_top, position_left, slope, duration
  const imageContainerStyle = {
    top: props.position_top,
    left: props.position_left
  }

  return(
      <React.Fragment >
          <TransitionGroup>
              <CSSTransition key={key} classNames="image" timeout={300}>
                <div key={key}
                  className="image-container col-lg-4 col-md-6 col-sm-12 m-2 p-2" 
                  style={imageContainerStyle}>

                  <div className="image-frame m-0 p-0" 
                        style={imageFrameStyle}>{label}
                  </div>
                </div>
              </CSSTransition>
          </TransitionGroup>              
          
      </React.Fragment>
  );

  }