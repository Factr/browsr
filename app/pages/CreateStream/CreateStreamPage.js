import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { debounce } from 'core-decorators'
import _ from 'lodash'

import AnimateOpacity from 'components/AnimateOpacity'

require('./styles/FormInput.less')
require('./styles/ModalForm.less')
require('./styles/StreamCreateEdit.less')
require('./styles/RadioInput.less')
require('./styles/Fieldset.less')
require('./styles/Hint.less')

export default class CreateStreamPage extends Component {
    static propTypes = {
        state: PropTypes.object.isRequired,
        actions: PropTypes.object.isRequired,
        onDone: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired,
        error: PropTypes.object,
    }

    state = {
        privacyFocused: false,
    }

    blurTimeout = null

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props, nextProps)
            || !_.isEqual(this.state, nextState)
    }

    // UI
    onPrivacyInputBlur() {
        this.blurTimeout = setTimeout(() => {
            this.setState({
                privacyFocused: false,
            })
        }, 0)
    }

    onPrivacyInputFocus() {
        if (this.props.state.isInProgress) return;

        clearTimeout(this.blurTimeout)

        this.setState({
            privacyFocused: true,
        })
    }

    onPrivacyInputMouseDown() {
        setTimeout(() => {
            clearTimeout(this.blurTimeout)
            this.onPrivacyInputFocus()
        }, 0)
    }

    // Data
    @debounce(500)
    onNameChange(name) {
        this.props.actions.setName(name)
    }

    @debounce(500)
    onDescChange(desc) {
        //noinspection JSUnresolvedFunction
        this.props.actions.setDescription(desc)
    }

    onPrivacyChange(setPublic) {
        if (setPublic) {
            //noinspection JSUnresolvedFunction
            this.props.actions.setPublic()
        } else {
            //noinspection JSUnresolvedFunction
            this.props.actions.setPrivate()
        }
    }

    onPublish() {
        if (this.props.state.isReadySaving)
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            this.props.actions.sendGeneral(this.props.state.next.toJS())
                .then(({ response: stream }) => {
                    //noinspection JSUnresolvedFunction
                    this.props.actions.resetForm()
                    this.props.onDone({
                        value: stream.id,
                        label: stream.name,
                        title: stream.name,
                    })
                })
                .catch(actualError => {
                    this.props.onError({
                        actualError,
                        message: "An error while creating a stream.",
                        backBtn: true,
                        backBtnCallback: () => this.refs.submit.focus()
                    })
                })
    }

    onBack() {
        this.props.onDone()
    }

    render() {
        const {
            state: {
                isChanged, isNameLengthGood, isInProgress, isReadySaving, next,
            },
            error,
        } = this.props

        const nameHasError = !isNameLengthGood && isChanged

        return (
            <div className="b-page" style={{ color: "#5f6677" }}>
                <div className="b-page__section">
                    <div className={classnames('b-form-input', {
                        'b-form-input_error': nameHasError,
                    })}>
                        <label className="b-form-input__label" htmlFor="stream-name">
                            Stream name

                            <AnimateOpacity>
                                {
                                    nameHasError &&
                                    <span>{' '}— should be 3 or more symbols</span>
                                }
                            </AnimateOpacity>
                        </label>
                        <div className="b-form-input__input">
                            <input
                                className={
                                    classnames(
                                        'b-stream-create-edit__stream-name-input',
                                        { '_error': nameHasError }
                                    )
                                }
                                type="text" id="stream-name"
                                onChange={e => ::this.onNameChange(e.target.value)}
                                ref="streamName"
                                maxLength="50"
                                defaultValue={next.get('name')}
                                autoFocus
                                disabled={isInProgress || !!error}/>
                        </div>
                    </div>
                </div>
                <div className="b-page__section">
                    <div className="b-form-input">
                        <label className="b-form-input__label" htmlFor="stream-desc">
                            Describe your stream
                        </label>
                        <div className="b-form-input__input">
                                <textarea name="stream-desc"
                                          id="stream-desc" rows="4"
                                          ref="streamDesc"
                                          onChange={e => ::this.onDescChange(e.target.value)}
                                          defaultValue={next.get('desc')}
                                          disabled={isInProgress || !!error}/>
                        </div>
                    </div>
                </div>
                <div className="b-page__section">
                    <div className="b-fieldset">
                        <b className="b-fieldset__legend">Privacy</b>
                        <div className={classnames({
                            "b-fieldset__inputs": true,
                            "b-fieldset__inputs_focused": this.state.privacyFocused,
                        })}>
                            <div className="b-fieldset__input">
                                <label className={classnames({
                                    "b-radio-input": true,
                                    "b-radio-input_disabled": isInProgress,
                                })}
                                       onMouseDown={::this.onPrivacyInputMouseDown}>
                                    <input type="radio" name="public" value="0" id="stream-private"
                                           onFocus={::this.onPrivacyInputFocus} onBlur={::this.onPrivacyInputBlur}
                                           onClick={e => ::this.onPrivacyChange(+e.target.value)}
                                           disabled={isInProgress || !!error}
                                           defaultChecked={!next.get('isPublic')}
                                           ref="streamPrivate"/>
                                    <div className="b-radio-input__inner">
                                        <div className="b-radio-input__input"/>
                                        <div className="b-radio-input__icon">
                                            <i className="icon icon-lock"/>
                                        </div>
                                        <div className="b-radio-input__label">
                                            <b className="b-radio-input__label-title">Private</b>
                                            <div className="b-radio-input__label-desc">
                                                Not visible to anyone except the people you share access with.
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            <div className="b-fieldset__input">
                                <label className={classnames({
                                    "b-radio-input": true,
                                    "b-radio-input_disabled": isInProgress,
                                })}
                                       onMouseDown={::this.onPrivacyInputMouseDown}>
                                    <input type="radio" name="public" value="1" id="stream-public"
                                           onFocus={::this.onPrivacyInputFocus} onBlur={::this.onPrivacyInputBlur}
                                           onClick={e => ::this.onPrivacyChange(+e.target.value)}
                                           disabled={isInProgress || !!error}
                                           defaultChecked={next.get('isPublic')}
                                           ref="streamPublic"/>
                                    <div className="b-radio-input__inner">
                                        <div className="b-radio-input__input"/>
                                        <div className="b-radio-input__icon">
                                            <i className="icon icon-earth"/>
                                        </div>
                                        <div className="b-radio-input__label">
                                            <b className="b-radio-input__label-title">Public</b>
                                            <div className="b-radio-input__label-desc">Visible to everyone.</div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="b-page__section">
                    <span className="b-hint">
                        Note: you’ll be able to add a cover image and edit the settings for this stream at
                        {' '}
                        <a href="https://factr.com/streams" tabIndex="-1" target="_blank">Factr.com</a>
                    </span>
                </div>
                <div className="b-page__section">
                    <div className="b-page__buttons">
                        <button className="btn btn-gray-white create-cancel" disabled={!!error} onClick={::this.onBack}>
                            Back
                        </button>
                        <button className="btn btn-gold create-stream"
                                disabled={!isReadySaving || !!error}
                                ref="submit"
                                onClick={::this.onPublish}>Create stream</button>
                    </div>
                </div>
            </div>
        )
    }
}
