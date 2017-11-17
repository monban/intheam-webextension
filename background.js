'use strict'

const new_install = brwsr => {
  brwsr.storage.sync.set({
    "default_tags": "FromTheWeb"
  })
}

const on_installed = (brwsr, details) => {
  if (details.reason === 'install') {
    new_install(brwsr)
  }
}

if (typeof browser === 'undefined') {
  chrome.runtime.onInstalled.addListener(details => on_installed(chrome, details))
} else {
  browser.runtime.onInstalled.addListener(details => on_installed(browser, details))
}
