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
    formdata[element.name] = element.value
  }
  await storageArea.set(formdata)
}

function fadeOut(element) {
  element.style.opacity -= 0.1
  if (element.style.opacity > 0) {
    setTimeout(() => fadeOut(element), 25);
  }
}

function flashMessage(element, message) {
  element.innerHTML = message
  element.style.opacity = 1
  setTimeout(() => fadeOut(element), 500)
}

document.addEventListener("DOMContentLoaded", () => {
  // Load current settings from local store
  const form = document.querySelector('#optionsForm')
  const store = browser.storage.local
  const messageArea = document.querySelector('#message_area')
  console.log(messageArea);
  loadSettings(form, store)

  // Override the form submit to store the settings
  form.addEventListener('submit', (evt) => {
    evt.preventDefault()
    saveSettings(form, store)
    flashMessage(messageArea, 'Saved')
  })
})

