import React, {Component}  from 'react';


import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';

import './styles.css';
import ImageBox from '../imageBox/ImageBox';

const classCol12 = "col-sm";
const classCol9 = "col-sm";
const classCol6 = "col-sm";
const classCol4 = "col-sm";
const classCol3 = "col-sm";

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
        const item = self.props.row[0];
        const colClass = item.orientation === "landscape" ? "col-2" : "col-3";
        return(
            <React.Fragment>
                <div className={colClass}></div>
                <ImageBox layout="layout_1" containerClasses={classCol12} key={item.key + "-1"} image = {item} />
                <div className={colClass}></div>
            </React.Fragment>
        );        
    }

    layout_2_1(self) {
        if (!self.props) return(<React.Fragment></React.Fragment>);

        const item1 = self.props.row[0];
        const item2 = self.props.row[1];
        return(
            <React.Fragment>
                <ImageBox layout="layout_2_1" containerClasses={classCol6} key={item1.key + "-1"} image = {item1} />
                <ImageBox layout="layout_2_1" containerClasses={classCol6} key={item2.key + "-1"} image = {item2} />
            </React.Fragment>
    );        
    }

    layout_2_2(self) {
        const item1 = self.props.row[0];
        const item2 = self.props.row[1];
        if (item1.orientation === item2.orientation === "portrait") 
        return(
            <React.Fragment>
                <div className="col-2"></div>
                <ImageBox layout="layout_2_2" containerClasses={classCol4} key={item1.key + "-1"} image = {item1} />
                <ImageBox layout="layout_2_2" containerClasses={classCol4} key={item2.key + "-1"} image = {item2} />
                <div className="col-2"></div>
            </React.Fragment>
        ); 
        else
        return(
            <React.Fragment>
                <ImageBox layout="layout_2_2" containerClasses={classCol6} key={item1.key + "-1"} image = {item1} />
                <ImageBox layout="layout_2_2" containerClasses={classCol6} key={item2.key + "-1"} image = {item2} />
            </React.Fragment>
        ); 
    }

    layout_2_3(self) {
        const item1 = self.props.row[0];
        const item2 = self.props.row[1];

        const landscape = item1.orientation === 'landscape' ? item1 : item2;
        const portrait = item1.orientation === 'portrait' ? item1 : item2;

        return(
            <React.Fragment>
                <ImageBox layout="layout_2_3" containerClasses={classCol9} key={landscape.key + "-1"} image = {landscape} />
                <ImageBox layout="layout_2_3" containerClasses={classCol3} key={portrait.key + "-1"} image = {portrait} />
            </React.Fragment>
        );
    }

    layout_3_1(self) {
        const item1 = self.props.row[0];
        const item2 = self.props.row[1];
        const item3 = self.props.row[2];

        return(
            <React.Fragment>
                <ImageBox layout="layout_3_1" containerClasses={classCol4} key={item1.key + "-1"} image = {item1} />
                <ImageBox layout="layout_3_1" containerClasses={classCol4} key={item2.key + "-1"} image = {item2} />
                <ImageBox layout="layout_3_1" containerClasses={classCol4} key={item3.key + "-1"} image = {item3} />
            </React.Fragment>
        );        
    }

    layout_3_2(self) {
        var portrait1, portrait2, landscape1, landscape2;
        const items = self.props.row;
        const portraits = items.filter((item) => item.orientation === 'portrait');
        const landscapes = items.filter((item) => item.orientation === 'landscape');

        for (var i=0; i<landscapes.length; i++) {
            if (i===0) landscape1 = landscapes[i];
            if (i===1) landscape2 = landscapes[i];
        }
        for (i=0; i<portraits.length; i++) {
            if (i===0) portrait1 = portraits[i];
            if (i===1) portrait2 = portraits[i];
        }
        
        if (self.state.landscape === 2) 
            return(
                <React.Fragment>
                    <ImageBox containerClasses={classCol3} key={portrait1.key + "-1"} image = {portrait1} />
                    <div className="col-9">
                        <div className="row">
                            <ImageBox layout="layout_3_2" containerClasses={classCol6} key={landscape1.key + "-1"} image = {landscape1} />
                            <ImageBox layout="layout_3_2" containerClasses={classCol6} key={landscape2.key + "-1"} image = {landscape2} />
                        </div>
                    </div>
                </React.Fragment>
            );
        else
            return(
                <React.Fragment>
                    <ImageBox containerClasses={classCol3} key={landscape1.key + "-1"} image = {landscape1} />
                    <div className="col-9">
                        <div className="row">
                            <ImageBox layout="layout_3_2"containerClasses={classCol6} key={portrait1.key + "-1"} image = {portrait1} />
                            <ImageBox layout="layout_3_2"containerClasses={classCol6} key={portrait2.key + "-1"} image = {portrait2} />
                        </div>
                    </div>
                </React.Fragment>
            );
}

    layout_3_3(self) {
        if (!self.props) return(<React.Fragment></React.Fragment>);
        var portrait1, portrait2, landscape1, landscape2;
        const items = self.props.row;
        const portraits = items.filter((item) => item.orientation === 'portrait');
        const landscapes = items.filter((item) => item.orientation === 'landscape');

        for (var i=0; i<landscapes.length; i++) {
            if (i===0) landscape1 = landscapes[i];
            if (i===1) landscape2 = landscapes[i];
        }
        for (i=0; i<portraits.length; i++) {
            if (i===0) portrait1 = portraits[i];
            if (i===1) portrait2 = portraits[i];
        }
        
        if (self.state.landscape === 2) 
            return(
                <React.Fragment>
                    <div className="col-9">
                        <div className="row">
                            <ImageBox layout="layout_3_3" containerClasses={classCol9} key={landscape1.key + "-1"} image = {landscape1} />
                            <ImageBox layout="layout_3_3" containerClasses={classCol9} key={landscape2.key + "-1"} image = {landscape2} />
                        </div>
                    </div>
                    <ImageBox containerClasses={classCol3} key={portrait1.key + "-1"} image = {portrait1} />
                </React.Fragment>
            );
        else
            return(
                <React.Fragment>
                    <div className="col-9">
                        <div className="row">
                            <ImageBox layout="layout_3_3" containerClasses={classCol9} key={portrait1.key + "-1"} image = {portrait1} />
                            <ImageBox layout="layout_3_3" containerClasses={classCol9} key={portrait2.key + "-1"} image = {portrait2} />
                        </div>
                    </div>
                    <ImageBox containerClasses={classCol3} key={landscape1.key + "-1"} image = {landscape1} />
                </React.Fragment>
            );
    }
}
  export default connect(mapStateToProps, mapDispatchToProps)(ContentRow);