import React, { PropTypes, Component } from 'react'
import { findDOMNode } from 'react-dom'
import { login, me, authLinkedIn, authGoogle } from '../api'
import config from '../config'
import extend from 'lodash/extend'
import classnames from 'classnames'
import AnimateOpacity from 'components/AnimateOpacity'
import URL from 'url-parse'

import analytics from '../analytics'

require('./LoginPage.less')

const baseUrl = config.frontendUrl
const urls = {
    site: baseUrl,
    resetPassword: `${baseUrl}/forgot-password`
}
const CHROME_EXTENSION_REDIRECT_URI = `https://${config.appId}.chromiumapp.org`

function LoginWith({ name, iconClassName, onClick, disabled }) {
    return (
        <a className={classnames('provider-oauth-button', { '_disabled': disabled })} href="#"
           onClick={e => {
               e.preventDefault()
               onClick && !disabled && onClick()
           }}>
            <div className={`provider-icon ${iconClassName}`}/>
            Login with {name}
        </a>
    )
}

class LoginPage extends Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
    }
    
    constructor(props) {
        super(props)
    
        this.state = {
            loading: false,
            error: null,
        }
    }
    
    render() {
        const { loading: isLoading } = this.state
        
        return (
            <div className="login">
                <h1 className="login__heading">Login</h1>
                {
                    this.state.error &&
                    <div className="login__error-outer">
                        <span className="login__error-message" dangerouslySetInnerHTML={{ __html: this.state.error }}/>
                        <br/>
                        Try again or
                        {' '}
                        <a href="#" onClick={::this.goToResetPassword}>reset your password</a>.
                    </div>
                }
                <div>
                    <LoginWith name="LinkedIn" onClick={::this.openLinkedInOAuth}
                               iconClassName="linkedin" disabled={isLoading} />
                    <LoginWith name="Google" onClick={::this.openGoogleOAuth}
                               iconClassName="google" disabled={isLoading}/>
                    {
                        false &&
                        <LoginWith name="Humanitarian ID"
                                   iconClassName="hid" disabled={isLoading} />
                    }
                </div>
                
                <div className="form-or">OR</div>
                
                <form className="login-form default-form" onSubmit={::this.submitLoginForm}>
                    <div className="input-field">
                        <input placeholder="Email Address" ref="email" type="text" name="email"
                               className="b-input"
                               autoFocus
                               disabled={isLoading}
                               defaultValue={kango.storage.getItem('last_used_email')}/>
                    </div>
                    <div className="input-field">
                        <input placeholder="Password"
                               className="b-input"
                               disabled={isLoading}
                               ref="password" type="password" name="password"/>
                    </div>
                    <div className="form-actions">
                        <div className="pull-right">
                            <button className="btn btn-gray" type="reset">Cancel</button>
                            <button disabled={isLoading}
                                    className={classnames("btn btn-primary", { "_loading": isLoading })}
                                    type="submit">
                                <span className="__title">Login</span>
                                {' '}
                                <AnimateOpacity>
                                    { isLoading && <span className="loading"/> }
                                </AnimateOpacity>
                            </button>
                        </div>
                    </div>
                </form>
                <p>
                    Don't have an account yet? Factr is currently in private beta.
                    <br />
                    Go to <b><a href="#" onClick={::this.goToWebSite}>our website</a></b> to apply for an invitation.
                </p>
            </div>
        )
    }
    
    openLinkedInOAuth() {
        const params = [
            'response_type=code',
            `client_id=${config.oauth.linkedin.clientId}`,
            `redirect_uri=${CHROME_EXTENSION_REDIRECT_URI}`,
            `state=asdf355asdf`
        ]
        
        this.setState({ loading: true, error: null })
        
        chrome.identity.launchWebAuthFlow(
            { 'url': `https://www.linkedin.com/oauth/v2/authorization?${params.join('&')}`, 'interactive': true },
            redirect_url => {
                const url = new URL(redirect_url, true)
                const code = url.query.code
                const errorMessage = 'An error happened while authorizing you through LinkedIn'
                
                if (code) {
                    authLinkedIn(code, CHROME_EXTENSION_REDIRECT_URI)
                        .then(userObjectAndToken => {
                            const { token, ...userObject } = userObjectAndToken
            
                            this.loginUserByUserObject(userObject, token)
                        })
                        .catch(() => this.setState({ loading: false, error: errorMessage }))
                } else {
                    this.setState({ loading: false, error: null })
                }
            }
        )
    }
    
    openGoogleOAuth() {
        this.setState({ loading: true, error: null })
        
        chrome.identity.getAuthToken({ 'interactive': true }, access_token => {
            const errorMessage = 'An error happened while authorizing you through Google'

            authGoogle(access_token)
                .then(userObjectAndToken => {
                    const { token, ...userObject } = userObjectAndToken

                    this.loginUserByUserObject(userObject, token)
                })
                .catch(() => this.setState({ loading: false, error: errorMessage }))
        })
    }
    
    openHumanitarianIDOAuth() {
        // TODO: Finish Humanitarian ID OAuth Login
        this.setState({ loading: true, error: null })
    
        chrome.identity.launchWebAuthFlow(
            { 'url': `https://www.linkedin.com/oauth/v2/authorization?${params.join('&')}`, 'interactive': true },
            redirect_url => {
                const url = new URL(redirect_url, true)
                const code = url.query.code
                const errorMessage = 'An error happened while authorizing you through LinkedIn'
            
                if (code) {
                    authLinkedIn(code, CHROME_EXTENSION_REDIRECT_URI)
                        .then(userObjectAndToken => {
                            const { token, ...userObject } = userObjectAndToken
                        
                            this.loginUserByUserObject(userObject, token)
                        })
                        .catch(() => this.setState({ loading: false, error: errorMessage }))
                } else {
                    this.setState({ loading: false, error: null })
                }
            }
        )
    }
    
    goToWebSite(e) {
        e.preventDefault()
        kango.browser.tabs.create({ url: urls.site })
    }
    
    goToResetPassword(e) {
        e.preventDefault()
        kango.browser.tabs.create({ url: urls.resetPassword })
    }
    
    submitLoginForm(e) {
        e.preventDefault()
        this.setState({ loading: true })
        
        const params = { username: findDOMNode(this.refs.email).value, password: findDOMNode(this.refs.password).value }
        const errorMessage = "Something went&nbsp;wrong when&nbsp;attempting to&nbsp;log&nbsp;you&nbsp;in."
        
        login(params)
            .then(response => {
                const token = response.token
                kango.storage.setItem('token', token)
                
                me()
                    .then(userObject => this.loginUserByUserObject(userObject, token))
                    .catch(err => {
                        this.setState({ loading: false })
                        this.onError(errorMessage)
                    })
            })
            .catch(() => {
                this.setState({ loading: false })
                this.onError(errorMessage)
            })
    }
    
    loginUserByUserObject(userObject, token) {
        //noinspection JSUnresolvedVariable
        analytics.identify(extend({ name: userObject.first_name + ' ' + userObject.last_name }, userObject))
        analytics.track('Logged In', { 'extension': true })
        kango.storage.setItem('last_used_email', userObject.email)
        kango.storage.setItem('user', JSON.stringify(userObject))
        kango.storage.setItem('token', token)
            
        this.setState({ loading: false })
        this.onChange({ user: userObject, token })
    }
    
    onError(errorMessage) {
        this.setState({
            error: errorMessage,
        })
    }
    
    onChange(change) {
        this.props.onChange(change)
    }
}


export default LoginPage