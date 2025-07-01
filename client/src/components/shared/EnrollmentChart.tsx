import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  Bar, 
  BarChart,
  CartesianGrid, 
  ResponsiveContainer, 
  XAxis, 
  YAxis 
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getEnrollmentStats } from "@/services/mentorService";

const PERIODS = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
];

const EnrollmentChart = () => {
  const [periodDays, setPeriodDays] = useState(30);
  
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['enrollmentStats', periodDays],
    queryFn: () => getEnrollmentStats(periodDays),
  });

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Tendência de Inscrições</CardTitle>
          <CardDescription>
            Novas inscrições ao longo do tempo
          </CardDescription>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((period) => (
            <Button 
              key={period.days} 
              variant={periodDays === period.days ? "default" : "outline"} 
              size="sm"
              onClick={() => setPeriodDays(period.days)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : chartData && chartData.length > 0 ? (
          <ChartContainer 
            config={{ enrollments: { label: 'Inscrições', color: "#8B5CF6" } }}
            className="aspect-[4/3] h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-enrollments)"
                  radius={[4, 4, 0, 0]}
                  name="Inscrições"
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent 
                          className="border-none bg-background shadow-xl" 
                          label={payload[0].payload.date}
                        />
                      );
                    }
                    return null;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Sem dados de inscrição para este período.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnrollmentChart;
