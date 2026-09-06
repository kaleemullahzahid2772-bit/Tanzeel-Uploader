export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer';
export type MediaType = 'image' | 'video';
export type MediaStatus = 'uploaded' | 'processing' | 'ready' | 'failed' | 'deleted';
export type PostStatus = 'draft' | 'processing' | 'ready' | 'published' | 'failed';

export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'twitter'
  | 'whatsapp';

export type ContentLanguage =
  | 'urdu'
  | 'english'
  | 'arabic'
  | 'bilingual_urdu_en'
  | 'bilingual_ar_urdu'
  | 'auto';

export type ContentTone =
  | 'professional'
  | 'friendly'
  | 'educational'
  | 'islamic'
  | 'emotional'
  | 'informative'
  | 'marketing'
  | 'concise';

export type ContentQualityStatus = 'draft' | 'approved' | 'needs_review';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface BrandSettings {
  id: string;
  user_id: string;
  brand_name: string;
  brand_description: string;
  website: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface ContentPreferences {
  id: string;
  user_id: string;
  default_language: string;
  default_timezone: string;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  public_url: string;
  file_type: MediaType;
  mime_type: string;
  file_size: number;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  status: MediaStatus;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  media_id: string | null;
  media?: MediaItem | null;
  title: string | null;
  topic: string;
  notes: string | null;
  status: PostStatus;
  created_at: string;
  updated_at: string;
}

export type OptimizationStatus =
  | 'draft'
  | 'optimizing'
  | 'optimized'
  | 'needs_review'
  | 'approved'
  | 'edited'
  | 'failed';

export interface SEOKeywordsData {
  primary: string[];
  secondary: string[];
  long_tail: string[];
}

export interface HashtagCategoriesData {
  brand: string[];
  topic: string[];
  audience: string[];
}

export interface VideoChapter {
  timestamp: string;
  title: string;
}

export interface ScoreBreakdown {
  hookScore: number; // Max 20
  platformFitScore: number; // Max 20
  seoScore: number; // Max 20
  ctaScore: number; // Max 15
  hashtagScore: number; // Max 15
  islamicAdabScore: number; // Max 10
}

export interface PlatformContentData {
  title?: string;
  hook?: string;
  caption?: string;
  description?: string;
  hashtags?: string[];
  keywords?: string[];
  tags?: string[];
  cta?: string;
  alt_text?: string;
  suggested_on_screen_text?: string;
  suggested_opening_line?: string;
  chapters?: VideoChapter[];
  seo_keywords?: SEOKeywordsData;
  hashtag_categories?: HashtagCategoriesData;
  optimization_status?: OptimizationStatus;
  quality_score?: number;
  score_breakdown?: ScoreBreakdown;
  optimization_suggestions?: string[];
}

export interface PlatformContent {
  id: string;
  post_id: string;
  user_id: string;
  platform: SocialPlatform;
  title: string | null;
  hook: string | null;
  caption: string | null;
  description: string | null;
  hashtags: string[];
  keywords: string[];
  tags: string[];
  cta: string | null;
  alt_text: string | null;
  suggested_on_screen_text: string | null;
  suggested_opening_line: string | null;
  chapters: VideoChapter[];
  seo_keywords: SEOKeywordsData;
  hashtag_categories: HashtagCategoriesData;
  status: ContentQualityStatus;
  optimization_status: OptimizationStatus;
  version: number;
  quality_score: number;
  score_breakdown: ScoreBreakdown;
  quality_notes: string[];
  optimization_suggestions: string[];
  optimized_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentVersion {
  id: string;
  post_id: string;
  user_id: string;
  platform: SocialPlatform;
  version: number;
  title: string | null;
  hook: string | null;
  caption: string | null;
  description: string | null;
  hashtags: string[];
  keywords: string[];
  tags: string[];
  cta: string | null;
  alt_text: string | null;
  suggested_on_screen_text: string | null;
  suggested_opening_line: string | null;
  chapters: VideoChapter[];
  quality_score: number;
  score_breakdown: ScoreBreakdown;
  optimization_suggestions: string[];
  revision_instruction: string | null;
  created_at: string;
}

export interface AIGeneration {
  id: string;
  post_id: string | null;
  user_id: string;
  model: string;
  prompt: string;
  source_content: Record<string, unknown>;
  generated_content: Record<string, PlatformContentData>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface QualityCheckResult {
  passed: boolean;
  score: number;
  breakdown?: ScoreBreakdown;
  issues: string[];
  suggestions: string[];
  islamicSafetyNotes: string[];
  needsReview: boolean;
}

export interface DashboardStats {
  totalMedia: number;
  draftPosts: number;
  publishedPosts: number;
  connectedAccounts: number;
}

// ==============================================================================
// PHASE 4: SOCIAL MEDIA ACCOUNTS & OAUTH TYPES
// ==============================================================================

export type SocialAccountStatus =
  | 'connected'
  | 'expiring_soon'
  | 'expired'
  | 'revoked'
  | 'error'
  | 'disconnected';

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  account_id: string;
  account_name: string;
  username: string | null;
  profile_image_url: string | null;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  scopes: string[];
  status: SocialAccountStatus;
  metadata: Record<string, unknown>;
  connected_at: string;
  updated_at: string;
}

export interface SocialAccountPublic {
  id: string;
  platform: SocialPlatform;
  account_id: string;
  account_name: string;
  username: string | null;
  profile_image_url: string | null;
  token_expires_at: string | null;
  scopes: string[];
  status: SocialAccountStatus;
  metadata: Record<string, unknown>;
  connected_at: string;
  updated_at: string;
  is_expiring_soon?: boolean;
  is_expired?: boolean;
}

export interface OAuthStateRecord {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  state_token: string;
  code_verifier: string | null;
  redirect_uri: string;
  expires_at: string;
  created_at: string;
}

export interface PlatformPermission {
  key: string;
  label: {
    en: string;
    ur: string;
  };
  description: {
    en: string;
    ur: string;
  };
  required: boolean;
}

export interface OAuthProviderConfig {
  platform: SocialPlatform;
  name: string;
  urduName: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  supportsPKCE: boolean;
  supportsRefresh: boolean;
  permissions: PlatformPermission[];
  clientIdEnv: string;
  clientSecretEnv: string;
  setupGuideUrl: string;
}

// ==============================================================================
// PHASE 5: AUTOMATIC SOCIAL MEDIA PUBLISHING ENGINE TYPES
// ==============================================================================

export type PublishingJobStatus =
  | 'pending'
  | 'processing'
  | 'published'
  | 'failed'
  | 'cancelled'
  | 'unsupported'
  | 'needs_reconnect';

export interface PublishingJob {
  id: string;
  user_id: string;
  post_id: string | null;
  social_account_id: string | null;
  platform: SocialPlatform;
  account_name: string;
  status: PublishingJobStatus;
  platform_post_id: string | null;
  platform_post_url: string | null;
  error_code: string | null;
  error_message: string | null;
  retry_count: number;
  request_payload: Record<string, unknown>;
  response_payload: Record<string, unknown>;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublishTarget {
  platform: SocialPlatform;
  accountId: string;
  accountName?: string;
  content: PlatformContentData;
}

export interface PublishRequestPayload {
  postId?: string;
  mediaId?: string;
  targets: PublishTarget[];
}

export interface PlatformPublishResult {
  jobId: string;
  platform: SocialPlatform;
  accountId: string;
  accountName: string;
  status: PublishingJobStatus;
  platformPostId?: string | null;
  platformPostUrl?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  publishedAt?: string | null;
  details?: Record<string, unknown>;
}

export interface PublishResponse {
  success: boolean;
  total: number;
  publishedCount: number;
  failedCount: number;
  results: PlatformPublishResult[];
}

// ==============================================================================
// PHASE 6: SMART SCHEDULING & CONTENT CALENDAR TYPES
// ==============================================================================

export type ScheduledPostStatus =
  | 'scheduled'
  | 'processing'
  | 'published'
  | 'failed'
  | 'cancelled'
  | 'paused'
  | 'needs_reconnect';

export interface ScheduledPost {
  id: string;
  user_id: string;
  post_id: string | null;
  social_account_id: string | null;
  platform: SocialPlatform;
  account_name: string;
  content_snapshot: PlatformContentData;
  media_id: string | null;
  media?: MediaItem | null;
  scheduled_for: string; // UTC ISO string
  timezone: string; // IANA timezone e.g. 'Asia/Karachi'
  status: ScheduledPostStatus;
  publishing_job_id: string | null;
  locked_at: string | null;
  locked_by: string | null;
  retry_count: number;
  max_retries: number;
  error_message: string | null;
  published_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleTarget {
  platform: SocialPlatform;
  accountId: string;
  accountName?: string;
  content: PlatformContentData;
}

export interface ScheduleRequestPayload {
  postId?: string;
  mediaId?: string;
  scheduledFor: string; // Local date/time ISO or formatted
  timezone: string; // User IANA timezone
  targets: ScheduleTarget[];
}

export interface ScheduleResult {
  scheduleId: string;
  platform: SocialPlatform;
  accountId: string;
  accountName: string;
  scheduledFor: string; // UTC ISO
  timezone: string;
  status: ScheduledPostStatus;
  errorMessage?: string;
}

export interface ScheduleResponse {
  success: boolean;
  total: number;
  scheduledCount: number;
  results: ScheduleResult[];
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'list';

export interface TimezoneOption {
  id: string;
  label: string;
  offset: string;
  region: string;
}

// ==============================================================================
// PHASE 7: ANALYTICS & PERFORMANCE INTELLIGENCE TYPES
// ==============================================================================

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last_7d'
  | 'last_30d'
  | 'last_90d'
  | 'this_month'
  | 'previous_month'
  | 'custom';

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface AnalyticsSnapshot {
  id: string;
  user_id: string;
  social_account_id: string;
  platform: SocialPlatform;
  account_name: string;
  metric_date: string; // YYYY-MM-DD
  followers: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  metrics_available: string[];
  metrics_unavailable: string[];
  raw_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type PostAnalyticsContentType =
  | 'video'
  | 'image'
  | 'reel_short'
  | 'text'
  | 'carousel'
  | 'story'
  | 'other';

export interface PostAnalytics {
  id: string;
  user_id: string;
  post_id: string | null;
  publishing_job_id: string | null;
  scheduled_post_id: string | null;
  social_account_id: string | null;
  platform: SocialPlatform;
  platform_post_id: string;
  post_title: string | null;
  post_topic: string | null;
  content_type: PostAnalyticsContentType;
  published_at: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  metrics_available: string[];
  metrics_unavailable: string[];
  raw_metadata: Record<string, unknown>;
  fetched_at: string;
  created_at: string;
  updated_at: string;
}

export interface MetricDelta {
  value: number;
  percentage: number | null; // e.g. +12.5 or -4.2
  direction: 'up' | 'down' | 'neutral' | 'unavailable';
  isAvailable: boolean;
}

export interface AnalyticsOverviewKPIs {
  followers: MetricDelta;
  views: MetricDelta;
  likes: MetricDelta;
  comments: MetricDelta;
  shares: MetricDelta;
  reach: MetricDelta;
  impressions: MetricDelta;
  engagementRate: MetricDelta;
  publishedPosts: MetricDelta;
  lastSyncedAt: string | null;
}

export interface AnalyticsTimeSeriesPoint {
  date: string; // YYYY-MM-DD
  followers: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement: number;
  postsPublished: number;
}

export interface PlatformPerformanceSummary {
  platform: SocialPlatform;
  accountName?: string;
  postCount: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  avgEngagementRate: number;
  isAvailable: boolean;
  unavailableMetrics: string[];
}

export interface ContentTypePerformance {
  type: PostAnalyticsContentType;
  label: string;
  postCount: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  avgEngagementRate: number;
}

export interface TopicPerformance {
  topic: string;
  postCount: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  avgEngagementRate: number;
}

export type PostSortOption =
  | 'views'
  | 'likes'
  | 'comments'
  | 'shares'
  | 'engagement'
  | 'date';

export interface BestPostingInsights {
  bestTimeSlot: string | null; // e.g. "8:00 PM - 10:00 PM"
  bestDayOfWeek: string | null; // e.g. "Friday"
  bestPlatform: SocialPlatform | null;
  dataSufficient: boolean;
  sampleSize: number;
  note: string;
}

export interface AISummaryReport {
  summaryUrdu: string;
  summaryEnglish: string;
  keyStrengths: string[];
  recommendations: string[];
  generatedAt: string;
}




// ==============================================================================
// PHASE 8: AI MARKETING MANAGER TYPES
// ==============================================================================

export type MarketingGoal =
  | 'grow_followers'
  | 'increase_engagement'
  | 'increase_reach'
  | 'generate_leads'
  | 'promote_courses'
  | 'website_traffic'
  | 'brand_awareness'
  | 'video_views';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'insufficient_data';
export type HealthScoreStatus = 'excellent' | 'good' | 'needs_attention' | 'critical' | 'insufficient_data';

export interface BrandKnowledge {
  id: string;
  user_id: string;
  brand_name: string;
  description: string;
  target_audience: string;
  services: string;
  products_courses: string;
  brand_voice: string;
  preferred_language: string;
  tone: string;
  primary_goal: MarketingGoal;
  keywords: string[];
  forbidden_keywords: string[];
  islamic_guidelines: string;
  content_rules: Record<string, boolean | string>;
  created_at: string;
  updated_at: string;
}

export type AIMarketingInsightType =
  | 'overview'
  | 'content'
  | 'platform'
  | 'audience'
  | 'action'
  | 'strategy'
  | 'weekly_plan'
  | 'top_performing'
  | 'underperforming'
  | 'health_score'
  | 'repurpose';

export interface AIMarketingInsight {
  id: string;
  user_id: string;
  insight_type: AIMarketingInsightType;
  title: string;
  description: string;
  recommendation?: string;
  supporting_data: {
    metrics?: Record<string, number | string | boolean>;
    sampleSize?: number;
    period?: string;
    comparison?: string;
    calculationNote?: string;
  };
  confidence: ConfidenceLevel;
  date_range?: {
    preset?: string;
    startDate?: string;
    endDate?: string;
  };
  platform?: SocialPlatform | 'all' | null;
  is_active: boolean;
  expires_at: string;
  created_at: string;
}

export interface AIContentIdea {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  content_type: PostAnalyticsContentType;
  target_platform: SocialPlatform | 'all';
  objective: string;
  hook?: string;
  cta?: string;
  reason?: string;
  estimated_resonance_score: number;
  status: 'new' | 'saved' | 'used' | 'dismissed';
  created_at: string;
  used_at?: string | null;
}

export interface WeeklyMarketingDayPlan {
  day: string; // e.g. "Monday", "Tuesday"
  date: string; // YYYY-MM-DD
  platform: SocialPlatform;
  contentTopic: string;
  contentType: PostAnalyticsContentType;
  objective: string;
  suggestedTime: string; // e.g. "14:00 UTC (9:00 PM PKT)"
  suggestedCta: string;
  priority: 'high' | 'medium' | 'low';
  hook?: string;
  notes?: string;
}

export interface WeeklyMarketingPlan {
  weekStartDate: string;
  weekEndDate: string;
  goal: MarketingGoal;
  days: WeeklyMarketingDayPlan[];
  strategySummaryUrdu: string;
  strategySummaryEnglish: string;
  confidence: ConfidenceLevel;
  dataSufficient: boolean;
  generatedAt: string;
}

export interface ContentStrategySummary {
  recommendedTopics: string[];
  topicsToTest: string[];
  topicsToReduce: string[];
  recommendedMix: {
    category: string;
    percentage: number;
    rationale: string;
  }[];
  platformPriorities: {
    platform: SocialPlatform;
    priority: 'primary' | 'secondary' | 'experimental' | 'maintenance';
    rationale: string;
  }[];
  suggestedPostingFrequency: {
    platform: SocialPlatform;
    postsPerWeek: number;
    rationale: string;
  }[];
  repurposeOpportunities: {
    postId: string;
    postTitle: string;
    sourcePlatform: SocialPlatform;
    targetPlatforms: SocialPlatform[];
    formatSuggestion: string;
    rationale: string;
  }[];
}

export interface HealthScoreComponent {
  name: string;
  labelUrdu: string;
  score: number; // 0 to maxScore
  maxScore: number;
  weight: number; // percentage of 100
  status: 'optimal' | 'moderate' | 'low' | 'insufficient_data';
  explanation: string;
}

export interface MarketingHealthScore {
  overallScore: number; // 0 to 100
  status: HealthScoreStatus;
  isLimitedData: boolean;
  components: HealthScoreComponent[];
  notes: string;
  evaluatedAt: string;
}

export interface AIMarketingOverview {
  overallTrend: 'growing' | 'stable' | 'declining' | 'insufficient_data';
  bestPlatform: SocialPlatform | null;
  bestContentType: PostAnalyticsContentType | null;
  bestTopic: string | null;
  postingConsistency: 'consistent' | 'inconsistent' | 'insufficient_data';
  confidence: ConfidenceLevel;
  healthScore: MarketingHealthScore;
  primaryGoal: MarketingGoal;
  dataFreshness: {
    lastDataUpdated: string | null;
    aiInsightsGenerated: string;
    isStale: boolean;
    sampleSize: number;
  };
}

export interface MarketingChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  suggestedPrompts?: string[];
}

export interface PlatformStrategyInsight {
  platform: SocialPlatform;
  status: 'connected' | 'not_connected';
  whatIsWorking: string[];
  whatToImprove: string[];
  recommendedContent: string;
  isLimitedData: boolean;
  sampleSize: number;
}

export interface TopUnderperformingInsight {
  topPosts: {
    id: string;
    title: string;
    platform: SocialPlatform;
    topic: string;
    views: number;
    engagement_rate: number;
    resonanceReason: string;
  }[];
  detectedPatterns: string[];
  underperformingPosts: {
    id: string;
    title: string;
    platform: SocialPlatform;
    topic: string;
    views: number;
    engagement_rate: number;
    improvementTip: string;
  }[];
  isComparisonReliable: boolean;
  comparisonNote: string;
}

export interface RepurposeCandidate {
  id: string;
  title: string;
  sourcePlatform: SocialPlatform;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  repurposeIdeas: {
    targetPlatform: SocialPlatform;
    targetFormat: PostAnalyticsContentType;
    suggestedHook: string;
    actionLabel: string;
    createPostUrl: string;
  }[];
}

export interface MarketingReportData {
  generatedAt: string;
  brandName: string;
  primaryGoal: MarketingGoal;
  healthScore: number;
  healthStatus: string;
  executiveSummaryUrdu: string;
  executiveSummaryEnglish: string;
  bestPlatform: string;
  bestContentType: string;
  bestTopic: string;
  postingConsistency: string;
  topInsights: string[];
  recommendedActions: string[];
  weeklyStrategy: string[];
  dataLimitations: string[];
}
