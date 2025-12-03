import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";
import { LearningStyle } from "@/store/useStudyStore";

export interface RecentMaterial {
  id: string;
  title: string;
  category: string;
  progress: number; // 0-100
  lastStudied: string;
  summary?: string;
}

export interface LearningPathStep {
  id: string;
  step: number;
  title: string;
  description: string;
  level: "basic" | "intermediate" | "advanced";
  icon: string;
}

export interface TopicRecommendation {
  topic: string;
  reason: string;
  icon: string;
}

export interface RecommendationResult {
  dominantTopics: string[];
  youtubeQueries: string[];
  learningPath: LearningPathStep[];
  topicRecommendations: TopicRecommendation[];
  recentMaterials: RecentMaterial[];
}

/**
 * Extract keywords from text content
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "need", "dare",
    "ought", "used", "to", "of", "in", "for", "on", "with", "at", "by",
    "from", "as", "into", "through", "during", "before", "after", "above",
    "below", "between", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own",
    "same", "so", "than", "too", "very", "just", "and", "but", "if", "or",
    "because", "until", "while", "this", "that", "these", "those", "it",
    "its", "they", "them", "their", "what", "which", "who", "whom"
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count frequency
  const freq: Record<string, number> = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Generate learning path based on learning style and topics
 */
function generateLearningPath(
  learningStyle: LearningStyle,
  topics: string[]
): LearningPathStep[] {
  const styleSpecificSteps: Record<LearningStyle, LearningPathStep[]> = {
    visual: [
      {
        id: "v1",
        step: 1,
        title: "Watch Introductory Videos",
        description: "Start with visual explanations and diagrams",
        level: "basic",
        icon: "🎬",
      },
      {
        id: "v2",
        step: 2,
        title: "Create Mind Maps",
        description: "Organize concepts visually with connections",
        level: "intermediate",
        icon: "🗺️",
      },
      {
        id: "v3",
        step: 3,
        title: "Design Infographics",
        description: "Summarize knowledge in visual formats",
        level: "advanced",
        icon: "📊",
      },
    ],
    auditory: [
      {
        id: "a1",
        step: 1,
        title: "Listen to Podcasts",
        description: "Start with audio explanations and lectures",
        level: "basic",
        icon: "🎧",
      },
      {
        id: "a2",
        step: 2,
        title: "Join Study Groups",
        description: "Discuss concepts with peers verbally",
        level: "intermediate",
        icon: "👥",
      },
      {
        id: "a3",
        step: 3,
        title: "Record & Teach",
        description: "Create your own audio explanations",
        level: "advanced",
        icon: "🎙️",
      },
    ],
    reading_writing: [
      {
        id: "r1",
        step: 1,
        title: "Read Core Materials",
        description: "Start with textbooks and articles",
        level: "basic",
        icon: "📚",
      },
      {
        id: "r2",
        step: 2,
        title: "Take Detailed Notes",
        description: "Summarize and rewrite in your words",
        level: "intermediate",
        icon: "📝",
      },
      {
        id: "r3",
        step: 3,
        title: "Write Essays & Guides",
        description: "Create comprehensive study guides",
        level: "advanced",
        icon: "✍️",
      },
    ],
    kinesthetic: [
      {
        id: "k1",
        step: 1,
        title: "Try Hands-On Experiments",
        description: "Start with practical exercises",
        level: "basic",
        icon: "🔬",
      },
      {
        id: "k2",
        step: 2,
        title: "Build Projects",
        description: "Apply knowledge through real projects",
        level: "intermediate",
        icon: "🛠️",
      },
      {
        id: "k3",
        step: 3,
        title: "Teach Through Demos",
        description: "Demonstrate concepts to others",
        level: "advanced",
        icon: "🎯",
      },
    ],
  };

  const basePath = styleSpecificSteps[learningStyle] || styleSpecificSteps.visual;

  // Add topic-specific steps if we have topics
  if (topics.length > 0) {
    const topicStep: LearningPathStep = {
      id: "topic1",
      step: basePath.length + 1,
      title: `Deepen ${topics[0].charAt(0).toUpperCase() + topics[0].slice(1)}`,
      description: `Focus on advanced ${topics[0]} concepts`,
      level: "advanced",
      icon: "🚀",
    };
    return [...basePath, topicStep];
  }

  return basePath;
}

/**
 * Generate YouTube search queries based on learning style and topics
 */
function generateYoutubeQueries(
  learningStyle: LearningStyle,
  topics: string[]
): string[] {
  const styleQueries: Record<LearningStyle, string[]> = {
    visual: ["visual learning techniques", "diagram tutorials", "infographic study"],
    auditory: ["study podcasts", "lecture recordings", "audio learning tips"],
    reading_writing: ["note taking methods", "study guide creation", "reading strategies"],
    kinesthetic: ["hands-on learning", "practical experiments", "interactive tutorials"],
  };

  const baseQueries = styleQueries[learningStyle] || styleQueries.visual;

  // Add topic-specific queries
  const topicQueries = topics.slice(0, 3).map(topic => `${topic} tutorial for students`);

  return [...baseQueries.slice(0, 2), ...topicQueries];
}

/**
 * Generate topic recommendations based on history
 */
function generateTopicRecommendations(
  topics: string[],
  learningStyle: LearningStyle
): TopicRecommendation[] {
  const recommendations: TopicRecommendation[] = [];

  if (topics.length > 0) {
    recommendations.push({
      topic: `Advanced ${topics[0]}`,
      reason: "Based on your recent study history",
      icon: "📈",
    });
  }

  // Add style-specific recommendations
  const styleRecs: Record<LearningStyle, TopicRecommendation> = {
    visual: {
      topic: "Data Visualization",
      reason: "Perfect for visual learners",
      icon: "📊",
    },
    auditory: {
      topic: "Public Speaking",
      reason: "Enhance your verbal skills",
      icon: "🎤",
    },
    reading_writing: {
      topic: "Academic Writing",
      reason: "Improve your written expression",
      icon: "✍️",
    },
    kinesthetic: {
      topic: "Laboratory Skills",
      reason: "Hands-on practical experience",
      icon: "🧪",
    },
  };

  if (styleRecs[learningStyle]) {
    recommendations.push(styleRecs[learningStyle]);
  }

  // Add general recommendations
  recommendations.push({
    topic: "Study Techniques",
    reason: "Boost your learning efficiency",
    icon: "🧠",
  });

  return recommendations.slice(0, 3);
}

/**
 * Main function to generate all recommendations for a user
 */
export async function generateRecommendations(
  userId: string,
  learningStyle: LearningStyle = "visual"
): Promise<RecommendationResult> {
  try {
    // Get user profile ID
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id, learning_style")
      .eq("firebase_uid", userId)
      .single();

    const userLearningStyle = (profile?.learning_style as LearningStyle) || learningStyle;
    const profileId = profile?.id;

    // Fetch study materials
    let recentMaterials: RecentMaterial[] = [];
    let allKeywords: string[] = [];

    if (profileId) {
      const { data: materials } = await supabase
        .from("study_materials")
        .select("id, title, summary, learning_style, created_at, updated_at")
        .eq("user_id", profileId)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (materials && materials.length > 0) {
        recentMaterials = materials.map((m, index) => ({
          id: m.id,
          title: m.title || "Untitled Material",
          category: m.learning_style || "General",
          progress: Math.min(100, 40 + index * 10), // Simulated progress
          lastStudied: m.updated_at || m.created_at,
          summary: m.summary,
        }));

        // Extract keywords from all summaries
        const allText = materials
          .map(m => `${m.title || ""} ${m.summary || ""}`)
          .join(" ");
        allKeywords = extractKeywords(allText);
      }
    }

    // Generate recommendations
    const dominantTopics = allKeywords.slice(0, 5);
    const youtubeQueries = generateYoutubeQueries(userLearningStyle, dominantTopics);
    const learningPath = generateLearningPath(userLearningStyle, dominantTopics);
    const topicRecommendations = generateTopicRecommendations(dominantTopics, userLearningStyle);

    return {
      dominantTopics,
      youtubeQueries,
      learningPath,
      topicRecommendations,
      recentMaterials,
    };
  } catch (error) {
    console.error("Error generating recommendations:", error);

    // Return default recommendations
    return {
      dominantTopics: [],
      youtubeQueries: generateYoutubeQueries(learningStyle, []),
      learningPath: generateLearningPath(learningStyle, []),
      topicRecommendations: generateTopicRecommendations([], learningStyle),
      recentMaterials: [],
    };
  }
}

/**
 * Fetch YouTube videos based on search queries
 */
export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration?: string;
  url: string;
}

export async function fetchYoutubeVideos(
  queries: string[],
  maxResults: number = 6
): Promise<YouTubeVideo[]> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn("YouTube API key not configured");
    return [];
  }

  try {
    // Use first query for main search
    const query = queries.slice(0, 2).join(" | ");
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&type=video&maxResults=${maxResults}&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("YouTube API request failed");
    }

    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return [];
  }
}

/**
 * Fetch user's study history
 */
export async function fetchUserStudyHistory(userId: string): Promise<RecentMaterial[]> {
  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("firebase_uid", userId)
      .single();

    if (!profile?.id) return [];

    const { data: materials } = await supabase
      .from("study_materials")
      .select("id, title, summary, learning_style, created_at, updated_at")
      .eq("user_id", profile.id)
      .order("updated_at", { ascending: false })
      .limit(6);

    if (!materials) return [];

    return materials.map((m, index) => ({
      id: m.id,
      title: m.title || "Untitled Material",
      category: m.learning_style || "General",
      progress: Math.min(100, 50 + index * 8),
      lastStudied: m.updated_at || m.created_at,
      summary: m.summary,
    }));
  } catch (error) {
    console.error("Error fetching study history:", error);
    return [];
  }
}

