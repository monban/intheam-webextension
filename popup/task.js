'use strict'

const createTaskManager = function (brwsr) {
  return {
    createTask: async function (taskdata) {
      this.showPending()
      const storageResult = await brwsr.storage.sync.get('api_key')
      const intheamTaskApiEndpoint = 'https://inthe.am/api/v2/tasks/'
      if (!storageResult.api_key) {
        brwsr.runtime.openOptionsPage()
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
      }).then(this.showResult)
      return result
    },
    getSelectedText: async function (tab) {
      const result = await brwsr.tabs.sendMessage(tab.id, 'foo', {})
      return result.data
    },
    populateFields: async function () {
      const defaults = await brwsr.storage.sync.get(['default_project', 'default_tags'])
      const tabs = await brwsr.tabs.query({active: true, currentWindow: true})
      const activeTab = tabs[0]
      document.getElementById('task_description').value = await this.getSelectedText(activeTab)
      if (defaults.default_project) {
        document.getElementById('task_project').value = defaults.default_project
      }
      if (defaults.default_tags) {
        document.getElementById('task_tags').value = defaults.default_tags
      }
    },
    showResult: function (response) {
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
    },
    showPending: function () {
      const submit = document.getElementById('submit_button')
      submit.disabled = true
      submit.value = 'Sending...'
    },
    submitForm: function (evt) {
      evt.preventDefault()
      let taskdata = {
        description: document.getElementById('task_description').value,
        project: document.getElementById('task_project').value,
        tags: document.getElementById('task_tags').value.split(/[^\w]+/)
      }
      this.createTask(taskdata)
    },
    importApiKey: function (key, store) {
      store.set({api_key: key})
    },
    init: async function (event) {
      const activeTab = (await brwsr.tabs.query({active: true}))[0]
      const apiKeyUrl = /^https:\/\/inthe\.am\/configure.*/
      const intheamConfigurationPage = 'https://inthe.am/configure#api'
      const instructionsElm = document.getElementById('setup-instructions')
      const formElement = document.getElementById('task_form')

      // inthe.am api keys are 40 characters long, numbers and lower-case letters
      const apiKeyPattern = /^[a-z\d]{40}$/
      const selectedText = await this.getSelectedText(activeTab)
      const store = brwsr.storage.sync
      const storedSettings = await store.get()

      // Check if we're on the inthe.am configuration page
      // and have the api key selected
      if (apiKeyUrl.test(activeTab.url) && apiKeyPattern.test(selectedText)) {
        this.importApiKey(selectedText, store)
        document.body.innerHTML = 'API key saved'
        brwsr.runtime.openOptionsPage()
        return
      }

      // If we don't have a saved API key, display instructions
      if (!storedSettings.api_key) {
        brwsr.tabs.create({
          active: true,
          url: intheamConfigurationPage
        })
        instructionsElm.style.display = 'block'
        formElement.style.display = 'none'
        return
      }

      this.populateFields()
      // Override the form submit to store the settings
      const submitForm = this.submitForm.bind(this)
      formElement.addEventListener('submit', submitForm)
    }
  }
}

const taskManager = createTaskManager(browser)
const init = taskManager.init.bind(taskManager)
document.addEventListener('DOMContentLoaded', init)
