// https://reactjsexample.com/react-side-nav-component/

import React, { Component} from 'react';
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';

// redux stuff
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';

// Be sure to include styles at some point, probably during your bootstrapping
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import './styles.css';

const mapStateToProps = state => ({
    ...state
});
const mapDispatchToProps = (dispatch) => {
  return({
    actions: bindActionCreators(Actions, dispatch)
  });
};

class Sidebar extends Component {

    render() {
        const iconStyle = { fontSize: '1.75em' };
        return(
            <SideNav
                onSelect={(selected) => {
                    console.log("onSelect() - ", selected);
                    // Add your code here
                }}
            >
                <SideNav.Toggle />
                <SideNav.Nav defaultSelected="plugins">
                    <NavItem eventKey="home">
                        <NavIcon><i className="fa fa-fw fa-home" style={iconStyle} /></NavIcon>
                        <NavText>Home</NavText>
                    </NavItem>
                    <NavItem eventKey="plugins">
                        <NavIcon><i className="fa fa-fw fa-plug" style={iconStyle} /></NavIcon>
                        <NavText>Plugins</NavText>                        
                        {this.props.publishers.items.map((publication) => {
                            if (publication.required) return( <React.Fragment></React.Fragment> );
                            return(
                                <NavItem eventKey={"plugins/" + String(publication.publisher)}>
                                    <NavText>
                                        {publication.publisher}
                                    </NavText>
                                </NavItem>
                            );
                        })}
                    </NavItem>
                    <NavItem eventKey="enhancers">
                        <NavIcon><i className="fa fa-fw fa-magic" style={iconStyle} /></NavIcon>
                        <NavText>Enhancers</NavText>
                    </NavItem>
                    <NavItem eventKey="developers">
                        <NavIcon><i className="fa fa-fw fa-code" style={iconStyle} /></NavIcon>
                        <NavText>Developer Center</NavText>
                    </NavItem>
                    <NavItem eventKey="account">
                        <NavIcon><i className="fa fa-fw fa-user" style={iconStyle} /></NavIcon>
                        <NavText>Account</NavText>
                            <NavItem eventKey="account/login">
                                <NavText>Login</NavText>
                            </NavItem>
                            <NavItem eventKey="account/logout">
                                <NavText>Logout</NavText>
                            </NavItem>
                            <NavItem eventKey="settings">
                                <NavText>Settings</NavText>
                            </NavItem>

                    </NavItem>
                </SideNav.Nav>
            </SideNav>            
        );
    }
        
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);