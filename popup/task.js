'use strict'

const createTask = async taskdata => {
  showPending()
  const storageResult = await browser.storage.sync.get('api_key')
  const intheamTaskApiEndpoint = 'https://inthe.am/api/v2/tasks/'
  if (!storageResult.api_key) {
    browser.runtime.openOptionsPage()
    return
  }
  const headers = new Headers({
    'Authorization': 'Token ' + storageResult.api_key,
    'Content-Type': 'application/json'
  })
  const result = fetch(intheamTaskApiEndpoint, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(taskdata)
  }).then(showResult)
  return result
}

const getSelectedText = async tab => {
  const result = await browser.tabs.sendMessage(tab.id, 'foo', {})
  return result.data
}

const populateFields = async () => {
  const defaults = await browser.storage.sync.get(['default_project', 'default_tags'])
  const tabs = await browser.tabs.query({active: true, currentWindow: true})
  const activeTab = tabs[0]
  document.getElementById('task_description').value = await getSelectedText(activeTab)
  if (defaults.default_project) {
    document.getElementById('task_project').value = defaults.default_project
  }
  if (defaults.default_tags) {
    document.getElementById('task_tags').value = defaults.default_tags
  }
}

const showResult = response => {
  const submit = document.getElementById('submit_button')
  submit.value = 'Done'

  let resultElement = document.createElement('p')
  if (response.ok) {
    resultElement.classList.add('success')
    let resultText = document.createTextNode('Task created')
    resultElement.appendChild(resultText)
  } else {
    resultElement.classList.add('error')
    let resultText = document.createTextNode(response.statusText)
    resultElement.appendChild(resultText)
  }
  document.body.appendChild(resultElement)
}

const showPending = () => {
  const submit = document.getElementById('submit_button')
  submit.disabled = true
  submit.value = 'Sending...'
}

const submitForm = evt => {
  evt.preventDefault()
  let taskdata = {
    description: document.getElementById('task_description').value,
    project: document.getElementById('task_project').value,
    tags: document.getElementById('task_tags').value.split(/[^\w]+/)
  }
  createTask(taskdata)
}

const importApiKey = (key, store) => {
  store.set({api_key: key})
}

document.addEventListener('DOMContentLoaded', async evt => {
  const activeTab = (await browser.tabs.query({active: true}))[0]
  const apiKeyUrl = /^https:\/\/inthe\.am\/configure.*/
  const intheamConfigurationPage = 'https://inthe.am/configure#api'
  const instructionsElm = document.getElementById('setup-instructions')
  const formElement = document.getElementById('task_form')

  // inthe.am api keys are 40 characters long, numbers and lower-case letters
  const apiKeyPattern = /^[a-z\d]{40}$/
  const selectedText = await getSelectedText(activeTab)
  const store = browser.storage.sync
  const storedSettings = await store.get()

  // Check if we're on the inthe.am configuration page
  // and have the api key selected
  if (apiKeyUrl.test(activeTab.url) && apiKeyPattern.test(selectedText)) {
    importApiKey(selectedText, store)
    document.body.innerHTML = 'API key saved'
    browser.runtime.openOptionsPage()
    return
  }

  // If we don't have a saved API key, display instructions
  if (!storedSettings.api_key) {
    browser.tabs.create({
      active: true,
      url: intheamConfigurationPage
    })
    instructionsElm.style.display = 'block'
    formElement.style.display = 'none'
    return
  }

  populateFields()
  // Override the form submit to store the settings
  formElement.addEventListener('submit', submitForm)
})
