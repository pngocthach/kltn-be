import { Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { tsr } from "@/App";

export function TimelineChart({ className }: { className?: string }) {
  const { data: lineChartData } = tsr.chart.getLineChartData.useQuery({
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
