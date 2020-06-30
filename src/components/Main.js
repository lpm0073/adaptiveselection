import React, { Component } from 'react';

// Shared
import Header from './header/Component';
import Sidebar from './sidebar/Component';
import Footer from './footer/Component';
import Routes from './Routes';


class Main extends Component {

  render() {
    return ( 
      <div className="container-fluid p-0">
        <Sidebar />
        <Routes />
        <Footer />
      </div>
    )
  }
}

export default Main;
