import { motion } from "framer-motion";
import { ExternalLink, Play, Youtube } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { YouTubeVideo } from "@/utils/recommendationEngine";

interface VideoCardProps {
  video: YouTubeVideo;
  index: number;
}

const VideoCard = ({ video, index }: VideoCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex-shrink-0 w-[240px] sm:w-[280px] lg:w-[300px]"
    >
      <Card className="h-full hover:shadow-md transition-all border-border bg-card group overflow-hidden">
        <div className="relative">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-32 sm:h-36 lg:h-40 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-red-600 flex items-center justify-center">
              <Play className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white fill-white ml-0.5" />
            </div>
          </div>
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
            <div className="bg-red-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1">
              <Youtube className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              YouTube
            </div>
          </div>
        </div>
        <CardContent className="p-2.5 sm:p-3">
          <h4 className="font-medium text-foreground text-xs sm:text-sm line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
            {video.title}
          </h4>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
            {video.channelTitle}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 sm:mt-3 text-[10px] sm:text-xs h-7 sm:h-8"
            onClick={() => window.open(video.url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" />
            Watch Video
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface YoutubeRecommendationsProps {
  videos: YouTubeVideo[];
  isLoading?: boolean;
}

export const YoutubeRecommendations = ({
  videos,
  isLoading,
}: YoutubeRecommendationsProps) => {
  if (isLoading) {
    return (
      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
          🎬 Recommended Videos for You
        </h2>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[240px] sm:w-[280px] lg:w-[300px] animate-pulse">
              <Card>
                <div className="h-32 sm:h-40 bg-muted" />
                <CardContent className="p-2.5 sm:p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-8 bg-muted rounded w-full mt-3" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
          🎬 Recommended Videos for You
        </h2>
        <Card className="border-dashed">
          <CardContent className="p-4 sm:p-6 text-center">
            <Youtube className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-muted-foreground mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base text-muted-foreground">
              Video recommendations will appear as you study more materials.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-8">
      <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
        🎬 Recommended Videos for You
      </h2>
      <div
        className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-8 sm:px-8"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {videos.map((video, index) => (
          <VideoCard key={video.id} video={video} index={index} />
        ))}
      </div>
    </div>
  );
};

export default YoutubeRecommendations;

