
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
  // Truncate title for mobile
  const truncatedTitle = title.length > 15 ? `${title.substring(0, 15)}...` : title;
  
  return (
    <Card className={`bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-1 md:pb-2 px-3 md:px-6 pt-3 md:pt-6">
        <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 text-gold text-center" title={title}>
          <span className="block md:hidden">{truncatedTitle}</span>
          <span className="hidden md:block">{title}</span>
          {tooltipText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 md:h-4 md:w-4 text-gold cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 text-white z-[9999]">
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center px-3 md:px-6 pb-3 md:pb-6">
        <div className={`text-lg md:text-2xl font-bold ${valueColor || 'text-white'}`}>{value}</div>
        {description && <p className="text-xs text-gray-300 mt-1 md:mt-2 hidden md:block">{description}</p>}
        {trend && (
          <div className={`flex items-center justify-center text-xs mt-1 md:mt-2 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}% {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
