import React, {Component}  from 'react';

// redux stuff
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';

// my stuff
import './styles.css';
import ImageBox from '../imageBox/ImageBox';
import ArticleBox from '../articleBox/ArticleBox';

const mapStateToProps = state => ({
    ...state
  });
  const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(Actions, dispatch)
  });
  
  class ContentRow extends Component {
    constructor(props) {
        super(props);

        this.layout_0 = this.layout_0.bind(this);
        this.layout_1 = this.layout_1.bind(this);
        this.layout_2_1 = this.layout_2_1.bind(this);
        this.layout_2_2 = this.layout_2_2.bind(this);
        this.layout_2_3 = this.layout_2_3.bind(this);
        this.layout_3_1 = this.layout_3_1.bind(this);
        this.layout_3_2 = this.layout_3_2.bind(this);
        this.layout_3_3 = this.layout_3_3.bind(this);
        this.generateRowArray = this.generateRowArray.bind(this);
        this.getPortrait = this.getPortrait.bind(this);
        this.getLandscape = this.getLandscape.bind(this);
        this.init = this.init.bind(this);
        this.setLayout = this.setLayout.bind(this);
        this.calculateItemDimensions = this.calculateItemDimensions.bind(this);

        // build the item object array from the ID values in this.props.row

        this.state = {
            id: this.props.id,      // row identifier
            presentationRow: null,
            rawRow: null,
            portrait: [],
            landscape: [],
            layoutMethod: this.layout_0,
            componentKey: Math.floor(Math.random() * 100000).toString()
        }
    }

    componentWillReceiveProps() {
        this.init();
    }

    render() {
        return(
            <div id={this.state.componentKey} key={this.state.componentKey} className="row content-row">
                {this.state.layoutMethod(this)}
            </div>
        );
    }


    init() {

        const rawRow = this.generateRowArray();
        const portrait = this.getPortrait(rawRow);
        const landscape = this.getLandscape(rawRow);

        this.setState({
            rawRow: rawRow,
            portrait: portrait,
            landscape: landscape
        });

        const presentationRow = this.calculateItemDimensions(rawRow, portrait, landscape);
        const layoutMethod = this.setLayout(rawRow, portrait, landscape);

        this.setState({
            presentationRow: presentationRow,
            layoutMethod: layoutMethod
        });

    }

    getPortrait(row) {

        return row.filter((item) => item.orientation === "portrait")
                .map((item) => {return item.id})
                .sort((a, b) => a.id - b.id);

    }
    getLandscape(row) {

        return row.filter((item) => item.orientation === "landscape")
                .map((item) => {return item.id})
                .sort((a, b) => a.id - b.id);

    }
    generateRowArray() {
        // id's for row items for this instance, sorted
        const itemRow = this.props.itemRow.present.items
                        .filter((item) => item.id === this.state.id)
                        .map((item) => {return item.row})[0];

        // item objects for the id's in itemRow
        return this.props.itemCarousel.present.items
                .filter((item) => itemRow.includes(item.id))
                .sort((a, b) => a.id - b.id);
    }

    setLayout(row, portrait, landscape) {
        const numItems = row.length;

        if (numItems === 0) return this.layout_0;
        if (numItems === 1) return this.layout_1;
        if (numItems === 2) {
            if (landscape.length === 2 || portrait.length === 2) return this.layout_2_1;
            else {
                if (landscape[0] % 2 === 0) return this.layout_2_2;
                else return this.layout_2_3;
            }
        }
        if (numItems === 3) {
            if (portrait.length === 0 || landscape.length === 0) return this.layout_3_1;
            else {
                if (landscape[0] % 2 === 0) return this.layout_3_2;
                else return this.layout_3_3;
            }
        } 
        console.log("setLayout - internal error: didn't resolve to a layout", row, portrait, landscape, this.state.rawRow, this.state.presentationRow);
        return this.layout_0;
    }

    layout_0(self) {
        return(<React.Fragment></React.Fragment>);        
    }
    
    layout_1(self) {
        const item = self.state.presentationRow[0];
        const colLeft = Math.floor((12 - item.columns)/2);
        const colRight = 12 - item.columns - colLeft;
        const colTotal = colLeft + colRight;

        if (self.state.presentationRow[0].id % 3 === 0)
            return(
                <React.Fragment>
                    <ArticleBox className={"col-sm-12 col-lg-" + colLeft} columns={colLeft} height={item.height} />
                    <ImageBox parent={self.state.componentKey} layout="layout_1" containerClasses={item.bootstrapClass} key={item.key} image = {item} />
                    <ArticleBox className={"col-sm-12 col-lg-" + colRight} columns={colRight} height={item.height}  />
                </React.Fragment>
            );        
        if (self.state.presentationRow[0].id % 3 === 1)
            return(
                <React.Fragment>
                    <ArticleBox className={"col-sm-12 col-lg-" + colTotal} columns={colTotal} height={item.height} />
                    <ImageBox parent={self.state.componentKey} layout="layout_1" containerClasses={item.bootstrapClass} key={item.key} image = {item} />
                </React.Fragment>
            );
        if (self.state.presentationRow[0].id % 3 === 2)
            return(
                <React.Fragment>
                    <ImageBox parent={self.state.componentKey} layout="layout_1" containerClasses={item.bootstrapClass} key={item.key} image = {item} />
                    <ArticleBox className={"col-sm-12 col-lg-" + colTotal} columns={colTotal} height={item.height} />
                </React.Fragment>
            );        
    }

    layout_2_1(self) {
        if (!self.props) return(<React.Fragment></React.Fragment>);

        const item1 = self.state.presentationRow[0];
        const item2 = self.state.presentationRow[1];
        return(
            <React.Fragment>
                <ImageBox parent={self.state.componentKey} layout="layout_2_1" containerClasses={item1.bootstrapClass} key={item1.key} image = {item1} />
                <ImageBox parent={self.state.componentKey} layout="layout_2_1" containerClasses={item2.bootstrapClass} key={item2.key} image = {item2} />
            </React.Fragment>
    );        
    }

    layout_2_2(self) {
        const item1 = self.state.presentationRow[0];
        const item2 = self.state.presentationRow[1];

        const landscape = item1.orientation === 'landscape' ? item1 : item2;
        const portrait = item1.orientation === 'portrait' ? item1 : item2;

        return(
            <React.Fragment>
                <ImageBox parent={self.state.componentKey} layout="layout_2_2" containerClasses={portrait.bootstrapClass} key={portrait.key} image = {portrait} />
                <ImageBox parent={self.state.componentKey} layout="layout_2_2" containerClasses={landscape.bootstrapClass} key={landscape.key} image = {landscape} />
            </React.Fragment>
        );
    }

    layout_2_3(self) {
        const item1 = self.state.presentationRow[0];
        const item2 = self.state.presentationRow[1];

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
        const item1 = self.state.presentationRow[0];
        const item2 = self.state.presentationRow[1];
        const item3 = self.state.presentationRow[2];

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
        const portraitItems = self.state.presentationRow.filter((item) => this.state.portrait.includes(item.id));
        const landscapeItems = self.state.presentationRow.filter((item) => this.state.landscape.includes(item.id));


        if (self.state.landscape.length === 2) 
            return(
                <React.Fragment>
                    <div className="col-lg-7">
                        <div className="row">
                            <ImageBox parent={self.state.componentKey} layout="layout_3_2" containerClasses={landscapeItems[0].bootstrapClass} key={landscapeItems[0].key} image = {landscapeItems[0]} />
                            <ImageBox parent={self.state.componentKey} layout="layout_3_2" containerClasses={landscapeItems[1].bootstrapClass} key={landscapeItems[1].key} image = {landscapeItems[1]} />
                        </div>
                    </div>
                    <ImageBox parent={self.state.componentKey} layout="layout_3_2" containerClasses={portraitItems[0].bootstrapClass} key={portraitItems[0].key} image = {portraitItems[0]} />
                </React.Fragment>
            );
        else
        // a pair of portraits
            return(
                <React.Fragment>
                    <ImageBox parent={self.state.componentKey} layout="layout_3_2" containerClasses={portraitItems[0].bootstrapClass} key={portraitItems[0].key} image = {portraitItems[0]} />
                    <ImageBox parent={self.state.componentKey} layout="layout_3_2" containerClasses={portraitItems[1].bootstrapClass} key={portraitItems[1].key} image = {portraitItems[1]} />
                    <ImageBox parent={self.state.componentKey} layout="layout_3_2" containerClasses={landscapeItems[0].bootstrapClass} key={landscapeItems[0].key} image = {landscapeItems[0]} />
                </React.Fragment>
            );
    }

    layout_3_3(self) {
        if (!self.props) return(<React.Fragment></React.Fragment>);
        const portraitItems = self.state.presentationRow.filter((item) => this.state.portrait.includes(item.id));
        const landscapeItems = self.state.presentationRow.filter((item) => this.state.landscape.includes(item.id));


        if (self.state.landscape.length === 2) 
            return(
                <React.Fragment>
                    <ImageBox parent={self.state.componentKey} layout="layout_3_2" containerClasses={portraitItems[0].bootstrapClass} key={portraitItems[0].key} image = {portraitItems[0]} />
                    <div className="col-lg-7">
                        <div className="row">
                            <ImageBox parent={self.state.componentKey} layout="layout_3_2" containerClasses={landscapeItems[0].bootstrapClass} key={landscapeItems[0].key} image = {landscapeItems[0]} />
                            <ImageBox parent={self.state.componentKey} layout="layout_3_2" containerClasses={landscapeItems[1].bootstrapClass} key={landscapeItems[1].key} image = {landscapeItems[1]} />
                        </div>
                    </div>
                </React.Fragment>
            );
        else
        // a pair of portraits
            return(
                <React.Fragment>
                    <ImageBox parent={self.state.componentKey} layout="layout_3_2" containerClasses={landscapeItems[0].bootstrapClass} key={landscapeItems[0].key} image = {landscapeItems[0]} />
                    <ImageBox parent={self.state.componentKey} layout="layout_3_2" containerClasses={portraitItems[0].bootstrapClass} key={portraitItems[0].key} image = {portraitItems[0]} />
                    <ImageBox parent={self.state.componentKey} layout="layout_3_2" containerClasses={portraitItems[1].bootstrapClass} key={portraitItems[1].key} image = {portraitItems[1]} />
                </React.Fragment>
            );
    }

    calculateItemDimensions(rowItems, portrait, landscape) {
        if (rowItems.length === 0) return;

        var targetWidth = 0.67 * window.screen.width;
        var targetHeight = .50 * window.screen.height;
        var portraitItems = rowItems.filter((item) => portrait.includes(item.id));
        var landscapeItems = rowItems.filter((item) => landscape.includes(item.id));
        let landscape1, landscape2, portrait1, portrait2, i = 0, totWidth, totCols, columns;

        function groupHeight(group) {
            // return smallest height
            const height = group.sort((a, b) => a.height - b.height)[0].height;
            return height < targetHeight ? height : targetHeight;
        }
        function groupWidth(group) {
            // return sum of widths
            return group.map((item) => {return item.width;}).reduce((a, b) => a + b);
        }
        function avgAspectRatio(group) {
            // return sum of widths
            if (group.length === 0) return 0;
            return group.map((item) => {return item.image_props.aspect_ratio;}).reduce((a, b) => a + b) / group.length;
        }
        function pairRectangles(rect1, rect2) {
            var height = groupHeight([rect1, rect2]);
            if (rect1.orientation === rect2.orientation === "landscape") height = height / 2;

            return {
                rect1: {
                    height: height,
                    aspect_ratio: rect1.image_props.aspect_ratio,
                    width: height / rect1.image_props.aspect_ratio
                },
                rect2: {
                    height: height ,
                    aspect_ratio: rect2.image_props.aspect_ratio,
                    width: height / rect2.image_props.aspect_ratio
                }
            }
        }
        function proportionalWidth(group) {
            const totWidth = groupWidth(group);
            for (i=0; i<group.length; i++) {
                group[i].width = targetWidth * (rowItems[i].width / totWidth);
                group[i].height = rowItems[i].width * rowItems[i].image_props.aspect_ratio;
            }
            return group;
        }
        function normalizeHeight(group) {
            const height = groupHeight(group);
            for (i=0; i<group.length; i++) {
                group[i].height = height;
                group[i].width = targetHeight / group[i].image_props.aspect_ratio;
            }
            return group;
        }
        function setBootstrapAttributes(group) {
            if (group.length === 0) return group;

            // =ROUNDDOWN((-(Aspect_Ratio-AVG_ASPECT_RATIO)/AVG_ASPECT_RATIO) / (1/12), 0)
            totCols = 0;
            const avg_aspect_ratio = avgAspectRatio(group);
            for (i=0; i<group.length; i++) {
                const aspect_ratio = group[i].image_props.aspect_ratio;
                const adj = Math.floor((group.length / 12) * (-(aspect_ratio-avg_aspect_ratio)/avg_aspect_ratio) / (1/12));
                const cols = 12/group.length + adj;
                group[i].columns = cols;
                totCols += group[i].columns;
            }

            // adjust for over/under
            columns = group.slice(1).map((item) => {return item.columns;}).reduce((a, b) => a + b);
            group[0].columns = (12 - columns);

            // generate bootstrap classes
            for (i=0; i<group.length; i++) {
                group[i].bootstrapClass += " col-sm-12 col-lg-" + group[i].columns;
            }
            return group;
        }
        function analyzeContent(group) {
            // rowItems, portrait, landscape
            for (i=0; i<group.length; i++) {
                if (group.length === 1) group[i].bootstrapClass += " single-item "; 
                if (portrait.length === 0) group[i].bootstrapClass += " all-landscapes "; 
                else if (landscape.length === 0) group[i].bootstrapClass += " all-portraits "; 
                else if (landscape.length === portrait.length) group[i].bootstrapClass += " 1landscape-1portrait "; 
                else if (landscape.length === 2) group[i].bootstrapClass += " 2landscapes-1portrait "; 
                else if (portrait.length === 2) group[i].bootstrapClass += " 2portraits-1landscape "; 
            }
            return group;
        }
        function initializeContent(group) {
            // rowItems, portrait, landscape
            for (i=0; i<group.length; i++) {
                group[i].bootstrapClass = group[i].orientation;
                group[i].width = group[i].image_props.width;
                group[i].height = group[i].image_props.height;
                group[i].aspect_ratio = group[i].image_props.aspect_ratio;
            }
            return group;
        }

        //---------- calculations begin here. -----------------------------------------------------
        rowItems = initializeContent(rowItems);
        rowItems = analyzeContent(rowItems);

        // single item on the row
        if (rowItems.length <= 1) {
            rowItems[0].height = groupHeight(rowItems);
            rowItems[0].width = rowItems[0].height / rowItems[0].image_props.aspect_ratio;
            rowItems[0].columns = 1 + Math.floor(11 * (rowItems[0].width / targetWidth));
            rowItems[0].columns = rowItems[0].columns >= 3 ? rowItems[0].columns : 3;
            rowItems[0].columns = rowItems[0].columns <= 12 ? rowItems[0].columns : 12;
            rowItems[0].bootstrapClass += "col-sm-12 col-lg-" + rowItems[0].columns;
            return(rowItems);
        }
        else 
        // two mixed items on the row
        if (portrait.length === landscape.length) {
            rowItems = proportionalWidth(rowItems);
            rowItems = normalizeHeight(rowItems);
            rowItems = setBootstrapAttributes(rowItems);
            return(rowItems);
        } else
        // 2 or more common orientations
        if (portrait.length === 0 || landscape.length === 0) {

            if (landscape.length === 0) {
                // all portraits
                rowItems = proportionalWidth(rowItems);
                rowItems = normalizeHeight(rowItems);
            } else {
                // all landscapes
                rowItems = proportionalWidth(rowItems);
                rowItems = normalizeHeight(rowItems);
            }

            rowItems = setBootstrapAttributes(rowItems);
            return(rowItems);

        } else 
        // this would be an internal error
        if (rowItems.length === 2) {
            console.log("calculateItemDimensions() internal error: rowItems.length === 2. We shouldn't be here.");
        } else
        // 3 mixed items
        if (rowItems.length === 3) {
            if (landscape.length > 1) {
                // a pair of rectangles
                landscape1 = landscapeItems[0];
                landscape2 = landscapeItems[1];

                const pairedRects = pairRectangles(landscape1, landscape2);
                landscape1.height = pairedRects.rect1.height;
                landscape1.width = pairedRects.rect1.width;
                landscape2.height = pairedRects.rect2.height;
                landscape2.width = pairedRects.rect2.width;

                portrait1 = portraitItems[0];
                portrait1.height = (landscape1.height + landscape2.height + 8); // 8px for padding
                portrait1.width = portrait1.height / portrait1.image_props.aspect_ratio;

                // rectangles are stacked. both should be 12 columns wide
                landscape1.columns = 12;
                landscape2.columns = 12;
                landscape1.bootstrapClass += "col-12";
                landscape2.bootstrapClass += "col-12";
                portrait1.columns = 6;
                portrait1.bootstrapClass += "col-sm-12 col-lg-5";

                if (
                    landscape1.height === 0 || landscape1.height === 'NaN' || landscape1.height === undefined ||
                    landscape1.width === 0 || landscape1.width === 'NaN' || landscape1.width === undefined ||
                    landscape2.height === 0 || landscape2.height === 'NaN' || landscape2.height === undefined ||
                    landscape2.width === 0 ||  landscape2.width === 'NaN' || landscape2.width === undefined ||
                    portrait1.height === 0 || portrait1.height === 'NaN' || portrait1.height === undefined ||
                    portrait1.width === 0 || portrait1.width === 'NaN' || portrait1.width === undefined
                    )
                    console.log("internal error w pair of landscapes", [landscape1, landscape2, portrait1]);
                return([landscape1, landscape2, portrait1]);

            } else {
                landscape1 = landscapeItems[0];
                portrait1 = portraitItems[0];
                portrait2 = portraitItems[1];

                landscape1.width = 0.25 * window.screen.height;
                landscape1.height = landscape1.width / landscape1.image_props.aspect_ratio;

                portrait1.height = landscape1.height;
                portrait1.width = portrait1.height * portrait1.image_props.aspect_ratio;

                portrait2.height = landscape1.height;
                portrait2.width = portrait2.height * portrait2.image_props.aspect_ratio;


                // calc Bootstrap 12ths per item
                var portraitRows = [portrait1, portrait2, landscape1];
                totWidth = groupWidth(portraitRows);
                totCols = 0;
                for (i=0; i<portraitRows.length; i++) {
                    portraitRows[i].columns = 1 + Math.floor(11 * (portraitRows[i].width / totWidth));
                    totCols += portraitRows[i].columns;
                }
                portraitRows[portraitRows.length - 1].columns += (12 - totCols);    // in case we're over/under
                for (i=0; i<portraitRows.length; i++) {
                    portraitRows[i].bootstrapClass += "col-sm-12 col-lg-" + portraitRows[i].columns;
                }

                if (
                    landscape1.height === 0 || landscape1.height === 'NaN' || landscape1.height === undefined ||
                    landscape1.width === 0 || landscape1.width === 'NaN' || landscape1.width === undefined ||
                    portrait2.height === 0 || portrait2.height === 'NaN' || portrait2.height === undefined ||
                    portrait2.width === 0 ||  portrait2.width === 'NaN' || portrait2.width === undefined ||
                    portrait1.height === 0 || portrait1.height === 'NaN' || portrait1.height === undefined ||
                    portrait1.width === 0 || portrait1.width === 'NaN' || portrait1.width === undefined
                    )
                    console.log("internal error w pair of landscapes", portraitRows);
                    return(portraitRows);

            }
        }

        return(rowItems);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentRow);