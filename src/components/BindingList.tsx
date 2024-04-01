import { X } from "lucide-react"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

const BindingList = ({ currentUrl }) => {
  // all local bindings
  const [allLocalBindings, setLocalallLocalBindings] = useStorage(
    currentUrl,
    ""
  )
  // all global bindings
  const [allGlobalBindings, setAllGlobalBindings] = useStorage("global", "")
  // all bindings
  let allBindings = JSON.stringify(
    (allLocalBindings ? JSON.parse(allLocalBindings) : []).concat(
      allGlobalBindings ? JSON.parse(allGlobalBindings) : []
    )
  )
  // capitalize like ctrl + m -> Ctrl + M
  const toTitleCase = (str) => {
    return str
      .split("+")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("+")
  }

  // A function to delete the current binding by using the id, not destination, or binding
  const deleteBinding = (binding) => {
    const { id, global } = binding
    // Use the appropriate storage and set function based on the global property
    const storage = global ? allGlobalBindings : allLocalBindings
    const setStorage = global ? setAllGlobalBindings : setLocalallLocalBindings
    // Filter out the binding with the matching ID
    const newBindings = JSON.parse(storage).filter((b) => b.id !== id)
    setStorage(JSON.stringify(newBindings))
  }

  // Format the bindings
  const formatedLocalBindings = allLocalBindings
    ? JSON.parse(allLocalBindings)
    : []
  const formatedGlobalBindings = allGlobalBindings
    ? JSON.parse(allGlobalBindings)
    : []

  // TODO: Fix duplicate code below
  return (
    <div className="mt-4">
      {JSON.parse(allBindings).length > 0 ? (
        <div>
          <Tabs defaultValue="current" className="flex flex-col justify-center">
            <TabsList className="mx-auto">
              <TabsTrigger value="current">Current Site</TabsTrigger>
              <TabsTrigger value="global">Global</TabsTrigger>
            </TabsList>
            <TabsContent value="current">
              <ul className="flex flex-col w-full gap-2 mt-2">
                {formatedLocalBindings.map((binding) => (
                  <div
                    className="flex flex-col  rounded-lg outline outline-border p-2 mb-1"
                    key={binding.id}>
                    <li className="flex flex-row gap-4 w-full justify-between">
                      <p className="text-sm font-medium">
                        {toTitleCase(binding.binding)}
                      </p>
                      <p className="text-xs text-end overflow-x-auto overflow-y-hidden whitespace-nowrap">
                        {binding.destination}
                      </p>
                    </li>
                    <div className="flex flex-row justify-between items-center">
                      <div className="flex flex-row gap-2">
                        <p>{binding.newTab ? "new tab" : "same tab"}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-700"
                        onClick={() => deleteBinding(binding)}>
                        <X size={20} />
                      </Button>
                    </div>
                  </div>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="global">
              <ul className="flex flex-col w-full gap-2 mt-2">
                {formatedGlobalBindings.map((binding) => (
                  <div
                    className="flex flex-col  rounded-lg outline outline-border p-2 mb-1"
                    key={binding.id}>
                    <li className="flex flex-row gap-4 w-full justify-between">
                      <p className="text-sm font-medium">
                        {toTitleCase(binding.binding)}
                      </p>
                      <p className="text-xs text-end overflow-x-auto overflow-y-hidden whitespace-nowrap">
                        {binding.destination}
                      </p>
                    </li>
                    <div className="flex flex-row justify-between items-center">
                      <div className="flex flex-row gap-2">
                        <p>{binding.newTab ? "new tab" : "same tab"}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-700"
                        onClick={() => deleteBinding(binding)}>
                        <X size={20} />
                      </Button>
                    </div>
                  </div>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // It isn't showing???
        <p className="text-center">No bindings yet 😢</p>
      )}
    </div>
  )
}

export default BindingList
