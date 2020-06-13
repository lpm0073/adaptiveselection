import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';


import './styles.css';
import {ImageBox} from '../../components/ImageBox';
import { wpGetExclusions } from '../../shared/categories';
import { mediaUrl } from '../../shared/urls';
import { wpGetImage } from '../../shared/wpGetImage';

const mapStateToProps = state => ({
    ...state
});
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
});


class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isCategoryInitialized: false,
      fetcherTimeout: null,
      level: 1,
      page_number: 1,
      category_exclusions: [],
      media_query: '',
      image_working_set: [],
      image_carousel: [],
      number_of_images: 10
    }

    this.imageFetcher = this.imageFetcher.bind(this);
    this.handleChangeLevel = this.handleChangeLevel.bind(this);
    this.repaint = this.repaint.bind(this);
    this.getRandomImageFrame = this.getRandomImageFrame.bind(this);
    this.isImageCollision = this.isImageCollision.bind(this);
    this.getRandomImage = this.getRandomImage.bind(this);
    this.setBackgroundUrl = this.setBackgroundUrl.bind(this);
    this.getElapsedTime = this.getElapsedTime.bind(this);
  }

  getRandomImageFrame() {
    console.log("getRandomImageFrame");
    return Math.floor(Math.random() * this.state.number_of_images);
  }

  isImageCollision(url) {
    console.log("isImageCollision");
    this.state.image_carousel.map((image) => {
        if (url === image.source_url) return true;
    });
    return false;

  }

  getRandomImage(images) {
    console.log("getRandomImage()");

    if (images === null) return null;

    var image, i = 0;
    do {
        image = images[Math.floor(Math.random() * images.length)];
        i++;
    } while (this.isImageCollision(image) && (i <= images.length))
    return image;
  }

  getElapsedTime(imageKey) {
    const d = new Date();

    this.state.image_carousel.map((image) => {
        if (image.key === imageKey) return d - image.timestamp;
    });
    return 999999;
  }

  setBackgroundUrl(imageKey, newImage) {
    console.log("setBackgroundUrl() - imageKey", imageKey);
    console.log("setBackgroundUrl() - newImage", newImage);

    newImage = wpGetImage(newImage, "medium");
    console.log("setBackgroundUrl() - newImage (processed)", newImage);

    var newImageSet = [];
    const obj = {
      key: imageKey,
      source_url: newImage.source_url,
      height: newImage.height,
      width: newImage.width,
      timestamp: new Date()
    }
    newImageSet.push(obj);

    this.state.image_carousel.map((image) => {
        if (image.key !== imageKey.key) {
          newImageSet.push(image);
        }
    });

    console.log("setBackgroundUrl() - newImageSet", newImageSet);

    this.setState({
      image_carousel: newImageSet
    });


  }

  repaint() {
    /* place a random image on a random imageKey at a random point in time. */
    if (this.state.image_working_set.length > 0) {

        const imageKey = this.getRandomImageFrame();
        const images = this.state.image_working_set;

        const image = this.getRandomImage(images);
        const elapsed = this.getElapsedTime(imageKey);

        console.log("repaint() imageKey", imageKey);
        console.log("repaint() images", images);
        console.log("repaint() image", image);
        console.log("repaint() elapsed", elapsed);

        if (imageKey != null && elapsed > 2000) {
            this.setBackgroundUrl(imageKey, image);
        }

    }

    const self = this;
    setTimeout(function() {
        self.repaint();
    }, 5000 * Math.random());   
  
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.level !== nextState.level) {
      console.log("the level changed.");
    }
    return true;
  }

  componentDidMount() {

        const self = this;
        const fetcherTimeout = setTimeout(function() {
            self.handleChangeLevel();
            self.imageFetcher();
            self.repaint();
        }, 250);    
        this.setState({
          fetcherTimeout: fetcherTimeout
        });
  }

  componentWillUnmount() {
    clearTimeout(this.state.fetcherTimeout);
  }

  handleChangeLevel() {

    if (this.props.categories.isLoading && !this.state.isCategoryInitialized) {
      // we're not ready, so wait 500ms and then try again.
      const self = this;
      setTimeout(function() {
          self.handleChangeLevel();
      }, 500);
      return;
    }

      const cats = this.props.categories.items;
      const exclusions = wpGetExclusions(this.state.level, cats);
      this.setState({
        category_exclusions: exclusions,
        media_query: mediaUrl + "&" + exclusions,
        isCategoryInitialized: true
      });
  
  }

  imageFetcher() {

    // initialize the state media_query URL
    if (this.state.isCategoryInitialized && !this.props.categories.isLoading) {
      const url = this.state.media_query + "&page=" + this.state.page_number;
      console.log(url);
      fetch(url)
      .then(
          response => {
              if (response.ok) {
                  return response;
              } else {
                  var error = new Error('Error ' + response.status + ': ' + response.statusText);
                  error.response = response;
                  throw error;
              }
          },
          error => {
              var errmess = new Error(error.message);
              throw errmess;
          })
      .then(response => response.json())
      .then(images => {
        const image_working_set = this.state.image_working_set.concat(images);
        console.log("loaded: image_working_set", image_working_set);
        this.setState({
          image_working_set: image_working_set,
          page_number: this.state.page_number + 1
        });
      })
      .catch(error => {
        console.log("frowny face.");
        this.setState({
          page_number: 1
        });
         /*
            {
              "code": "rest_post_invalid_page_number",
              "message": "The page number requested is larger than the number of pages available.",
              "data": {
                "status": 400
                }
            }
        */
      });
  
    }

    const self = this;
    setTimeout(function() {
        self.imageFetcher();
    }, 30000 * Math.random());   

  }

  render() {
      return(
          <div className="home-page mt-5 pt-5">
            <div className="row m-2 p-2 text-center">
              {this.state.image_carousel.length > 0 ? this.state.image_carousel.map((image, indx) => {
                  console.log("render()", image);
                  return (
                    <ImageBox 
                    key={indx}
                    imageKey={indx}
                    url={image.source_url}
                    height = {image.height}
                    width = {image.width}
                    />
                  );
                })
                :
                <div>i am waiting</div>
              }
            </div>
        </div>
      );
  
  }



}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

