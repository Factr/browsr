//noinspection JSUnresolvedVariable
import Immutable from 'immutable'
// import { createSelector } from 'reselect'

// Current & next
export const current = state => state.get('current')
export const next = state => state.get('next')
export const ui = state => state.get('ui')

export const isChanged = state => !Immutable.is(current(state), next(state))
export const isNameLengthGood = state => next(state).get('name').length > 2
export const isInProgress = state => ui(state).get('isInProgress')
export const creationError = state => ui(state).get('creationError')
export const isReadySaving = state => isChanged(state) && isNameLengthGood(state) && !isInProgress(state)
