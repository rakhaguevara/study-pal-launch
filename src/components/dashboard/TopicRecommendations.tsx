import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TopicRecommendation } from "@/utils/recommendationEngine";

interface TopicCardProps {
  recommendation: TopicRecommendation;
  index: number;
}

const TopicCard = ({ recommendation, index }: TopicCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-md transition-all border-border bg-card group cursor-pointer">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="text-lg sm:text-xl lg:text-2xl flex-shrink-0">{recommendation.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h4 className="font-semibold text-foreground text-xs sm:text-sm truncate">
                  {recommendation.topic}
                </h4>
                <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500 flex-shrink-0" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                {recommendation.reason}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface TopicRecommendationsSectionProps {
  recommendations: TopicRecommendation[];
  isLoading?: boolean;
}

export const TopicRecommendationsSection = ({
  recommendations,
  isLoading,
}: TopicRecommendationsSectionProps) => {
  if (isLoading) {
    return (
      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
          💡 Recommended Topics Based on Your History
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-2.5 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded flex-shrink-0" />
                  <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
          💡 Recommended Topics Based on Your History
        </h2>
        <Card className="border-dashed">
          <CardContent className="p-4 sm:p-6 text-center">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-muted-foreground mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base text-muted-foreground">
              Complete more study sessions to get personalized topic recommendations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-8">
      <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
        💡 Recommended Topics Based on Your History
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {recommendations.map((rec, index) => (
          <TopicCard
            key={`${rec.topic}-${index}`}
            recommendation={rec}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default TopicRecommendationsSection;

