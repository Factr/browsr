import React, {Component} from 'react';
import LoginPage from './LoginPage';
import CollectPage from './CollectPage';


class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            token: kango.storage.getItem('token'),
            user: JSON.parse(kango.storage.getItem('user')),
        };
        this.onChange = this.onChange.bind(this);
        this.logOut = this.logOut.bind(this);
        this.renderBody = this.renderBody.bind(this);
        this.renderNavMenu = this.renderNavMenu.bind(this);
    }

    render() {
        return (
            <div id="app" ref="app">
                <nav className="nav">
                    <div className="nav-wrapper">
                        <div className="branding"><a href="https://factr.com" className="logo" /></div>
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
        return <div><CollectPage onError={this.onError} user={state.user}/></div>
    }

    renderNavMenu() {
        var {user, token} = this.state;
        if (user) {
            return (
                <div className="logged-in">
                    <div>Logged in as <b>{user.first_name + ' ' + user.last_name}</b></div>
                    <div><a href="#" onClick={this.logOut}>Logout</a></div>
                </div>
            );
        }
        return null;
    }

    onChange(state) {
        this.setState(state);
    }

    logOut() {
        //kango.storage.removeItem('user');
        //kango.storage.removeItem('token');
        kango.storage.clear();
        heap.track('Logged Out', {extension: true});
        this.onChange({user: null, token: null});
    }
}

export default Layout;