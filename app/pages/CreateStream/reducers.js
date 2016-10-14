//noinspection JSUnresolvedVariable
import Immutable from 'immutable'
import { createReducer } from 'redux-act'
import { streamExternalToInternal } from './utils'

import {
    setName,
    setDescription,
    setPublic,
    setPrivate,
    sendGeneral,
    resetForm,
} from './actions'

const fromJSFactory = reviver => obj => Immutable.fromJS(obj, reviver)
const fromJS = fromJSFactory((key, value) => {
    const isIndexed = Immutable.Iterable.isIndexed(value)
    
    return isIndexed ? value.toList() : value.toOrderedMap()
})

// CURRENT
const initialState = fromJS({
    id: null,
    name: '',
    desc: '',
    isPublic: false,
    slug: '',
})

export const current = createReducer({
    [sendGeneral.ok]: (state, { response }) => fromJS(streamExternalToInternal(response)),
    [resetForm]: state => initialState,
}, initialState)

export const next = createReducer({
    [setName]: (state, { name }) => state.set('name', name),
    [setDescription]: (state, { desc }) => state.set('desc', desc),
    [setPrivate]: state => state.set('isPublic', false),
    [setPublic]: state => state.set('isPublic', true),
    
    [sendGeneral.ok]: (state, { response }) => fromJS(streamExternalToInternal(response)),
    
    [resetForm]: state => initialState,
}, initialState)

// UI
const uiInitialState = fromJS({
    isInProgress: false,
    creationError: null,
})

export const ui = createReducer({
    [sendGeneral.request]: state => state
        .set('isInProgress', true)
        .set('creationError', null),
    [sendGeneral.error]: (state, payload, error) => state
        .set('isInProgress', false)
        .set('creationError', error),
    [sendGeneral.ok]: state => state
        .set('isInProgress', false)
        .set('creationError', null),
    [resetForm]: state => uiInitialState,
}, uiInitialState)