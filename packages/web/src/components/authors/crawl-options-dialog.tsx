"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { AuthorResponse as Author } from "@kltn/contract/api/author";
import { useState } from "react";

interface CrawlOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author: Author;
  onCrawlNow: () => void;
  onScheduleCrawl: (schedule: number) => void;
}

export function CrawlOptionsDialog({
  open,
  onOpenChange,
  author,
  onCrawlNow,
  onScheduleCrawl,
}: CrawlOptionsDialogProps) {
  const scheduleOptions = {
    daily: 1,
    weekly: 7,
    monthly: 30,
  };

  const [selectedSchedule, setSelectedSchedule] = useState<string>(
    author.schedule?.toString() || scheduleOptions.weekly.toString()
  );

  const handleSaveSchedule = () => {
    onScheduleCrawl(Number(selectedSchedule));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crawl Options</DialogTitle>
          <DialogDescription>
            Update publication data for {author.name} from Google Scholar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <Button className="w-full" onClick={onCrawlNow}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Crawl Now
          </Button>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Schedule Regular Crawls</h4>
            <RadioGroup
              value={selectedSchedule}
              onValueChange={setSelectedSchedule}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={scheduleOptions.daily.toString()}
                  id="daily"
                />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={scheduleOptions.weekly.toString()}
                  id="weekly"
                />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={scheduleOptions.monthly.toString()}
                  id="monthly"
                />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleSaveSchedule}>
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
