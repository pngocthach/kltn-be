"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { RefreshCw } from "lucide-react"

interface Author {
  _id: string
  name: string
  url: string
  createdAt: string
  updatedAt: string
  articles: string[]
  affiliation: string[]
}

interface CrawlOptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  author: Author
  onCrawlNow: () => void
  onScheduleCrawl: (schedule: string) => void
}

export function CrawlOptionsDialog({
  open,
  onOpenChange,
  author,
  onCrawlNow,
  onScheduleCrawl,
}: CrawlOptionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crawl Options</DialogTitle>
          <DialogDescription>Update publication data for {author.name} from Google Scholar.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <Button className="w-full" onClick={onCrawlNow}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Crawl Now
          </Button>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Schedule Regular Crawls</h4>
            <RadioGroup defaultValue="weekly">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onScheduleCrawl("weekly")}>
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

