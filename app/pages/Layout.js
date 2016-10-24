import React, { Component, PropTypes } from "react"
import { findDOMNode } from "react-dom"
import LoginPage from "./LoginPage"
import CollectPage from "./CollectPage"
import CreateStreamPageConnected from "./CreateStream/index.js"
import Message from "components/Message"
import classnames from "classnames"
import analytics from '../analytics'

class TryAgainButton extends Component {
    static propTypes = {
        fn: PropTypes.func.isRequired,
    }
    
    state = {
        loading: false,
    }
    
    onClick() {
        this.setState({ loading: true })
        
        this.props.fn()
            .then(() => this.setState({ loading: false }))
            .catch(() => this.setState({ loading: false }))
    }
    
    render() {
        return (
            <button autoFocus
                    className={classnames("btn btn-primary", { "_loading": this.state.loading })}
                    disabled={this.state.loading}
                    onClick={::this.onClick}>
                <span className="__title">Try again</span>
                { this.state.loading && <span className="loading" /> }
            </button>
        )
    }
}

class Layout extends Component {
    constructor(props) {
        super(props)
    }
    
    state = {
        token: kango.storage.getItem('token'),
        user: JSON.parse(kango.storage.getItem('user')),
        isCreatingStream: false,
        appShown: false,
        error: null,
    }
    
    componentDidMount() {
        setTimeout(() => this.setState({ appShown: true }), 150)
        
        if (!this.state.user) {
            this.logOut()
        }
    }
    
    renderErrorButtons(error) {
        return (
            <div>
                {
                    error.backBtn &&
                    <button className="btn btn-gray-white"
                            autoFocus={!error.tryAgainFn}
                            onClick={() => this.setState({ error: null }, error.backBtnCallback)}>
                        <span className="icon icon-chevron-left"/>{' '}Back
                    </button>
                }
                {
                    error.closeBtn &&
                    <button className="btn btn-gray-white"
                            autoFocus
                            onClick={() => KangoAPI.closeWindow()}>Close</button>
                }
                {
                    error.tryAgainFn &&
                    <TryAgainButton fn={error.tryAgainFn}/>
                }
            </div>
        )
    }
    
    render() {
        const { error } = this.state
        
        return (
            <div id="app" ref="app">
                <nav className="nav">
                    <div className="nav-wrapper">
                        <div className="branding">
                            <a href="https://factr.com" target="_blank" className="logo" tabIndex="-1"/>
                        </div>
                        <div className="menu">
                            {this.renderNavMenu()}
                        </div>
                    </div>
                </nav>
                <div className="container">
                    {this.renderBody()}
                    {
                        error &&
                        <Message text={error.message} buttons={this.renderErrorButtons(error)} error/>
                    }
                </div>
            </div>
        )
        
    }
    
    openCreatingStream() {
        this.setState({ isCreatingStream: true })
    }
    
    closeCreatingStream(stream) {
        if (stream)
            kango.storage.setItem('stream', stream)
        
        this.setState({ isCreatingStream: false }, () => {
            // Focus tags field
            findDOMNode(this).querySelector('#tags input').focus()
        })
    }
    
    renderBody() {
        const { user, token, isCreatingStream } = this.state
        
        if (!token) {
            return (
                <div>
                    <LoginPage onChange={::this.onChange} error={this.state.error}/>
                </div>
            )
        }
        
        if (!user) {
            return null
        }
        
        return (
            <div>
                {
                    isCreatingStream
                        ? <CreateStreamPageConnected onDone={::this.closeCreatingStream}
                                                     onError={::this.onError}
                                                     error={this.state.error}/>
                        : <CollectPage user={user}
                                       openCreatingStream={::this.openCreatingStream}
                                       onError={::this.onError}
                                       error={this.state.error}/>
                }
            </div>
        )
    }
    
    renderNavMenu() {
        const { user, token } = this.state
        
        if (user) {
            //noinspection JSUnresolvedVariable
            return (
                <div className="logged-in">
                    <div>Logged in as <b>{user.first_name + ' ' + user.last_name}</b></div>
                    <div>
                        <a href="#" onClick={::this.logOut} tabIndex="-1">Log out</a>
                    </div>
                </div>
            )
        }
        
        return null
    }
    
    onChange(state) {
        this.setState(state)
    }
    
    onError(error) {
        console.error("ERROR:", error.actualError)
        if (error.actualError.noInternet) {
            this.setState({ error: { ...error, message: "No internet connection.", closeBtn: true } })
        } else {
            this.setState({ error })
        }
    }
    
    logOut(e) {
        e && typeof e.preventDefault === "function" && e.preventDefault()
        
        kango.storage.clear()
        analytics.track('Logged Out', { extension: true })
        this.onChange({ user: null, token: null, error: null })
    }
}

export default Layout