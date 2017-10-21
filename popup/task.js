const createTask = async taskdata => {
  const result = await browser.storage.sync.get('api_key')
  if (!result.api_key) {
    browser.runtime.openOptionsPage()
    return
  }
  let xhr = new XMLHttpRequest()
  xhr.addEventListener('loadend', showResult)
  xhr.open('POST', 'https://inthe.am/api/v2/tasks/', true)
  xhr.setRequestHeader('Authorization', 'Token ' + result.api_key)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify(taskdata))
  showPending()
}

const getSeletedText = async tab => {
  const res = await browser.tabs.sendMessage(tab.id, 'foo')
  return res.data
}

const populateFields = async () => {
  const defaults = await browser.storage.sync.get(['default_project', 'default_tags'])
  const tabs = await browser.tabs.query({active: true, currentWindow: true})
  const activeTab = tabs[0]
  const res = await browser.tabs.sendMessage(activeTab.id, 'foo')
  document.getElementById('task_description').value = res.data
  if (defaults.default_project) {
    document.getElementById('task_project').value = defaults.default_project
  }
  if (defaults.default_tags) {
    document.getElementById('task_tags').value = defaults.default_tags
  }
}

const showResult = evt => {
  const submit = document.getElementById('submit_button')
  submit.value = 'Done'

  let resultElement = document.createElement('p')
  const xhr = evt.target
  if (xhr.status == 200) {
    resultElement.classList.add('success')
    let resultText = document.createTextNode('Task created')
    resultElement.appendChild(resultText)
  } else {
    resultElement.classList.add('error')
    let resultText = document.createTextNode(xhr.statusText)
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
  const selectedText = await getSeletedText(activeTab)
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
