import React, {Component} from 'react';
import LoginPage from './LoginPage';
import CollectPage from './CollectPage';


class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            token: kango.storage.getItem('token'),
            user: JSON.parse(kango.storage.getItem('user')),
            error: false
        };
        this.onChange = this.onChange.bind(this);
        this.onError = this.onError.bind(this);
        this.logOut = this.logOut.bind(this);
        this.renderBody = this.renderBody.bind(this);
        this.renderNavMenu = this.renderNavMenu.bind(this);
    }

    render() {
        if (this.state.error) {
            return (
                <div id="app">
                    <div className="status-message error">{this.state.error}</div>
                </div>
            )
        }
        return (
            <div id="app">
                <nav className="nav">
                    <div className="nav-wrapper">
                        <div className="branding"><a href="https://factr.com" className="logo"></a></div>
                        <div className="menu">
                            {this.renderNavMenu()}
                        </div>
                    </div>
                </nav>
                <div className="container">
                    {this.renderBody()}
                </div>
            </div>);

    }

    renderBody() {
        var state = this.state;
        if (!state.token) {
            return <div><LoginPage onChange={this.onChange} onError={this.onError}/></div>;
        }
        var user = state.user;

        if (!user) {
            this.logOut();
            return null;
        }
        return <div><CollectPage user={state.user}/></div>
    }

    renderNavMenu() {
        var {user, token} = this.state;
        if (user) {
            return (
                <div className="logged-in">
                    <div>Logged in as <b>{user.display_name}</b></div>
                    <div><a href="#" onClick={this.logOut}>Logout</a></div>
                </div>
            );
        }
        return null;
    }

    onError(message) {
        this.setState({error: message});
        setTimeout(function () {
            this.setState({error: false});
        }.bind(this), 3000)

    }

    onChange(state) {
        this.setState(state);
    }

    logOut() {
        kango.storage.removeItem('user');
        kango.storage.removeItem('token');
        this.onChange({user: null, token: null});
    }
}

export default Layout;