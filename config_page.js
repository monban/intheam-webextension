const webextFindKey = async () => {
  const apiKeyPattern = /^[a-z\d]{40}$/
  const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
  const validKey = key => apiKeyPattern.test(key)
  const getKey = () => {
    const elm = document.getElementById('rest_api_key')
    if (elm) {
      return document.getElementById('rest_api_key').innerHTML
    } else {
      return null
    }
  }
  let tagContents = getKey() // Ugh, a mutable variable
  while (!validKey(tagContents)) {
    // The Ember app hasn't finished rendering yet, wait a bit
    await sleep(500)
    tagContents = getKey()
  }
  return tagContents
}
const webextShowPopup = key => {
  const messageElement = document.createElement('div')

  const dismissPopup = () => {
    document.body.removeChild(messageElement)
  }

  const webextSaveKey = () => {
    browser.storage.sync.set({'api_key': key})
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

    while (messageElement.firstChild) {
      messageElement.removeChild(messageElement.firstChild)
    }
    messageElement.appendChild(successMessage)
  }

  messageElement.id = 'browser_extension_popup'
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
}
const webextInit = async () => {
  const storedKey = (await browser.storage.sync.get('api_key')).api_key
  const foundKey = await webextFindKey()
  if (foundKey === storedKey) {
    // The key is already stored, we're done here
  } else {
    webextShowPopup(foundKey)
  }
}
webextInit()
