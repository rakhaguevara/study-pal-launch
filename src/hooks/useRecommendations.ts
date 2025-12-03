import { useEffect, useState } from "react";
import { useStudyStore, LearningStyle } from "@/store/useStudyStore";
import {
  generateRecommendations,
  fetchYoutubeVideos,
  RecommendationResult,
  YouTubeVideo,
} from "@/utils/recommendationEngine";

interface UseRecommendationsResult {
  recommendations: RecommendationResult | null;
  videos: YouTubeVideo[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useRecommendations = (): UseRecommendationsResult => {
  const userId = useStudyStore((state) => state.userId);
  const learningStyle = useStudyStore((state) => state.learningStyle);

  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch recommendations
      const recs = await generateRecommendations(userId, learningStyle as LearningStyle);
      setRecommendations(recs);

      // Fetch YouTube videos based on queries
      if (recs.youtubeQueries.length > 0) {
        const youtubeVideos = await fetchYoutubeVideos(recs.youtubeQueries, 6);
        setVideos(youtubeVideos);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch recommendations"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, learningStyle]);

  return {
    recommendations,
    videos,
    isLoading,
    error,
    refetch: fetchData,
  };
};

export default useRecommendations;

