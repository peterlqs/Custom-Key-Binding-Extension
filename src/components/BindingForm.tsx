import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { BadgeAlert, CircleHelp, Pencil, TextSelect } from "lucide-react"
import { useEffect, useState } from "react"
import { set, useForm } from "react-hook-form"
import { z } from "zod"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

const formSchema = z
  .object({
    binding: z.string().min(1, {
      message: "Binding must not be empty"
    }),
    destination: z.string().min(1, {
      message: "Destination must not be empty"
    }),
    global: z.boolean(),
    url: z.boolean(),
    newTab: z.boolean(),
    id: z.string()
  })
  // Destination must be a valid URL
  .refine((data) => !data.url || data.destination.includes("."), {
    message: "Destination must be a valid URL",
    path: ["destination"]
  })

export function BindingForm({ currentUrl }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      binding: "",
      destination: "",
      global: false,
      url: false,
      newTab: false,
      id: ""
    }
  })

  // all local bindings
  const [allLocalBindings, setLocalallLocalBindings] = useStorage(
    currentUrl,
    ""
  )
  // all global bindings
  const [allGlobalBindings, setAllGlobalBindings] = useStorage("global", "")

  // show warning
  const [showWarning, setShowWarning] = useState("")

  // toast
  const { toast } = useToast()

  // Form Handler
  function onSubmit(data: z.infer<typeof formSchema>) {
    // Clear the current keys and destination
    form.resetField("binding")
    form.resetField("destination")
    // Clear the warning
    setShowWarning("")

    // if destination is an url like google.com, change data.url to true
    if (data.destination.includes(".")) {
      data.url = true
    }
    // Add to local storage
    const newBinding = {
      binding: data.binding,
      destination: data.destination,
      global: data.global,
      url: data.url,
      newTab: data.newTab,
      id: crypto.randomUUID()
    }
    // Set the new binding
    // if global, add to global storage
    if (data.global) {
      if (allGlobalBindings === "") {
        setAllGlobalBindings(JSON.stringify([newBinding]))
      } else {
        const newAllGlobalBindings = JSON.parse(allGlobalBindings)
        newAllGlobalBindings.push(newBinding)
        setAllGlobalBindings(JSON.stringify(newAllGlobalBindings))
      }
    } else {
      if (allLocalBindings === "") {
        setLocalallLocalBindings(JSON.stringify([newBinding]))
      } else {
        const newallLocalBindings = JSON.parse(allLocalBindings)
        newallLocalBindings.push(newBinding)
        setLocalallLocalBindings(JSON.stringify(newallLocalBindings))
      }
    }
    // Show toast successful
    toast({
      variant: "success",
      description: "Added successfully! RELOAD PAGE for the new binding to work"
    })
  }
  // Get the keys
  const handleAddKeys = () => {
    // Clear the input
    form.resetField("binding")
    // Focus on the input if not focused
    form.setFocus("binding")

    const pressedKeys = new Set()
    const handleKeyDown = (e) => {
      pressedKeys.add(e.key)
    }

    const handleKeyUp = () => {
      // Prevent unfocus when tab into focus
      if (pressedKeys.size === 0) {
        return
      } else {
        form.setValue("binding", Array.from(pressedKeys).join("+"))
        document.removeEventListener("keydown", handleKeyDown)
        document.removeEventListener("keyup", handleKeyUp)
        // Blur (unfocus) binding
        ;(document.activeElement as HTMLElement).blur()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)
  }
  // Get the element
  const handleGetElement = async () => {
    // Clear the input
    form.resetField("destination")
    // Blur (unfocus) binding
    ;(document.activeElement as HTMLElement).blur()

    const response = await sendToContentScript({
      name: "runSelector"
    })

    const keydownListener = async (e) => {
      if (e.key === "q") {
        // Get the element
        const response = await sendToContentScript({
          name: form.getValues("destination") ? "getLink" : "getElement"
        })
        // If response is not a valid selector
        const isSelectorValid = ((dummyElement) => (selector) => {
          try {
            dummyElement.querySelector(selector)
          } catch {
            return false
          }
          return true
        })(document.createDocumentFragment())
        if (!isSelectorValid(response)) {
          toast({
            variant: "destructive",
            description: "Element can't be selected. Try again"
          })
          form.clearErrors("destination")
          return
        }
        // If response is valid
        toast({
          variant: "success",
          description: "Element selected"
        })

        form.setValue("destination", response)

        const terminate = await sendToContentScript({
          name: "terminate"
        })
        document.removeEventListener("keydown", keydownListener)
        // Show warning if conditions are met (ex: not a button or anchor tag or url)
        if (
          response &&
          !response.match(/(>a|>button|:a|:button|\.|a#|button#)/)
        ) {
          setShowWarning(
            "The destination should be a button or an anchor tag or an URL."
          )
        } else {
          setShowWarning("")
        }
      }
    }
    document.addEventListener("keydown", keydownListener)
  }

  // A function to reload page
  const reloadPage = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs[0]
      var url = tab.url
      chrome.tabs.update(tab.id, { url: url })
    })
  }

  return (
    <TooltipProvider>
      <div className="">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto space-y-2 p-4 border-border border-2 rounded-lg">
            <p className="mb-2">
              Site: {form.getValues("global") ? "All sites" : currentUrl}
            </p>
            <FormField
              name="binding"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-row gap-2 items-center">
                        <FormLabel>Activate the shortcut</FormLabel>
                        <CircleHelp className="h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Type in the key bindings to activate the shortcut</p>
                    </TooltipContent>
                  </Tooltip>

                  <div className="flex flex-row gap-2 justify-center">
                    <Button
                      type="button"
                      onClick={handleAddKeys}
                      variant="ghost"
                      size="icon">
                      <Pencil className="h-6 w-6" />
                    </Button>
                    <FormControl>
                      <Input
                        // onInputCapture={handleAddKeys}
                        onFocus={handleAddKeys}
                        type="text"
                        {...field}
                        autoComplete="false"
                        placeholder="Type your keys here"
                      />
                    </FormControl>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="destination"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-row gap-2 items-center">
                        <FormLabel>Destination</FormLabel>
                        <CircleHelp className="h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-center">
                        Click on the right button, hover over element,
                        <br />
                        and press Q. Or, tick the URL box and type in
                        <br />
                        your URL
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex flex-row gap-2 justify-center">
                    <Button
                      type="button"
                      onClick={handleGetElement}
                      variant="ghost"
                      size="icon">
                      <TextSelect className="h-6 w-6" />
                    </Button>
                    <FormControl>
                      <Input
                        autoComplete="false"
                        type="text"
                        disabled={!form.getValues("url")}
                        placeholder="Press button, then Q to select"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  {/* <FormDescription>Select the element.</FormDescription> */}
                  {showWarning != "" && (
                    <div className="flex flex-row gap-2">
                      <BadgeAlert className="text-yellow-700" />
                      <p className="text-sm text-yellow-600">{showWarning}</p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-2 py-2">
              <FormField
                name="url"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          form.resetField("destination")
                        }}
                      />
                    </FormControl>
                    <FormLabel>Destination is URL</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                name="global"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Global</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                name="newTab"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Open link in new tab</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-between gap-4">
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={reloadPage}
                  className="flex-1">
                  Close & Reload
                </Button>
              </CollapsibleTrigger>

              <Button type="submit" className="flex-1">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </TooltipProvider>
  )
}
