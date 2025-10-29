import { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfYear } from "date-fns";

interface HeatmapValue {
  date: string;
  count: number; // minutes studied
}

interface ProductivityHeatmapProps {
  userId: string;
}

const ProductivityHeatmap = ({ userId }: ProductivityHeatmapProps) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalActiveDays, setTotalActiveDays] = useState(0);
  const [totalFocusHours, setTotalFocusHours] = useState(0);

  useEffect(() => {
    fetchFocusData();
  }, [userId]);

  const fetchFocusData = async () => {
    try {
      setIsLoading(true);
      
      // Get data for last 12 months
      const startDate = format(startOfYear(new Date()), "yyyy-MM-dd");
      const endDate = format(new Date(), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("focus_sessions")
        .select("session_date, duration_minutes")
        .eq("user_id", userId)
        .gte("session_date", startDate)
        .lte("session_date", endDate);

      if (error) throw error;

      // Aggregate by date
      const aggregated = data.reduce((acc: Record<string, number>, session) => {
        const date = session.session_date;
        acc[date] = (acc[date] || 0) + session.duration_minutes;
        return acc;
      }, {});

      // Convert to heatmap format
      const heatmapValues: HeatmapValue[] = Object.entries(aggregated).map(
        ([date, minutes]) => ({
          date,
          count: minutes as number,
        })
      );

      setHeatmapData(heatmapValues);
      
      // Calculate statistics
      const activeDays = heatmapValues.filter(v => v.count > 0).length;
      const totalMinutes = heatmapValues.reduce((sum, v) => sum + v.count, 0);
      const totalHours = Math.floor(totalMinutes / 60);
      
      setTotalActiveDays(activeDays);
      setTotalFocusHours(totalHours);
    } catch (error) {
      console.error("Error fetching focus data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getColorClass = (value: HeatmapValue | undefined) => {
    if (!value || value.count === 0) return "color-empty";
    
    const hours = value.count / 60;
    if (hours >= 6) return "color-scale-4"; // Dark blue
    if (hours >= 3) return "color-scale-3"; // Medium blue
    if (hours >= 1) return "color-scale-2"; // Light blue
    return "color-scale-1"; // Very light blue
  };

  const getTooltipData = (value: HeatmapValue | undefined, date: string) => {
    if (!value || value.count === 0) return null;
    
    const hours = Math.floor(value.count / 60);
    const minutes = value.count % 60;
    
    return {
      date: format(new Date(date), "MMMM d, yyyy"),
      time: hours > 0 
        ? `${hours}h ${minutes}min` 
        : `${minutes}min`
    };
  };

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
            📅 Study Activity Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <Card className="shadow-md rounded-2xl bg-white border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-[#1E3A8A]">
            📊 Study Activity Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Heatmap Grid */}
          <div className="heatmap-container overflow-x-auto">
            <style>{`
              .react-calendar-heatmap {
                width: 100%;
              }
              .react-calendar-heatmap .color-empty {
                fill: #EBEDF0;
                rx: 4;
              }
              .react-calendar-heatmap .color-scale-1 {
                fill: #C6F6D5;
                rx: 4;
              }
              .react-calendar-heatmap .color-scale-2 {
                fill: #9AE6B4;
                rx: 4;
              }
              .react-calendar-heatmap .color-scale-3 {
                fill: #68D391;
                rx: 4;
              }
              .react-calendar-heatmap .color-scale-4 {
                fill: #38A169;
                rx: 4;
              }
              .react-calendar-heatmap text {
                fill: #6B7280;
                font-size: 10px;
                font-weight: 500;
              }
              .react-calendar-heatmap rect {
                transition: all 0.2s ease;
              }
              .react-calendar-heatmap rect:hover {
                stroke: #FF6B00;
                stroke-width: 2px;
                cursor: pointer;
                transform: scale(1.08);
              }
              .react-calendar-heatmap .month-label {
                fill: #111827;
              }
              .react-calendar-heatmap .wday-label {
                fill: #6B7280;
              }
            `}</style>
            
            <CalendarHeatmap
              startDate={startOfYear(new Date())}
              endDate={new Date()}
              values={heatmapData}
              classForValue={getColorClass}
              showWeekdayLabels
              tooltipDataAttrs={(value) => {
                if (!value || !value.date) return {};
                const tooltipInfo = getTooltipData(value, value.date);
                return tooltipInfo ? {
                  'data-tip': `${tooltipInfo.date}: ${tooltipInfo.time} of focus time`
                } : {};
              }}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Activity Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-sm text-muted-foreground">Active Study Days</p>
                  <p className="text-xl font-bold text-foreground">{totalActiveDays}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="text-sm text-muted-foreground">Total Focus Time</p>
                  <p className="text-xl font-bold text-foreground">{totalFocusHours}h</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-[#6B7280]">Less</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#EBEDF0" }} />
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#C6F6D5" }} />
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#9AE6B4" }} />
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#68D391" }} />
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#38A169" }} />
              </div>
              <span className="text-[#111827] font-semibold">More</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductivityHeatmap;
