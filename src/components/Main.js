import React, { Component } from 'react';

// Shared
import Sidebar from './sidebar/Component';
import Routes from './Routes';


class Main extends Component {

  render() {
    return ( 
      <div className="container-fluid p-0">
        <Sidebar />
        <Routes />
      </div>
    )
  }
}

export default Main;
