// https://reactjsexample.com/react-side-nav-component/


import React, { Component } from 'react';
import { Navbar, Nav, NavbarToggler, Collapse, NavItem} from 'reactstrap';
import { NavLink } from 'react-router-dom';
import './styles.css';

class Header extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isNavOpen: false,
            isModalOpen: false
          };

          this.toggleNav = this.toggleNav.bind(this);
        }

    toggleNav() {
        this.setState({
            isNavOpen: !this.state.isNavOpen
        });
    }

    render() {
        return(
        <header key="app-header" >
            <Navbar className="navbar-dark bg-dark fixed-left" dark expand="md">
                <NavbarToggler onClick={this.toggleNav} />
                <Collapse isOpen={this.state.isNavOpen} navbar>
                    <Nav navbar>
                        <NavItem>
                            <NavLink className="nav-link"  to='/'>Home</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="nav-link" to='/about'>About</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="nav-link"  to='/specialties'>Specialties</NavLink>
                        </NavItem>
                    </Nav>
                </Collapse>
            </Navbar>
        </header>

        );
    }
}

export default Header;