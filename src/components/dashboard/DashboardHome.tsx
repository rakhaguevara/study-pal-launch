import { motion } from "framer-motion";
import DashboardCards from "@/components/DashboardCards";
import RecommendedTips from "@/components/RecommendedTips";
import { RecentlyLearnedSection } from "./RecentlyLearnedCard";
import { YoutubeRecommendations } from "./YoutubeRecommendations";
import { LearningPathSection } from "./LearningPathCard";
import { TopicRecommendationsSection } from "./TopicRecommendations";
import { useRecommendations } from "@/hooks/useRecommendations";

interface DashboardHomeProps {
  userName: string;
}

export const DashboardHome = ({ userName }: DashboardHomeProps) => {
  const { recommendations, videos, isLoading } = useRecommendations();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's a summary of your study performance.
          </p>
        </div>

        {/* Summary Cards */}
        <DashboardCards />

        {/* Recommended Tips (original component) */}
        <RecommendedTips />

        {/* Recently Learned Section */}
        <RecentlyLearnedSection
          materials={recommendations?.recentMaterials || []}
          isLoading={isLoading}
        />

        {/* YouTube Recommendations */}
        <YoutubeRecommendations videos={videos} isLoading={isLoading} />

        {/* Learning Path */}
        <LearningPathSection
          steps={recommendations?.learningPath || []}
          isLoading={isLoading}
        />

        {/* Topic Recommendations */}
        <TopicRecommendationsSection
          recommendations={recommendations?.topicRecommendations || []}
          isLoading={isLoading}
        />
      </motion.div>
    </div>
  );
};

export default DashboardHome;

