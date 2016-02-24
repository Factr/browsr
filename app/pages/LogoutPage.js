import React, {Component, PropTypes} from 'react';


class LogoutPage extends Component {
    constructor(props){
        super(props);
    }
    shouldComponentUpdate(nextProps){
        return this.props.isLoggedIn !== nextProps.isLoggedIn;
    }

    render() {
        return (<div>Login Page</div>);
    }
}


LogoutPage.propTypes = {
    isLoggedIn: React.PropTypes.bool.isRequired
};



export default LogoutPage;