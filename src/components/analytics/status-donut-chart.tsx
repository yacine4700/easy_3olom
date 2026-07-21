"use client";

import { Pie, PieChart, Cell } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StatusSlice {
  status: string;
  label: string;
  count: number;
  fill: string;
}

const chartConfig = {
  new: { label: "جديد", color: "var(--chart-2)" },
  answered: { label: "تمت الإجابة", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function StatusDonutChart({ data }: { data: StatusSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          الأسئلة حسب الحالة
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            لا توجد أسئلة بعد
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[240px]"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="label" hideLabel />}
              />
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="label" />}
                className="flex-wrap gap-3"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
