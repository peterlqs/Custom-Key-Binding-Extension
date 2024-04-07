import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import "./style.css"

import { useState } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { ThemeProvider } from "./components/theme-provider"
import { Checkbox } from "./components/ui/checkbox"
import { Separator } from "./components/ui/separator"
import { Switch } from "./components/ui/switch"
import { Toaster } from "./components/ui/toaster"
import { useToast } from "./components/ui/use-toast"

function OptionsIndex() {
  const { toast } = useToast()
  const [isChecked, setIsChecked] = useState(false)
  const [switchChecked, setSwitchChecked] = useStorage("focusOnInput", false)
  const toggleCheck = () => setIsChecked(!isChecked)
  const toggleSwitch = () => setSwitchChecked(!switchChecked)

  const storage = new Storage()

  // Function to handle deletion
  const handleDelete = () => {
    console.log(isChecked)
    if (isChecked) {
      // Perform deletion logic here
      // sessionStorage.clear()
      // localStorage.clear()
      // chrome.storage.sync.clear()
      storage.clear()
      // toast
      toast({
        variant: "success",
        description: "Data deleted successfully."
      })
    } else {
      console.log("Failed to delete data.")
    }
  }

  // Function to handle export data
  const handleExport = async () => {
    // Perform export logic here
    // const exportData = storage.getAll().then((data) => console.log(data))
    const exportData = await storage.getAll()
    const blob = new Blob([JSON.stringify(exportData)], {
      type: "application/json"
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Function to handle import data
  const handleImport = async () => {
    // Perform import logic here
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.click()
    input.onchange = async () => {
      const file = input.files[0]
      const reader = new FileReader()
      reader.onload = async () => {
        chrome.storage.sync.clear() // Clear existing sync storage data
        const data = JSON.parse(reader.result as string) // Cast reader.result to string
        for (const [key, value] of Object.entries(data)) {
          chrome.storage.sync.set({ [key]: value })
        }
        // toast
        toast({
          variant: "success",
          description: "Data imported successfully."
        })
      }
      reader.readAsText(file)
    }
  }
  return (
    <main>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange>
        <div className="py-6 px-4">
          <Tabs defaultValue="home" className="">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="setting">Setting</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            <TabsContent value="home">
              <Card className="">
                <CardHeader>
                  <CardTitle>A Quick Tutorial</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 mt-2">
                  <div className="text-sm space-y-2">
                    {/* <p className="text-xl font-bold text-center">
                      A quick tutorial
                    </p> */}
                    <p className="text-lg font-bold">1. Register key:</p>
                    <p>
                      To register your key binding, tap the{" "}
                      <span className="font-bold">Pencil button</span> and start
                      typing the keys.
                    </p>
                    <p className="text-lg font-bold">
                      2. Register destination:
                    </p>
                    <p>
                      The default destination will be an element on the website,
                      like a button or a toggle. Click on the
                      <span className="font-bold">
                        TextSelect button, hover your mouse
                      </span>{" "}
                      over any element on the website and{" "}
                      <span className="font-bold">press “Q” to capture</span>{" "}
                      that element.
                    </p>
                    <p>
                      If you tick the “Destination is URL” box below then type
                      the URL directly in the input.
                    </p>
                    <p className="text-lg font-bold">3. Other options:</p>
                    <p>
                      {" "}
                      <span className="font-bold">Destination is URL:</span> If
                      it is ticked, the page will open an URL, otherwise, it
                      will perform a “click” on the element.
                    </p>
                    <p>
                      <span className="font-bold">Global:</span> The key binding
                      only works on the current website by default. Ticking this
                      box will make it work on all sites.
                    </p>
                    <p>
                      <span className="font-bold">Open link in new tab:</span>{" "}
                      If the destination is a URL, it will be opened in the
                      current tab unless ticked.
                    </p>
                    <p>
                      <span className="font-bold">
                        [Name] of the target element:
                      </span>{" "}
                      The extension will find the element with the name you type
                      in "Destination" and click on it. Example: element with
                      the Login text.
                    </p>
                    <p className="text-lg font-bold">Note:</p>
                    <p>
                      - The key binding only works when the website is in focus.
                      <br />- You cannot override browser's reserved key
                      bindings.
                    </p>
                    <div className="flex flex-row gap-2 mt-2 justify-center">
                      <a href="https://github.com/peterlqs/Custom-Key-Binding-Extension/issues">
                        <Button variant="secondary">Report a bug 🪲</Button>
                      </a>
                      {/* <a href="">
                        <Button>Leave us a rating ⭐</Button>
                      </a> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="setting">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm">
                      Focus on the input bar by “Alt + /”
                    </p>
                    <Switch
                      checked={switchChecked}
                      onCheckedChange={toggleSwitch}>
                      <Label>Enable</Label>
                    </Switch>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-sm">Import & Export Data</p>
                      <p className="text-xs mt-2">
                        The export format is in JSON.
                      </p>
                    </div>
                    <div className="flex flex-row gap-2 justify-end">
                      <Button variant="secondary" onClick={handleExport}>
                        Export Data
                      </Button>
                      <Button onClick={handleImport}>Import Data</Button>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex flex-col gap-2">
                    <p className="text-sm">Delete Data</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" onCheckedChange={toggleCheck} />
                      <label
                        htmlFor="terms"
                        className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I confirm deletion of data that can't be undo.
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        disabled={!isChecked}
                        onClick={handleDelete}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 mt-2">
                  <div className="text-sm space-y-2">
                    <p>
                      Custom Key Binding is made by{" "}
                      <a
                        className="underline"
                        href="https://www.linkedin.com/in/quann">
                        Quan Nguyen.
                      </a>
                    </p>
                    <p>
                      This extension was made due to my frustration about having
                      to switch between my units back and forth on my university
                      website. Welp, not anymore.
                    </p>
                    <p>
                      The code to grab an element's selector is based on{" "}
                      <a
                        className="underline"
                        href="https://github.com/adam-kov/grab-selector">
                        https://github.com/adam-kov/grab-selector
                      </a>
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <Toaster />
      </ThemeProvider>
    </main>
  )
}

export default OptionsIndex
