import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { withRouter } from 'react-router-dom';

// Redux
import { connect } from 'react-redux';
import { fetchSpecialties, fetchCategories } from '../redux/ActionCreators';

// Pages
import Home from '../pages/home/Component';


const mapStateToProps = state => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  fetchSpecialties: () => {dispatch(fetchSpecialties())},
  fetchCategories: () => {dispatch(fetchCategories())}
});


class Routes extends Component {
  
  componentDidMount() {
    this.props.fetchSpecialties();
    this.props.fetchCategories();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
}

  render() {

    return(
        <React.Fragment>
          <Switch>
            <Route path="/home" component={Home} />
            <Redirect to="/home" />
          </Switch>
        </React.Fragment>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Routes));