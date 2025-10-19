import { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay } from "date-fns";

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

  useEffect(() => {
    fetchFocusData();
  }, [userId]);

  const fetchFocusData = async () => {
    try {
      setIsLoading(true);
      
      // Get data for last 90 days
      const startDate = format(subDays(new Date(), 90), "yyyy-MM-dd");
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
      
      // Count active days (> 0 minutes)
      setTotalActiveDays(heatmapValues.filter(v => v.count > 0).length);
    } catch (error) {
      console.error("Error fetching focus data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getColorClass = (value: HeatmapValue | undefined) => {
    if (!value || value.count === 0) return "color-empty";
    
    const hours = value.count / 60;
    if (hours >= 8) return "color-scale-4"; // Dark green
    if (hours >= 6) return "color-scale-3"; // Medium green
    if (hours >= 4) return "color-scale-2"; // Light green
    return "color-scale-1"; // Very light green
  };

  const formatTooltip = (value: HeatmapValue | undefined) => {
    if (!value || value.count === 0) return "No activity";
    
    const hours = Math.floor(value.count / 60);
    const minutes = value.count % 60;
    return `${hours}h ${minutes}m focus time`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Activity Tracker</CardTitle>
          <CardDescription>Loading your productivity data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            📊 Study Activity Tracker
          </CardTitle>
          <CardDescription>
            Your daily learning activity over the past 90 days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="heatmap-container">
            <style>{`
              .react-calendar-heatmap {
                width: 100%;
              }
              .react-calendar-heatmap .color-empty {
                fill: hsl(var(--muted));
              }
              .react-calendar-heatmap .color-scale-1 {
                fill: hsl(142, 76%, 85%);
              }
              .react-calendar-heatmap .color-scale-2 {
                fill: hsl(142, 76%, 65%);
              }
              .react-calendar-heatmap .color-scale-3 {
                fill: hsl(142, 76%, 45%);
              }
              .react-calendar-heatmap .color-scale-4 {
                fill: hsl(142, 76%, 30%);
              }
              .react-calendar-heatmap text {
                fill: hsl(var(--muted-foreground));
                font-size: 10px;
              }
              .react-calendar-heatmap rect:hover {
                stroke: hsl(var(--primary));
                stroke-width: 2px;
                cursor: pointer;
              }
            `}</style>
            
            <CalendarHeatmap
              startDate={subDays(new Date(), 90)}
              endDate={new Date()}
              values={heatmapData}
              classForValue={getColorClass}
              showWeekdayLabels
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted"></div>
                <span className="text-xs text-muted-foreground">No activity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(142, 76%, 85%)" }}></div>
                <span className="text-xs text-muted-foreground">&lt; 4h</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(142, 76%, 65%)" }}></div>
                <span className="text-xs text-muted-foreground">4-6h</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(142, 76%, 45%)" }}></div>
                <span className="text-xs text-muted-foreground">6-8h</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(142, 76%, 30%)" }}></div>
                <span className="text-xs text-muted-foreground">≥ 8h</span>
              </div>
            </div>
            <div className="text-sm font-medium text-foreground">
              <span className="text-primary font-bold">{totalActiveDays}</span> active days this period
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductivityHeatmap;
