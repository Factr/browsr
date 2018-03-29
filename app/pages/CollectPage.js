import React, { Component, PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import extend from 'lodash/extend'
import Select from 'react-select'
import { getStreams, getItemFromUrl, postItem, addItemTags } from '../api'
import _ from 'lodash'
import classnames from "classnames"
import Message from "components/Message"
import AnimatedSuccessIcon from "components/AnimatedSuccessIcon"
import analytics, { trackEvent } from '../analytics'

import StreamSelector from '../components/StreamSelector'
import TagsInput from "react-tagsinput"
require("react-tagsinput/react-tagsinput.css")
require("./CollectPage.less")
import AutosizeInput from "react-input-autosize"

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
            saving: false,
            showSuccess: false,
            post: {
                title: '',
                image: '',
                description: '',
                message: '',
                url: ''
            }
        }
    }

    componentWillMount() {
        kango.browser.tabs.getCurrent(tab => {
            getItemFromUrl(tab.getUrl())
                .then(data => {
                    let post = {
                        title: data.title,
                        image: data.image_url,
                        description: data.description,
                        message: '',
                        url: data.url
                    }
                    //noinspection JSUnresolvedVariable
                    if (data.authors.length > 0) {
                        //noinspection JSUnresolvedVariable
                        post.author = data.authors.join(', ')
                    }
                    this.setState({ post: post })
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

    onNewStream(e) {
        e.preventDefault()

        this.props.openCreatingStream()
    }

    render() {
        const { loadingStreams, stream, saving, showSuccess } = this.state
        const { error } = this.props

        let tags = kango.storage.getItem("tags") || []
        const collectDisabled = saving || !stream

        return (
            <div className="b-page _collect _relative">
                <form onSubmit={::this.onSubmit}>
                    <div className="b-form-input">
                        <label className="b-form-input__label">Add To</label>
                        <div className="b-form-input__input">
                            <div className="b-row _v-center">
                                <div className="b-row__column _fill">
                                    <StreamSelector
                                        onError={this.props.onError}
                                        onStreamChange={this.onStreamChange}
                                    />
                                </div>
                                <div className="b-row__column new-stream-buttom">
                                    <a href="#"
                                       className="b-new-stream-link"
                                       tabIndex={error ? "-1" : "0"}
                                       onClick={::this.onNewStream}>+ New Stream</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="b-form-input">
                        <label className="b-form-input__label">Post</label>
                        <div className="b-form-input__input">
                            <textarea ref="message" name="message"
                                      value={this.state.message}
                                      onChange={::this.onInputChange}
                                      autoFocus
                                      className="b-input _message"
                                      disabled={!!error}
                                      placeholder="Say something about this page (optional)"/>
                        </div>
                    </div>
                    <div className="input-section__bottom">
                        <div className="left">
                            <div className="b-form-input">
                                <label className="b-form-input__label">Thumbnail</label>
                                <div className="b-form-input__input" id="thumbnail">
                                    <div className="thumbnail-container">
                                        <img src={this.state.post.image} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="right">
                            <div className="b-form-input">
                                <label className="b-form-input__label">Title</label>
                                <div className="b-form-input__input" id="title">
                                    <input ref="description" name="title"
                                          type="text"
                                          value={this.state.post.title}
                                          onChange={::this.onInputChange}
                                          autoFocus
                                          className="b-input _title"
                                          disabled={!!error}
                                          placeholder="Say something about this page (optional)"/>
                                </div>
                            </div>
                            <div className="b-form-input">
                                <label className="b-form-input__label">Description</label>
                                <div className="b-form-input__input" id="description">
                                <textarea ref="description" name="description"
                                      value={this.state.post.description}
                                      onChange={::this.onInputChange}
                                      autoFocus
                                      className="b-input _description"
                                      disabled={!!error}
                                      placeholder="Say something about this page (optional)"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button disabled={collectDisabled || !!error}
                            className={classnames("btn btn-gold add-to-factr", { "_loading": saving })}
                            width="100%"
                            ref="submit"
                            type="submit">
                        <span className="__title">Add to Factr</span>
                        { saving ? <span className="loading" /> : null }
                    </button>
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
        let post = {...this.state.post}
        post[name] = value
        this.setState({ post })
    }

    onTagsChange(tags) {
        kango.storage.setItem("tags", tags)
        this.forceUpdate()
    }

    onSubmit(e) {
        e.preventDefault()
        const { post, stream } = this.state
        const streamId = stream.id
        this.setState({ saving: true })

        postItem(streamId, post)
            .then(post => {
                trackEvent('add post', post)
                this.setState({ saving: false, showSuccess: true })
                this.closeWindow()
                this.clearKangoLocal()
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
    }

    closeWindow() {
        setTimeout(() => KangoAPI.closeWindow(), 2000)
    }

    clearKangoLocal() {
        kango.storage.removeItem('message')
        kango.storage.removeItem('tags')
        kango.storage.removeItem('description')
        kango.storage.removeItem('title')
        kango.storage.removeItem('image')
    }

    onClear() {
        this.clearKangoLocal()
        KangoAPI.closeWindow()
    }

    onStreamChange = (stream) => {
        this.setState({ stream: stream })
    }

}

export default CollectPage
