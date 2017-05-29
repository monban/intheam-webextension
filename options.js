document.addEventListener("DOMContentLoaded", () => {
  // Load current settings from local store
  browser.storage.local.get('api_key').then((res) => { 
    if (res.api_key)
      document.querySelector('#api_key').value = res.api_key
  });


  // Override the form submit to store the settings
  document.querySelector('#optionsForm').addEventListener('submit', (evt) => {
    evt.preventDefault();
    browser.storage.local.set({api_key: document.querySelector('#api_key').value});
    // TODO Print some kind of message saying save succeeded
  });
});

