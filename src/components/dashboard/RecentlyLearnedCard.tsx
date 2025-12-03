import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RecentMaterial } from "@/utils/recommendationEngine";

interface RecentlyLearnedCardProps {
  material: RecentMaterial;
  index: number;
}

export const RecentlyLearnedCard = ({ material, index }: RecentlyLearnedCardProps) => {
  const categoryColors: Record<string, string> = {
    visual: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    auditory: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
    reading_writing: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
    kinesthetic: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
    General: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300",
  };

  const formattedDate = material.lastStudied
    ? formatDistanceToNow(new Date(material.lastStudied), { addSuffix: true })
    : "Recently";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-md transition-shadow border-border bg-card">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="flex-shrink-0 p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate text-xs sm:text-sm">
                {material.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={`text-[10px] sm:text-xs ${categoryColors[material.category] || categoryColors.General}`}
                >
                  {material.category.replace("_", "/")}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{material.progress}%</span>
            </div>
            <Progress value={material.progress} className="h-1 sm:h-1.5" />
          </div>

          <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>{formattedDate}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface RecentlyLearnedSectionProps {
  materials: RecentMaterial[];
  isLoading?: boolean;
}

export const RecentlyLearnedSection = ({
  materials,
  isLoading,
}: RecentlyLearnedSectionProps) => {
  if (isLoading) {
    return (
      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">📖 Recently Learned</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-muted rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 h-1.5 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">📖 Recently Learned</h2>
        <Card className="border-dashed">
          <CardContent className="p-4 sm:p-6 text-center">
            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-muted-foreground mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base text-muted-foreground">
              No study materials yet. Upload your first material to get started!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-8">
      <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">📖 Recently Learned</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {materials.slice(0, 4).map((material, index) => (
          <RecentlyLearnedCard key={material.id} material={material} index={index} />
        ))}
      </div>
    </div>
  );
};

export default RecentlyLearnedSection;

