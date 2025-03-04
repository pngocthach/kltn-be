import { Card } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  value: string | number;
  description?: string;
  className?: string;
}

export function ChartCard({
  title,
  value,
  description,
  className,
}: ChartCardProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </Card>
  );
}
