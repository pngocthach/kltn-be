import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Search, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { DateRangePopover } from "@/components/articles/date-range-popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function ArticleFiltersSidebar({
  tempSearchQuery,
  setTempSearchQuery,
  tempSelectedAuthors,
  setTempSelectedAuthors,
  tempSelectedAffiliations,
  setTempSelectedAffiliations,
  tempDateRange,
  setTempDateRange,
  handleApplyFilters,
  handleResetFilters,
  authorsData,
  affiliationsData,
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 top-4 z-50" // Added z-50 to ensure button stays above other elements
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] p-6 z-50">
        {" "}
        {/* Added z-50 to ensure sheet content stays above other elements */}
        <SheetHeader className="mb-6">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your search results
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="w-full pl-9"
              value={tempSearchQuery}
              onChange={(e) => setTempSearchQuery(e.target.value)}
            />
          </div>

          {/* Authors filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium mr-2">Authors</label>
            <MultiSelect
              className="w-full"
              placeholder="Filter by authors"
              options={
                authorsData?.body.map((author) => ({
                  label: author.name,
                  value: author._id,
                })) || []
              }
              value={tempSelectedAuthors}
              onChange={setTempSelectedAuthors}
            />
          </div>

          {/* Affiliations filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium mr-2">Affiliations</label>
            <MultiSelect
              className="w-full"
              placeholder="Filter by affiliations"
              options={
                affiliationsData?.body.map((affiliation) => ({
                  label: affiliation.name,
                  value: affiliation._id,
                })) || []
              }
              value={tempSelectedAffiliations}
              onChange={setTempSelectedAffiliations}
            />
          </div>

          {/* Date range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !tempDateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tempDateRange.from ? (
                    tempDateRange.to ? (
                      <>
                        {format(tempDateRange.from, "LLL dd, y")} -{" "}
                        {format(tempDateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(tempDateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <DateRangePopover
                dateRange={tempDateRange}
                setDateRange={setTempDateRange}
              />
            </Popover>
          </div>

          <div className="flex gap-2 pt-6">
            <Button className="flex-1" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
