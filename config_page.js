const foundKey = document.getElementById('rest_api_key').innerHTML
const storageQuery = browser.storage.sync.get('api_key')

storageQuery.then(res => {
  if (res.api_key === foundKey) {
    return
  }

  const messageElement = document.createElement('div')

  const dismissPopup = () => {
    document.body.removeChild(messageElement)
  }

  const webextSaveKey = () => {
    browser.storage.sync.set({'api_key': foundKey})
    const successMessage = document.createElement('div')
    successMessage.className = 'webextSuccess'
    successMessage.innerHTML = `<h3>API key saved</h3>
      <p>You can now begin using the inthe.am browser extension to add
      tasks from anywhere on the web. Just select some text and press
      the <img src="static/logo.png"> button.</p>
    `
    const okayButton = document.createElement('a')
    okayButton.className = 'button radius'
    okayButton.innerHTML = 'Great!'
    okayButton.addEventListener('click', dismissPopup)
    successMessage.appendChild(okayButton)

    while (messageElement.firstChild)
      messageElement.removeChild(messageElement.firstChild)
    messageElement.appendChild(successMessage)
  }

  messageElement.id = "browser_extension_popup"
  messageElement.innerHTML = `<h3>Link to browser extension?</h3>
    <p>You are running the inthe.am browser extension,
    but it doesn't have the API key for this account loaded.
    Do you want to link this account to the browser extension?</p>
  `
  const saveButton = document.createElement('a')
  saveButton.className = 'button radius'
  saveButton.innerHTML = 'Link'
  saveButton.addEventListener('click', webextSaveKey)

  const dismissButton = document.createElement('a')
  dismissButton.className = 'button radius alert'
  dismissButton.innerHTML = 'No thanks'
  dismissButton.addEventListener('click', dismissPopup)

  messageElement.appendChild(saveButton)
  messageElement.appendChild(dismissButton)
  document.body.appendChild(messageElement)
})
