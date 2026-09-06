import {
  PostAnalytics,
  SocialPlatform,
  PostAnalyticsContentType,
  RepurposeCandidate,
} from '@/lib/types/database';

/**
 * Identifies high-performing content candidates and formulates cross-platform repurposing actions.
 */
export function identifyRepurposingCandidates(
  posts: PostAnalytics[],
  connectedPlatforms: SocialPlatform[]
): RepurposeCandidate[] {
  if (!posts || posts.length === 0) return [];

  // Filter connected platforms pool
  const targetPlatPool = connectedPlatforms.length > 0 ? connectedPlatforms : ['facebook', 'instagram', 'youtube', 'twitter'];

  // Sort by engagement or views
  const sorted = [...posts].sort((a, b) => (b.views + b.likes * 2) - (a.views + a.likes * 2));
  const topSlice = sorted.slice(0, 5);

  return topSlice.map((post) => {
    const title = post.post_title || 'Islamic Reflection Post';
    const topic = post.post_topic || 'Islamic Wisdom';
    const srcPlat = post.platform;

    // Cross-platform proposals
    const repurposeIdeas: RepurposeCandidate['repurposeIdeas'] = [];

    // Proposal 1: Turn into Instagram Reel / Carousel
    if (srcPlat !== 'instagram' || post.content_type === 'video') {
      repurposeIdeas.push({
        targetPlatform: 'instagram',
        targetFormat: 'carousel',
        suggestedHook: `✨ 3 کلیدی نکات: "${title}" کو اپنی روزمرہ زندگی میں کیسے اپنائیں؟`,
        actionLabel: 'Convert to Instagram Carousel',
        createPostUrl: `/dashboard/create-post?topic=${encodeURIComponent(topic)}&platform=instagram&format=carousel&notes=${encodeURIComponent(`Repurposed from ${srcPlat} post: "${title}"`)}`,
      });
    }

    // Proposal 2: Turn into X / Twitter Thread
    if (srcPlat !== 'twitter') {
      repurposeIdeas.push({
        targetPlatform: 'twitter',
        targetFormat: 'text',
        suggestedHook: `ایک مختصر فکر انگیز تھریڈ: ${title} کے حوالے سے اہم ترین اسباق 🧵👇`,
        actionLabel: 'Convert to X / Twitter Post',
        createPostUrl: `/dashboard/create-post?topic=${encodeURIComponent(topic)}&platform=twitter&format=text&notes=${encodeURIComponent(`Repurposed from ${srcPlat} post: "${title}"`)}`,
      });
    }

    // Proposal 3: Turn into Short Video (TikTok / Reels / Shorts)
    if (post.content_type !== 'reel_short') {
      repurposeIdeas.push({
        targetPlatform: 'tiktok',
        targetFormat: 'reel_short',
        suggestedHook: `کیا آپ جانتے ہیں کہ "${title}" ہماری زندگی کیسے بدل سکتا ہے؟ 💡`,
        actionLabel: 'Convert to Short Video (Reels/TikTok)',
        createPostUrl: `/dashboard/create-post?topic=${encodeURIComponent(topic)}&platform=tiktok&format=reel_short&notes=${encodeURIComponent(`Repurposed into 60s viral script from: "${title}"`)}`,
      });
    }

    // Proposal 4: Turn into WhatsApp Broadcast
    if (targetPlatPool.includes('whatsapp') || srcPlat !== 'whatsapp') {
      repurposeIdeas.push({
        targetPlatform: 'whatsapp',
        targetFormat: 'text',
        suggestedHook: `📢 خصوصی پیغام: ${title} — اہم اسلامی رہنمائی`,
        actionLabel: 'Convert to WhatsApp Broadcast',
        createPostUrl: `/dashboard/create-post?topic=${encodeURIComponent(topic)}&platform=whatsapp&format=text&notes=${encodeURIComponent(`Repurposed for WhatsApp community groups from: "${title}"`)}`,
      });
    }

    return {
      id: post.id,
      title,
      sourcePlatform: srcPlat,
      publishedAt: post.published_at,
      views: post.views,
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      engagementRate: post.engagement_rate,
      repurposeIdeas,
    };
  });
}
