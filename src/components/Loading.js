import React from 'react';
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"

const Loading = () => {
    return(
        <div id="loader" className="col-12 text-center">
            <Loader
                type="ThreeDots"
                color="white"
                height={100}
                width={100}
                timeout={3000}
            />
        </div>
    );
}

export default Loading;