browser.contextMenus.create({
    id: "create-intheam-task",
    title: "Create task on inthe.am",
    contexts: ["selection"]
});
browser.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "create-intheam-task") {
      createTask(info.selectionText);
    }
});

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
