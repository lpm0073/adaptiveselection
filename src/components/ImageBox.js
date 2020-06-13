import React from 'react';

export const ImageBox = (props) => {

    const key = "image-box-" + props.imageKey;
    const divStyle = {
        backgroundImage: "url('" + props.url + "')",
        height: props.height,
        width: props.width
      }
    const label = "Box " + props.imageKey;
  
    return(
        <React.Fragment >
            <div key={key} className="col-lg-4 col-md-6 col-sm-12">
              <div className="box m-1 p-1" style={divStyle}>{label}</div>
            </div>
        </React.Fragment>
    );
  
  }