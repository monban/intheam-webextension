async function createTask(taskdata) {
  console.log('creating task: ', taskdata);
  const result = await browser.storage.local.get('api_key')
  if (!result.api_key) {
    console.log('api_key not set')
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

document.addEventListener('DOMContentLoaded', function(evt) {
  populateFields()
  document.getElementById('task_form').addEventListener('submit', submitForm)
})

