import React, {Component}  from 'react';

// redux stuff
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';

// my stuff
import './styles.css';
import ImageBox from '../imageBox/ImageBox';
import Loading from '../Loading';

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
            const carousel = this.props.itemCarousel.present.items;
            const id = this.props.row[i];
            const item = carousel.filter((n) => n.id === id)[0];
            row.push(item);
        }

        const numItems = row.length;
        const portrait = row.filter((item) => item.image_props.orientation === "portrait")
                            .map((item) => {return item.id});
        const landscape = row.filter((item) => item.image_props.orientation === "landscape")
                             .map((item) => {return item.id});

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
            row: this.calculateItemDimensions(row, portrait, landscape),
            portrait: portrait,
            landscape: landscape,
            layoutMethod: layoutMethod,
            componentKey: Math.floor(Math.random() * 100000).toString()
        }
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
        const colLeft = Math.floor((12 - item.columns)/2);
        const colRight = 12 - item.columns - colLeft;
        return(
            <React.Fragment>
                <div className={"col-" + colLeft}></div>
                <ImageBox parent={self.state.componentKey} layout="layout_1" containerClasses={item.bootstrapClass} key={item.key} image = {item} />
                <div className={"col-" + colRight}></div>
            </React.Fragment>
        );        
    }

    layout_2_1(self) {
        if (!self.props) return(<React.Fragment></React.Fragment>);

        const item1 = self.state.row[0];
        const item2 = self.state.row[1];
        return(
            <React.Fragment>
                <ImageBox parent={self.state.componentKey} layout="layout_2_1" containerClasses={item1.bootstrapClass} key={item1.key} image = {item1} />
                <ImageBox parent={self.state.componentKey} layout="layout_2_1" containerClasses={item2.bootstrapClass} key={item2.key} image = {item2} />
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
                <ImageBox parent={self.state.componentKey} layout="layout_2_3" containerClasses={portrait.bootstrapClass} key={portrait.key} image = {portrait} />
                <ImageBox parent={self.state.componentKey} layout="layout_2_3" containerClasses={landscape.bootstrapClass} key={landscape.key} image = {landscape} />
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
                <ImageBox parent={self.state.componentKey} layout="layout_2_3" containerClasses={landscape.bootstrapClass} key={landscape.key} image = {landscape} />
                <ImageBox parent={self.state.componentKey} layout="layout_2_3" containerClasses={portrait.bootstrapClass} key={portrait.key} image = {portrait} />
            </React.Fragment>
        );
    }

    layout_3_1(self) {
        const item1 = self.state.row[0];
        const item2 = self.state.row[1];
        const item3 = self.state.row[2];

        return(
            <React.Fragment>
                <ImageBox parent={self.state.componentKey} layout="layout_3_1" containerClasses={item1.bootstrapClass} key={item1.key} image = {item1} />
                <ImageBox parent={self.state.componentKey} layout="layout_3_1" containerClasses={item2.bootstrapClass} key={item2.key} image = {item2} />
                <ImageBox parent={self.state.componentKey} layout="layout_3_1" containerClasses={item3.bootstrapClass} key={item3.key} image = {item3} />
            </React.Fragment>
        );        
    }

    layout_3_2(self) {
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

        if (self.state.landscape.length === 2) 
            return(
                <React.Fragment>
                    <div className="col-8">
                        <div className="row">
                            <ImageBox parent={self.state.componentKey} layout="layout_3_3" containerClasses={landscape1.bootstrapClass} key={landscape1.key} image = {landscape1} />
                            <ImageBox parent={self.state.componentKey} layout="layout_3_3" containerClasses={landscape2.bootstrapClass} key={landscape2.key} image = {landscape2} />
                        </div>
                    </div>
                    <ImageBox containerClasses={portrait1.bootstrapClass} key={portrait1.key} image = {portrait1} />
                </React.Fragment>
            );
        else
            return(
                <React.Fragment>
                    <div className="col-8">
                        <div className="row">
                            <ImageBox parent={self.state.componentKey} layout="layout_3_3" containerClasses={portrait1.bootstrapClass} key={portrait1.key} image = {portrait1} />
                            <ImageBox parent={self.state.componentKey} layout="layout_3_3" containerClasses={portrait2.bootstrapClass} key={portrait2.key} image = {portrait2} />
                        </div>
                    </div>
                    <ImageBox containerClasses={landscape1.bootstrapClass} key={landscape1.key} image = {landscape1} />
                </React.Fragment>
            );
    }

    layout_3_3(self) {
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

        if (self.state.landscape.length === 2) 
            return(
                <React.Fragment>
                    <div className="col-8">
                        <div className="row">
                            <ImageBox parent={self.state.componentKey} layout="layout_3_3" containerClasses={landscape1.bootstrapClass} key={landscape1.key} image = {landscape1} />
                            <ImageBox parent={self.state.componentKey} layout="layout_3_3" containerClasses={landscape2.bootstrapClass} key={landscape2.key} image = {landscape2} />
                        </div>
                    </div>
                    <ImageBox containerClasses={portrait1.bootstrapClass} key={portrait1.key} image = {portrait1} />
                </React.Fragment>
            );
        else
            return(
                <React.Fragment>
                    <div className="col-8">
                        <div className="row">
                            <ImageBox parent={self.state.componentKey} layout="layout_3_3" containerClasses={portrait1.bootstrapClass} key={portrait1.key} image = {portrait1} />
                            <ImageBox parent={self.state.componentKey} layout="layout_3_3" containerClasses={portrait2.bootstrapClass} key={portrait2.key} image = {portrait2} />
                        </div>
                    </div>
                    <ImageBox containerClasses={landscape1.bootstrapClass} key={landscape1.key} image = {landscape1} />
                </React.Fragment>
            );
    }

    calculateItemDimensions(rowItems, portrait, landscape) {

        function groupHeight(group) {
            const max = .50 * window.screen.height;
            var retval = 999999;
            for (var i=0; i<group.length; i++) {
                retval = group[i].image_props.height < retval ? group[i].image_props.height : retval;
            }
            return retval < max ? retval : max;
        }
        function groupWidth(group) {
            var width = 0;
            for (var i=0; i<group.length; i++) {
                width += group[i].image_props.width;
            }
            return width;
        }
        function pairRectangles(rect1, rect2) {
            const rect1Area = rect1.width * rect1.height;
            const rect2Area = rect2.width * rect2.height;
            var height = groupHeight([rect1, rect2]);
            var retval;
            if (rect1.orientation === rect2.orientation === "landscape") height /= 2;

            if (rect1Area < rect2Area) {
                retval = {
                    rect1: height,
                    rect2: {
                        height: height ,
                        aspect_ratio: rect2.aspect_ratio,
                        width: height / rect2.aspect_ratio
                    }
                }
            }
            else {
                retval = {
                    rect2: rect2,
                    rect1: {
                        height: height,
                        aspect_ratio: rect1.aspect_ratio,
                        width: height / rect1.aspect_ratio
                    }
                }
            }
            return retval;
        }

        // easiest possible situation: only 1 item on the row
        if (rowItems.length <= 1) {
            const viewWidth = 0.75 * window.screen.width;
            rowItems[0].height = groupHeight(rowItems);
            rowItems[0].width = rowItems[0].height / rowItems[0].image_props.aspect_ratio;
            rowItems[0].columns = Math.floor(12 * (rowItems[0].width / viewWidth));
            rowItems[0].columns = rowItems[0].columns > 1 ? rowItems[0].columns : 2;
            rowItems[0].bootstrapClass = "single-item col-" + rowItems[0].columns;
            console.log("single item", rowItems[0], window.screen.width);
            return(rowItems);
        }
        else 
        // common orientations, or, only two items on the row
        if (portrait.length === 0 || 
            landscape.length === 0 ||
            portrait.length === landscape.length) {

            // normalize heights
            const targetHeight = .50 * window.screen.height;
            for (var i=0; i<rowItems.length; i++) {
                rowItems[i].height = targetHeight;
                rowItems[i].width = rowItems[i].height / rowItems[i].image_props.aspect_ratio;
            }
            
            // normalize widths
            var totWidth = rowItems.map((item) => {return item.width;}).reduce((a, b) => a + b);
            var compressionFactor = window.screen.width / totWidth;
            for (i=0; i<rowItems.length; i++) {
                rowItems[i].width *= compressionFactor;
                rowItems[i].height = rowItems[i].width * rowItems[i].image_props.aspect_ratio;
            }

            // calc Bootstrap 12ths per item
            totWidth = rowItems.map((item) => {return item.width;}).reduce((a, b) => a + b);
            var totCols = 0;
            for (i=0; i<rowItems.length; i++) {
                rowItems[i].columns = Math.floor(12 * (rowItems[i].width / totWidth));
                totCols += rowItems[i].columns;
            }
            // adjust for over/under
            var columns = rowItems.slice(1).map((item) => {return item.columns;}).reduce((a, b) => a + b);
            rowItems[0].columns = (12 - columns);    
            for (i=0; i<rowItems.length; i++) {
                if (portrait.length === landscape.length) rowItems[i].bootstrapClass = "2-images ";
                else rowItems[i].bootstrapClass = "common-orientations ";
                rowItems[i].bootstrapClass += " col-" + rowItems[i].columns;
            }
            return(rowItems);

        } else 
        // this would be an internal error
        if (rowItems.length === 2) {
            console.log("we shouldn't be here.");
        } else
        if (rowItems.length === 3) {
            console.log("there are three items.");
            if (landscape.length > 1) {
                // a pair of rectangles
                var landscape1, landscape2;
                for (i=0; i<landscape.length; i++) {
                    const id = landscape[i];
                    if (i===0) landscape1 = rowItems.filter((n) => n.id === id)[0];
                    if (i===1) landscape2 = rowItems.filter((n) => n.id === id)[0];
                }

                var pairedRects = pairRectangles(landscape1, landscape2);
                landscape1.height = pairedRects.rect1.height;
                landscape1.width = pairedRects.rect1.width;
                landscape2.height = pairedRects.rect2.height;
                landscape2.width = pairedRects.rect2.width;

                const id = portrait[0];
                portrait = rowItems.filter((n) => n.id === id)[0];
                pairedRects = pairRectangles(landscape1, portrait);
                portrait.height = pairedRects.rect2.height;
                portrait.width = pairedRects.rect2.width;

                // calc Bootstrap 12ths per item
                var landscapeRows = [landscape1, landscape2];
                totWidth = groupWidth(landscapeRows);
                totCols = 0;
                for (i=0; i<landscapeRows.length; i++) {
                    landscapeRows[i].columns = Math.floor(6 * (landscapeRows[i].width / totWidth));
                    totCols += landscapeRows[i].columns;
                }
                landscapeRows[landscapeRows.length - 1].columns += (6 - totCols);    // in case we're over/under
                for (i=0; i<landscapeRows.length; i++) {
                    landscapeRows[i].bootstrapClass = "3-w-pair-of-landscapes col-" + landscapeRows[i].columns;
                    console.log("3-fer", landscapeRows[i].bootstrapClass);
                }

                rowItems = [landscape1, landscape2, portrait];

            } else {
                console.log("a pair of portraits");

            }
        }

        return(rowItems);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentRow);