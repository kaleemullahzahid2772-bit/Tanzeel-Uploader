import { SocialPlatform } from '@/lib/types/database';

export interface RawAccountMetrics {
  followers: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  raw: Record<string, unknown>;
  availableMetrics: string[];
  unavailableMetrics: string[];
}

export interface RawPostMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  raw: Record<string, unknown>;
  availableMetrics: string[];
  unavailableMetrics: string[];
}

/**
 * Fetches real account-level metrics from official platform APIs.
 */
export async function fetchPlatformAccountMetrics(
  platform: SocialPlatform,
  accountId: string,
  accessToken: string,
  metadata?: Record<string, unknown>
): Promise<RawAccountMetrics> {
  switch (platform) {
    case 'facebook':
      return fetchFacebookAccountMetrics(accountId, accessToken);
    case 'instagram':
      return fetchInstagramAccountMetrics(accountId, accessToken);
    case 'youtube':
      return fetchYouTubeAccountMetrics(accessToken);
    case 'twitter':
      return fetchTwitterAccountMetrics(accountId, accessToken);
    case 'tiktok':
      return fetchTikTokAccountMetrics(accessToken);
    case 'whatsapp':
      return fetchWhatsAppAccountMetrics(accountId, accessToken);
    default:
      throw new Error(`Unsupported platform for analytics: ${platform}`);
  }
}

/**
 * Fetches real post-level metrics from official platform APIs.
 */
export async function fetchPlatformPostMetrics(
  platform: SocialPlatform,
  platformPostId: string,
  accessToken: string,
  accountId?: string
): Promise<RawPostMetrics> {
  switch (platform) {
    case 'facebook':
      return fetchFacebookPostMetrics(platformPostId, accessToken);
    case 'instagram':
      return fetchInstagramPostMetrics(platformPostId, accessToken);
    case 'youtube':
      return fetchYouTubePostMetrics(platformPostId, accessToken);
    case 'twitter':
      return fetchTwitterPostMetrics(platformPostId, accessToken);
    case 'tiktok':
      return fetchTikTokPostMetrics(platformPostId, accessToken);
    case 'whatsapp':
      return fetchWhatsAppPostMetrics(platformPostId, accessToken);
    default:
      throw new Error(`Unsupported platform for post analytics: ${platform}`);
  }
}

// ==============================================================================
// 1. FACEBOOK GRAPH API METRICS
// ==============================================================================

async function fetchFacebookAccountMetrics(pageId: string, accessToken: string): Promise<RawAccountMetrics> {
  try {
    const fields = 'followers_count,fan_count,insights.metric(page_impressions,page_engaged_users){values}';
    const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=${fields}&access_token=${accessToken}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to fetch Facebook page insights');
    }

    const followers = data.followers_count || data.fan_count || 0;
    let impressions = 0;
    let reach = 0;

    if (data.insights?.data) {
      for (const item of data.insights.data) {
        if (item.name === 'page_impressions' && item.values?.[0]?.value) {
          impressions = Number(item.values[0].value) || 0;
        }
        if (item.name === 'page_engaged_users' && item.values?.[0]?.value) {
          reach = Number(item.values[0].value) || 0;
        }
      }
    }

    return {
      followers,
      views: impressions,
      likes: data.fan_count || 0,
      comments: 0,
      shares: 0,
      reach,
      impressions,
      raw: data,
      availableMetrics: ['followers', 'views', 'reach', 'impressions'],
      unavailableMetrics: ['shares', 'comments'],
    };
  } catch (err: unknown) {
    console.error('Facebook Account Metrics API error:', err);
    throw err;
  }
}

async function fetchFacebookPostMetrics(postId: string, accessToken: string): Promise<RawPostMetrics> {
  try {
    const fields = 'reactions.summary(total_count),comments.summary(total_count),shares,insights.metric(post_impressions,post_engaged_users)';
    const res = await fetch(`https://graph.facebook.com/v21.0/${postId}?fields=${fields}&access_token=${accessToken}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to fetch Facebook post insights');
    }

    const likes = data.reactions?.summary?.total_count || 0;
    const comments = data.comments?.summary?.total_count || 0;
    const shares = data.shares?.count || 0;
    let impressions = 0;
    let reach = 0;

    if (data.insights?.data) {
      for (const item of data.insights.data) {
        if (item.name === 'post_impressions' && item.values?.[0]?.value) {
          impressions = Number(item.values[0].value) || 0;
        }
        if (item.name === 'post_engaged_users' && item.values?.[0]?.value) {
          reach = Number(item.values[0].value) || 0;
        }
      }
    }

    return {
      views: impressions,
      likes,
      comments,
      shares,
      reach,
      impressions,
      raw: data,
      availableMetrics: ['views', 'likes', 'comments', 'shares', 'reach', 'impressions'],
      unavailableMetrics: [],
    };
  } catch (err: unknown) {
    console.error('Facebook Post Metrics API error:', err);
    throw err;
  }
}

// ==============================================================================
// 2. INSTAGRAM GRAPH API METRICS
// ==============================================================================

async function fetchInstagramAccountMetrics(igUserId: string, accessToken: string): Promise<RawAccountMetrics> {
  try {
    const fields = 'followers_count,media_count,insights.metric(impressions,reach){values}';
    const res = await fetch(`https://graph.facebook.com/v21.0/${igUserId}?fields=${fields}&access_token=${accessToken}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to fetch Instagram account insights');
    }

    const followers = data.followers_count || 0;
    let impressions = 0;
    let reach = 0;

    if (data.insights?.data) {
      for (const item of data.insights.data) {
        if (item.name === 'impressions' && item.values?.[0]?.value) {
          impressions = Number(item.values[0].value) || 0;
        }
        if (item.name === 'reach' && item.values?.[0]?.value) {
          reach = Number(item.values[0].value) || 0;
        }
      }
    }

    return {
      followers,
      views: impressions,
      likes: 0,
      comments: 0,
      shares: 0,
      reach,
      impressions,
      raw: data,
      availableMetrics: ['followers', 'views', 'reach', 'impressions'],
      unavailableMetrics: ['likes', 'comments', 'shares'],
    };
  } catch (err: unknown) {
    console.error('Instagram Account Metrics API error:', err);
    throw err;
  }
}

async function fetchInstagramPostMetrics(mediaId: string, accessToken: string): Promise<RawPostMetrics> {
  try {
    const fields = 'like_count,comments_count,insights.metric(impressions,reach,saved,shares,video_views)';
    const res = await fetch(`https://graph.facebook.com/v21.0/${mediaId}?fields=${fields}&access_token=${accessToken}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to fetch Instagram media insights');
    }

    const likes = data.like_count || 0;
    const comments = data.comments_count || 0;
    let shares = 0;
    let impressions = 0;
    let reach = 0;
    let views = 0;

    if (data.insights?.data) {
      for (const item of data.insights.data) {
        if (item.name === 'impressions' && item.values?.[0]?.value) {
          impressions = Number(item.values[0].value) || 0;
        }
        if (item.name === 'reach' && item.values?.[0]?.value) {
          reach = Number(item.values[0].value) || 0;
        }
        if (item.name === 'shares' && item.values?.[0]?.value) {
          shares = Number(item.values[0].value) || 0;
        }
        if (item.name === 'video_views' && item.values?.[0]?.value) {
          views = Number(item.values[0].value) || 0;
        }
      }
    }

    if (views === 0) views = impressions;

    return {
      views,
      likes,
      comments,
      shares,
      reach,
      impressions,
      raw: data,
      availableMetrics: ['views', 'likes', 'comments', 'shares', 'reach', 'impressions'],
      unavailableMetrics: [],
    };
  } catch (err: unknown) {
    console.error('Instagram Post Metrics API error:', err);
    throw err;
  }
}

// ==============================================================================
// 3. YOUTUBE DATA API v3 & ANALYTICS
// ==============================================================================

async function fetchYouTubeAccountMetrics(accessToken: string): Promise<RawAccountMetrics> {
  try {
    const url = 'https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true';
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to fetch YouTube channel metrics');
    }

    const item = data.items?.[0];
    const stats = item?.statistics || {};

    const subscribers = Number(stats.subscriberCount) || 0;
    const views = Number(stats.viewCount) || 0;
    const comments = Number(stats.commentCount) || 0;

    return {
      followers: subscribers,
      views,
      likes: 0,
      comments,
      shares: 0,
      reach: views,
      impressions: views,
      raw: stats,
      availableMetrics: ['followers', 'views', 'reach', 'impressions', 'comments'],
      unavailableMetrics: ['likes', 'shares'],
    };
  } catch (err: unknown) {
    console.error('YouTube Account Metrics API error:', err);
    throw err;
  }
}

async function fetchYouTubePostMetrics(videoId: string, accessToken: string): Promise<RawPostMetrics> {
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to fetch YouTube video metrics');
    }

    const item = data.items?.[0];
    const stats = item?.statistics || {};

    const views = Number(stats.viewCount) || 0;
    const likes = Number(stats.likeCount) || 0;
    const comments = Number(stats.commentCount) || 0;

    return {
      views,
      likes,
      comments,
      shares: 0,
      reach: views,
      impressions: views,
      raw: stats,
      availableMetrics: ['views', 'likes', 'comments', 'reach', 'impressions'],
      unavailableMetrics: ['shares'],
    };
  } catch (err: unknown) {
    console.error('YouTube Post Metrics API error:', err);
    throw err;
  }
}

// ==============================================================================
// 4. TWITTER / X API v2 METRICS
// ==============================================================================

async function fetchTwitterAccountMetrics(userId: string, accessToken: string): Promise<RawAccountMetrics> {
  try {
    const url = `https://api.twitter.com/2/users/${userId}?user.fields=public_metrics`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (!res.ok || data.errors) {
      throw new Error(data.errors?.[0]?.message || 'Failed to fetch Twitter/X account metrics');
    }

    const metrics = data.data?.public_metrics || {};
    const followers = metrics.followers_count || 0;

    return {
      followers,
      views: 0,
      likes: metrics.like_count || 0,
      comments: 0,
      shares: 0,
      reach: followers,
      impressions: 0,
      raw: metrics,
      availableMetrics: ['followers'],
      unavailableMetrics: ['views', 'reach', 'impressions', 'shares'],
    };
  } catch (err: unknown) {
    console.error('Twitter Account Metrics API error:', err);
    throw err;
  }
}

async function fetchTwitterPostMetrics(tweetId: string, accessToken: string): Promise<RawPostMetrics> {
  try {
    const url = `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics,non_public_metrics,organic_metrics`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (!res.ok || data.errors) {
      throw new Error(data.errors?.[0]?.message || 'Failed to fetch Tweet metrics');
    }

    const pub = data.data?.public_metrics || {};
    const nonPub = data.data?.non_public_metrics || {};
    const organic = data.data?.organic_metrics || {};

    const impressions = nonPub.impression_count || organic.impression_count || pub.impression_count || 0;
    const likes = pub.like_count || 0;
    const comments = pub.reply_count || 0;
    const shares = (pub.retweet_count || 0) + (pub.quote_count || 0);

    return {
      views: impressions,
      likes,
      comments,
      shares,
      reach: impressions,
      impressions,
      raw: { ...pub, ...nonPub, ...organic },
      availableMetrics: ['views', 'likes', 'comments', 'shares', 'reach', 'impressions'],
      unavailableMetrics: [],
    };
  } catch (err: unknown) {
    console.error('Twitter Post Metrics API error:', err);
    throw err;
  }
}

// ==============================================================================
// 5. TIKTOK API v2 METRICS
// ==============================================================================

async function fetchTikTokAccountMetrics(accessToken: string): Promise<RawAccountMetrics> {
  try {
    const url = 'https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count';
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (!res.ok || data.error?.code !== 'ok') {
      throw new Error(data.error?.message || 'Failed to fetch TikTok account metrics');
    }

    const user = data.data?.user || {};
    const followers = user.follower_count || 0;
    const likes = user.likes_count || 0;

    return {
      followers,
      views: 0,
      likes,
      comments: 0,
      shares: 0,
      reach: followers,
      impressions: 0,
      raw: user,
      availableMetrics: ['followers', 'likes'],
      unavailableMetrics: ['views', 'reach', 'impressions', 'shares', 'comments'],
    };
  } catch (err: unknown) {
    console.error('TikTok Account Metrics API error:', err);
    throw err;
  }
}

async function fetchTikTokPostMetrics(publishId: string, accessToken: string): Promise<RawPostMetrics> {
  try {
    const url = 'https://open.tiktokapis.com/v2/video/query/?fields=id,view_count,like_count,comment_count,share_count';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filters: {
          video_ids: [publishId],
        },
      }),
    });
    const data = await res.json();

    if (!res.ok || data.error?.code !== 'ok') {
      throw new Error(data.error?.message || 'Failed to query TikTok video metrics');
    }

    const video = data.data?.videos?.[0] || {};
    const views = video.view_count || 0;
    const likes = video.like_count || 0;
    const comments = video.comment_count || 0;
    const shares = video.share_count || 0;

    return {
      views,
      likes,
      comments,
      shares,
      reach: views,
      impressions: views,
      raw: video,
      availableMetrics: ['views', 'likes', 'comments', 'shares', 'reach', 'impressions'],
      unavailableMetrics: [],
    };
  } catch (err: unknown) {
    console.error('TikTok Post Metrics API error:', err);
    throw err;
  }
}

// ==============================================================================
// 6. WHATSAPP BUSINESS API METRICS
// ==============================================================================

async function fetchWhatsAppAccountMetrics(wabaId: string, accessToken: string): Promise<RawAccountMetrics> {
  try {
    const fields = 'id,name,timezone_id,message_template_namespace';
    const res = await fetch(`https://graph.facebook.com/v21.0/${wabaId}?fields=${fields}&access_token=${accessToken}`);
    const data = await res.json();

    return {
      followers: 0,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0,
      impressions: 0,
      raw: data,
      availableMetrics: [],
      unavailableMetrics: ['followers', 'views', 'likes', 'comments', 'shares', 'reach', 'impressions'],
    };
  } catch (err: unknown) {
    console.error('WhatsApp Account Metrics API error:', err);
    throw err;
  }
}

async function fetchWhatsAppPostMetrics(messageId: string, accessToken: string): Promise<RawPostMetrics> {
  // WhatsApp messaging API only supports direct delivery/read receipts via Webhooks, not public post impressions
  return {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    reach: 0,
    impressions: 0,
    raw: { message_id: messageId, note: 'Direct broadcast metric' },
    availableMetrics: [],
    unavailableMetrics: ['views', 'likes', 'comments', 'shares', 'reach', 'impressions'],
  };
}
