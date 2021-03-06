import React, { PropTypes, Component } from 'react'
import { findDOMNode } from 'react-dom'
import { login, me, authLinkedIn, authGoogle, makeApiRequest } from '../api'
import classnames from 'classnames'
import AnimateOpacity from 'components/AnimateOpacity'
import URL from 'url-parse'
import config from '../config'
import storage from 'storage'
import { trackEventCentr } from '../analytics'

require('./LoginPage.less')

const baseUrl = config.frontendUrl
const urls = {
    site: baseUrl,
    resetPassword: `${baseUrl}/forgot-password`
}
const CHROME_EXTENSION_REDIRECT_URI = `https://${config.appId}.chromiumapp.org`

function getBrowser() {
    if (typeof chrome !== "undefined" && typeof browser !== "undefined") {
        return "Firefox";
    } else {
        return "Chrome";
    }
}

function LoginWith({ name, iconClassName, onClick, disabled }) {
    return (
        <a className={classnames(`provider-oauth-button ${iconClassName}`, { '_disabled': disabled })} href="#"
           tabIndex={disabled ? '-1' : '0'}
           onClick={e => {
               e.preventDefault()
               onClick && !disabled && onClick()
           }}>
            <div className={`provider-icon ${iconClassName}`}/>
            Login in with {name}
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
            oauthFocused: true,
        }
    }

    handleFocus = (focus) => {
        this.setState({ oauthFocused: focus})
    }

    openLinkedInOAuth = () => {
        const params = [
            'response_type=code',
            `client_id=${config.oauth.linkedin.client_id}`,
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

                            this.loginUserByUserObject(userObject, token, 'linkedin')
                        })
                        .catch(() => this.setState({ loading: false, error: errorMessage }))
                  } else {
                    this.setState({ loading: false, error: null })
                }
            }
        )
    }

    openFireFoxGoogleOAuth = () => {
        this.setState({ loading: true, error: null })
        const redirectUrl = browser.identity.getRedirectURL();
        console.log(redirectUrl)
        const scopes = ["email", "profile"]
        const params = [
            'response_type=token',
            `client_id=${config.oauth.google.client_id}`,
            `redirect_uri=${redirectUrl}`,
            `state=asdf355asdf`,
            `scope=openid ${encodeURIComponent(scopes.join(' '))}`,
        ]

        try {
            browser.identity.launchWebAuthFlow(
                { 'url': `https://accounts.google.com/o/oauth2/v2/auth?${params.join('&')}`, 'interactive': true }
            ).then((redirect_url) => {
                  const url = new URL(redirect_url, true)
                  const accessToken = new URLSearchParams(url.hash.substring(1)).get('access_token')
                  const errorMessage = 'An error happened while authorizing you through LinkedIn'
    
                  if (accessToken) {
                      authGoogle(accessToken)
                          .then((resp) => {
                              const apiToken = resp.token
                              storage.setItem('token', apiToken)
                              me().then((userObject)=>{
                                  this.loginUserByUserObject(userObject, apiToken, 'google')
                              })
                          })
                          .catch(() => this.setState({ loading: false, error: errorMessage }))
                    } else {
                      this.setState({ loading: false, error: null })
                  }
            })
        } catch (e) {
            console.log(e);
            this.setState({ loading: false, error: e });
        }

    }

    openGoogleGoogleOAuth = () => {
        this.setState({ loading: true, error: null })
        chrome.identity.getAuthToken({ 'interactive': true }, access_token => {
            const errorMessage = 'An error happened while authorizing you through Google'
            authGoogle(access_token)
                .then((resp) => {
                    let apiToken = resp.token
                    storage.setItem('token', apiToken)
                    me().then((userObject)=>{
                        this.loginUserByUserObject(userObject, apiToken, 'google')
                    })
                })
                .catch(() => this.setState({ loading: false, error: errorMessage }))
        })
    }

    openGoogleOAuth = () => {
        // Firefox doesn't support chrome.identity.getAuthToken, so need to use different auth flow
        if (typeof chrome.identity.getAuthToken === "function") {
            this.openGoogleGoogleOAuth()
        } else if (browser && typeof browser.identity.launchWebAuthFlow === 'function') {
            this.openFireFoxGoogleOAuth()
        }
    }

    goToWebSite = (e) => {
        e.preventDefault()
        chrome.tabs.create({ url: urls.site })
    }

    goToResetPassword = (e) => {
        e.preventDefault()
        chrome.tabs.create({ url: urls.resetPassword })
    }

    submitLoginForm = (e) => {
        e.preventDefault()
        this.setState({ loading: true })

        const params = { username: findDOMNode(this.refs.email).value, password: findDOMNode(this.refs.password).value }
        const errorMessage = "Something went wrong when attempting to log you in."

        login(params)
            .then(response => {
                const token = response.token
                storage.setItem('token', token)

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

    loginUserByUserObject = (userObject, token) => {
        const canTrack = storage.getItem('cookies');
        if (canTrack) {
            trackEventCentr(`downloaded ${getBrowser()} extension`)
        }

        storage.setItem('last_used_email', userObject.email)
        storage.setItem('user', JSON.stringify(userObject))
        storage.setItem('token', token)

        this.setState({ loading: false })
        this.onChange({ user: userObject, token })
    }

    onError = (errorMessage) => {
        this.setState({
            error: errorMessage,
        })
    }

    onChange = (change) => {
        this.props.onChange(change)
    }

    render() {
        const { loading: isLoading, oauthFocused, error } = this.state;

        return (
            <div className="login">
                <h1 className="login__heading">Login to get started.</h1>
                {
                    error &&
                    <div className="login__error-outer">
                        <span className="login__error-message">{error}</span>
                        <br/>
                        Try again or
                        {' '}
                        <a href="#" onClick={this.goToResetPassword}>reset your password</a>.
                    </div>
                }
                <div className={classnames("oauth-options", {
                    focused: oauthFocused,
                })}
                    onClick={() => this.handleFocus(true)}
                >
                    <LoginWith name="Google" onClick={this.openGoogleOAuth}
                        iconClassName="google" disabled={isLoading}/>
                    {/* <LoginWith name="LinkedIn" onClick={this.openLinkedInOAuth}
                        iconClassName="linkedin" disabled={isLoading}/> */}
                </div>

                <div className="form-or">OR</div>

                <form className={classnames("login-form default-form", {
                    focused: !oauthFocused,
                    })}
                    onSubmit={this.submitLoginForm}
                >
                    <div className="input-field">
                        <input placeholder="Email Address" ref="email" type="text" name="email"
                               className="b-input"
                               onFocus={() => this.handleFocus(false)}
                               disabled={isLoading}
                               defaultValue={storage.getItem('last_used_email')}/>
                    </div>
                    <div className="input-field">
                        <input placeholder="Password"
                               className="b-input"
                               onFocus={() => this.handleFocus(false)}
                               disabled={isLoading}
                               ref="password" type="password" name="password"/>
                    </div>
                    <div className="form-actions">
                        <button disabled={isLoading}
                                className={classnames("btn btn-gold", "login-button", { "_loading": isLoading })}
                                type="submit">
                            <span className="__title">Login</span>
                            {' '}
                            <AnimateOpacity>
                                { isLoading && <span className="loading"/> }
                            </AnimateOpacity>
                        </button>
                    </div>
                </form>
                <p>
                    Don't have an account yet? <b><a href="#" onClick={this.goToWebSite}>Create one.</a></b>
                </p>
            </div>
        )
    }
}


export default LoginPage
