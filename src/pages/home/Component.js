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
      fetcherDelay: null,
      repaintDelay: null,
      level: 4,
      page_number: Math.floor(Math.random() * 25),
      category_exclusions: [],
      media_query: '',
      image_working_set: [],
      image_carousel: [],
      number_of_images: 8
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


  repaint() {
    /* place a random image on a random imageKey at a random point in time. */
    if (this.state.image_working_set.length > 0) {
          const imageKey = this.getRandomImageFrame();
          const images = this.state.image_working_set;
          const image = this.getRandomImage(images);
          const elapsed = this.getElapsedTime(imageKey);
          console.log("repaint()", imageKey, elapsed);
          if (imageKey != null && elapsed > 30000) {
              this.setBackgroundUrl(imageKey, image);
          }
      }
    const delay = this.state.image_carousel.length < this.state.number_of_images ? 500 : 15000;
    const self = this;
    const repaintDelay = setTimeout(function() {
        self.repaint();
    }, delay * Math.random());   

    this.setState({
      repaintDelay: repaintDelay
    });
    return;

  
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.level !== nextState.level) {
      console.log("the level changed.");
    }
    return true;
  }

  componentDidMount() {

        const self = this;
        const fetcherDelay = setTimeout(function() {
            self.handleChangeLevel();
            self.imageFetcher();
            self.repaint();
        }, 250);    
        this.setState({
          fetcherDelay: fetcherDelay
        });
  }

  componentWillUnmount() {
    clearTimeout(this.state.fetcherDelay);
    clearTimeout(this.state.repaintDelay);
  }

  render() {
      return(
          <div className="home-page mt-5 pt-5">
            <div className="row m-2 p-2 text-center">
              {this.state.image_carousel.length > 0 ? this.state.image_carousel.map((image) => {
                  return (
                    <ImageBox 
                    key={image.key}
                    imageKey={image.key}
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

  getRandomImage(images) {

    if (images === null) return null;
    var image, i = 0;
    do {
        image = images[Math.floor(Math.random() * images.length)];
        if (!this.isImageCollision(image)) return image;
        i++;
    } while (i <= 2 * images.length)

    return null;
  }

  getElapsedTime(imageKey) {
    const d = new Date();
    let elapsed;

    this.state.image_carousel
    .filter(image => {
      return image.key === imageKey;
    })
    .map(image => {
      elapsed = d - image.timestamp;
    });
    if (elapsed > 0) return elapsed;
    return 999999;
  }


  getRandomImageFrame() {
    if (this.state.image_carousel.length < this.state.number_of_images - 1) return this.state.image_carousel.length;
    return Math.floor(Math.random() * this.state.number_of_images);
  }

  isImageCollision(imageCandidate) {

    this.state.image_carousel
    .filter(image => imageCandidate.id === image.id)
    .map(image => {
      console.log("collision!!!");
      return true;
    });

    return false;

  }

  setBackgroundUrl(imageKey, newImage) {
    newImage = wpGetImage(newImage, "medium");

    let newImageSet;
    const obj = {
      key: parseInt(imageKey, 10),
      id: parseInt(newImage.id, 10),
      source_url: newImage.source_url,
      height: parseInt(newImage.height, 10),
      width: parseInt(newImage.width, 10),
      timestamp: new Date()
    }

    newImageSet = this.state.image_carousel.filter(image => image.key !== imageKey);
    newImageSet.push(obj);

    this.setState({
      image_carousel: newImageSet
    });
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
      fetch(url)
      .then(response => {
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
        this.setState({
          image_working_set: image_working_set,
          page_number: this.state.page_number + Math.floor(Math.random() * 10)
        });
      })
      .catch(error => {
        console.log("frowny face.");
        this.setState({
          page_number: Math.floor(Math.random() * 25)
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
    const delay = this.state.image_working_set.length < 4 * this.state.number_of_images ? 500: 30000;
    const self = this;

    const fetcherDelay = setTimeout(function() {
        self.imageFetcher();
    }, delay * Math.random());
    this.setState({
      fetcherDelay: fetcherDelay
    });

  }


}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

