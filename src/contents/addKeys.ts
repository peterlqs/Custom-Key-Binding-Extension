import { Storage } from "@plasmohq/storage"

export {}

async function main() {
  const currentUrl = window.location.href.split("/")[2]
  // local bindings
  const storage = new Storage()
  const allLocalBindings = await storage.get(currentUrl)
  // global bindings
  const allGlobalBindings = await storage.get("global")
  // focusOnInput
  const focusOnInput = await storage.get("focusOnInput")

  // combine to all bindings
  const allBindings = JSON.stringify(
    (allLocalBindings ? JSON.parse(allLocalBindings) : []).concat(
      allGlobalBindings ? JSON.parse(allGlobalBindings) : []
    )
  )

  // focus on input when press Alt + /
  if (focusOnInput) {
    document.addEventListener("keydown", (event) => {
      if (event.altKey && event.key === "/") {
        const input = document.querySelector(
          "input, textarea"
        ) as HTMLInputElement
        if (input) {
          input.focus()
        }
      }
    })
  }

  const pressedKeys = new Set()
  // Function to handle keydown events
  function handleKeyDown(event) {
    // Add pressed key to the set
    pressedKeys.add(event.key.toLowerCase())
  }

  // Function to handle keyup events
  function handleKeyUp() {
    // Check each binding
    JSON.parse(allBindings).forEach((binding) => {
      // Split the binding string to get individual keys
      const keys = binding.binding.split("+").map((key) => key.toLowerCase())

      //DEBUG
      // console.log(keys)
      // console.log(Array.from(pressedKeys))

      // Check if all keys in the binding are pressed and in order
      let allKeysPressed = true
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] !== Array.from(pressedKeys)[i]) {
          allKeysPressed = false
          break
        }
      }
      // If all keys are pressed, open the destination URL
      if (allKeysPressed && pressedKeys.size === keys.length) {
        // URL
        // Check if the destination is a relative URL
        if (binding.url === true) {
          // If the newTab attribute is true, open the URL in a new tab
          let newTab = "_blank"
          if (!binding.newTab) {
            newTab = "_self"
          }

          if (!binding.destination.includes("://")) {
            window.open("https://" + binding.destination, newTab)
          } else {
            // Otherwise, treat it as an absolute URL
            window.open(binding.destination, newTab)
          }
        }

        // HTML Element
        // Check if the destination is an HTML element
        if (binding.url !== true) {
          const element = document.querySelector(binding.destination)
          if (element) {
            ;(element as HTMLAnchorElement).click()
          }
        }

        // Target is a button with name
        if (binding.elementWithText === true) {
          const elements = document.querySelectorAll("button, a")
          // reverse the loop because the first element is at the end (a bit counterintuitive)
          for (let i = elements.length - 1; i >= 0; i--) {
            // for (let i = 0; i < elements.length; i++) {
            if (
              elements[i].textContent
                .toLowerCase()
                .includes(binding.destination.toLowerCase())
            ) {
              ;(elements[i] as HTMLButtonElement).click()
              break
            }
          }
        }
      }
    })
    // Clear the set of pressed keys
    pressedKeys.clear()
  }

  // Add event listeners for keydown and keyup events
  document.addEventListener("keydown", handleKeyDown)
  document.addEventListener("keyup", handleKeyUp)
}

main()
