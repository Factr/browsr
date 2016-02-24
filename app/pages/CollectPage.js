import React, {Component, PropTypes} from 'react';
import Select from 'react-select';
import moment from 'moment';

function buildCollectionOptions(collections) {
    return collections.map(function (c) {
        return {value: c._id, label: c.title, title: c.title, date: c.updateTime}
    })
}


class CollectPage extends Component {
    constructor(props) {
        super(props);
        this.state = {collections: []}
    }

    shouldComponentUpdate(nextProps) {
        return this.props.isLoggedIn !== nextProps.isLoggedIn;
    }

    render() {
        return (
            <div>
                <h1>Save this page</h1>
                <form>
                    <div className="input-field">
                        <label>Post</label>
                        <textarea placeholder="Say something about this link (optional)"></textarea>
                    </div>
                    <div className="input-field">
                        <label>Save To</label>
                        <Select
                            name="form-field-name"
                            options={buildCollectionOptions(this.state.collections)}
                            optionRenderer={this.renderOption}
                            onChange={this.onSelectChange}
                        />                    </div>
                    <div className="input-field">
                        <label>Tags</label>
                        <input placeholder="Sepaerate with a comma" type="text"/>
                    </div>

                    <div className="form-actions">
                        <div className="pull-right">
                            <button className="btn btn-gray" type="reset">Cancel</button>
                            <button className="btn btn-primary" type="submit">Collect</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    onSelectChange() {

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