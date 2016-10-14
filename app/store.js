import { applyMiddleware, createStore } from 'redux'
import { combineReducers } from 'redux-immutable'

// Middlewares
import thunk from 'redux-thunk'

// Reducers
import * as reducers from './pages/CreateStream/reducers'

// Prepare middleware
const middleware = applyMiddleware(thunk)

const configureStore = () => {
    const rootReducer = combineReducers({
        ...reducers
    })
    return createStore(rootReducer, middleware)
}

export default configureStore
