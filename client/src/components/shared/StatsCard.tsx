
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
  valueColor?: string;
  tooltipText?: string;
}

const StatsCard = ({ title, value, icon, description, trend, className, valueColor, tooltipText }: StatsCardProps) => {
  return (
    <Card className={`bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gold text-center">
          {title}
          {tooltipText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gold cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 text-white z-[9999]">
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className={`text-2xl font-bold ${valueColor || 'text-white'}`}>{value}</div>
        {description && <p className="text-xs text-gray-300 mt-2">{description}</p>}
        {trend && (
          <div className={`flex items-center justify-center text-xs mt-2 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}% {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
