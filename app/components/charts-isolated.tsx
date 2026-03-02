
"use client";

import {
  ComposedChart as RechartsComposedChart,
  Bar as RechartsBar,
  Line as RechartsLine,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer as RechartsResponsiveContainer,
  BarChart as RechartsBarChart
} from "recharts";

// This component isolates the Recharts context issues
export function MonthlyTrendsChart({ data }: { data: any[] }) {
  return (
    <RechartsResponsiveContainer width="100%" height={350}>
      <RechartsComposedChart data={data}>
        <RechartsCartesianGrid strokeDasharray="3 3" vertical={false} />
        <RechartsXAxis dataKey="month" />
        <RechartsYAxis yAxisId="left" />
        <RechartsYAxis yAxisId="right" orientation="right" />
        <RechartsTooltip />
        <RechartsLegend />
        <RechartsBar yAxisId="left" dataKey="complaints" fill="var(--color-chart-2)" name="New Complaints" />
        <RechartsBar yAxisId="left" dataKey="resolved" fill="var(--color-chart-1)" name="Resolved" />
        <RechartsLine yAxisId="right" type="monotone" dataKey="satisfaction" stroke="var(--color-chart-3)" name="Satisfaction" />
      </RechartsComposedChart>
    </RechartsResponsiveContainer>
  );
}

export function FailureRateChart({ data }: { data: any[] }) {
  return (
    <RechartsResponsiveContainer width="100%" height={250}>
      <RechartsBarChart data={data}>
        <RechartsCartesianGrid strokeDasharray="3 3" vertical={false} />
        <RechartsXAxis 
          dataKey="model" 
          fontSize={12} 
          tick={{ angle: -40, textAnchor: 'end' }} 
          height={60} 
        />
        <RechartsYAxis unit="%" />
        <RechartsTooltip formatter={(value: any) => `${Number(value).toFixed(2)}%`} />
        <RechartsBar 
          dataKey="failureRate" 
          name="Failure Rate" 
          fill="var(--color-destructive)" 
          radius={[4, 4, 0, 0]} 
        />
      </RechartsBarChart>
    </RechartsResponsiveContainer>
  );
}

// Green IT Chart
export function GreenITChart({ data }: { data: any[] }) {
  return (
    <RechartsResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} layout="vertical">
          <RechartsCartesianGrid strokeDasharray="3 3" horizontal={false} />
          <RechartsXAxis type="number" unit="W" />
          <RechartsYAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }}/>
          <RechartsTooltip formatter={(value: any, name: any) => [`${value} W`, name]} />
          <RechartsBar dataKey="power" name="Total Consumption" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} />
      </RechartsBarChart>
  </RechartsResponsiveContainer>
  )
}

    