import { SocialPlatform, OAuthProviderConfig } from '@/lib/types/database';

export const OAUTH_PROVIDERS: Record<SocialPlatform, OAuthProviderConfig> = {
  facebook: {
    platform: 'facebook',
    name: 'Facebook Pages',
    urduName: 'فیس بک پیجز',
    authUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
    scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'],
    supportsPKCE: false,
    supportsRefresh: false,
    clientIdEnv: 'FACEBOOK_CLIENT_ID',
    clientSecretEnv: 'FACEBOOK_CLIENT_SECRET',
    setupGuideUrl: 'https://developers.facebook.com/apps',
    permissions: [
      {
        key: 'pages_show_list',
        label: {
          en: 'View Facebook Pages List',
          ur: 'فیس بک پیجز کی فہرست دیکھنا',
        },
        description: {
          en: 'Allows Nūr Social to list the Facebook Pages you manage so you can connect them.',
          ur: 'نور سوشل کو آپ کے زیر انتظام فیس بک پیجز کی فہرست دیکھنے کی اجازت دیتا ہے۔',
        },
        required: true,
      },
      {
        key: 'pages_read_engagement',
        label: {
          en: 'Read Page Engagement & Profile',
          ur: 'پیج پروفائل اور انگیجمنٹ کی معلومات',
        },
        description: {
          en: 'Allows reading Page name, profile picture, and verification status.',
          ur: 'پیج کا نام، پروفائل تصویر اور تصدیقی کیفیت دیکھنے کے لیے۔',
        },
        required: true,
      },
      {
        key: 'pages_manage_posts',
        label: {
          en: 'Manage Page Content (Future Publishing)',
          ur: 'پیج پر مواد کا انتظام (فیز 5 کے لیے)',
        },
        description: {
          en: 'Prepares permissions for publishing content to your Page in Phase 5.',
          ur: 'فیز 5 میں آپ کے پیج پر مواد شائع کرنے کی ضروری اجازت۔',
        },
        required: true,
      },
    ],
  },
  instagram: {
    platform: 'instagram',
    name: 'Instagram Professional',
    urduName: 'انسٹاگرام پروفیشنل',
    authUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
    scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
    supportsPKCE: false,
    supportsRefresh: false,
    clientIdEnv: 'INSTAGRAM_CLIENT_ID',
    clientSecretEnv: 'INSTAGRAM_CLIENT_SECRET',
    setupGuideUrl: 'https://developers.facebook.com/docs/instagram-platform',
    permissions: [
      {
        key: 'instagram_basic',
        label: {
          en: 'Basic Instagram Profile Access',
          ur: 'انسٹاگرام بنیادی پروفائل رسائی',
        },
        description: {
          en: 'View username, profile photo, and account type (Business or Creator).',
          ur: 'یوزر نیم، پروفائل تصویر اور اکاؤنٹ کی قسم دیکھنے کے لیے۔',
        },
        required: true,
      },
      {
        key: 'instagram_content_publish',
        label: {
          en: 'Instagram Content Publishing Scope',
          ur: 'انسٹاگرام پوسٹ پبلشنگ کی تیاری',
        },
        description: {
          en: 'Prepares authorization to publish photos and reels to Instagram in Phase 5.',
          ur: 'فیز 5 میں انسٹاگرام پر تصاویر اور ریلز شائع کرنے کی تیاری کے لیے۔',
        },
        required: true,
      },
    ],
  },
  tiktok: {
    platform: 'tiktok',
    name: 'TikTok Creator & Business',
    urduName: 'ٹک ٹاک اکاؤنٹ',
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    scopes: ['user.info.basic', 'video.upload'],
    supportsPKCE: true,
    supportsRefresh: true,
    clientIdEnv: 'TIKTOK_CLIENT_KEY',
    clientSecretEnv: 'TIKTOK_CLIENT_SECRET',
    setupGuideUrl: 'https://developers.tiktok.com/',
    permissions: [
      {
        key: 'user.info.basic',
        label: {
          en: 'Read TikTok Profile Details',
          ur: 'ٹک ٹاک پروفائل کی تفصیلات',
        },
        description: {
          en: 'Display avatar, display name, and verify creator identity.',
          ur: 'اوتار، نام اور کریئٹر تصدیق دیکھنے کے لیے۔',
        },
        required: true,
      },
      {
        key: 'video.upload',
        label: {
          en: 'Video Upload Authorization',
          ur: 'ویڈیو اپلوڈ کی اجازت',
        },
        description: {
          en: 'Prepares authorization for direct video uploads to TikTok in Phase 5.',
          ur: 'فیز 5 میں ٹک ٹاک پر ویڈیوز اپلوڈ کرنے کے لیے مجاز ہونا۔',
        },
        required: true,
      },
    ],
  },
  youtube: {
    platform: 'youtube',
    name: 'YouTube Channels & Shorts',
    urduName: 'یوٹیوب چینل',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    supportsPKCE: true,
    supportsRefresh: true,
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    setupGuideUrl: 'https://console.cloud.google.com/apis/credentials',
    permissions: [
      {
        key: 'youtube.readonly',
        label: {
          en: 'View YouTube Channel Profile',
          ur: 'یوٹیوب چینل کی معلومات دیکھنا',
        },
        description: {
          en: 'Allows Nūr Social to display your Channel Name, Thumbnail, and Subscriber count.',
          ur: 'چینل کا نام، لوگو اور بنیادی معلومات دکھانے کے لیے۔',
        },
        required: true,
      },
      {
        key: 'youtube.upload',
        label: {
          en: 'YouTube Video Upload Permission',
          ur: 'یوٹیوب ویڈیو اپلوڈ کی اجازت',
        },
        description: {
          en: 'Prepares permissions for uploading videos and Shorts in Phase 5.',
          ur: 'فیز 5 میں ویڈیوز اور شارٹس اپلوڈ کرنے کی اجازت۔',
        },
        required: true,
      },
    ],
  },
  twitter: {
    platform: 'twitter',
    name: 'X (Twitter)',
    urduName: 'ایکس (ٹوئٹر)',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    supportsPKCE: true,
    supportsRefresh: true,
    clientIdEnv: 'TWITTER_CLIENT_ID',
    clientSecretEnv: 'TWITTER_CLIENT_SECRET',
    setupGuideUrl: 'https://developer.x.com/en/portal/dashboard',
    permissions: [
      {
        key: 'users.read',
        label: {
          en: 'View Profile & Username',
          ur: 'پروفائل اور یوزر نیم دیکھنا',
        },
        description: {
          en: 'Fetch X handle (@username) and avatar for display.',
          ur: 'ایکس ہینڈل (@username) اور پروفائل تصویر دکھانے کے لیے۔',
        },
        required: true,
      },
      {
        key: 'tweet.write',
        label: {
          en: 'Post Tweets Authorization',
          ur: 'پوسٹ لکھنے اور شائع کرنے کی اجازت',
        },
        description: {
          en: 'Prepares authorization to publish posts to your X account in Phase 5.',
          ur: 'فیز 5 میں پوسٹس شائع کرنے کی پیشگی اجازت۔',
        },
        required: true,
      },
      {
        key: 'offline.access',
        label: {
          en: 'Continuous Connection (Refresh Token)',
          ur: 'مسلسل کنکشن (ریفریش ٹوکن)',
        },
        description: {
          en: 'Keeps your connection active without having to re-login every few hours.',
          ur: 'ٹوکن کو خودکار ریفریش رکھنے کے لیے تاکہ بار بار لاگ ان نہ کرنا پڑے۔',
        },
        required: true,
      },
    ],
  },
  whatsapp: {
    platform: 'whatsapp',
    name: 'WhatsApp Channels & Business',
    urduName: 'واٹس ایپ چینل و بزنس',
    authUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
    scopes: ['whatsapp_business_management', 'whatsapp_business_messaging'],
    supportsPKCE: false,
    supportsRefresh: false,
    clientIdEnv: 'WHATSAPP_CLIENT_ID',
    clientSecretEnv: 'WHATSAPP_CLIENT_SECRET',
    setupGuideUrl: 'https://business.facebook.com/wa/manage/',
    permissions: [
      {
        key: 'whatsapp_business_management',
        label: {
          en: 'WhatsApp Business Account (WABA) Access',
          ur: 'واٹس ایپ بزنس اکاؤنٹ مینجمنٹ',
        },
        description: {
          en: 'Allows connecting your official Meta WhatsApp Business account.',
          ur: 'آفیشل میٹا واٹس ایپ بزنس اکاؤنٹ کنیکٹ کرنے کے لیے۔',
        },
        required: true,
      },
      {
        key: 'whatsapp_business_messaging',
        label: {
          en: 'Channel Broadcasts & Messaging Scope',
          ur: 'چینل براڈکاسٹ اور پیغامات کا دائرہ',
        },
        description: {
          en: 'Prepares authorization for official broadcasts in Phase 5.',
          ur: 'فیز 5 میں براڈکاسٹ پیغامات کے لیے ضروری اجازت۔',
        },
        required: true,
      },
    ],
  },
};

export function getOAuthProviderConfig(platform: SocialPlatform): OAuthProviderConfig {
  return OAUTH_PROVIDERS[platform] || OAUTH_PROVIDERS.facebook;
}

export function isPlatformConfigured(platform: SocialPlatform): boolean {
  const config = getOAuthProviderConfig(platform);
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];

  if (!clientId || !clientSecret) {
    if (platform === 'instagram' || platform === 'whatsapp') {
      const fbId = process.env.FACEBOOK_CLIENT_ID;
      const fbSecret = process.env.FACEBOOK_CLIENT_SECRET;
      return Boolean(fbId && fbSecret);
    }
    return false;
  }

  return true;
}

export function getProviderCredentials(platform: SocialPlatform): {
  clientId: string;
  clientSecret: string;
} {
  const config = getOAuthProviderConfig(platform);
  let clientId = process.env[config.clientIdEnv] || '';
  let clientSecret = process.env[config.clientSecretEnv] || '';

  if ((!clientId || !clientSecret) && (platform === 'instagram' || platform === 'whatsapp')) {
    clientId = process.env.FACEBOOK_CLIENT_ID || '';
    clientSecret = process.env.FACEBOOK_CLIENT_SECRET || '';
  }

  return { clientId, clientSecret };
}
