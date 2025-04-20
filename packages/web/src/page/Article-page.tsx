import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Search, MoreHorizontal, CalendarIcon, ArrowLeft } from "lucide-react";
import {
  format,
  addMonths,
  addYears,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subYears,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tsr } from "@/App";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { ArticleFiltersSidebar } from "@/components/article-filters-sidebar";

const formatPublicationDate = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return format(date, "dd/MM/yyyy");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
};

const DateRangePopover = ({ dateRange, setDateRange }) => {
  const [startDateInput, setStartDateInput] = useState(
    dateRange.from ? format(dateRange.from, "dd/MM/yyyy") : ""
  );
  const [endDateInput, setEndDateInput] = useState(
    dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : ""
  );

  const handleManualDateInput = (value: string, isStart: boolean) => {
    const [day, month, year] = value.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    if (!isNaN(date.getTime())) {
      if (isStart) {
        setDateRange({ ...dateRange, from: date });
        setStartDateInput(value);
      } else {
        setDateRange({ ...dateRange, to: date });
        setEndDateInput(value);
      }
    }
  };

  const presetOptions = [
    {
      label: "Today",
      getValue: () => ({
        from: new Date(),
        to: new Date(),
      }),
    },
    {
      label: "This Month",
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: new Date(),
      }),
    },
    {
      label: "Last Month",
      getValue: () => ({
        from: startOfMonth(subMonths(new Date(), 1)),
        to: endOfMonth(subMonths(new Date(), 1)),
      }),
    },
    {
      label: "This Year",
      getValue: () => ({
        from: startOfYear(new Date()),
        to: new Date(),
      }),
    },
    {
      label: "Last Year",
      getValue: () => ({
        from: startOfYear(subYears(new Date(), 1)),
        to: endOfYear(subYears(new Date(), 1)),
      }),
    },
  ];

  return (
    <PopoverContent className="flex w-auto p-0" align="start">
      <div className="border-r border-border">
        <div className="p-2 w-[150px]">
          {presetOptions.map((preset) => (
            <Button
              key={preset.label}
              variant="ghost"
              className="w-full justify-start text-left font-normal mb-1 px-2"
              onClick={() => {
                const range = preset.getValue();
                setDateRange(range);
                setStartDateInput(format(range.from, "dd/MM/yyyy"));
                setEndDateInput(format(range.to, "dd/MM/yyyy"));
              }}
            >
              {preset.label}
            </Button>
          ))}
          <div className="border-t border-border my-2" />
          <Button
            variant="ghost"
            className="w-full justify-start text-left font-normal mb-1 px-2"
            onClick={() => {
              setDateRange({});
              setStartDateInput("");
              setEndDateInput("");
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            {/* Start Date Input */}
            <div className="flex flex-col gap-2">
              <Label>Start Date</Label>
              <Input
                placeholder="DD/MM/YYYY"
                value={startDateInput}
                onChange={(e) => {
                  setStartDateInput(e.target.value);
                  handleManualDateInput(e.target.value, true);
                }}
                className="w-[120px]"
              />
            </div>
            {/* End Date Input */}
            <div className="flex flex-col gap-2">
              <Label>End Date</Label>
              <Input
                placeholder="DD/MM/YYYY"
                value={endDateInput}
                onChange={(e) => {
                  setEndDateInput(e.target.value);
                  handleManualDateInput(e.target.value, false);
                }}
                className="w-[120px]"
              />
            </div>
          </div>
          <div>
            <Calendar
              mode="range"
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => {
                if (range?.from) {
                  setStartDateInput(format(range.from, "dd/MM/yyyy"));
                }
                if (range?.to) {
                  setEndDateInput(format(range.to, "dd/MM/yyyy"));
                }
                setDateRange(range || {});
              }}
              initialFocus
            />
          </div>
        </div>
      </div>
    </PopoverContent>
  );
};

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we should show the back button
  const shouldShowBackButton = Boolean(
    location.state?.from || searchParams.has("affiliations")
  );

  const handleBackClick = () => {
    if (location.state?.from) {
      navigate(location.state.from, { replace: true });
    } else if (searchParams.has("affiliations")) {
      navigate("/affiliations", { replace: true });
    } else {
      navigate(-1);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(
    searchParams.get("authors")?.split(",").filter(Boolean) || []
  );
  const [tempSelectedAuthors, setTempSelectedAuthors] = useState<string[]>(
    searchParams.get("authors")?.split(",").filter(Boolean) || []
  );
  const [selectedAffiliations, setSelectedAffiliations] = useState<string[]>(
    searchParams.get("affiliations")?.split(",").filter(Boolean) || []
  );
  const [tempSelectedAffiliations, setTempSelectedAffiliations] = useState<
    string[]
  >(searchParams.get("affiliations")?.split(",").filter(Boolean) || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Changed default to 20
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [tempDateRange, setTempDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  const datePresets = [
    {
      label: "Last Month",
      getValue: () => ({
        from: startOfMonth(subMonths(new Date(), 1)),
        to: endOfMonth(subMonths(new Date(), 1)),
      }),
    },
    {
      label: "Last Year",
      getValue: () => ({
        from: startOfYear(subYears(new Date(), 1)),
        to: endOfYear(subYears(new Date(), 1)),
      }),
    },
  ];

  // Fetch authors and affiliations for filters
  const { data: authorsData } = tsr.author.getAuthors.useQuery({
    queryKey: ["/api/authors"],
  });

  const { data: affiliationsData } =
    tsr.affiliation.getRawAffiliations.useQuery({
      queryKey: ["/api/raw-affiliations"],
    });

  // Fetch articles with filters including date range
  const { data: articlesResponse, isLoading } =
    tsr.article.getArticles.useQuery({
      queryKey: [
        "/api/articles",
        selectedAuthors,
        selectedAffiliations,
        searchQuery,
        dateRange.from,
        dateRange.to,
      ],
      queryData: {
        query: {
          authors: selectedAuthors,
          affiliations: selectedAffiliations,
          search: searchQuery || undefined,
          startDate: dateRange.from?.toISOString(),
          endDate: dateRange.to?.toISOString(),
        },
      },
    });

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAuthors.length)
      params.set("authors", selectedAuthors.join(","));
    if (selectedAffiliations.length)
      params.set("affiliations", selectedAffiliations.join(","));
    if (searchQuery) params.set("search", searchQuery);
    if (dateRange.from) params.set("from", dateRange.from.toISOString());
    if (dateRange.to) params.set("to", dateRange.to.toISOString());
    setSearchParams(params);
  }, [
    selectedAuthors,
    selectedAffiliations,
    searchQuery,
    dateRange,
    setSearchParams,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAuthors, selectedAffiliations, searchQuery]);

  if (isLoading) return <div>Loading...</div>;
  console.log(">>> query:", selectedAuthors, selectedAffiliations, searchQuery);

  const articles = articlesResponse?.body || [];

  // Calculate pagination
  const totalItems = articles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentArticles = articles.slice(startIndex, endIndex);

  const handleApplyFilters = () => {
    setSearchQuery(tempSearchQuery);
    setSelectedAuthors(tempSelectedAuthors);
    setSelectedAffiliations(tempSelectedAffiliations);
    setDateRange(tempDateRange);
  };

  const handleResetFilters = () => {
    setTempSearchQuery("");
    setTempSelectedAuthors([]);
    setTempSelectedAffiliations([]);
    setTempDateRange({});
    setSearchQuery("");
    setSelectedAuthors([]);
    setSelectedAffiliations([]);
    setDateRange({});
  };

  return (
    <div className="h-full w-full bg-background">
      <div className="mx-auto max-w-screen-xl p-6">
        {shouldShowBackButton && (
          <button
            onClick={handleBackClick}
            className="mb-4 flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
        )}

        {/* Filters Sidebar */}
        <ArticleFiltersSidebar
          tempSearchQuery={tempSearchQuery}
          setTempSearchQuery={setTempSearchQuery}
          tempSelectedAuthors={tempSelectedAuthors}
          setTempSelectedAuthors={setTempSelectedAuthors}
          tempSelectedAffiliations={tempSelectedAffiliations}
          setTempSelectedAffiliations={setTempSelectedAffiliations}
          tempDateRange={tempDateRange}
          setTempDateRange={setTempDateRange}
          handleApplyFilters={handleApplyFilters}
          handleResetFilters={handleResetFilters}
          authorsData={authorsData}
          affiliationsData={affiliationsData}
        />

        {/* Active Filters */}
        {(selectedAuthors.length > 0 ||
          selectedAffiliations.length > 0 ||
          searchQuery ||
          dateRange.from) && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">
              Active filters:
            </span>
            {searchQuery && (
              <Badge variant="secondary" className="px-3 py-1">
                Search: {searchQuery}
              </Badge>
            )}
            {selectedAuthors.map((authorId) => {
              const author = authorsData?.body.find((a) => a._id === authorId);
              return author ? (
                <Badge key={authorId} variant="secondary" className="px-3 py-1">
                  {author.name}
                </Badge>
              ) : null;
            })}
            {selectedAffiliations.map((affiliationId) => {
              const affiliation = affiliationsData?.body.find(
                (a) => a._id === affiliationId
              );
              return affiliation ? (
                <Badge
                  key={affiliationId}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  {affiliation.name}
                </Badge>
              ) : null;
            })}
            {dateRange.from && (
              <Badge variant="secondary" className="px-3 py-1">
                {format(dateRange.from, "LLL dd, y")}
                {dateRange.to && ` - ${format(dateRange.to, "LLL dd, y")}`}
              </Badge>
            )}
          </div>
        )}

        {/* Results Section */}
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">Results</h2>
              <Badge variant="outline">{articles.length} articles</Badge>
            </div>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 items per page</SelectItem>
                <SelectItem value="20">20 items per page</SelectItem>
                <SelectItem value="50">50 items per page</SelectItem>
                <SelectItem value="100">100 items per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-5/12">Title</TableHead>
                  <TableHead className="w-3/12">Authors</TableHead>
                  <TableHead className="w-2/12">Publication Date</TableHead>
                  <TableHead className="w-2/12">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentArticles.map((article) => (
                  <TableRow key={article._id}>
                    <TableCell>
                      <Link
                        to={`/articles/${article._id}`}
                        className="group flex items-center gap-2"
                      >
                        <span className="line-clamp-2 group-hover:text-primary">
                          {article.title}
                        </span>
                        <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div
                        className="line-clamp-1"
                        title={article.metadata.Authors}
                      >
                        {article.metadata.Authors}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatPublicationDate(
                        article.metadata["Publication date"]
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {article.metadata.Journal
                          ? "Journal"
                          : article.metadata.Conference
                          ? "Conference"
                          : article.metadata.Book
                          ? "Book"
                          : "Other"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {endIndex} of {totalItems} results
            </div>
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (page === 1 || page === totalPages) return true;
                    return Math.abs(currentPage - page) <= 1;
                  })
                  .map((page, index, array) => {
                    if (index > 0 && array[index - 1] !== page - 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <PaginationEllipsis />
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={page === currentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      );
                    }
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
