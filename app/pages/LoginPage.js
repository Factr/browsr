import React, { PropTypes, Component } from 'react'
import { findDOMNode } from 'react-dom'
import { login, me } from '../api'
import extend from 'lodash/extend'
import classnames from 'classnames'
import AnimateOpacity from 'components/AnimateOpacity'

const baseUrl = "https://factr.com"
const urls = {
    site: baseUrl,
    resetPassword: `${baseUrl}/forgot-password`
}

class LoginPage extends Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
    }
    
    constructor(props) {
        super(props)
        
        this.state = { loading: false, error: null }
    }
    
    render() {
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
                <form className="login-form default-form" onSubmit={::this.submitLoginForm}>
                    <div className="input-field">
                        <input placeholder="Email Address" ref="email" type="text" name="email"
                               className="b-input"
                               defaultValue={kango.storage.getItem('last_used_email')}/>
                    </div>
                    <div className="input-field">
                        <input placeholder="Password"
                               className="b-input"
                               ref="password" type="password" name="password"/>
                    </div>
                    <div className="form-actions">
                        <div className="pull-right">
                            <button className="btn btn-gray" type="reset">Cancel</button>
                            <button disabled={this.state.loading}
                                    className={classnames("btn btn-primary", { "_loading": this.state.loading })}
                                    type="submit">
                                <span className="__title">Login</span>
                                {' '}
                                <AnimateOpacity>
                                    { this.state.loading && <span className="loading"/> }
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
                    .then(user => {
                        //noinspection JSUnresolvedVariable
                        heap.identify(extend({ name: user.first_name + ' ' + user.last_name }, user))
                        heap.track('Logged In', { 'extension': true })
                        kango.storage.setItem('last_used_email', user.email)
                        kango.storage.setItem('user', JSON.stringify(user))
                        this.setState({ loading: false })
                        this.onChange({ user, token })
                    })
                    .catch(() => {
                        this.setState({ loading: false })
                        this.onError(errorMessage)
                    })
            })
            .catch(() => {
                this.setState({ loading: false })
                this.onError(errorMessage)
            })
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