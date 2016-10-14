//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import CreateStreamPage from './CreateStreamPage'

import * as actions from './actions'
import {
    current,
    next,
    isChanged,
    isNameLengthGood,
    isInProgress,
    creationError,
    isReadySaving
} from './selectors'

function mapState(state) {
    return {
        state: {
            current: current(state),
            next: next(state),
            isChanged: isChanged(state),
            isNameLengthGood: isNameLengthGood(state),
            isInProgress: isInProgress(state),
            creationError: creationError(state),
            isReadySaving: isReadySaving(state),
        },
    }
}

@connect(mapState, dispatch => ({ actions: bindActionCreators(actions, dispatch) }))
class CreateStreamPageConnected extends Component {
    static propTypes = {
        onDone: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired,
    }
    
    render() {
        return <CreateStreamPage {...this.props} />
    }
}

export default CreateStreamPageConnected
