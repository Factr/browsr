import { createAction } from 'redux-act'
import { createActionAsync } from 'redux-act-async'
import { trackEvent } from './utils'
import { formatResponseError, streamInternalToExternal } from './utils'
import { createStream } from '../../api'
import _ from 'lodash'

export const sendGeneral = createActionAsync('SEND_STREAM_GENERAL',
    internalStream => {
        const formData = new FormData()
    
        const params = streamInternalToExternal(internalStream)
        _.forEach(params, (value, key) => formData.append(key, value))
        
        const saveOk = data => {
            trackEvent('[chrome extension] created stream', data)
            
            return data
        }
    
        return createStream(formData)
            .then(saveOk)
            .catch(formatResponseError)
    }, {
        error: {
            metaReducer: ({ error }) => error,
        },
    })

// General
export const setName = createAction('SET_STREAM_NAME', name => ({ name }))
export const setDescription = createAction('SET_STREAM_DESCRIPTION', desc => ({ desc }))
export const setPublic = createAction('SET_STREAM_PRIVACY_PUBLIC')
export const setPrivate = createAction('SET_STREAM_PRIVACY_PRIVATE')

export const resetForm = createAction('RESET_EVERYTHING')