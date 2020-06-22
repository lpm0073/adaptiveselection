import React, {Component}  from 'react';


import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';
import * as Signals from '../../redux/userSignals';

import './styles.css';
import ImageBox from '../imageBox/ImageBox';


const mapStateToProps = state => ({
    ...state
  });
  const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(Actions, dispatch)
  });
  
  class ContentRow extends Component {

    render() {
        //console.log("render()", this.props);
        return(
            <React.Fragment>
                <div className="row content-row">
                    {this.props.row.map((item, idx) => {
                        return(
                            <ImageBox key={item.key + "-" + idx} image = {item} />
                            );
                    })}
                </div>
            </React.Fragment>
        );
    }

  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(ContentRow);