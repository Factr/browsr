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
        chrome.tabs.create({ url: 'https://blog.factr.com/privacy-policy-add-to-factr/' });
    }

    handleSubmit = () => {
        const { cookies, currentTab } = this.state;
        this.props.onSubmit({ cookies, currentTab });
    }

    render() {
        const { cookies, currentTab } = this.state;
        return (
            <div className="terms">
                <div className="row">
                    <div className="title">
                        Can we monitor that you're able to succesfully download and post via the extension?
                    </div>
                    <Switch
                        onChange={this.toggleCookies}
                        checked={cookies}
                        onColor="#fcc800"
                    />
                </div>
                <div className="row">
                    <div className="title">
                        Can we collect anonymized data from the site you're linking, so we can show an image/description preview in the post you create?**
                    </div>
                    <Switch
                        onChange={this.toggleTab}
                        checked={currentTab}
                        onColor="#fcc800"
                    />
                </div>
                <div className="privacy-disclaimer">
                    <span>
                        **Unfortunately, declining the ability to see the current tab URL will prevent “Add to Factr” from working.&nbsp;
                    </span>
                    <span>
                        For full details about the data we collect check out our
                        <a href="#" onClick={this.openPrivacy}>&nbsp;Privacy Policy</a>
                    </span>
                </div>
                <div className="button-container">
                    <button
                        className={cx('btn btn-gold', 'submit-button', {
                            _disabled: !currentTab
                        })}
                        onClick={this.handleSubmit}
                        disabled={!currentTab}
                    >
                        <span className="__title">Continue</span>
                    </button>
                </div>
            </div>
        )
    }
}

export default Terms;