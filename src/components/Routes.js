import React, { Component } from 'react';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';

// Redux
import { connect } from 'react-redux';
import { fetchCategories, fetchPublishers } from '../redux/ActionCreators';

// Pages
import Feed from '../pages/feed/Component';
import Sidebar from './sidebar/Component';


const mapStateToProps = state => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  fetchCategories: () => {dispatch(fetchCategories())},
  fetchPublishers: () => {dispatch(fetchPublishers())}
});


class Routes extends Component {
  
  componentDidMount() {
    this.props.fetchCategories();
    this.props.fetchPublishers();
  }


  render() {
    return(
        <React.Fragment>
          <Sidebar history={this.props.history} location={this.props.location} />
          <Switch>
            <Route path="/" component={Feed} />
            <Redirect to="/" />
          </Switch>
        </React.Fragment>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Routes));