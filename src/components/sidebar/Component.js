// https://reactjsexample.com/react-side-nav-component/

import React, { Component} from 'react';
import SideNav, { NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import ClickOutside from 'react-click-outside';

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
    constructor(props) {
        super(props);

        this.state = {
            expanded: false
        }
    }
    render() {

        const iconStyle = { fontSize: '1.75em' };
        return(
                <SideNav
                    expanded={this.state.expanded}
                    onToggle={(expanded) => {
                        this.setState({ expanded });
                    }}                
                    onSelect={(selected) => {
                        const to = '/' + selected;
                        if (this.props.location.pathname !== to) {
                            this.props.history.push(to);
                        }                    
                    }}
                >
                    <SideNav.Toggle />
                    <SideNav.Nav defaultSelected="home">
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