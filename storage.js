const chromeCallback = (data) => {
    if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError)
        return
    } else {
        return data
    }
}

export default {
    setItem: (key, value) => localStorage.setItem(key, value),

    getItem: (key) => localStorage.getItem(key),

    removeItem: (key) => localStorage.removeItem(key),

    clear: () => localStorage.clear()
}
