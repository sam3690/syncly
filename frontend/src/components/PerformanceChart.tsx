import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { month: "Jan", completed: 45, pending: 12 },
  { month: "Feb", completed: 52, pending: 18 },
  { month: "Mar", completed: 61, pending: 15 },
  { month: "Apr", completed: 58, pending: 10 },
  { month: "May", completed: 70, pending: 14 },
  { month: "Jun", completed: 65, pending: 8 },
  { month: "Jul", completed: 75, pending: 11 },
  { month: "Aug", completed: 82, pending: 9 },
  { month: "Sep", completed: 78, pending: 13 },
];

export function PerformanceChart() {
  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Workflow Performance</h3>
        <p className="text-sm text-muted-foreground mt-1">Monthly completion trends</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
          <Bar 
            dataKey="completed" 
            fill="hsl(var(--primary))" 
            radius={[8, 8, 0, 0]}
            name="Completed"
          />
          <Bar 
            dataKey="pending" 
            fill="hsl(var(--warning))" 
            radius={[8, 8, 0, 0]}
            name="Pending"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}