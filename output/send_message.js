console.log("Running send_message")

chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {
        console.log(message, sender, sendResponse)
        console.log("Message: ", message.message)
        if (message.message === 'version') {
            sendResponse({
                type: 'success',
                version: '0.3.9'
            })
            return true
        }
    }
)
