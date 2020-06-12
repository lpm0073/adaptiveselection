import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';


import './styles.css';
import {ImageBox} from '../../components/ImageBox';

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
      
    }
  }

  categoryWeights() {
    const categories = this.props.categories.items;
    for (var i=0; i++; i < categories.length) {
        const x = {

        }
    }
  }

  render() {
      if (!this.props.categories.isLoading) {
        console.log(this.props.categories.items);
      }
      return(
          <div className="home-page mt-5 pt-5">

            <div className="row m-2 p-2 text-center">
              <ImageBox 
                imageKey="1" 
                url="https://cdn.fotomashup.com/2020/06/10214318/y9bfvi6080121.jpg"
                height = "125px"
                width = "125px"
                />
              
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

