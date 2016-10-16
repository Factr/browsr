import React from 'react'
import classnames from 'classnames'

require('./Message.less')
require('./AnimatedSuccessIcon.less')

export default function Message({ text = "No text", iconClassName, icon, error, buttons }) {
    const statusMessageClasses = classnames("b-status-message", {
        "_error": error,
    })
    
    if (error)
        iconClassName = "icon-warning"
    
    return (
        <div className="b-message">
            <div className={statusMessageClasses}>
                <div className="b-status-message__icon">
                    {
                        iconClassName && !icon &&
                        <span className={classnames("icon", iconClassName)}/>
                    }
                    { icon }
                </div>
                <div className="b-status-message__title" dangerouslySetInnerHTML={{ __html: text }} />
                {
                    buttons &&
                    <div className="b-status-message__buttons">
                        { buttons }
                    </div>
                }
            </div>
        </div>
    )
}