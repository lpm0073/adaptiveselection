import React, {Component}  from 'react';

// redux stuff
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../redux/ActionCreators';
import './styles.css';

// my stuff

// more redux stuff
const mapStateToProps = state => ({
    ...state
  });
  const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(Actions, dispatch)
  });
  
  class ArticleBox extends Component {

      render() {
          const style={
              height: this.props.height
          };
          var cls = "m-0 p-0 " + this.props.className;
          if (this.props.columns > 2) cls += " article-container"
          return(
            <div className={cls}>
              <div className="m-0 p-0" style={style}></div>
            </div>
        );
      }
  }
  export default connect(mapStateToProps, mapDispatchToProps)(ArticleBox);
  