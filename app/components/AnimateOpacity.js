import React, { Component, PropTypes } from 'react'
import CSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup'

require('./AnimateOpacity.less')

export default class extends Component {
    static propTypes = {
        timing: PropTypes.number,
    }
    
    static defaultProps = {
        timing: 150,
    }
    
    render() {
        return (
            <CSSTransitionGroup className="animate-opacity"
                                transitionName="item"
                                transitionEnterTimeout={this.props.timing}
                                transitionLeaveTimeout={this.props.timing}>
                {this.props.children}
            </CSSTransitionGroup>
        )
    }
}