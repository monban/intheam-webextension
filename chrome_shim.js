'use strict'

const promisify = (fn, args) => new Promise(resolve => {
  const argsArray = Array.from(args)
  const resolveCallback = function (result) { resolve(result) }
  argsArray.push(resolveCallback)
  fn.apply(this, argsArray)
})

// Emulate proper browser behavior in Chrome
if (typeof browser === 'undefined') {
  window.browser = {
    tabs: {
      create: function () { return chrome.tabs.create.apply(this, arguments) },
      query: function () { return promisify(chrome.tabs.query, arguments) },
      sendMessage: function () { return promisify(chrome.tabs.sendMessage, arguments) }
    },
    storage: {
      sync: {
        get: function () { return promisify(chrome.storage.sync.get, arguments) },
        set: function () { return chrome.storage.sync.set.apply(this, arguments) }
      }
    },
    runtime: {
      openOptionsPage: function () { return chrome.runtime.openOptionsPage.apply(this, arguments) }
    }
  }
}
