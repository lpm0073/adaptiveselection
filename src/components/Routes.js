import React, { Component } from 'react';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';

// Redux
import { connect } from 'react-redux';
import { fetchCategories, fetchPublishers } from '../redux/ActionCreators';

// my stuff
import Sidebar from './sidebar/Component';

// Pages
import Feed from '../pages/feed/Component';
import EnhancersPage from '../pages/enhancers/Component';
import AccountPage from '../pages/account/Component';


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
            <Route exact path="/" component={Feed} />
            <Route exact path="/home" component={Feed} />
            <Route exact path="/enhancers" component={EnhancersPage} />
            <Route exact path="/account" component={AccountPage} />
            <Redirect to="/" />
          </Switch>
        </React.Fragment>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Routes));