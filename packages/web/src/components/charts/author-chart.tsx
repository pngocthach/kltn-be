import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface DataItem {
  name: string;
  articles: number;
  citations: number;
  hIndex: number;
  topField: string;
  affiliation: string;
}

const data: DataItem[] = [
  {
    name: "John Doe",
    articles: 15,
    citations: 850,
    hIndex: 12,
    topField: "Computer Science",
    affiliation: "Stanford University",
  },
  {
    name: "Jane Smith",
    articles: 12,
    citations: 720,
    hIndex: 10,
    topField: "Medicine",
    affiliation: "Harvard University",
  },
  {
    name: "Alice Johnson",
    articles: 10,
    citations: 580,
    hIndex: 8,
    topField: "Physics",
    affiliation: "MIT",
  },
  {
    name: "Bob Wilson",
    articles: 8,
    citations: 420,
    hIndex: 7,
    topField: "Biology",
    affiliation: "UC Berkeley",
  },
  {
    name: "Sarah Brown",
    articles: 7,
    citations: 380,
    hIndex: 6,
    topField: "Chemistry",
    affiliation: "Stanford University",
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
            <p className="text-muted-foreground">h-index</p>
            <p className="font-medium">{data.hIndex}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Top Field</p>
            <p className="font-medium">{data.topField}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Affiliation</p>
            <p className="font-medium">{data.affiliation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AuthorChartProps {
  className?: string;
}

export function AuthorChart({ className }: AuthorChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            bottom: 40,
            left: 20,
          }}
        >
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            angle={-45}
            textAnchor="end"
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={10} />
          <Bar
            dataKey="articles"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
