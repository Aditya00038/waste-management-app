
"use client"

import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import { getWasteData } from "@/lib/data"
import { Skeleton } from "../ui/skeleton";

const chartConfig = {
  Wet: {
    label: "Wet Waste",
    color: "hsl(var(--chart-1))",
  },
  Dry: {
    label: "Dry Waste",
    color: "hsl(var(--chart-2))",
  },
  Hazardous: {
    label: "Hazardous Waste",
    color: "hsl(var(--destructive))",
  }
} satisfies ChartConfig

export function WasteChart() {
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
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Bar dataKey="Wet" fill="var(--color-Wet)" radius={4} />
        <Bar dataKey="Dry" fill="var(--color-Dry)" radius={4} />
        <Bar dataKey="Hazardous" fill="var(--color-Hazardous)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
