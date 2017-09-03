async function createTask(description) {
  const result = await browser.storage.local.get('api_key')
  if (!result.api_key) {
    console.log('api_key not set')
    return
  }
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://inthe.am/api/v2/tasks/', true);
  xhr.setRequestHeader("Authorization", "Token " + result.api_key);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({"description": description}));
}

async function populateFields() {
  const tabs = await browser.tabs.query({active: true, currentWindow: true})
  const activeTab = tabs[0]
  const res = await browser.tabs.sendMessage(activeTab.id, 'foo')
  document.getElementById('task_description').value = res.data
}

document.addEventListener('DOMContentLoaded', function(evt) {
  populateFields()
  document.getElementById('task_form').addEventListener('submit', (e) => {
    e.preventDefault()
    let description = document.getElementById('task_description').value
    createTask(description)
  })
})

