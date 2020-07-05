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
                <SideNav.Nav defaultSelected="home">
                    <NavItem eventKey="home">
                        <NavIcon><i className="fa fa-fw fa-home" style={iconStyle} /></NavIcon>
                        <NavText>Home</NavText>
                    </NavItem>
                    <NavItem eventKey="publications">
                        <NavIcon><i className="fa fa-fw fa-book" style={iconStyle} /></NavIcon>
                        <NavText>Plugins</NavText>                        
                        {this.props.publishers.items.map((publication) => {
                            return(
                                <NavItem eventKey={"publications/" + String(publication.publisher)}>
                                    <NavText>
                                        {publication.publisher}
                                    </NavText>
                                </NavItem>
                            );
                        })}
                    </NavItem>
                </SideNav.Nav>
            </SideNav>            
        );
    }
        
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);