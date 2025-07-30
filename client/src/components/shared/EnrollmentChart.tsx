import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { getEnrollmentStats } from "@/services/mentorService";
import { useQuery } from "@tanstack/react-query";
import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis
} from "recharts";

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
    <Card className="col-span-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white">Tendência de Inscrições</CardTitle>
          <CardDescription className="text-gray-300">
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
              className={periodDays === period.days ? "bg-gold text-slate-900 hover:bg-gold/90" : "border-gold/30 text-white hover:bg-gold/20"}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-gray-300">Carregando dados...</p>
          </div>
        ) : chartData && chartData.length > 0 ? (
          <ChartContainer 
            config={{ enrollments: { label: 'Inscrições', color: "#d4af37" } }}
            className="aspect-[4/3] h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d4af37" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#d4af37" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#e5e7eb' }}
                />
                <YAxis 
                  stroke="#d4af37" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  tick={{ fill: '#e5e7eb' }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#goldGradient)"
                  radius={[4, 4, 0, 0]}
                  name="Inscrições"
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" />
                    <stop offset="100%" stopColor="#b8860b" />
                  </linearGradient>
                </defs>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-lg p-3 shadow-lg">
                          <p className="text-white font-medium">{`Data: ${payload[0].payload.date}`}</p>
                          <p className="text-gold">
                            {`Inscrições: ${payload[0].value}`}
                          </p>
                        </div>
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
            <p className="text-gray-300">Sem dados de inscrição para este período.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnrollmentChart;
