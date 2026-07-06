"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export interface ReadinessSlice {
  module: string;
  total: number;
}

export interface ReadinessBarChartProps {
  data: ReadinessSlice[];
}

/**
 * Horizontal bar chart comparing content volume across the knowledge modules
 * (Knowledge Base, Glossary, Methodology). Horizontal bars (Recharts
 * `layout="vertical"`) keep long Arabic labels readable on the inline-start
 * (right) edge and let values extend toward the inline-end.
 */
const chartConfig = {
  total: { label: "الإجمالي", color: "var(--color-brand)" },
} satisfies ChartConfig;

export function ReadinessBarChart({ data }: ReadinessBarChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>محتوى قاعدة المعرفة</CardTitle>
        <CardDescription>عدد العناصر في كل وحدة معرفية</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
          >
            <CartesianGrid horizontal={false} vertical={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="module"
              type="category"
              orientation="right"
              width={110}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={<ChartTooltipContent nameKey="total" hideLabel />}
            />
            <Bar
              dataKey="total"
              fill="var(--color-total)"
              radius={4}
              maxBarSize={28}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
