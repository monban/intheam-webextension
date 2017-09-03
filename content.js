browser.runtime.onMessage.addListener((req, sen, res) => {
  res({
    data: window.getSelection().toString()
  })
})
