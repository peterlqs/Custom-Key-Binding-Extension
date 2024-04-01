import { useEffect, useState } from "react"

import "./style.css"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import { Plus, RefreshCw } from "lucide-react"

import { Button } from "~components/ui/button"

import { BindingForm } from "./components/BindingForm"
import BindingList from "./components/BindingList"
import { ThemeProvider } from "./components/theme-provider"
import { ModeToggle } from "./components/ui/modetoggle"
import { Toaster } from "./components/ui/toaster"

// import { elementSelector } from "~contents/selector"

function IndexPopup() {
  // Get current tab url
  const [currentUrl, setCurrentUrl] = useState("")
  // collapsible for add new binding
  const [isOpen, setIsOpen] = useState(false)

  // Hook: get current tab's url
  useEffect(
    () =>
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true
        },
        function (tabs) {
          const tab = tabs[0]
          if (tab.url) {
            const rootUrl = tab.url.split("/")[2]
            setCurrentUrl(rootUrl)
          }
        }
      ),
    [chrome]
  )

  return (
    <main>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange>
        <div className="py-6 px-4 min-w-[320px]">
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="space-y-2">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">All Bindings</h1>
              <div className="flex flex-row gap-2">
                <ModeToggle />
                <CollapsibleTrigger asChild>
                  <Button size="sm">
                    Add
                    <Plus className="ml-2 h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent className="items-center">
              <BindingForm currentUrl={currentUrl} />
            </CollapsibleContent>
          </Collapsible>
          <BindingList currentUrl={currentUrl} />
        </div>
        <Toaster />
      </ThemeProvider>
    </main>
  )
}

export default IndexPopup
