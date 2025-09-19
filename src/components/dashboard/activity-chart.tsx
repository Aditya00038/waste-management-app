
"use client"

import { useEffect, useState } from "react";
import { Line, LineChart, CartesianGrid, XAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import { getWasteData } from "@/lib/data"
import { Skeleton } from "../ui/skeleton";

const chartConfig = {
  wet: {
    label: "Wet",
    color: "hsl(var(--chart-1))",
  },
  dry: {
    label: "Dry",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ActivityChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        const wasteData = await getWasteData();
        // @ts-ignore
        setData(wasteData);
        setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <Skeleton className="h-[250px] w-full" />
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Line
          dataKey="Wet"
          type="natural"
          stroke="var(--color-wet)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="Dry"
          type="natural"
          stroke="var(--color-dry)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
