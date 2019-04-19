import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import onClickOutside from "react-onclickoutside"
import isEqual from 'lodash/isequal'
import isEmpty from 'lodash/isEmpty'

import storage from 'storage'
import { getStreams } from '../api'

require('./StreamSelector.less')

class StreamSelector extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loadingStreams: false,
            recentStreams: [],
            streams: [],
            selectedStream: null,
            numRecent: null,
            open: false,
            searchText: '',
        }
    }

    componentWillMount() {
        if (storage.getItem('recentStreams') === null) {
            storage.setItem('recentStreams', [])
        }
        this.setState({ selectedStream: storage.getItem('stream'),
                        recentStreams: storage.getItem('recentStreams'),
                        streams: storage.getItem('streams')
                      }, () => {
                            this.props.onStreamChange(this.state.selectedStream)
                      })
    }

    componentDidMount() {
        if (storage.getItem('streams') === null) {
                this.setState({ loadingStreams: true })
            }
        this.updateStreams()
    }

    updateStreams = () => {
        getStreams()
            .then(data => {
                const streams = data.results.sort((a, b) => a.name.localeCompare(b.name))

                storage.setItem("streams", streams)

                if (storage.getItem('stream') === null) {
                    // set current stream to inbox
                    const inbox = streams.find(stream => stream.personal && !stream.public)
                    storage.setItem('stream', inbox)
                    this.setState({ selectedStream: inbox})
                }

                // remove deleted streams from recent streams
                const streamIds = streams.map(stream => stream.id)
                const recentStreams = storage.getItem('recentStreams')
                                             .filter(stream => streamIds.includes(stream.id))
                storage.setItem('recentStreams', recentStreams)

                this.setState({ streams: streams, loadingStreams: false })
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

    renderStreamItem = (stream) => {
        return (
            <div
                key={stream.id}
                onClick={() => this.handleStreamItemClick(stream)}
                className="stream-list-item"
            >
                <span className="stream-name">{stream.name}</span><br/>
                <span className="stream-owner">{stream.owner_name}</span>
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

    renderDivider = (label, position) => {
        return (
            <div className={`divider-${position}`} onClick={this.stopPropagation}>
                {label}
            </div>
        )
    }

    renderStreams = () => {
        const { streams, recentStreams, numRecent, searchText } = this.state

        if (searchText === '') {
            return (
              <div className="streams-container">
                  {
                      !isEmpty(recentStreams) &&
                      this.renderDivider('RECENT', 'top')
                  }
                  {
                      !isEmpty(recentStreams) &&
                      this.renderStreamsList(recentStreams)
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

            const filteredStreams = streams.filter( stream => stream.name.toLowerCase()
                                           .includes(searchText.toLowerCase()))

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
        const { selectedStream, open, loadingStreams } = this.state
        return (
            <div onClick={this.toggleDropDown} className={classnames("stream-selector", {
                _open: open,
                _loading: loadingStreams,
            })}>
                {
                    selectedStream &&
                    !loadingStreams &&
                    <span className="selected-stream">{this.truncateName(selectedStream.name)}</span>
                }
                {
                    loadingStreams &&
                    <i className="icon icon-loading loading" />
                }
                {
                    open &&
                    !loadingStreams &&
                    this.buildDropDown()
                }
                <i className="icon icon-chevron-down"/>
            </div>
        )
    }
}

export default onClickOutside(StreamSelector)