async function createTask(taskdata) {
  const result = await browser.storage.local.get('api_key')
  if (!result.api_key) {
    browser.runtime.openOptionsPage()
    return
  }
  let xhr = new XMLHttpRequest();
  xhr.addEventListener('loadend', showResult)
  xhr.open('POST', 'https://inthe.am/api/v2/tasks/', true);
  xhr.setRequestHeader("Authorization", "Token " + result.api_key);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(taskdata));
  showPending()
}

async function getSeletedText(tab) {
  const res = await browser.tabs.sendMessage(tab.id, 'foo')
  return res.data
}

async function populateFields() {
  const defaults = await browser.storage.local.get(['default_project', 'default_tags'])
  const tabs = await browser.tabs.query({active: true, currentWindow: true})
  const activeTab = tabs[0]
  const res = await browser.tabs.sendMessage(activeTab.id, 'foo')
  document.querySelector('#task_description').value = res.data
  if (defaults.default_project) {
    document.querySelector('#task_project').value = defaults.default_project
  }
  if (defaults.default_tags) {
    document.querySelector('#task_tags').value = defaults.default_tags
  }
}

function showResult(evt) {
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

function showPending() {
  const submit = document.getElementById('submit_button')
  submit.disabled = true
  submit.value = 'Sending...'
}

function submitForm(evt) {
    evt.preventDefault()
    let taskdata = {
      description: document.querySelector('#task_description').value,
      project: document.querySelector('#task_project').value,
      tags: document.querySelector('#task_tags').value.split(/[^\w]+/)
    }
    createTask(taskdata)
}

function importApiKey(key, store) {
  store.set({api_key: key})
}

document.addEventListener('DOMContentLoaded', async function(evt) {
  const activeTab = (await browser.tabs.query({active: true}))[0]
  const apiKeyUrl = /^https:\/\/inthe\.am\/configure.*/

  // inthe.am api keys are 40 characters long, numbers and lower-case letters
  const apiKeyPattern = /^[a-z\d]{40}$/
  const selectedText = await getSeletedText(activeTab)
  const store = browser.storage.local

  // Check if we're on the inthe.am configuration page
  // and have the api key selected
  if (apiKeyUrl.test(activeTab.url) && apiKeyPattern.test(selectedText)) {
    importApiKey(selectedText, store)
    document.body.innerHTML = 'API key saved'
    browser.runtime.openOptionsPage()
    return
  }

  populateFields()
  // Override the form submit to store the settings
  document.querySelector('#task_form').addEventListener('submit', submitForm)
})

