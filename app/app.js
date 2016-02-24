require('./styles/app.less');

import React from 'react';
import ReactDOM from 'react-dom';
import Layout from './pages/Layout';

KangoAPI.onReady(function () {
    ReactDOM.render(
        <Layout/>,
        document.getElementById('body')
    );
});
