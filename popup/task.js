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
      try {
        const result = await brwsr.tabs.sendMessage(tab.id, 'foo', {})
        return result.data
      } catch (err) {
        console.error('error occured communicating with background script:', err)
        return ''
      }
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
      const formElement = document.getElementById('task_form')

      // inthe.am api keys are 40 characters long, numbers and lower-case letters
      const store = brwsr.storage.sync
      const storedSettings = await store.get()

      // If we don't have a saved API key, go to the app options
      if (!storedSettings.api_key) {
        brwsr.runtime.openOptionsPage()
        formElement.style.display = 'none'
        window.close()
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
