import { Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { tsr } from "@/App";

const data = [
  {
    month: "Jan",
    articles: 12,
  },
  {
    month: "Feb",
    articles: 18,
  },
  {
    month: "Mar",
    articles: 15,
  },
  {
    month: "Apr",
    articles: 25,
  },
  {
    month: "May",
    articles: 30,
  },
  {
    month: "Jun",
    articles: 22,
  },
  {
    month: "Jul",
    articles: 28,
  },
  {
    month: "Aug",
    articles: 35,
  },
  {
    month: "Sep",
    articles: 29,
  },
  {
    month: "Oct",
    articles: 33,
  },
  {
    month: "Nov",
    articles: 40,
  },
  {
    month: "Dec",
    articles: 45,
  },
];

export function TimelineChart({ className }: { className?: string }) {
  const { data: lineChartData, isLoading } = tsr.getLineChartData.useQuery({
    queryKey: ["/api/article-line-chart"],
  });

  return (
    <ChartContainer
      config={{
        articles: {
          label: "Articles",
          color: "hsl(var(--primary))",
        },
      }}
      className={className}
    >
      <LineChart
        data={lineChartData?.body.data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={10} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="articles" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  );
}
