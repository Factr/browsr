require('./styles/app.less')

import React from 'react'
import ReactDOM from 'react-dom'
import Layout from './pages/Layout'
import { Provider } from 'react-redux'
import configureStore from './store'

const store = configureStore()

ReactDOM.render(
    <Provider store={store}>
        <Layout />
    </Provider>,
    document.getElementById('body')
)
