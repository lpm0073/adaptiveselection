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

        // build the item object array from the ID values in this.props.row
        var row = [];
        for (var i=0; i<this.props.row.length; i++) {
            const carousel = this.props.imageCarousel.present.items;
            const id = this.props.row[i];
            const item = carousel.filter((n) => n.id === id)[0];
            row.push(item);
        }
        const numItems = row.length;
        var portrait = [],
            landscape = [];

        for (i=0; i<numItems; i++) {
            if (row[i].orientation === 'landscape') landscape.push(row[i].id);
            else portrait.push(row[i].id);
        }

        var layoutMethod;
        if (numItems === 0) layoutMethod = this.layout_null;
        else if (numItems === 1) layoutMethod = this.layout_1
        else if (numItems === 2) {
            if (landscape.length === 2 || portrait.length === 2) layoutMethod = this.layout_2_1;
            else {
                if (Math.random() > 0.5) layoutMethod = this.layout_2_2;
                else layoutMethod = this.layout_2_3;
            }
        }
        else if (numItems === 3) {
            if (portrait.length === 0 || landscape.length === 0) layoutMethod = this.layout_3_1;
            else {
                if (Math.random() > 0.5) layoutMethod = this.layout_3_2;
                else layoutMethod = this.layout_3_3;
            }
        } 

        this.state = {
            row: row,
            portrait: portrait,
            landscape: landscape,
            layoutMethod: layoutMethod,
            componentKey: Math.floor(Math.random() * 100000).toString()
        }
    }

    componentDidMount() {
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
        console.log("layout_3_3()", this.state.landscape, this.state.portrait);
        if (!self.props) return(<React.Fragment></React.Fragment>);
        var portrait1 = null, portrait2 = null, landscape1 = null, landscape2 = null;
        const items = self.state.row;
        const portraits = this.state.portrait;
        const landscapes = this.state.landscape;

        for (var i=0; i<landscapes.length; i++) {
            const id = landscapes[i];
            if (i===0) landscape1 = items.filter((item) => item.id === id)[0];
            if (i===1) landscape2 = items.filter((item) => item.id === id)[0];
        }
        for (i=0; i<portraits.length; i++) {
            const id = portraits[i];
            if (i===0) portrait1 = items.filter((item) => item.id === id)[0];
            if (i===1) portrait2 = items.filter((item) => item.id === id)[0];
        }

        console.log(landscape1, landscape2, portrait1, portrait2);

        if (self.state.landscape.length === 2) 
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
        // window.screen.height
        function groupHeight(self) {
            var height = 999999;
            for (var i=0; i<self.state.row.length; i++) {
                if (self.state.row[i].height < height) height = self.state.row[i].height;
            }
            return height;
        }
        function groupWidth(self) {
            var width = 0;
            for (var i=0; i<self.state.row.length; i++) {
                width += self.state.row[i].height;
            }
            return width;
        }
        function compressionRatio(self) {
            if (window.screen.height === 0) return 0;
            return groupWidth(self) / window.screen.height;
        }
        console.log("portfolio, landscape", this.state.portrait, this.state.landscape);
        console.log("height: ", groupHeight(this));
        console.log("width: ", groupWidth(this));
        if (this.state.portrait.length === 0 || this.state.landscape.length === 0) {
            console.log("all are same orentation");
        } else {
            if (this.state.portrait.length > this.state.landscape.length) {
                console.log("1 or more portraits");
            } else {
                console.log("1 or more landscapes");
            }
        }
        for (var i=0; i<this.state.row.length; i++) {

        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentRow);