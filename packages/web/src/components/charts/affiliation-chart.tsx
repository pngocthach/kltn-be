import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface DataItem {
  name: string;
  articles: number;
  citations: number;
  impact: number;
  topField: string;
  color: string;
}

const data: DataItem[] = [
  {
    name: "Stanford University",
    articles: 45,
    citations: 2150,
    impact: 4.8,
    topField: "Computer Science",
    color: "hsl(0, 70%, 50%)",
  },
  {
    name: "MIT",
    articles: 35,
    citations: 1850,
    impact: 5.2,
    topField: "Physics",
    color: "hsl(60, 70%, 50%)",
  },
  {
    name: "Harvard University",
    articles: 30,
    citations: 1650,
    impact: 4.9,
    topField: "Medicine",
    color: "hsl(120, 70%, 50%)",
  },
  {
    name: "UC Berkeley",
    articles: 25,
    citations: 1250,
    impact: 4.6,
    topField: "Chemistry",
    color: "hsl(180, 70%, 50%)",
  },
  {
    name: "Others",
    articles: 20,
    citations: 980,
    impact: 4.2,
    topField: "Biology",
    color: "hsl(240, 70%, 50%)",
  },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: DataItem;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  if (!data) return null;

  return (
    <div className="rounded-lg border bg-background p-4 shadow-sm">
      <div className="grid gap-2">
        <p className="font-medium">{data.name}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Articles</p>
            <p className="font-medium">{data.articles}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Citations</p>
            <p className="font-medium">{data.citations}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Impact Factor</p>
            <p className="font-medium">{data.impact}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Top Field</p>
            <p className="font-medium">{data.topField}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AffiliationChartProps {
  className?: string;
}

export function AffiliationChart({ className }: AffiliationChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 0,
            right: 0,
            bottom: 0,
            left: 100,
          }}
        >
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <Bar
            dataKey="articles"
            fill="hsl(var(--primary))"
            radius={[4, 4, 4, 4]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
