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
      level: 0,
      category_exclusions: [],
      media_query: '',
      image_working_set: null,
      image_queue: null
    }

    this.fetcher = this.fetcher.bind(this);

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
            self.fetcher();
        }, 250);    
        this.setState({
          fetcherTimeout: fetcherTimeout
        });

  }

  fetcher() {

    // initialize the state media_query URL
    if (!this.state.isCategoryInitialized && !this.props.categories.isLoading) {
      const cats = this.props.categories.items;
      const exclusions = wpGetExclusions(0, cats);
      this.setState({
        category_exclusions: exclusions,
        media_query: mediaUrl + "&" + exclusions,
        isCategoryInitialized: true
      });

      fetch(this.state.media_query)
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
        this.setState({
          image_queue: images
        });
      })
      .catch(error => {
        console.log("frowny face.");
      });
  
    }


    /*
    const self = this;
    setTimeout(function() {
        self.fetcher();
    }, 3000 * Math.random());   
     */

  }

  render() {
      console.log("image queue:", this.state.image_queue);
      if (!this.state.image_queue) {
        return(
          <div>still waiting...</div>
        );
      }

      return(
          <div className="home-page mt-5 pt-5">

            <div className="row m-2 p-2 text-center">

              {this.state.image_queue.map((obj, indx) => {
                  console.log("in the zone", obj);
                  return (
                    <ImageBox 
                    key={indx}
                    imageKey="1" 
                    url={wpGetImage(obj)}
                    height = "125px"
                    width = "125px"
                    />
                  );
                })}


              
              <ImageBox 
                imageKey="2" 
                url="https://cdn.fotomashup.com/2020/06/10214304/xf366110106c3d40f98d8dbbe7decab0a-700.jpg" 
                height = "125px"
                width = "125px"
              />
              
              <ImageBox 
                imageKey="3" 
                url="https://cdn.fotomashup.com/2020/06/10214241/Wonderland-004.jpg" 
                height = "125px"
                width = "125px"
              />

              <ImageBox 
                imageKey="4" 
                url="https://cdn.fotomashup.com/2020/06/10214226/women-looking-at-viewer-stockings-black-hair-kitchen-boobs-lingerie-clothing-French-Maid-Leah-Francis-lady-leg-costume-undergarment-fetish-model-soubrette-339304.jpg" 
                height = "125px"
                width = "125px"
              />

              <ImageBox 
                imageKey="5" 
                url="https://cdn.fotomashup.com/2020/06/10214231/women-model-black-hair-leather-latex-catsuit-323011-wallhere.com_.jpg" 
                height = "125px"
                width = "125px"
              />

              <ImageBox 
                imageKey="6" 
                url="https://cdn.fotomashup.com/2020/06/10214206/women-1591617702767-5078.jpg" 
                height = "125px"
                width = "125px"
              />
            </div>

        </div>
      );
  
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

