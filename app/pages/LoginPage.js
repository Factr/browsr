import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';
import {login, me} from '../api';
import extend from 'lodash/extend';

const baseUrl = "https://factr.com"
const urls = {
    site: baseUrl,
    resetPassword: `${baseUrl}/forgot-password`
}

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {loading: false, error: false};
        this.submitLoginForm = this.submitLoginForm.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    render() {
        return (
            <div className="login">
                <h1 className="login__heading">Login</h1>
                {
                    this.state.error &&
                    <div className="login__error-outer">
                        <span className="login__error-message" dangerouslySetInnerHTML={{ __html: this.state.error }} />
                        <br/>
                        Try again or
                        {' '}
                        <a href="#" onClick={LoginPage.goToResetPassword}>reset your password</a>.
                    </div>
                }
                <form className="login-form default-form" onSubmit={this.submitLoginForm}>
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
                            <button disabled={this.state.loading} className="btn btn-primary" type="submit">
                                Login {this.state.loading ? (<span className="loading" />) : null}</button>
                        </div>
                    </div>
                </form>
                <p>
                    Don't have an account yet? Factr is currently in private beta. Go to <b><a href="#"
                                                                                               onClick={LoginPage.goToWebSite}>our
                    website</a></b> to apply for an invitation.
                </p>
            </div>
        );
    }
    
    onError(message) {
        this.setState({error: message})
    }

    static goToWebSite(e) {
        e.preventDefault();
        kango.browser.tabs.create({url: urls.site});
    }
    
    static goToResetPassword(e) {
        e.preventDefault()
        kango.browser.tabs.create({url: urls.resetPassword})
    }

    submitLoginForm(e) {
        e.preventDefault();
        var _this = this;
        _this.setState({loading: true});
        var params = {username: findDOMNode(this.refs.email).value, password: findDOMNode(this.refs.password).value};
        var errorMessage = "Something went&nbsp;wrong when&nbsp;attempting to&nbsp;log&nbsp;you&nbsp;in.";
        login(params).then(function (response) {
            var token = response.token;
            kango.storage.setItem('token', token);
            me().then(function (user) {
                heap.identify(extend({name: user.first_name + ' ' + user.last_name}, user));
                heap.track('Logged In', {'extension': true});
                kango.storage.setItem('last_used_email', user.email);
                kango.storage.setItem('user', JSON.stringify(user));
                _this.setState({loading: false});
                _this.onChange({user, token});
            }).catch(function () {
                _this.setState({loading: false});
                _this.onError(errorMessage);
            });
        }).catch(function () {
            _this.setState({loading: false});
            _this.onError(errorMessage);
        })
    }

    onChange(change) {
        this.props.onChange(change);
    }
}


export default LoginPage;