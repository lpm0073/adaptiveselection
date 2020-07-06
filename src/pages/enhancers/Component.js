// https://reactjsexample.com/react-side-nav-component/

import React, { Component} from 'react';

// redux stuff
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';

// my stuff
import './styles.css';

const mapStateToProps = state => ({
    ...state
});
const mapDispatchToProps = (dispatch) => {
  return({
    actions: bindActionCreators(Actions, dispatch)
  });
};

class EnhancersPage extends Component {

    render() {

        return(
            <h1>Enhancers Page</h1>
        );
    }
        
}

export default connect(mapStateToProps, mapDispatchToProps)(EnhancersPage);