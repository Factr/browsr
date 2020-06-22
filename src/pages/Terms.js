import React, { Component } from 'react';
import PropTypes from 'prop-types';
import storage from 'storage';
import Switch from 'react-switch';
import cx from 'classnames';

require('./Terms.less');

class Terms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cookies: false,
            currentTab: false,
        };
    }

    toggleCookies = () => {
        this.setState((state) => ({ cookies: !state.cookies }));
    }

    toggleTab = () => {
        this.setState((state) => ({ currentTab: !state.currentTab }));
    }

    openPrivacy = (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: 'https://factr.com/privacy-policy' });
    }

    render() {
        const { cookies, currentTab } = this.state;
        return (
            <div className="terms">
                <div className="row">
                    <div className="title">
                        Can we add cookies to your browser to store your Factr profile information so that you don't have to log in every time?
                    </div>
                    <Switch
                        onChange={this.toggleCookies}
                        checked={cookies}
                        onColor="#fcc800"
                    />
                </div>
                <div className="row">
                    <div className="title">
                        Can we collect anonymous data on your current tab URL so we can generate an image/description preview when you want to post from the extension?
                    </div>
                    <Switch
                        onChange={this.toggleTab}
                        checked={currentTab}
                        onColor="#fcc800"
                    />
                </div>
                <div className="privacy-disclaimer">
                    <span>
                        Unfortunately, without cookies and the ability to collect data on the current URL, Add to Factr will not work because we need to store the user credentials to post to your Factr account.
                    </span>
                    <span>
                        Full details about the data we collect and what we do with it, along with details over cookies we create are provided in our
                        <a href="#" onClick={this.openPrivacy}>&nbsp;Privacy Policy</a>
                    </span>
                </div>
                <div className="button-container">
                    <button
                        className={cx('btn btn-gold', 'submit-button', {
                            _disabled: !(cookies && currentTab)
                        })}
                        onClick={this.props.onSubmit}
                        disabled={!(cookies && currentTab)}
                    >
                        <span className="__title">Continue</span>
                    </button>
                </div>
            </div>
        )
    }
}

export default Terms;