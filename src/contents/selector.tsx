import { useMessage } from "@plasmohq/messaging/hook"

export {}

/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-undef */
const HIGHLIGHTER_ID = "selector-grab-highlighter"
let lastHighlightTarget

function addHighlight() {
  const div = document.createElement("div")
  div.id = HIGHLIGHTER_ID
  const { style } = div
  style.backgroundColor = "#1d234280"
  style.boxSizing = "border-box"
  style.border = "solid 2px #663e9e"
  style.position = "fixed"
  style.zIndex = "9999"
  style.pointerEvents = "none"
  document.body.appendChild(div)
}

function updateHighlight({ target }) {
  // console.log(target)
  if (!(target instanceof HTMLElement) || target === lastHighlightTarget) {
    return
  }
  lastHighlightTarget = target
  const { top, left, width, height } = target.getBoundingClientRect()
  const highlighter = document.getElementById(HIGHLIGHTER_ID)
  if (!highlighter) return
  const { style } = highlighter
  style.top = top - 4 + "px"
  style.left = left - 4 + "px"
  style.width = width + 8 + "px"
  style.height = height + 8 + "px"
}

function removeHighlight() {
  const highlighter = document.getElementById(HIGHLIGHTER_ID)
  if (highlighter) {
    document.body.removeChild(highlighter)
  }
}

function generateSelector(element) {
  if (!element) return ""

  let selector = getSelector(element)
  while (!isUnique(selector) && element) {
    element = element.parentElement
    const newSelector = getSelector(element)
    if (newSelector) selector = newSelector + ">" + selector
  }
  return selector
}

function getSelector(element) {
  if (!element) return ""

  const { tagName, id } = element
  const tag = tagName.toLowerCase()
  if (tag === "body" || tag === "html") return tag

  let selector = tag
  if (!isUnique(selector)) selector += id ? "#" + id : ""

  return appendPseudoSelector(element, selector)
}

function appendPseudoSelector(element, selector) {
  return isUnique(selector)
    ? selector
    : `${selector}:nth-child(${getChildIndex(element)})`
}

function getChildIndex({ previousElementSibling: sibling }) {
  return sibling ? getChildIndex(sibling) + 1 : 1
}

function getQueryLength(selector) {
  // selector alone gives error for ex: div#28, the parseSelector fix it
  const parseSelector = (selector) => {
    if (selector && window.CSS && window.CSS.escape) {
      selector = selector.replaceAll(
        /#([^\s"#']+)/g,
        (match, id) => "#" + CSS.escape(id)
      )
    }

    return selector
  }
  return document.querySelectorAll(parseSelector(selector)).length
  // return document.querySelectorAll(selector).length
}

function isUnique(selector) {
  return getQueryLength(selector) <= 1
}

function throttle(func, limit = 100) {
  let inThrottle
  let lastResult

  return function () {
    const args = arguments
    const context = this

    if (!inThrottle) {
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
      lastResult = func.apply(context, args)
    }

    return lastResult
  }
}

function terminate() {
  // Remove event listeners
  window.removeEventListener("mousemove", throttle(updateHighlight))
  window.removeEventListener("click", terminate)
  removeHighlight()
}

function elementSelector() {
  addHighlight()
  document.addEventListener("mousemove", throttle(updateHighlight))
  // Mouse click = terminate listener
  window.addEventListener("click", terminate, { capture: true, once: true })
  return generateSelector(lastHighlightTarget)
}

// Register the message handler outside of the test function
const main = () => {
  useMessage<string, string>(async (req, res) => {
    // Initialize the element selector
    if (req.name === "runSelector") {
      elementSelector()
      res.send("Success")
    }
    // Get the element
    if (req.name === "getElement") {
      const element = await elementSelector()
      res.send(element)
      terminate()
    }
    if (req.name === "getLink") {
      const element = await elementSelector()
      res.send(lastHighlightTarget.href)
      terminate()
    }
    // Call again to dismiss the element selector (?)
    if (req.name === "terminate") {
      res.send("Terminated")
      terminate()
    }
  })
}

export default main
