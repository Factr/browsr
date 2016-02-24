import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import Select from 'react-select';
import moment from 'moment';
import {getCollections, createItemFromURL, collect} from 'api';

function buildCollectionOptions(collections) {
    return collections.map(function (c) {
        return {value: c._id, label: c.title, title: c.title, date: c.updateTime}
    })
}


class CollectPage extends Component {
    constructor(props) {
        super(props);
        this.state = {collection: null, collections: [], loadingCollections: false, saving: false};
        this.onSubmit = this.onSubmit.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
    }

    componentDidMount() {
        this.setState({loadingCollections: true});
        getCollections().then(function (data) {
            this.setState({collections: data, loadingCollections: false});
        }.bind(this)).catch(function (err) {
            this.setState({loadingCollections: false});
            alert('Could not load your collections. Please try again later');
        });

    }

    render() {
        var {collections, loadingCollections, collection, saving} = this.state;
        return (
            <div>
                <h1>Save this page</h1>
                <form onSubmit={this.onSubmit}>
                    <div className="input-field">
                        <label>Post</label>
                        <textarea ref="message" name="message" placeholder="Say something about this link (optional)"/>
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
                        <input ref="tags" name="tags" placeholder="Sepaerate with a comma" type="text"/>
                    </div>

                    <div className="form-actions">
                        <div className="pull-right">
                            <button className="btn btn-gray" type="reset">Cancel</button>
                            <button disabled={saving} className="btn btn-primary" type="submit">Collect {saving ? (<span className="loading"></span>) : null}</button>
                        </div>
                    </div>
                </form>
            </div>
        );
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
                        _this.setState({saving: false, collection: null});
                        KangoAPI.closeWindow()
                    }).catch(function () {
                        alert("Something went wrong when trying to collect item.");
                        _this.setState({saving: false});
                    })
                }).catch(function (err) {
                _this.setState({saving: false});
                alert("Could not parse current page.");
            })
        }.bind(this));
    }

    clearForm() {

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