import { Suspense, lazy, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load recharts only when needed
const LazyBarChart = lazy(() => import("recharts").then(mod => ({ default: mod.BarChart })));
const LazyLineChart = lazy(() => import("recharts").then(mod => ({ default: mod.LineChart })));
const LazyPieChart = lazy(() => import("recharts").then(mod => ({ default: mod.PieChart })));
const LazyBar = lazy(() => import("recharts").then(mod => ({ default: mod.Bar })));
const LazyLine = lazy(() => import("recharts").then(mod => ({ default: mod.Line })));
const LazyPie = lazy(() => import("recharts").then(mod => ({ default: mod.Pie })));
const LazyCell = lazy(() => import("recharts").then(mod => ({ default: mod.Cell })));
const LazyXAxis = lazy(() => import("recharts").then(mod => ({ default: mod.XAxis })));
const LazyYAxis = lazy(() => import("recharts").then(mod => ({ default: mod.YAxis })));
const LazyCartesianGrid = lazy(() => import("recharts").then(mod => ({ default: mod.CartesianGrid })));
const LazyTooltip = lazy(() => import("recharts").then(mod => ({ default: mod.Tooltip })));
const LazyLegend = lazy(() => import("recharts").then(mod => ({ default: mod.Legend })));
const LazyResponsiveContainer = lazy(() => import("recharts").then(mod => ({ default: mod.ResponsiveContainer })));

interface ChartSoviettProps {
  data: any[];
  type: "bar" | "line" | "pie";
  dataKey: string;
  width?: number;
  height?: number;
}

const ChartSkeleton = () => (
  <div className="space-y-2 p-4">
    <Skeleton className="h-64 w-full" />
  </div>
);

export const DynamicBarChart = ({ data, dataKey, height = 300 }: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazyResponsiveContainer width="100%" height={height}>
      <LazyBarChart data={data}>
        <LazyCartesianGrid strokeDasharray="3 3" />
        <LazyXAxis dataKey="name" />
        <LazyYAxis />
        <LazyTooltip />
        <LazyLegend />
        <LazyBar dataKey={dataKey} fill="#8884d8" />
      </LazyBarChart>
    </LazyResponsiveContainer>
  </Suspense>
);

export const DynamicLineChart = ({ data, dataKey, height = 300 }: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazyResponsiveContainer width="100%" height={height}>
      <LazyLineChart data={data}>
        <LazyCartesianGrid strokeDasharray="3 3" />
        <LazyXAxis dataKey="name" />
        <LazyYAxis />
        <LazyTooltip />
        <LazyLegend />
        <LazyLine type="monotone" dataKey={dataKey} stroke="#8884d8" />
      </LazyLineChart>
    </LazyResponsiveContainer>
  </Suspense>
);

export const DynamicPieChart = ({ data, dataKey, height = 300 }: any) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <LazyResponsiveContainer width="100%" height={height}>
        <LazyPieChart>
          <LazyPie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {data.map((entry: any, index: number) => (
              <LazyCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </LazyPie>
          <LazyTooltip />
        </LazyPieChart>
      </LazyResponsiveContainer>
    </Suspense>
  );
};
