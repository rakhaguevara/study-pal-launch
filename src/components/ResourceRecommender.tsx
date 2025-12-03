import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Youtube, BookOpen, FileText, ArrowRight, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useStudyStore } from '@/store/useStudyStore';
import { auth } from '@/lib/firebase';

interface YouTubeResource {
  id: string;
  title: string;
  url: string;
  description: string;
  thumbnail: string;
  channelName: string;
  duration?: string;
}

interface ArticleResource {
  id: string;
  title: string;
  url: string;
  authors?: string[];
  source: string;
  description: string;
  publishDate?: string;
}

interface ResourceRecommenderProps {
  summary: string;
  materialName: string;
  onReferencesReady?: (youtubeLinks: string[], articleLinks: string[]) => void;
}

interface LearningProgress {
  userId: string;
  topic: string;
  completedResources: string[];
  lastAccessed: Date;
}

const YOUTUBE_API_KEY = 'AIzaSyAAIHHpb2WGmy6V7vwIaqxF0AeaUzA919Q';

const ResourceRecommender = ({ summary, materialName, onReferencesReady }: ResourceRecommenderProps) => {
  const learningStyle = useStudyStore(state => state.learningStyle);
  const user = auth.currentUser;
  
  const [youtubeResources, setYoutubeResources] = useState<YouTubeResource[]>([]);
  const [articleResources, setArticleResources] = useState<ArticleResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [completedResources, setCompletedResources] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'youtube' | 'articles'>('youtube');
  
  // Track if we've already notified parent to prevent loops
  const hasNotifiedRef = useRef(false);
  const previousRefsRef = useRef<{ youtube: string[]; articles: string[] }>({ youtube: [], articles: [] });

  // Extract topic keywords from summary
  const extractTopicKeywords = useCallback((text: string): string[] => {
    const keywords: string[] = [];
    const commonTopics = ['docker', 'react', 'javascript', 'python', 'kubernetes', 'git', 'node', 'api', 'database', 'cloud'];
    
    commonTopics.forEach(topic => {
      if (text.toLowerCase().includes(topic)) {
        keywords.push(topic);
      }
    });
    
    return keywords.slice(0, 3);
  }, []);

  // Generate mock YouTube resources (fallback)
  const generateMockYouTubeResources = useCallback((): YouTubeResource[] => [
    {
      id: '1',
      title: 'Complete Introduction to the Topic',
      url: 'https://youtube.com/watch?v=example1',
      description: 'Comprehensive video tutorial covering all basics',
      thumbnail: 'https://via.placeholder.com/320x180?text=Video+Thumbnail',
      channelName: 'Tech Tutorials',
    },
    {
      id: '2',
      title: 'Advanced Concepts Explained',
      url: 'https://youtube.com/watch?v=example2',
      description: 'Deep dive into advanced topics',
      thumbnail: 'https://via.placeholder.com/320x180?text=Video+Thumbnail',
      channelName: 'Advanced Learning',
    },
    {
      id: '3',
      title: 'Hands-On Practice Session',
      url: 'https://youtube.com/watch?v=example3',
      description: 'Practical exercises and demonstrations',
      thumbnail: 'https://via.placeholder.com/320x180?text=Video+Thumbnail',
      channelName: 'Practical Skills',
    },
  ], []);

  // Load progress from localStorage
  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(`learning-progress-${user.uid}`);
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          const topicProgress = parsed[materialName] as LearningProgress;
          if (topicProgress) {
            setProgress(topicProgress);
            setCompletedResources(topicProgress.completedResources || []);
          }
        } catch (e) {
          console.error('Failed to load progress:', e);
        }
      }
    }
  }, [user, materialName]);

  // Fetch YouTube resources
  const fetchYouTubeResources = useCallback(async (keywords: string[]) => {
    if (!keywords.length) {
      return generateMockYouTubeResources();
    }

    try {
      const searchQuery = keywords.join(' ');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(searchQuery)}&type=video&key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) throw new Error('YouTube API failed');

      const data = await response.json();
      const resources: YouTubeResource[] = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        url: `https://youtube.com/watch?v=${item.id.videoId}`,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelName: item.snippet.channelTitle,
      }));

      return resources;
    } catch (error) {
      console.error('Failed to fetch YouTube resources:', error);
      return generateMockYouTubeResources();
    }
  }, [generateMockYouTubeResources]);

  // Fetch article resources (mock implementation - replace with real API)
  const fetchArticleResources = useCallback(async (keywords: string[]): Promise<ArticleResource[]> => {
    if (!keywords.length) {
      return [];
    }

    // Mock implementation - replace with real APIs (CrossRef, Semantic Scholar, etc.)
    return [
      {
        id: 'article-1',
        title: `Understanding ${keywords[0] || 'Modern Technologies'}`,
        url: 'https://example.com/article-1',
        authors: ['Dr. Jane Smith', 'Dr. John Doe'],
        source: 'Tech Journal',
        description: 'Comprehensive guide on the topic with practical examples',
        publishDate: '2024-01-15',
      },
      {
        id: 'article-2',
        title: `${keywords[0] || 'Technology'} Best Practices`,
        url: 'https://example.com/article-2',
        authors: ['Tech Expert'],
        source: 'Developer Blog',
        description: 'Industry best practices and advanced techniques',
        publishDate: '2024-02-10',
      },
      {
        id: 'article-3',
        title: `Research: ${keywords[0] || 'Technology'} Trends`,
        url: 'https://example.com/article-3',
        authors: ['Research Team'],
        source: 'Academic Journal',
        description: 'Latest research and findings in the field',
        publishDate: '2024-03-05',
      },
      {
        id: 'article-4',
        title: `Hands-On Guide to ${keywords[0] || 'Technology'}`,
        url: 'https://example.com/article-4',
        authors: ['Practical Learning'],
        source: 'Learning Platform',
        description: 'Step-by-step tutorial for practical learning',
        publishDate: '2024-04-01',
      },
    ];
  }, []);

  // Main fetch effect - only runs when summary changes
  useEffect(() => {
    let isMounted = true;
    hasNotifiedRef.current = false; // Reset notification flag on new fetch

    const fetchResources = async () => {
      const keywords = extractTopicKeywords(summary);
      
      setIsLoading(true);
      
      try {
        const [ytResources, artResources] = await Promise.all([
          fetchYouTubeResources(keywords),
          fetchArticleResources(keywords),
        ]);

        if (isMounted) {
          setYoutubeResources(ytResources);
          setArticleResources(artResources);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        if (isMounted) {
          setYoutubeResources(generateMockYouTubeResources());
          setArticleResources([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchResources();

    return () => {
      isMounted = false;
    };
  }, [summary, extractTopicKeywords, fetchYouTubeResources, fetchArticleResources, generateMockYouTubeResources]);

  // Notify parent when references are ready - with proper change detection
  useEffect(() => {
    if (!onReferencesReady || isLoading) return;
    
    const youtubeUrls = youtubeResources.map(r => r.url);
    const articleUrls = articleResources.map(r => r.url);
    
    // Check if the URLs have actually changed
    const prevYoutube = previousRefsRef.current.youtube;
    const prevArticles = previousRefsRef.current.articles;
    
    const youtubeChanged = youtubeUrls.length !== prevYoutube.length || 
      youtubeUrls.some((url, i) => url !== prevYoutube[i]);
    const articlesChanged = articleUrls.length !== prevArticles.length || 
      articleUrls.some((url, i) => url !== prevArticles[i]);
    
    if ((youtubeChanged || articlesChanged) && !hasNotifiedRef.current) {
      previousRefsRef.current = { youtube: youtubeUrls, articles: articleUrls };
      hasNotifiedRef.current = true;
      onReferencesReady(youtubeUrls, articleUrls);
    }
  }, [youtubeResources, articleResources, isLoading, onReferencesReady]);

  // Mark resource as completed
  const markAsCompleted = (resourceId: string) => {
    if (!user) return;

    const updated = [...completedResources, resourceId];
    setCompletedResources(updated);

    // Save to localStorage
    const newProgress: LearningProgress = {
      userId: user.uid,
      topic: materialName,
      completedResources: updated,
      lastAccessed: new Date(),
    };

    const savedData = localStorage.getItem(`learning-progress-${user.uid}`);
    const data = savedData ? JSON.parse(savedData) : {};
    data[materialName] = newProgress;
    localStorage.setItem(`learning-progress-${user.uid}`, JSON.stringify(data));
    setProgress(newProgress);
  };

  // Refresh resources
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    hasNotifiedRef.current = false; // Allow new notification after refresh
    
    const keywords = extractTopicKeywords(summary);
    
    try {
      const [ytResources, artResources] = await Promise.all([
        fetchYouTubeResources(keywords),
        fetchArticleResources(keywords),
      ]);
      
      setYoutubeResources(ytResources);
      setArticleResources(artResources);
    } catch (error) {
      console.error('Error refreshing resources:', error);
    } finally {
      setIsLoading(false);
    }
  }, [summary, extractTopicKeywords, fetchYouTubeResources, fetchArticleResources]);

  const isResourceCompleted = (resourceId: string) => completedResources.includes(resourceId);

  const getRecommendationCount = () => {
    const totalResources = youtubeResources.length + articleResources.length;
    const completedCount = completedResources.length;
    return { totalResources, completedCount, progressPercentage: totalResources > 0 ? (completedCount / totalResources) * 100 : 0 };
  };

  const stats = getRecommendationCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              📚 More to Explore
            </CardTitle>
            <CardDescription>
              Tailored for {learningStyle} learners • {stats.completedCount}/{stats.totalResources} completed
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Progress Tracker */}
        {stats.totalResources > 0 && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Learning Progress</span>
              <span className="text-xs text-muted-foreground">{stats.progressPercentage.toFixed(0)}% Complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.progressPercentage}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-orange-500"
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              Videos ({youtubeResources.length})
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Articles ({articleResources.length})
            </TabsTrigger>
          </TabsList>

          {/* YouTube Tab */}
          <TabsContent value="youtube" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {youtubeResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group border-2 hover:border-primary/50">
                      <CardContent className="p-0 overflow-hidden">
                        <div className="relative w-full h-32 bg-muted overflow-hidden">
                          <img
                            src={resource.thumbnail}
                            alt={resource.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {isResourceCompleted(resource.id) && (
                            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Youtube className="h-4 w-4 text-red-500" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">Video</span>
                          </div>
                          <h4 className="font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors text-sm">
                            {resource.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">{resource.channelName}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              window.open(resource.url, '_blank');
                              markAsCompleted(resource.id);
                            }}
                          >
                            <Youtube className="h-4 w-4 mr-2" />
                            Watch
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {articleResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-2 hover:border-primary/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              <Badge variant="secondary">{resource.source}</Badge>
                              {isResourceCompleted(resource.id) && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {resource.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {resource.description}
                            </p>
                            {resource.authors && (
                              <p className="text-xs text-muted-foreground">
                                {resource.authors.join(', ')}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.open(resource.url, '_blank');
                              markAsCompleted(resource.id);
                            }}
                          >
                            Read
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Additional CTA */}
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-500/10 to-orange-500/10 rounded-lg border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground">Want more recommendations?</h4>
              <p className="text-sm text-muted-foreground">
                Explore personalized content for your {learningStyle} learning style
              </p>
            </div>
            <Button variant="outline">
              Explore More
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceRecommender;
