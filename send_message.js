console.log("CALLING SEND_MESSAGE")
chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    if (message == 'version') {
      sendResponse({
        type: 'success',
        version: '0.3.9'
      })
      return true
    }
  }
)
