"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface LevelChartData {
  level: string;
  count: number;
  fill: string;
}

interface LevelBarChartProps {
  data: LevelChartData[];
}

const chartConfig = {
  count: { label: "أسئلة", color: "var(--chart-2)" },
} satisfies ChartConfig;

const LEVEL_LABELS: Record<string, string> = {
  "1AS": "1AS",
  "2AS": "2AS",
  "3AS": "3AS",
  AS: "AS",
  unassigned: "غير محدد",
};

/**
 * Horizontal bar chart: how many student questions map to each education
 * level. Helps the admin see where students ask the most.
 */
export function LevelBarChart({ data }: LevelBarChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: LEVEL_LABELS[d.level] ?? d.level,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          الأسئلة حسب السنة
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 || data.every((d) => d.count === 0) ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            لا توجد أسئلة بعد
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[240px] w-full"
          >
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                className="text-xs"
              />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={72}
                className="text-xs"
              />
              <ChartTooltip
                content={<ChartTooltipContent nameKey="count" />}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.level} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
