document.addEventListener("DOMContentLoaded", () => {
  // Load current settings from local store
  browser.storage.local.get().then((res) => { 
    if (res.api_key)
      document.querySelector('#api_key').value = res.api_key
    if (res.default_project)
      document.querySelector('#default_project').value = res.default_project
    if (res.default_tags)
      document.querySelector('#default_tags').value = res.default_tags
  });


  // Override the form submit to store the settings
  document.querySelector('#optionsForm').addEventListener('submit', (evt) => {
    evt.preventDefault();
    const formdata = {
      api_key: document.querySelector('#api_key').value,
      default_project: document.querySelector('#default_project').value,
      default_tags: document.querySelector('#default_tags').value
    }
      
    browser.storage.local.set(formdata);
    // TODO Print some kind of message saying save succeeded
  });
});

