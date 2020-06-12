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
      category_exclusions: [],
      media_query: '',
      image_working_set: null,
      image_queue: null,
      page_number: 1
    }

    this.fetcher = this.fetcher.bind(this);
    this.handle_level = this.handle_level.bind(this);


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
            self.handle_level();
            self.fetcher();
        }, 250);    
        this.setState({
          fetcherTimeout: fetcherTimeout
        });

  }

  handle_level() {

    if (!this.props.categories.isLoading) {
      const cats = this.props.categories.items;
      const exclusions = wpGetExclusions(this.state.level, cats);
      this.setState({
        category_exclusions: exclusions,
        media_query: mediaUrl + "&" + exclusions,
        isCategoryInitialized: true
      });
  
    }
  
  }

  fetcher() {

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
        this.setState({
          image_queue: images,
          page_number: this.state.page_number + 1
        });
        console.log(images);
      })
      .catch(error => {
        /*
            {
              "code": "rest_post_invalid_page_number",
              "message": "The page number requested is larger than the number of pages available.",
              "data": {
                "status": 400
                }
            }

        */
       console.log("frowny face.");
       this.setState({
         page_number: 0
       });

      });
  
    }

    const self = this;
    setTimeout(function() {
        self.fetcher();
    }, 30000 * Math.random());   

  }

  render() {
      return(
          <div className="home-page mt-5 pt-5">
            <div className="row m-2 p-2 text-center">
              {this.state.image_queue != null ? this.state.image_queue.map((obj, indx) => {
                  var imgDict = wpGetImage(obj, "medium");
                  return (
                    <ImageBox 
                    key={indx}
                    imageKey={indx}
                    url={imgDict.source_url}
                    height = {imgDict.height}
                    width = {imgDict.width}
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

