import React, { Component } from 'react';

// Shared
import Routes from './Routes';
import PrivacyDisclaimer from './privacyDisclaimer/PrivacyDisclaimer';


class Main extends Component {

  render() {
    return ( 
      <div className="container-fluid p-0">
        <PrivacyDisclaimer />
        <Routes />
      </div>
    )
  }
}

export default Main;
