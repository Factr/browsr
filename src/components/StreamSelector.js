import classnames from 'classnames'
import isEmpty from 'lodash/isEmpty'
import React, { Component } from 'react'
import onClickOutside from "react-onclickoutside"
import storage from 'storage'

import { getRecentStreams, getStreams } from '../api'
import InboxIcon from './InboxIcon';

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
        const { onError } = this.props;

        getStreams().then(data => {
            const streams = data.results.sort((a, b) => a.name.localeCompare(b.name))

            storage.setItem("streams", streams)

            if (storage.getItem('stream') === null) {
                // set current stream to inbox
                const inbox = streams.find(stream => stream.personal && !stream.public)
                storage.setItem('stream', inbox)
                this.setState({ selectedStream: inbox})
            }

            this.setState({ streams: streams, loadingStreams: false })
        }).catch(error => {
            this.setState({ loadingStreams: false })
            onError({
                error,
                message: "Could not load your streams.<br />Please try again later.",
                closeBtn: true,
            })
        });

        getRecentStreams({sort: 'desc', limit: 5 }).then(data => {
            const recentStreams = data;
            storage.setItem('recentStreams', recentStreams);
            this.setState({ recentStreams });
        }).catch(error => {
            this.setState({ loadingStreams: false })
            onError({
                error,
                message: "Could not load your streams.<br />Please try again later.",
                closeBtn: true,
            })
        });
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
                className="stream-item"
            >
                <div className="stream-icon" style={{ borderRadius: (!stream.is_inbox && stream.personal) ? '50%' : 2 }}>
                    { stream.is_inbox && <InboxIcon /> }
                    { !stream.is_inbox && stream.image_url && <div style={{ backgroundImage: `url(${stream.image_url})` }} /> }
                    { !stream.is_inbox && !stream.image_url && stream.name[0].toUpperCase()}
                </div>
                <div className="stream-info">
                    <span className="stream-name">{stream.name}</span>
                    <span className="stream-owner">
                        { !stream.is_inbox && !stream.personal && stream.owner.name }
                        { !stream.is_inbox && !stream.personal && '  •  '}
                        { stream.public ? 'Public' : 'Private' }
                    </span>
                </div>
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
        const { streams, numRecent, searchText } = this.state

        const personalStreams = streams.filter((stream) => (
            stream.is_inbox || (!stream.is_inbox && stream.personal)
        ));
        const recentStreams = this.state.recentStreams.filter((stream) => !(
            stream.is_inbox || (!stream.is_inbox && stream.personal)
        ));
        const usersStreams = streams.filter((stream) => (
            ![...personalStreams, ...recentStreams].filter((existingStream) => existingStream.id === stream.id).length
        ));
        
        if (searchText === '') {
            return (
              <div className="streams-container">
                  {
                      this.renderStreamsList(personalStreams)
                  }
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
                      this.renderStreamsList(usersStreams)
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
                    this.renderStreamItem(selectedStream)
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
