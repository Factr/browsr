import React, { Component, PropTypes } from "react"
import LoginPage from "./LoginPage"
import CollectPage from "./CollectPage"
import CreateStreamPageConnected from "./CreateStream/index.js"
import Message from "components/Message"
import classnames from "classnames"
import storage from 'storage'
import Terms from "./Terms"

window.storage = storage

class TryAgainButton extends Component {
    static propTypes = {
        fn: PropTypes.func.isRequired,
    }

    state = {
        loading: false,
    }

    onClick = () => {
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
                    onClick={this.onClick}>
                <span className="__title">Try again</span>
                { this.state.loading && <span className="loading" /> }
            </button>
        )
    }
}

class Layout extends Component {
    constructor(props) {
        super(props)
        this.state = {
            token: storage.getItem('token'),
            user: JSON.parse(storage.getItem('user')),
            cookies: JSON.parse(storage.getItem('cookies')),
            currentTab: JSON.parse(storage.getItem('currentTab')),
            isCreatingStream: false,
            appShown: false,
            error: null,
        };
    }

    componentDidMount() {
        this.setState({
            cookies: JSON.parse(storage.getItem('cookies')),
            currentTab: JSON.parse(storage.getItem('currentTab')),
        });

        if (!this.state.user) {
            this.logOut()
        }
    }

    openCreatingStream = () => {
        this.setState({ isCreatingStream: true })
    }

    closeCreatingStream = (stream) => {
        if (stream)
            storage.setItem('stream', stream)
            this.setState({ isCreatingStream: false }, () => {
        })
    }

    onChange = (state) => {
        this.setState(state)
    }

    onError = (error) => {
        console.error("ERROR:", error.actualError)
        if (error.actualError.noInternet) {
            this.setState({ error: { ...error, message: "No internet connection.", closeBtn: true } })
        } else {
            this.setState({ error })
        }
    }

    onLogOut = (e) => {
        e && typeof e.preventDefault === "function" && e.preventDefault()
        this.logOut()
    }

    logOut = () => {
        storage.clear();
        this.setState({ user: null, token: null, error: null });
    }

    handleTermsSubmit = ({ cookies, currentTab }) => {
        storage.setItem('cookies', cookies ? 'true' : null);
        storage.setItem('currentTab', currentTab ? 'true': null);

        this.setState({ cookies, currentTab });
    }

    renderNavMenu() {
        const { user } = this.state

        if (user) {
            return (
                <div className="logged-in">
                    <div>Logged in as {user.first_name + ' ' + user.last_name}.
                        <a href="#" onClick={this.onLogOut} tabIndex="-1"> Logout.</a>
                    </div>
                </div>
            )
        }

        return null
    }

    renderBody() {
        const { user, token, isCreatingStream, error, currentTab } = this.state

        if (!currentTab) {
            return (
                <Terms onSubmit={this.handleTermsSubmit} />
            )
        }

        if (!token) {
            return (
                <div>
                    <LoginPage
                        onChange={this.onChange}
                        error={error}
                    />
                </div>
            )
        }

        if (!user) {
            return null
        }

        return (
            <div style={{width: '100%'}}>
                {
                    isCreatingStream
                        ? (
                            <CreateStreamPageConnected
                                onDone={this.closeCreatingStream}
                                onError={this.onError}
                                error={error}
                            />
                        ) : (
                            <CollectPage user={user}
                                openCreatingStream={this.openCreatingStream}
                                onError={this.onError}
                                error={error}
                            />
                        )
                }
            </div>
        )
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
                            onClick={() => {}}>
                    </button>
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
}

export default Layout
