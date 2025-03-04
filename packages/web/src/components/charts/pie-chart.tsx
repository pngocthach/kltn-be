import { tsr } from "@/App";
import { useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { PieProps } from "recharts";

interface DataItem {
  type: string;
  count: number;
}

const data: DataItem[] = [
  {
    type: "Conference",
    count: 46,
  },
  {
    type: "Journal",
    count: 38,
  },
  {
    type: "Book",
    count: 9,
  },
];

// Use shadcn/ui chart colors
const colors = [
  "red",
  "green",
  "orange",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: DataItem & { fill: string };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  if (!data) return null;

  return (
    <div className="rounded-lg border bg-background p-4 shadow-sm">
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: data.fill }}
          />
          <p className="font-medium">{data.type}</p>
        </div>
        <div className="text-sm">
          <p className="text-muted-foreground">Count</p>
          <p className="font-medium">{data.count}</p>
        </div>
      </div>
    </div>
  );
};

interface ArticlePieChartProps {
  className?: string;
}

export function ArticlePieChart({ className }: ArticlePieChartProps) {
  const [selectedType, setSelectedType] = useState<
    (DataItem & { fill: string }) | null
  >(null);

  const { data: pieChart, isLoading } = tsr.getPieChartData.useQuery({
    queryKey: ["/pie-chart"],
  });

  const chartData: DataItem[] = pieChart?.body.data ?? [];

  const handlePieClick: PieProps["onClick"] = (_, index) => {
    if (typeof index === "number") {
      setSelectedType({
        ...chartData[index],
        fill: colors[index % colors.length],
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="type"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            onClick={handlePieClick}
            className="cursor-pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={entry.type}
                fill={colors[index % colors.length]}
                stroke={
                  selectedType?.type === entry.type
                    ? "hsl(var(--primary))"
                    : "transparent"
                }
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => {
              const index = chartData.findIndex((d) => d.type === value);
              const color = colors[index % colors.length];
              return (
                <span
                  className={`cursor-pointer rounded-lg px-2 py-1 text-sm transition-colors hover:bg-muted ${
                    selectedType?.type === value ? "bg-muted" : ""
                  }`}
                  onClick={() =>
                    setSelectedType({
                      type: value,
                      count: chartData[index].count,
                      fill: color,
                    })
                  }
                >
                  <span className="inline-flex items-center">
                    {`${value} (${chartData[index].count})`}
                  </span>
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
