import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

require('./StreamSelector.less')

class StreamSelector extends Component {
    static propTypes = {
        streams: PropTypes.array,
        selectedStream: PropTypes.object,
    }

    constructor(props) {
        super(props)
        this.state = {
            selectedStream: null,
            open: false,
        }
    }

    componentWillMount() {
        this.setState({ selectedStream: this.props.streams[0]})
    }

    toggleDropDown = () => {
        this.setState({ open: !this.state.open })
    }

    handleStreamItemClick = (stream) => {
        this.props.onStreamChange(stream)
    }

    stopPropagation = (e) => {
        e.stopPropagation()
    }

    truncateName = (name) => {
        if (name.length > 30) {
            return `${name.slice(0, 30)}...`
        } else {
            return name
        }
    }

    findRecentStreams = () => {
        const { streams } = this.props
        let recentlyPostedStreams = []
        let remainingStreams = []

        for(let i = 0; i < streams.length; i++) {
            if (streams[i].content_added && i < 5) {
                recentlyPostedStreams.push(streams[i])
            } else {
                remainingStreams.push(streams[i])
            }
        }

        return { recentlyPostedStreams, remainingStreams }
    }

    renderStreamItem = (stream) => {
        return (
            <div
                key={stream.id}
                onClick={() => this.handleStreamItemClick(stream)}
                className="stream-list-item"
            >
                <span className="stream-name">{stream.name}</span><br/>
                <span className="stream-owner">{stream.owner.name}</span>
            </div>
        )
    }

    renderStreams(streams) {
        return (
          <div className="streams-list-container">
              {
                  streams.map( stream => this.renderStreamItem(stream) )
              }
          </div>
        )
    }

    renderSearchBar = () => {
        return (
            <div className="search-bar" onClick={this.stopPropagation}>
                <i className="icon file-search" />
                <input
                    type="text"
                    placeholder="Search streams..."
                />
            </div>
        )
    }

    renderDivider = (label) => {
        return (
            <div className="divider" onClick={this.stopPropagation}>
                {label}
            </div>
        )
    }

    buildDropDown = () => {
        const { recentlyPostedStreams, remainingStreams } = this.findRecentStreams()
        return (
            <div className="dropdown-container">
                {
                    this.renderSearchBar()
                }
                {
                    this.renderDivider()
                }
                {
                    this.renderDivider('RECENT')
                }
                {
                    this.renderStreams(recentlyPostedStreams)
                }
                {
                    this.renderDivider('YOUR STREAMS')
                }
                {
                    this.renderStreams(remainingStreams)
                }
            </div>
        )
    }

    render() {
        const { selectedStream } = this.props
        const { open } = this.state

        return (
            <div onClick={this.toggleDropDown} className={classnames("stream-selector", {
                _open: this.state.open,
            })}>
                {
                    selectedStream &&
                    <span className="selected-stream">{this.truncateName(selectedStream.name)}</span>
                }
                {
                    open &&
                    this.buildDropDown()
                }
                <i className="icon icon-chevron-down"/>
            </div>
        )
    }
}

export default StreamSelector
