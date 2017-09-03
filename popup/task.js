function createTask(description) {
  browser.storage.local.get('api_key').then((res) => {
    if (res.api_key) {
      let xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://inthe.am/api/v2/tasks/', true);
      xhr.setRequestHeader("Authorization", "Token " + res.api_key);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify({"description": description}));
    } else {
      // Tell people they need to set up the extension?
      console.log('api_key not set');
    }
  });
}
document.getElementById('task_form').addEventListener('submit', (e) => {
  e.preventDefault();
  let description = document.getElementById('task_description').value;
  createTask(description);
})

document.addEventListener('DOMContentLoaded', (evt) => {
  browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
    let activeTab = tabs[0]
    browser.tabs.sendMessage(activeTab.id, 'foo').then((res) => {
      document.getElementById('task_description').value = res.data
    })
  })
})

