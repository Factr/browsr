import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';
import extend from 'lodash/extend';
import Select from 'react-select';
import {getStreams, getItemFromUrl, postItem, addItemTags} from '../api';

function buildStreamOptions(streams) {
    return streams.map(function (c) {
        return {value: c.id, label: c.name, title: c.name}
    }).sort((a, b) => a.title > b.title ? 1 : -1)
}


class CollectPage extends Component {
    constructor(props) {
        super(props);
        this.state = {stream: null, streams: [], loadingStreams: false, saving: false, showSuccess: false};
        this.onSubmit = this.onSubmit.bind(this);
        this.onClear = this.onClear.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
        CollectPage.onInputChange = CollectPage.onInputChange.bind(this);
    }

    componentDidMount() {
        this.setState({loadingStreams: true});
        getStreams().then(function (data) {
            const stream = kango.storage.getItem("stream");
            this.setState({streams: data, loadingStreams: false, stream});
        }.bind(this)).catch(function () {
            this.setState({loadingStreams: false});
            this.props.onError('Could not load your streams. Please try again later');
        }.bind(this));
    }

    render() {
        var {streams, loadingStreams, stream, saving, showSuccess} = this.state;
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
                                  onChange={CollectPage.onInputChange} autoFocus
                                  className="b-input _message _resize-y"
                                  placeholder="Say something about this link (optional)"/>
                    </div>
                    <div className="input-field">
                        <label>Save To</label>
                        <Select
                            isLoading={loadingStreams}
                            value={stream}
                            name="form-field-name"
                            options={buildStreamOptions(streams)}
                            optionRenderer={CollectPage.renderOption}
                            onChange={this.onSelectChange}
                        />
                    </div>
                    <div className="input-field">
                        <label>Tags</label>
                        <input ref="tags" name="tags"
                               className="b-input"
                               onChange={CollectPage.onInputChange} placeholder="Separate with a comma"
                               defaultValue={kango.storage.getItem("tags")}
                               type="text"/>
                    </div>

                    <div className="form-actions">
                        <div className="pull-right">
                            <button onClick={this.onClear} className="btn btn-gray" type="button">Cancel</button>
                            <button disabled={saving || !stream} className="btn btn-primary" type="submit">
                                Collect {saving ? (
                                <span className="loading"/>) : null}</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    static onInputChange(e) {
        var value = e.target.value;
        var name = e.target.name;
        kango.storage.setItem(name, value);
    }

    onSubmit(e) {
        e.preventDefault();
        var _this = this;
        var streamId = _this.state.stream.value;
        var post = {};
        _this.setState({saving: true});
        kango.browser.tabs.getCurrent(function (tab) {
            getItemFromUrl(tab.getUrl())
                .then(function (data) {
                    post.title = data.title;
                    post.description = data.description;
                    post.image_url = data.image_url;
                    post.url = data.url;
                    post.message = findDOMNode(_this.refs.message).value;
                    if (data.authors.length > 0) {
                        post.author = data.authors.join(', ');
                    }
                    var tags = findDOMNode(_this.refs.tags).value.split(',').map(function (a) {
                        return a.trim()
                    });
                    postItem(streamId, post).then(function (post) {
                        heap.track('Posted Item', extend({}, {extension: true}, post));
                        if (tags.length > 0) {
                            addItemTags(streamId, post.id, tags).then(function () {
                                _this.setState({saving: false, stream: null, showSuccess: true});
                                _this.closeWindow();
                                CollectPage.clearKangoLocal();
                            }).catch(function () {
                                _this.props.onError("Something went wrong saving tags but your post was created.");
                                _this.setState({saving: false, stream: null, showSuccess: false});
                            });
                        }
                        else {
                            _this.setState({saving: false, stream: null, showSuccess: true});
                            _this.closeWindow();
                            CollectPage.clearKangoLocal();
                        }
                    }).catch(function () {
                        _this.props.onError("Something went wrong when creating post.");
                        _this.setState({saving: false, stream: null, showSuccess: false});

                    });

                }).catch(function () {
                _this.setState({saving: false, stream: null, showSuccess: false});
                _this.props.onError("Could not create post because this page is not valid.")
            })
        }.bind(this));
    }

    closeWindow() {
        setTimeout(function () {
            KangoAPI.closeWindow();
        }, 1000);
    }

    static clearKangoLocal() {
        kango.storage.removeItem('message');
        kango.storage.removeItem('stream');
        kango.storage.removeItem('tags');
    }

    onClear() {
        CollectPage.clearKangoLocal();
        KangoAPI.closeWindow();
    }

    onSelectChange(val) {
        kango.storage.setItem('stream', val);
        this.setState({
            stream: val
        })
    }

    static renderOption(option) {
        return (
            <div>
                <span className="option-title">{option.label}</span>
            </div>
        );

    }
}


CollectPage.propTypes = {
    user: React.PropTypes.object.isRequired
};


export default CollectPage;