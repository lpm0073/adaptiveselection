// https://reactjsexample.com/react-side-nav-component/

import React, { Component} from 'react';
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';

// Be sure to include styles at some point, probably during your bootstrapping
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import './styles.css';

import { getPublishers } from '../../shared/ImagesApi';


class Sidebar extends Component {

    constructor(props) {
        super(props);

        this.postPublishers = this.postPublishers.bind(this);

        this.state = {
            publishers: []
        };
    }

    componentDidMount() {
        getPublishers(this.postPublishers);
    }

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
                        <NavText>Publications</NavText>                        
                        {this.state.publishers.map((publication) => {
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

    postPublishers(publishers) {

        var obj = [];

        for (var i=0; i<publishers.length; i++) {
          const required = publishers[i].acf.hasOwnProperty("required") ? publishers[i].acf.required : false;
          const publisher = publishers[i].name;
          const categoryId = publishers[i].id;
          const filtered = publishers[i].acf.hasOwnProperty("filtered") ? publishers[i].acf.filtered : false;
          
          const publication = {
              required: required,
              publisher: publisher,
              id: categoryId,
              filtered: filtered
          }
          if (publication.id !== 1 && !publication.required) obj.push(publication);
        }

        this.setState({
            publishers: obj
        });

    }
        
}

export default Sidebar;
