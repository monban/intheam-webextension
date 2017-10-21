const loadSettings = async storageArea => {
  const defaultSettings = {
    default_tags: 'FromTheWeb'
  }

  const storedSettings = await storageArea.get()
  const settings = Object.assign({}, defaultSettings, storedSettings)
  for (let key in settings) {
    let element = document.getElementById(key)
    if (element) {
      element.value = settings[key]
    }
  }
}

const saveSettings = async (formElement, storageArea) => {
  let formdata = {}
  for (let element of formElement.elements) {
    formdata[element.name] = element.value
  }
  await storageArea.set(formdata)
}

const fadeOut = element => {
  element.style.opacity -= 0.1
  if (element.style.opacity > 0) {
    setTimeout(() => fadeOut(element), 25)
  }
}

const flashMessage = (element, message) => {
  element.innerHTML = message
  element.style.opacity = 1
  setTimeout(() => fadeOut(element), 500)
}

document.addEventListener('DOMContentLoaded', () => {
  // Load current settings from local store
  const form = document.getElementById('optionsForm')
  const store = browser.storage.sync
  const messageArea = document.getElementById('message_area')
  loadSettings(store)

  // Override the form submit to store the settings
  form.addEventListener('submit', (evt) => {
    evt.preventDefault()
    saveSettings(form, store)
    flashMessage(messageArea, 'Saved')
  })
})
