import React, {Component}  from 'react';

// redux stuff
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';

// my stuff
import './styles.css';
import ImageBox from '../imageBox/ImageBox';
import Loading from '../Loading';


// module stuff
const classColSM = "col-sm";
const classCol12 = "col-12";
const classCol9 = "col-9";
const classCol8 = "col-8";
const classCol7 = "col-7";
const classCol6 = "col-6";
const classCol5 = "col-5";
const classCol4 = "col-4";
const classCol3 = "col-3";

const DEFAULT_HEIGHT = "300"

const mapStateToProps = state => ({
    ...state
  });
  const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(Actions, dispatch)
  });
  
  class ContentRow extends Component {
    constructor(props) {
        super(props);

        this.layout_null = this.layout_null.bind(this);
        this.layout_1 = this.layout_1.bind(this);
        this.layout_2_1 = this.layout_2_1.bind(this);
        this.layout_2_2 = this.layout_2_2.bind(this);
        this.layout_2_3 = this.layout_2_3.bind(this);
        this.layout_3_1 = this.layout_3_1.bind(this);
        this.layout_3_2 = this.layout_3_2.bind(this);
        this.layout_3_3 = this.layout_3_3.bind(this);
        this.calculateItemDimensions = this.calculateItemDimensions.bind(this);

        this.state = {
            row: [],
            portrait: 0,
            landscape: 0,
            layoutMethod: this.layout_null,
            componentKey: Math.floor(Math.random() * 100000).toString()
        }
    }

    componentDidMount() {
        // build the item object array from the ID values in this.props.row
        var row = [];
        for (var i=0; i<this.props.row.length; i++) {
            const carousel = this.props.imageCarousel.present.items;
            const id = this.props.row[i];
            const item = carousel.filter((n) => n.id === id)[0];
            row.push(item);
        }
        const numItems = row.length;
        var portrait = 0,
            landscape = 0;

        for (i=0; i<numItems; i++) {
            if (row[i].orientation === 'landscape') landscape += 1;
            else portrait += 1;
        }
        this.setState({
            row: row,
            portrait: portrait,
            landscape: landscape
        });

        if (numItems === 0) {
            this.setState({layoutMethod: this.layout_null});
        } else
        if (numItems === 1) {
            this.setState({layoutMethod: this.layout_1});
        } else
        if (numItems === 2) {
            if (landscape === 2 || portrait === 2) {
                this.setState({layoutMethod: this.layout_2_1});
            } else {
                if (Math.random() > 0.5) this.setState({layoutMethod: this.layout_2_2});
                else this.setState({layoutMethod: this.layout_2_3});
            }
        } else
        if (numItems === 3) {
            if (portrait === 0 || landscape === 0) this.setState({layoutMethod: this.layout_3_1});
            else {
                if (Math.random() > 0.5) this.setState({layoutMethod: this.layout_3_2});
                else this.setState({layoutMethod: this.layout_3_3});
            }
        } 
        this.calculateItemDimensions();
    }

    render() {
        return(
            <React.Fragment>
                <div id={this.state.componentKey} key={this.state.componentKey} className="row content-row">
                    {this.state.layoutMethod(this)}
                </div>
            </React.Fragment>
        );
    }

    layout_null() {
        return(
            <Loading />
        );        
    }
    layout_1(self) {
        const item = self.state.row[0];
        const colClass = item.orientation === "landscape" ? "col-2" : "col-3";
        return(
            <React.Fragment>
                <div className={colClass}></div>
                <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_1" containerClasses={classColSM} key={item.key} image = {item} />
                <div className={colClass}></div>
            </React.Fragment>
        );        
    }

    layout_2_1(self) {
        if (!self.props) return(<React.Fragment></React.Fragment>);

        const item1 = self.state.row[0];
        const item2 = self.state.row[1];
        return(
            <React.Fragment>
                <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_2_1" containerClasses={classCol6} key={item1.key} image = {item1} />
                <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_2_1" containerClasses={classCol6} key={item2.key} image = {item2} />
            </React.Fragment>
    );        
    }

    layout_2_2(self) {
        const item1 = self.state.row[0];
        const item2 = self.state.row[1];

        const landscape = item1.orientation === 'landscape' ? item1 : item2;
        const portrait = item1.orientation === 'portrait' ? item1 : item2;

        return(
            <React.Fragment>
                <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_2_3" containerClasses={classCol5} key={portrait.key} image = {portrait} />
                <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_2_3" containerClasses={classCol7} key={landscape.key} image = {landscape} />
            </React.Fragment>
        );
    }

    layout_2_3(self) {
        const item1 = self.state.row[0];
        const item2 = self.state.row[1];

        const landscape = item1.orientation === 'landscape' ? item1 : item2;
        const portrait = item1.orientation === 'portrait' ? item1 : item2;

        return(
            <React.Fragment>
                <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_2_3" containerClasses={classCol7} key={landscape.key} image = {landscape} />
                <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_2_3" containerClasses={classCol5} key={portrait.key} image = {portrait} />
            </React.Fragment>
        );
    }

    layout_3_1(self) {
        const item1 = self.state.row[0];
        const item2 = self.state.row[1];
        const item3 = self.state.row[2];

        return(
            <React.Fragment>
                <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_3_1" containerClasses={classCol4} key={item1.key} image = {item1} />
                <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_3_1" containerClasses={classCol4} key={item2.key} image = {item2} />
                <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_3_1" containerClasses={classCol4} key={item3.key} image = {item3} />
            </React.Fragment>
        );        
    }

    layout_3_2(self) {
        var portrait1, portrait2, landscape1, landscape2;
        const items = self.state.row;
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
                    <ImageBox containerClasses={classCol4} key={portrait1.key} image = {portrait1} />
                    <div className="col-8">
                        <div className="row">
                            <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_3_2" containerClasses={classCol12} key={landscape1.key} image = {landscape1} />
                            <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_3_2" containerClasses={classCol12} key={landscape2.key} image = {landscape2} />
                        </div>
                    </div>
                </React.Fragment>
            );
        else
            return(
                <React.Fragment>
                    <ImageBox containerClasses={classCol4} key={landscape1.key} image = {landscape1} />
                    <div className="col-8">
                        <div className="row">
                            <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_3_2"containerClasses={classCol12} key={portrait1.key} image = {portrait1} />
                            <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_3_2"containerClasses={classCol12} key={portrait2.key} image = {portrait2} />
                        </div>
                    </div>
                </React.Fragment>
            );
}

    layout_3_3(self) {
        if (!self.props) return(<React.Fragment></React.Fragment>);
        var portrait1, portrait2, landscape1, landscape2;
        const items = self.state.row;
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
                    <div className="col-8">
                        <div className="row">
                            <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_3_3" containerClasses={classCol9} key={landscape1.key} image = {landscape1} />
                            <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_3_3" containerClasses={classCol9} key={landscape2.key} image = {landscape2} />
                        </div>
                    </div>
                    <ImageBox height={DEFAULT_HEIGHT} containerClasses={classCol4} key={portrait1.key} image = {portrait1} />
                </React.Fragment>
            );
        else
            return(
                <React.Fragment>
                    <div className="col-8">
                        <div className="row">
                            <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_3_3" containerClasses={classCol9} key={portrait1.key} image = {portrait1} />
                            <ImageBox height={DEFAULT_HEIGHT} parent={self.state.componentKey} layout="layout_3_3" containerClasses={classCol9} key={portrait2.key} image = {portrait2} />
                        </div>
                    </div>
                    <ImageBox containerClasses={classCol4} key={landscape1.key} image = {landscape1} />
                </React.Fragment>
            );
    }

    calculateItemDimensions() {
        console.log("calculateItemDimensions()", this.state.row.length);
        for (var i=0; i<this.state.row.length; i++) {
            console.log("calculateItemDimensions() - ", this.state.row[i]);
        }
    }
}
  export default connect(mapStateToProps, mapDispatchToProps)(ContentRow);