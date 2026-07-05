"use client";

import * as React from "react";
import { Cell, Pie, PieChart } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export interface StatusSlice {
  status: string;
  label: string;
  count: number;
  fill: string;
}

export interface StatusDonutChartProps {
  data: StatusSlice[];
}

/**
 * Donut chart showing the breakdown of student questions by answer status.
 *
 * Client Component — Recharts needs a measured container (ResponsiveContainer).
 * The `chartConfig` is keyed by status so the legend + tooltip can resolve
 * Arabic labels and the slice colors are wired through CSS variables declared
 * via ChartStyle.
 */
const chartConfig = {
  new: { label: "جديد", color: "#0ea5e9" },
  answered: { label: "تمت الإجابة", color: "#10b981" },
} satisfies ChartConfig;

export function StatusDonutChart({ data }: StatusDonutChartProps) {
  const total = React.useMemo(
    () => data.reduce((sum, d) => sum + d.count, 0),
    [data],
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>الأسئلة حسب الحالة</CardTitle>
        <CardDescription>توزيع الأسئلة الواردة من الطلاب</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="text-muted-foreground flex h-[240px] items-center justify-center text-sm">
            لا توجد أسئلة بعد
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto mx-auto h-[240px] w-full"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="status" hideLabel />}
              />
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                strokeWidth={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="status" />}
                verticalAlign="bottom"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
