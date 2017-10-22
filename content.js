'use strict'

const messageHandler = (req, sen, res) => {
  const text = window.getSelection().toString()
  const data = {}
  if (typeof text === 'undefined') {
    data.data = ''
  } else {
    data.data = text
  }
  res(data)
}

const addListenerTo = brwsr => brwsr.runtime.onMessage.addListener(messageHandler)

if (typeof browser === 'undefined') {
  addListenerTo(chrome)
} else {
  addListenerTo(browser)
}
