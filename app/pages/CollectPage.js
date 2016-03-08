import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import Select from 'react-select';
import moment from 'moment';
import {getCollections, createItemFromURL, collect} from 'api';

function buildCollectionOptions(collections) {
    return collections.map(function (c) {
        return {value: c._id, label: c.title, title: c.title + ' - ' + c.streamTitle, date: c.updateTime}
    })
}


class CollectPage extends Component {
    constructor(props) {
        super(props);
        this.state = {collection: null, collections: [], loadingCollections: false, saving: false, showSuccess: false};
        this.onSubmit = this.onSubmit.bind(this);
        this.onClear = this.onClear.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
    }

    componentDidMount() {
        this.setState({loadingCollections: true});
        getCollections().then(function (data) {
            this.setState({collections: data, loadingCollections: false});
        }.bind(this)).catch(function (err) {
            this.setState({loadingCollections: false});
            this.props.onError('Could not load your collections. Please try again later');
        }.bind(this));

    }

    render() {
        var {collections, loadingCollections, collection, saving, showSuccess} = this.state;
        if (showSuccess) {
            return (<div className="collect">
                <div className="status-message">Successfully saved</div>
            </div>)
        }
        return (
            <div className="collect">
                <h1>Save this page</h1>
                <form onSubmit={this.onSubmit}>
                    <div className="input-field">
                        <label>Post</label>
                        <textarea ref="message" name="message" defaultValue={kango.storage.getItem("message")}
                                  onChange={this.onInputChange} placeholder="Say something about this link (optional)"/>
                    </div>
                    <div className="input-field">
                        <label>Save To</label>
                        <Select
                            isLoading={loadingCollections}
                            value={collection}
                            name="form-field-name"
                            options={buildCollectionOptions(collections)}
                            optionRenderer={this.renderOption}
                            onChange={this.onSelectChange}
                        /></div>
                    <div className="input-field">
                        <label>Tags</label>
                        <input ref="tags" name="tags" defaultValue={kango.storage.getItem("tags")}
                               onChange={this.onInputChange} placeholder="Separate with a comma"
                               type="text"/>
                    </div>

                    <div className="form-actions">
                        <div className="pull-right">
                            <button onClick={this.onClear} className="btn btn-gray" type="button">Cancel</button>
                            <button disabled={saving} className="btn btn-primary" type="submit">Collect {saving ? (
                                <span className="loading"></span>) : null}</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    onInputChange(e) {
        var value = e.target.value;
        var name = e.target.name;
        kango.storage.setItem(name, value);
    }

    onSubmit(e) {
        e.preventDefault();
        var _this = this;
        _this.setState({saving: true});
        kango.browser.tabs.getCurrent(function (tab) {
            createItemFromURL(tab.getUrl())
                .then(function (item) {
                    var params = {
                        item: item._id,
                        collection: _this.state.collection,
                        tags: findDOMNode(_this.refs.tags).value.split(','),
                        message: findDOMNode(_this.refs.message).value.split(',')
                    };
                    collect(params).then(function () {
                        _this.setState({saving: false, collection: null, showSuccess: true});
                        _this.clearKangoLocal();
                        setTimeout(function () {
                            KangoAPI.closeWindow();
                        }, 1000);
                    }).catch(function () {
                        _this.props.onError("Something went wrong when trying to collect item.");
                        _this.setState({saving: false});
                    })
                }).catch(function (err) {
                _this.setState({saving: false});
                _this.props.onError("Could not parse current page.");
            })
        }.bind(this));
    }

    clearKangoLocal() {
        kango.storage.removeItem('message');
        kango.storage.removeItem('tags');

    }

    onClear() {
        this.clearKangoLocal();
        this.setState({collection: null});
        KangoAPI.closeWindow();
    }

    onSelectChange(val) {
        this.setState({
            collection: val
        })


    }

    renderOption(option) {
        return (
            <div>
                <span className="option-title">{option.title}</span>
                <span className="option-date">{moment(option.date).fromNow()}</span>
            </div>
        );

    }
}


CollectPage.propTypes = {
    user: React.PropTypes.object.isRequired
};


export default CollectPage;