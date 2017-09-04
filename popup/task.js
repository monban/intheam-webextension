async function createTask(description) {
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
  xhr.send(JSON.stringify({"description": description}));
  showPending()
}

async function populateFields() {
  const tabs = await browser.tabs.query({active: true, currentWindow: true})
  const activeTab = tabs[0]
  const res = await browser.tabs.sendMessage(activeTab.id, 'foo')
  document.getElementById('task_description').value = res.data
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

document.addEventListener('DOMContentLoaded', function(evt) {
  populateFields()
  document.getElementById('task_form').addEventListener('submit', (e) => {
    e.preventDefault()
    let description = document.getElementById('task_description').value
    createTask(description)
  })
})

