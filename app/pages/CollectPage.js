import React, { Component, PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import extend from 'lodash/extend'
import Select from 'react-select'
import { getStreams, getItemFromUrl, postItem, addItemTags } from '../api'
import _ from 'lodash'
import classnames from "classnames"
import Message from "components/Message"
import AnimatedSuccessIcon from "components/AnimatedSuccessIcon"

import TagsInput from "react-tagsinput"
require("react-tagsinput/react-tagsinput.css")
import AutosizeInput from "react-input-autosize"

function buildStreamOptions(streams) {
    return streams
        .map(c => ({ value: c.id, label: c.name, title: c.name }))
        .sort((a, b) => a.title > b.title ? 1 : -1)
}

function autosizingRenderTagInput(props) {
    // Specify addTag also to prevent it passing into AutosizeInput component
    const { onChange, value, addTag, autoFocus, ...p } = props
    return <AutosizeInput type='text'
                          onChange={onChange}
                          value={value}
                          minWidth={80}
                          autoFocus={autoFocus}
                          {...p}
                          placeholder="Type a tag word or phrase and hit enter"/>
}

function tagsPasteSplit(data) {
    return data.split(',').map(tag => tag.trim())
}

class CollectPage extends Component {
    static propTypes = {
        user: PropTypes.object.isRequired,
        openCreatingStream: PropTypes.func.isRequired,
        error: PropTypes.object,
    }
    
    constructor(props) {
        super(props)
        
        this.state = {
            stream: null,
            streams: [],
            loadingStreams: false,
            saving: false,
            showSuccess: false,
        }
    }
    
    componentWillMount() {
        this.setState({ stream: kango.storage.getItem('stream') })
    }
    
    componentDidMount() {
        this.setState({ loadingStreams: true })
        
        getStreams()
            .then(data => {
                let { stream } = this.state
                const selectedStreamId = stream && stream.value
                
                stream = (
                    _.some(data, streamObject => streamObject.id === selectedStreamId)
                        ? stream
                        : ''
                )
                
                this.setState({ streams: data, loadingStreams: false, stream })
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
    
    onNewStream(e) {
        e.preventDefault()
        
        this.props.openCreatingStream()
    }
    
    render() {
        const { streams, loadingStreams, stream, saving, showSuccess } = this.state
        const { error } = this.props
        
        let tags = kango.storage.getItem("tags") || []
        const collectDisabled = saving || !stream
        
        return (
            <div className="b-page _collect _relative">
                <h1>Save this page</h1>
                <form onSubmit={::this.onSubmit}>
                    <div className="b-form-input">
                        <label className="b-form-input__label">Post</label>
                        <div className="b-form-input__input">
                            <textarea ref="message" name="message"
                                      defaultValue={kango.storage.getItem("message")}
                                      onChange={::this.onInputChange}
                                      autoFocus
                                      className="b-input _message _resize-y"
                                      disabled={!!error}
                                      placeholder="Say something about this link (optional)"/>
                        </div>
                    </div>
                    <div className="b-form-input">
                        <label className="b-form-input__label">Save To</label>
                        <div className="b-form-input__input">
                            <div className="b-row _v-center">
                                <div className="b-row__column _fill">
                                    <Select
                                        isLoading={loadingStreams}
                                        value={stream}
                                        backspaceRemoves={false}
                                        name="form-field-name"
                                        options={buildStreamOptions(streams)}
                                        optionRenderer={::this.renderOption}
                                        onChange={::this.onSelectChange}
                                        clearable={false}
                                        disabled={!!error}
                                        tabIndex={error ? "-1" : "0"}
                                        placeholder="Select one of your streams"
                                        noResultsText="No streams for posting"
                                    />
                                </div>
                                <div className="b-row__column">
                                    <a href="#"
                                       className="b-new-stream-link"
                                       tabIndex={error ? "-1" : "0"}
                                       onClick={::this.onNewStream}>+ New Stream</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="b-form-input">
                        <label className="b-form-input__label">Tags</label>
                        <div className="b-form-input__input" id="tags">
                            <TagsInput value={tags}
                                       onChange={::this.onTagsChange}
                                       disabled={!!error}
                                       className={classnames({
                                           "react-tagsinput": true,
                                           "react-tagsinput_disabled": !!error,
                                       })}
                                       addOnPaste
                                       addOnBlur
                                       addKeys={[9, 13, 188]}
                                       onlyUnique
                                       pasteSplit={tagsPasteSplit}
                                       renderInput={autosizingRenderTagInput}/>
                        </div>
                    </div>
                    
                    <div className="form-actions _floating">
                        <button onClick={::this.onClear}
                                className="btn btn-gray-white"
                                disabled={!!error}
                                type="button">Cancel</button>
                        <button disabled={collectDisabled || !!error}
                                className={classnames("btn btn-primary", { "_loading": saving })}
                                ref="submit"
                                type="submit">
                            <span className="__title">Collect</span>
                            { saving ? <span className="loading" /> : null }
                        </button>
                    </div>
                </form>
                {
                    showSuccess &&
                    <Message text="Successfully saved" icon={<AnimatedSuccessIcon />} />
                }
            </div>
        )
    }
    
    onInputChange(e) {
        const value = e.target.value
        const name = e.target.name
        kango.storage.setItem(name, value)
    }
    
    onTagsChange(tags) {
        kango.storage.setItem("tags", tags)
        this.forceUpdate()
    }
    
    onSubmit(e) {
        e.preventDefault()
        const streamId = this.state.stream.value
        const post = {}
        this.setState({ saving: true })
        
        kango.browser.tabs.getCurrent(tab => {
            getItemFromUrl(tab.getUrl())
                .then(data => {
                    post.title = data.title
                    post.description = data.description
                    post.image_url = data.image_url
                    post.url = data.url
                    post.message = findDOMNode(this.refs.message).value
                    
                    //noinspection JSUnresolvedVariable
                    if (data.authors.length > 0) {
                        //noinspection JSUnresolvedVariable
                        post.author = data.authors.join(', ')
                    }
                    
                    let tags = kango.storage.getItem("tags") || []
                    tags = tags.map(a => a.trim()).filter(tag => tag)
                    
                    postItem(streamId, post)
                        .then(post => {
                            heap.track('Posted Item', extend({}, { extension: true }, post))
                            
                            if (tags.length > 0) {
                                addItemTags(streamId, post.id, tags)
                                    .then(() => {
                                        this.setState({ saving: false, stream: null, showSuccess: true })
                                        this.closeWindow()
                                        this.clearKangoLocal()
                                    })
                                    .catch(actualError => {
                                        this.setState({ saving: false, showSuccess: false })
                                        this.props.onError({
                                            actualError,
                                            message: "Something went wrong when saving tags<br />but your post was created.",
                                            closeBtn: true,
                                        })
                                    })
                            } else {
                                this.setState({ saving: false, showSuccess: true })
                                this.closeWindow()
                                this.clearKangoLocal()
                            }
                        })
                        .catch(actualError => {
                            this.setState({ saving: false, showSuccess: false })
                            this.props.onError({
                                actualError,
                                message: "Something went wrong when creating post.",
                                // tryAgainFn: () => new Promise((res, rej) => setTimeout(() => res(), 1000)),
                                backBtn: true,
                                backBtnCallback: () => this.refs.submit.focus(),
                            })
                        })
                    
                })
                .catch(actualError => {
                    this.setState({ saving: false, showSuccess: false })
                    this.props.onError({
                        actualError,
                        message: "Could not create post because this page is not valid.",
                        closeBtn: true,
                    })
                })
        })
    }
    
    closeWindow() {
        setTimeout(() => KangoAPI.closeWindow(), 2000)
    }
    
    clearKangoLocal() {
        kango.storage.removeItem('message')
        kango.storage.removeItem('stream')
        kango.storage.removeItem('tags')
    }
    
    onClear() {
        this.clearKangoLocal()
        KangoAPI.closeWindow()
    }
    
    onSelectChange(val) {
        kango.storage.setItem('stream', val)
        
        this.setState({
            stream: val
        })
    }
    
    renderOption(option) {
        return (
            <div>
                <span className="option-title">{option.label}</span>
            </div>
        )
    }
}

export default CollectPage