import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import onClickOutside from "react-onclickoutside"
import isEqual from 'lodash/isequal'

import { getStreams } from '../api'

require('./StreamSelector.less')

class StreamSelector extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loadingStreams: false,
            streams: [],
            selectedStream: null,
            open: false,
            searchText: '',
        }
    }

    componentWillMount() {
        this.setState({ selectedStream: kango.storage.getItem('stream'),
                        streams: kango.storage.getItem('streams')
                      }, () => {
                            this.props.onStreamChange(this.state.selectedStream)
                      })
    }

    componentDidMount() {
        this.setState({ loadingStreams: true })
        this.updateStreams()
    }

    updateStreams = () => {
        getStreams()
            .then(data => {
                const streams = data.streams
                let { selectedStream } = this.state
                // if user selects new stream before updated streams load
                // users selection will be changed to most recently updated
                let mostRecentStream = streams[0]

                kango.storage.setItem("stream", mostRecentStream)
                kango.storage.setItem("streams", streams)

                this.setState({ streams: streams, loadingStreams: false, selectedStream: mostRecentStream })
            })
            .catch(actualError => {
                this.setState({ loadingStreams: false })
                this.props.onError({
                    actualError,
                    message: "Could not load your streams.<br />Please try again later.",
                    closeBtn: true,
                })
            })
    }

    toggleDropDown = () => {
        this.setState({ open: !this.state.open })
    }

    handleStreamItemClick = (stream) => {
        this.setState({ selectedStream: stream }, () => {
            this.props.onStreamChange(stream)
        })
    }

    stopPropagation = (e) => {
        e.stopPropagation()
    }

    handleClickOutside = (e) => {
        this.setState({ open: false })
    }

    truncateName = (name) => {
        if (name.length > 30) {
            return `${name.slice(0, 30)}...`
        } else {
            return name
        }
    }

    handleSearch = (e) => {
        this.setState({ searchText: e.target.value })
    }

    findRecentStreams = () => {
        const { streams } = this.state
        let recentlyPostedStreams = []

        for(let i = 0; i < streams.length; i++) {
            if (streams[i].content_added && i < 5) {
                recentlyPostedStreams.push(streams[i])
            }
        }

        return { recentlyPostedStreams, streams }
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

    renderStreamsList(streams) {
        return (
          <div className="streams-list-container">
              {
                  streams.map( stream => this.renderStreamItem(stream) )
              }
          </div>
        )
    }

    renderSearchBar = () => {
        const { searchText } = this.state
        return (
            <div className="search-bar" onClick={this.stopPropagation}>
                <i className="icon icon-magnifier" />
                <input
                    onChange={this.handleSearch}
                    value={searchText}
                    type="text"
                    placeholder="Search streams..."
                />
                {
                    searchText !== '' &&
                    <i
                        className="icon icon-cross-circle"
                        onClick={() => this.setState({ searchText: '' })}
                    />
                }
            </div>
        )
    }

    renderDivider = (label, position) => {
        return (
            <div className={`divider-${position}`} onClick={this.stopPropagation}>
                {label}
            </div>
        )
    }

    renderStreams = () => {
        const { recentlyPostedStreams, streams } = this.findRecentStreams()
        if (this.state.searchText === '') {
            return (
              <div className="streams-container">
                  {
                      this.renderDivider('RECENT', 'top')
                  }
                  {
                      this.renderStreamsList(recentlyPostedStreams)
                  }
                  {
                      this.renderDivider('YOUR STREAMS', 'top')
                  }
                  {
                      this.renderStreamsList(streams)
                  }
              </div>
            )
        } else {
            const { searchText, streams } = this.state

            const filteredStreams = streams.filter( stream => stream.name.toLowerCase().includes(searchText.toLowerCase()))

            return (
                <div className="streams-container">
                    {
                        this.renderStreamsList(filteredStreams)
                    }
                </div>
            )
        }
    }

    buildDropDown = () => {
        return (
            <div className="dropdown-container">
                {
                    this.renderSearchBar()
                }
                {
                    this.renderDivider('', 'bottom')
                }
                {
                    this.renderStreams()
                }
            </div>
        )
    }

    render() {
        const { selectedStream, open } = this.state

        return (
            <div onClick={this.toggleDropDown} className={classnames("stream-selector", {
                _open: open,
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

export default onClickOutside(StreamSelector)
