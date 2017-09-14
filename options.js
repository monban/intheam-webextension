async function loadSettings(formElement, storageArea) {
  const data = await storageArea.get()
  for (let key in data) {
    let element = formElement.querySelector('#' + key)
    if (element) {
      element.value = data[key]
    }
  }
}

async function saveSettings(formElement, storageArea) {
  let formdata = {}
  for (let element of formElement.elements) {
    console.log(element);
    formdata[element.name] = element.value
  }
  console.log('saving fromdata', formdata)
  await storageArea.set(formdata)
}


document.addEventListener("DOMContentLoaded", () => {
  // Load current settings from local store
  const form = document.querySelector('#optionsForm')
  const store = browser.storage.local
  loadSettings(form, store)

  // Override the form submit to store the settings
  form.addEventListener('submit', (evt) => {
    evt.preventDefault()
    saveSettings(form, store)
   // TODO Print some kind of message saying save succeeded
  })
})

