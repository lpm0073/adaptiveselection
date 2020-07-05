import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { withRouter } from 'react-router-dom';

// Redux
import { connect } from 'react-redux';
import { fetchCategories, fetchPublishers } from '../redux/ActionCreators';

// Pages
import Feed from '../pages/feed/Component';


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

  shouldComponentUpdate(nextProps, nextState) {
    return true;
}

  render() {

    return(
        <React.Fragment>
          <Switch>
            <Route path="/" component={Feed} />
            <Redirect to="/" />
          </Switch>
        </React.Fragment>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Routes));