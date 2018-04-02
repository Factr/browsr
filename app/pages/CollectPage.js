import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import extend from 'lodash/extend'
import { getStreams, getItemFromUrl, postItem } from '../api'
import _ from 'lodash'
import classnames from "classnames"
import Message from "components/Message"
import AnimatedSuccessIcon from "components/AnimatedSuccessIcon"
import analytics, { trackEvent } from '../analytics'

import StreamSelector from '../components/StreamSelector'

require("react-tagsinput/react-tagsinput.css")
require("./CollectPage.less")

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
            imageRemoved: false,
            loadingImages: false,
            images: [],
            post: {
                title: '',
                image_url: '',
                description: '',
                message: '',
                url: ''
            }
        }
    }

    async addImageProcess(src) {
        return new Promise((resolve, reject) => {
            let img = new Image()
            img.onload = () => resolve(img.height)
            img.onerror = reject
            img.src = src
        })
    }

    // filters the images based on image height.
    // Newspaper on backend only does filtering for top images
    async getValidImages(images) {
        let validImages = []
        for(let i = 0; i < images.length; i++) {
            const imageHeight = await this.addImageProcess(images[i])
            if (imageHeight > 1) {
                validImages.push(images[i])
            }
        }
          this.setState({ loadingImages: false })
          return validImages
    }

    componentWillMount() {
        this.setState({ loadingImages: true })
        kango.browser.tabs.getCurrent(tab => {
            getItemFromUrl(tab.getUrl())
                .then(data => {
                    let post = {
                        title: data.title,
                        image_url: data.image_url,
                        description: data.description,
                        message: '',
                        url: data.url
                    }
                    //noinspection JSUnresolvedVariable
                    if (data.authors.length > 0) {
                        //noinspection JSUnresolvedVariable
                        post.author = data.authors.join(', ')
                    }
                    this.setState({ post })

                    this.getValidImages(data.images)
                        .then( images => {
                            this.setState({ images, loadingImages: false })
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

    onNewStream(e) {
        e.preventDefault()

        this.props.openCreatingStream()
    }

    handleRemoveImage = () => {
        let post = {...this.state.post}
        post.image_url = ''
        post.do_not_parse_url = true // inform the backend to not reparse the url
        this.setState({ post, imageRemoved: true })
    }

    changeImage = (idx) => {
        const { images } = this.state
        const length = images.length
        let post = {...this.state.post}
        const imageIndex = images.findIndex( url => url === post.image_url )
        // code below allows for iterating forwards and backwards through the images
        const newIndex = ((imageIndex + idx) % length + length) % length
        post.image_url = images[newIndex]

        this.setState({ post })
    }

    onInputChange(e) {
        const value = e.target.value
        const name = e.target.name
        kango.storage.setItem(name, value)
        let post = {...this.state.post}
        post[name] = value
        this.setState({ post })
    }

    updateRecentStreams = () => {
        const { stream } = this.state
        const oldStream = kango.storage.getItem('stream')
        let recentStreams = kango.storage.getItem('recentStreams')

        if (oldStream.id !== stream.id) {
            // check if posted stream is in recent streams, if so remove it
            if (_.find(recentStreams, { 'id': stream.id})) {
                recentStreams = recentStreams.filter( obj => obj.id !== stream.id )
            }
            recentStreams.unshift(oldStream)
            kango.storage.setItem('recentStreams', recentStreams.slice(0,5))
            kango.storage.setItem('stream', stream)
        }
    }

    onSubmit(e) {
        e.preventDefault()
        const { post, stream } = this.state
        this.updateRecentStreams()

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

    render() {
        const { loadingImages,
                stream,
                saving,
                showSuccess,
                imageRemoved } = this.state
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
                        {
                            !imageRemoved &&
                            <div className="left">
                                <div className="b-form-input">
                                    <label className="b-form-input__label">Thumbnail</label>
                                    <div className="b-form-input__input" id="thumbnail">
                                        <div className="thumbnail-container">
                                            <i className="icon icon-cross remove-image"
                                                onClick={this.handleRemoveImage}
                                            />
                                                <div className={classnames("change-image-container float-left", {
                                                        _disabled: loadingImages
                                                    })}
                                                    onClick={() => this.changeImage(-1)}
                                                >
                                                    <i className="icon icon-chevron-left change-image"/>
                                                </div>
                                                {
                                                    loadingImages &&
                                                    <i className="icon icon-loading image-loading" />
                                                }
                                                {
                                                    !loadingImages &&
                                                    <img src={this.state.post.image_url} />
                                                }
                                                <div className={classnames("change-image-container float-right", {
                                                        _disabled: loadingImages
                                                    })}
                                                    onClick={()=> this.changeImage(1)}
                                                >
                                                    <i className="icon icon-chevron-right change-image"/>
                                                </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        <div className={classnames("right", {
                              _full: imageRemoved,
                        })}>
                            <div className="b-form-input">
                                <label className="b-form-input__label">Title</label>
                                <div className="b-form-input__input" id="title">
                                    <input ref="description" name="title"
                                          type="text"
                                          value={this.state.post.title}
                                          onChange={::this.onInputChange}
                                          autoFocus
                                          className="b-input title"
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
                                      className="b-input description"
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
}

export default CollectPage
