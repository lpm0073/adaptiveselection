import React, {Component}  from 'react';


import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';

import './styles.css';
import ImageBox from '../imageBox/ImageBox';


const mapStateToProps = state => ({
    ...state
  });
  const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(Actions, dispatch)
  });
  
  class ContentRow extends Component {
    constructor(props) {
        super(props);

        this.state = {
            portrait: 0,
            landscape: 0,
            layoutMethod: this.layout_null
        }
    }

    componentDidMount() {
        var portrait = 0,
            landscape = 0;
            
        console.log("componentDidMount()", this.props);
        const numItems = this.props.row.length;


        for (var i=0; i<numItems; i++) {
            if (this.props.row[i].orientation === 'landscape') landscape += 1;
            else portrait += 1;
        }
        this.setState({
            portrait: portrait,
            landscape: landscape
        });

        if (numItems === 1) {
            this.setState({layoutMethod: this.layout_1});
            return;
        }
        if (numItems === 2) {
            if (landscape === 2 || portrait === 2) {
                this.setState({layoutMethod: this.layout_2_1});
            } else {
                if (Math.random() > 0.5) this.setState({layoutMethod: this.layout_2_2});
                else this.setState({layoutMethod: this.layout_2_3});
            }
            return;
        }
        if (numItems === 3) {
            if (portrait === 0 || landscape === 0) this.setState({layoutMethod: this.layout_3_1});
            else {
                if (Math.random() > 0.5) this.setState({layoutMethod: this.layout_3_2});
                else this.setState({layoutMethod: this.layout_3_3});
            }
            return;
        }
    }

    render() {
        //console.log("render()", this.props);
        return(
            <React.Fragment>
                <div className="row content-row">
                    {this.state.layoutMethod(this)}
                </div>
            </React.Fragment>
        );
    }

    layout_null() {
        return(
            <React.Fragment>

            </React.Fragment>
        );        
    }
    layout_1(self) {
        if (!self.props) return(<React.Fragment></React.Fragment>);
        console.log("layout_1()", self.props);
        const item = self.props.row[0];
        return(
            <div className="col-12">
                <ImageBox key={item.key + "-1"} image = {item} />
            </div>
        );        
    }

    layout_2_1(self) {
        console.log("layout_2_1()", self.props);
        if (!self.props) return(<React.Fragment></React.Fragment>);

        const item1 = self.props.row[0];
        const item2 = self.props.row[1];
        return(
            <React.Fragment>
                <div className="col-6">
                    <ImageBox key={item1.key + "-1"} image = {item1} />
                </div>
                <div className="col-6">
                    <ImageBox key={item2.key + "-1"} image = {item2} />
                </div>
            </React.Fragment>
    );        
    }

    layout_2_2(self) {
        if (!self.props) return(<React.Fragment></React.Fragment>);
        const item1 = self.props.row[0];
        const item2 = self.props.row[1];
        return(
            <React.Fragment>
                <div className="col-6">
                    <ImageBox key={item1.key + "-1"} image = {item1} />
                </div>
                <div className="col-6">
                    <ImageBox key={item2.key + "-1"} image = {item2} />
                </div>
            </React.Fragment>
        );
    }

    layout_2_3(self) {
        if (!self.props) return(<React.Fragment></React.Fragment>);
        const item1 = self.props.row[0];
        const item2 = self.props.row[1];

        const landscape = item1.orientation === 'landscape' ? item1 : item2;
        const portrait = item1.orientation === 'portrait' ? item1 : item2;

        return(
            <React.Fragment>
                <div className="col-9">
                    <ImageBox key={landscape.key + "-1"} image = {landscape} />
                </div>
                <div className="col-3">
                    <ImageBox key={portrait.key + "-1"} image = {portrait} />
                </div>
            </React.Fragment>
        );
    }

    layout_3_1(self) {
        if (!self.props) return(<React.Fragment></React.Fragment>);
        const item1 = self.props.row[0];
        const item2 = self.props.row[1];
        const item3 = self.props.row[2];

        return(
            <React.Fragment>
                <div className="col-4">
                    <ImageBox key={item1.key + "-1"} image = {item1} />
                </div>
                <div className="col-4">
                    <ImageBox key={item2.key + "-1"} image = {item2} />
                </div>
                <div className="col-4">
                    <ImageBox key={item3.key + "-1"} image = {item3} />
                </div>
            </React.Fragment>
        );        
    }

    layout_3_2(self) {
        if (!self.props) return(<React.Fragment></React.Fragment>);
        const items = self.props.row[0];
        const portrait = items.filter((item) => item.orientation === 'portrait')[0];
        var landscape1;
        var landscape2;

        const landscapes = items.filter((item) => item.orientation === 'landscape');

        for (var i=0; i<landscapes.length; i++) {
            if (i===0) landscape1 = landscapes[i];
            if (i===1) landscape2 = landscapes[i];
        }
    
        return(
            <React.Fragment>
                <div className="col-3">
                    <ImageBox key={portrait.key + "-1"} image = {portrait} />
                </div>
                <div className="col-9">
                    <div className="row">
                        <div className="col-6">
                            <ImageBox key={landscape1.key + "-1"} image = {landscape1} />
                        </div>
                        <div className="col-6">
                            <ImageBox key={landscape2.key + "-1"} image = {landscape2} />
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );        
    }

    layout_3_3(self) {
        if (!self.props) return(<React.Fragment></React.Fragment>);
        const items = self.props.row[0];
        const portrait = items.filter((item) => item.orientation === 'portrait')[0];
        var landscape1;
        var landscape2;

        const landscapes = items.filter((item) => item.orientation === 'landscape');

        for (var i=0; i<landscapes.length; i++) {
            if (i===0) landscape1 = landscapes[i];
            if (i===1) landscape2 = landscapes[i];
        }
    
        return(
            <React.Fragment>
                <div className="col-9">
                    <div className="row">
                        <div className="col-6">
                            <ImageBox key={landscape1.key + "-1"} image = {landscape1} />
                        </div>
                        <div className="col-6">
                            <ImageBox key={landscape2.key + "-1"} image = {landscape2} />
                        </div>
                    </div>
                </div>
                <div className="col-3">
                    <ImageBox key={portrait.key + "-1"} image = {portrait} />
                </div>
            </React.Fragment>
        );        
    }
}
  
  export default connect(mapStateToProps, mapDispatchToProps)(ContentRow);