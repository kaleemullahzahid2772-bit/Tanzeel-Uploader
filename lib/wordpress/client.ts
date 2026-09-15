import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import {
  WordPressSettings,
  WordPressClientSettings,
  WordPressTestResult,
  WordPressPostMatch,
  WordPressUploadResult,
} from '@/lib/types/wordpress';
import { encryptToken, decryptToken } from '@/lib/security/crypto';

// Ensure system certificate resolution in local and serverless runtime environments
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const CREDENTIALS_FILE_PATH = path.join(process.cwd(), '.wordpress-credentials.json');

/**
 * Cleans and standardizes a WordPress website URL (ensures http/https and removes trailing slash).
 */
export function sanitizeWordPressUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim().replace(/\/+$/, '');
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

/**
 * Formats standard HTTP Basic Auth header for WordPress Application Passwords.
 * Strips whitespace often present in WordPress application password keys (e.g. "abcd efgh ijkl mnop").
 */
export function getWordPressAuthHeader(username: string, applicationPassword: string): string {
  const cleanPass = applicationPassword.replace(/\s+/g, '');
  const authString = `${username.trim()}:${cleanPass}`;
  return `Basic ${Buffer.from(authString).toString('base64')}`;
}

/**
 * Cleans and standardizes a WordPress post slug or URL.
 * Extracts the slug even if the user pasted a full URL or path with slashes.
 */
export function sanitizeSlug(slugOrUrl: string): string {
  if (!slugOrUrl) return '';
  let s = slugOrUrl.trim();
  try {
    if (s.startsWith('http://') || s.startsWith('https://')) {
      const u = new URL(s);
      s = u.pathname;
    }
  } catch {
    s = s.replace(/^https?:\/\/[^\/]+/, '');
  }
  s = s.split('?')[0].split('#')[0];
  s = s.replace(/^\/+|\/+$/g, '');
  const parts = s.split('/').filter(Boolean);
  if (parts.length > 0) {
    s = parts[parts.length - 1];
  }
  try {
    s = decodeURIComponent(s);
  } catch {
    // Keep as is
  }
  return s.toLowerCase().trim();
}

/**
 * Sends an HTTP/HTTPS request with certificate bypass and timeout safety.
 */
async function wpRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: Buffer | string;
    timeoutMs?: number;
  } = {}
): Promise<{ status: number; headers: Record<string, string | string[] | undefined>; data: any; raw: string }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'http:' ? http : https;
    const method = (options.method || 'GET').toUpperCase();
    const timeoutMs = options.timeoutMs || 30000;

    const reqHeaders: Record<string, string> = {
      'User-Agent': 'Tanzeel-WordPress-Uploader/1.0 (+https://tanzeel.org)',
      Accept: 'application/json, */*',
      ...(options.headers || {}),
    };

    if (options.body && !reqHeaders['Content-Length']) {
      reqHeaders['Content-Length'] = String(Buffer.byteLength(options.body));
    }

    const req = client.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'http:' ? 80 : 443),
        path: parsedUrl.pathname + parsedUrl.search,
        method,
        rejectUnauthorized: false,
        headers: reqHeaders,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => {
          const rawBuffer = Buffer.concat(chunks);
          const rawText = rawBuffer.toString('utf8');
          let parsed: any = null;
          try {
            parsed = JSON.parse(rawText);
          } catch {
            parsed = null;
          }
          resolve({
            status: res.statusCode || 200,
            headers: res.headers,
            data: parsed,
            raw: rawText,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`WordPress request timed out after ${timeoutMs / 1000}s`));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

/**
 * Tests WordPress REST API connection using Application Password credentials.
 */
export async function testWordPressConnection(settings: WordPressSettings): Promise<WordPressTestResult> {
  const baseUrl = sanitizeWordPressUrl(settings.website_url);
  if (!baseUrl) {
    return { success: false, message: 'Invalid WordPress Website URL. Please specify a valid URL.' };
  }
  if (!settings.username || !settings.username.trim()) {
    return { success: false, message: 'WordPress username is required.' };
  }
  if (!settings.application_password || !settings.application_password.trim()) {
    return { success: false, message: 'WordPress Application Password is required.' };
  }

  const authHeader = getWordPressAuthHeader(settings.username, settings.application_password);

  try {
    // 1. Verify user identity via /wp-json/wp/v2/users/me
    const userMeUrl = `${baseUrl}/wp-json/wp/v2/users/me`;
    const userRes = await wpRequest(userMeUrl, {
      method: 'GET',
      headers: { Authorization: authHeader },
      timeoutMs: 15000,
    });

    if (userRes.status === 401 || userRes.status === 403) {
      return {
        success: false,
        message: 'WordPress authentication failed. Please check your username and Application Password.',
        error_code: 'AUTH_FAILED',
      };
    }

    if (userRes.status === 404) {
      return {
        success: false,
        message: 'WordPress REST API not found. Please ensure the REST API is enabled on your WordPress site.',
        error_code: 'REST_API_NOT_FOUND',
      };
    }

    if (userRes.status < 200 || userRes.status >= 300) {
      const errMsg = userRes.data?.message || `HTTP ${userRes.status}`;
      return {
        success: false,
        message: `Connection error: ${errMsg}`,
        error_code: String(userRes.status),
      };
    }

    const userData = userRes.data || {};
    const displayName = userData.name || userData.slug || settings.username;

    // 2. Fetch site information via root /wp-json
    let siteName = baseUrl;
    try {
      const siteRes = await wpRequest(`${baseUrl}/wp-json`, {
        method: 'GET',
        timeoutMs: 10000,
      });
      if (siteRes.status === 200 && siteRes.data?.name) {
        siteName = siteRes.data.name;
      }
    } catch {
      // Non-critical, fallback to URL
    }

    return {
      success: true,
      message: 'WordPress Connected Successfully',
      user_display_name: displayName,
      site_name: siteName,
      site_url: baseUrl,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('getaddrinfo')) {
      return { success: false, message: 'Could not resolve WordPress hostname. Please check your URL.' };
    }
    if (errorMsg.includes('ECONNREFUSED')) {
      return { success: false, message: 'Connection refused by server. Please check if your WordPress site is online.' };
    }
    if (errorMsg.includes('timed out')) {
      return { success: false, message: 'Connection to WordPress timed out. Please try again.' };
    }
    return { success: false, message: `Unable to connect to WordPress: ${errorMsg}` };
  }
}

/**
 * Searches for a post in WordPress by its slug.
 * Checks posts first, then pages if not found.
 */
export async function findPostBySlug(settings: WordPressSettings, slug: string): Promise<WordPressPostMatch> {
  const baseUrl = sanitizeWordPressUrl(settings.website_url);
  if (!baseUrl || !settings.username || !settings.application_password) {
    return { found: false, message: 'WordPress credentials not configured.' };
  }

  const cleanSlug = sanitizeSlug(slug);
  if (!cleanSlug) {
    return { found: false, message: 'Slug cannot be empty.' };
  }

  const authHeader = getWordPressAuthHeader(settings.username, settings.application_password);

  try {
    // 1. Search in /wp-json/wp/v2/posts
    const postsUrl = `${baseUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(cleanSlug)}&_fields=id,title,slug,link,featured_media`;
    const postRes = await wpRequest(postsUrl, {
      method: 'GET',
      headers: { Authorization: authHeader },
      timeoutMs: 20000,
    });

    if (postRes.status === 200 && Array.isArray(postRes.data) && postRes.data.length > 0) {
      const post = postRes.data[0];
      const featuredMediaId = Number(post.featured_media) || 0;
      let existingMediaUrl: string | null = null;

      if (featuredMediaId > 0) {
        try {
          const mediaRes = await wpRequest(`${baseUrl}/wp-json/wp/v2/media/${featuredMediaId}?_fields=id,source_url`, {
            method: 'GET',
            headers: { Authorization: authHeader },
            timeoutMs: 10000,
          });
          if (mediaRes.status === 200 && mediaRes.data?.source_url) {
            existingMediaUrl = mediaRes.data.source_url;
          }
        } catch {
          // Non-critical
        }
      }

      return {
        found: true,
        post_id: post.id,
        post_title: typeof post.title?.rendered === 'string' ? post.title.rendered : cleanSlug,
        post_slug: post.slug,
        post_url: post.link,
        post_type: 'post',
        has_existing_featured_image: featuredMediaId > 0,
        existing_media_id: featuredMediaId > 0 ? featuredMediaId : undefined,
        existing_media_url: existingMediaUrl,
      };
    }

    // 2. Fallback: Search in /wp-json/wp/v2/pages
    const pagesUrl = `${baseUrl}/wp-json/wp/v2/pages?slug=${encodeURIComponent(cleanSlug)}&_fields=id,title,slug,link,featured_media`;
    const pageRes = await wpRequest(pagesUrl, {
      method: 'GET',
      headers: { Authorization: authHeader },
      timeoutMs: 15000,
    });

    if (pageRes.status === 200 && Array.isArray(pageRes.data) && pageRes.data.length > 0) {
      const page = pageRes.data[0];
      const featuredMediaId = Number(page.featured_media) || 0;

      return {
        found: true,
        post_id: page.id,
        post_title: typeof page.title?.rendered === 'string' ? page.title.rendered : cleanSlug,
        post_slug: page.slug,
        post_url: page.link,
        post_type: 'page',
        has_existing_featured_image: featuredMediaId > 0,
        existing_media_id: featuredMediaId > 0 ? featuredMediaId : undefined,
      };
    }

    return {
      found: false,
      message: `No WordPress post or page was found with the slug "${cleanSlug}".`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { found: false, message: `Failed to search WordPress posts: ${msg}` };
  }
}

/**
 * Uploads an image buffer to WordPress Media Library.
 * Sets filename as ${slug}.png or ${slug}.webp with SEO-friendly title.
 */
export async function uploadMediaToWordPress(
  settings: WordPressSettings,
  imageBuffer: Buffer,
  filename: string,
  mimeType: string = 'image/png',
  title?: string
): Promise<{ id: number; source_url: string; title: string }> {
  const baseUrl = sanitizeWordPressUrl(settings.website_url);
  if (!baseUrl || !settings.username || !settings.application_password) {
    throw new Error('WordPress credentials not configured.');
  }

  const authHeader = getWordPressAuthHeader(settings.username, settings.application_password);
  const mediaEndpoint = `${baseUrl}/wp-json/wp/v2/media`;

  const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
  const headers: Record<string, string> = {
    Authorization: authHeader,
    'Content-Disposition': `attachment; filename="${cleanFilename}"`,
    'Content-Type': mimeType,
  };

  const res = await wpRequest(mediaEndpoint, {
    method: 'POST',
    headers,
    body: imageBuffer,
    timeoutMs: 60000,
  });

  if (res.status === 201 && res.data?.id) {
    const mediaId = res.data.id;
    const sourceUrl = res.data.source_url || '';

    // If title provided, update media title and alt text for SEO
    if (title && title.trim()) {
      try {
        await wpRequest(`${baseUrl}/wp-json/wp/v2/media/${mediaId}`, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            alt_text: title.trim(),
            description: `${title.trim()} - Generated with Tanzeel Thumbnail Studio`,
          }),
          timeoutMs: 10000,
        });
      } catch {
        // Non-critical
      }
    }

    return {
      id: mediaId,
      source_url: sourceUrl,
      title: title || cleanFilename,
    };
  }

  const errMsg = res.data?.message || res.raw.slice(0, 200) || `HTTP ${res.status}`;
  throw new Error(`Image upload failed: ${errMsg}`);
}

/**
 * Sets the featured_media property on a WordPress post or page.
 */
export async function setPostFeaturedImage(
  settings: WordPressSettings,
  postId: number,
  mediaId: number,
  postType: 'post' | 'page' = 'post'
): Promise<{ success: boolean; post_id: number; featured_media: number }> {
  const baseUrl = sanitizeWordPressUrl(settings.website_url);
  if (!baseUrl || !settings.username || !settings.application_password) {
    throw new Error('WordPress credentials not configured.');
  }

  const authHeader = getWordPressAuthHeader(settings.username, settings.application_password);
  const endpoint = postType === 'page'
    ? `${baseUrl}/wp-json/wp/v2/pages/${postId}`
    : `${baseUrl}/wp-json/wp/v2/posts/${postId}`;

  const res = await wpRequest(endpoint, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      featured_media: mediaId,
    }),
    timeoutMs: 20000,
  });

  if (res.status === 200 && res.data?.id) {
    return {
      success: true,
      post_id: res.data.id,
      featured_media: res.data.featured_media || mediaId,
    };
  }

  const errMsg = res.data?.message || `HTTP ${res.status}`;
  throw new Error(`Failed to set featured image on post #${postId}: ${errMsg}`);
}

/**
 * Full End-to-End Orchestrator: Finds post by slug, uploads media, and sets featured image.
 */
export async function uploadAndSetFeaturedImage(
  settings: WordPressSettings,
  imageBuffer: Buffer,
  slug: string,
  postTitle?: string,
  mimeType: string = 'image/png'
): Promise<WordPressUploadResult> {
  const cleanSlug = slug.trim().toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
  const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png';
  const filename = `${cleanSlug}.${ext}`;

  // 1. Search post by slug
  const match = await findPostBySlug(settings, cleanSlug);

  // 2. Upload media to WordPress
  const uploaded = await uploadMediaToWordPress(settings, imageBuffer, filename, mimeType, postTitle);

  // 3. If post found, set as featured image
  let featuredUpdated = false;
  let postUrl = uploaded.source_url;
  let resolvedPostTitle = postTitle || cleanSlug;
  let resolvedPostId = uploaded.id;

  if (match.found && match.post_id) {
    await setPostFeaturedImage(settings, match.post_id, uploaded.id, match.post_type || 'post');
    featuredUpdated = true;
    resolvedPostId = match.post_id;
    resolvedPostTitle = match.post_title || postTitle || cleanSlug;
    postUrl = match.post_url || uploaded.source_url;
  }

  return {
    success: true,
    media_id: uploaded.id,
    media_url: uploaded.source_url,
    post_id: match.found ? resolvedPostId : undefined,
    post_title: resolvedPostTitle,
    post_url: postUrl,
    featured_media_updated: featuredUpdated,
    message: match.found
      ? `Featured image successfully updated for post "${resolvedPostTitle}".`
      : `Image uploaded to WordPress Media Library (No post matched slug "${cleanSlug}").`,
  };
}

/**
 * Server-side Credential Storage: Retrieves stored WordPress settings.
 * Checks environment variables first, then server-side encrypted credentials store.
 */
export async function getStoredWordPressSettings(): Promise<WordPressSettings | null> {
  const envUrl = process.env.WORDPRESS_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
  const envUser = process.env.WORDPRESS_USERNAME || process.env.WORDPRESS_USER;
  const envPass = process.env.WORDPRESS_APP_PASSWORD || process.env.WORDPRESS_PASSWORD;

  // Check Server-Side Encrypted File Store
  const fileSettings: Partial<WordPressSettings> = {};
  try {
    if (fs.existsSync(CREDENTIALS_FILE_PATH)) {
      const content = fs.readFileSync(CREDENTIALS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed.website_url) {
        fileSettings.website_url = sanitizeWordPressUrl(parsed.website_url);
      }
      if (parsed.username) {
        fileSettings.username = parsed.username.trim();
      }
      if (parsed.encrypted_password) {
        try {
          fileSettings.application_password = decryptToken(parsed.encrypted_password);
        } catch {
          // ignore decrypt errors
        }
      }
      fileSettings.is_connected = Boolean(parsed.is_connected);
      fileSettings.last_tested_at = parsed.last_tested_at || null;
    }
  } catch (err) {
    console.warn('[WordPress Storage] Failed to read encrypted credentials file:', err);
  }

  const effectiveUrl = (envUrl && envUrl.trim()) || fileSettings.website_url;
  const effectiveUser = (envUser && envUser.trim()) || fileSettings.username;
  const effectivePass = (envPass && envPass.trim()) || fileSettings.application_password;

  if (effectiveUrl && effectiveUser && effectivePass) {
    return {
      website_url: sanitizeWordPressUrl(effectiveUrl),
      username: effectiveUser.trim(),
      application_password: effectivePass.trim(),
      is_connected: Boolean(fileSettings.is_connected || (envUrl && envUser && envPass)),
      last_tested_at: fileSettings.last_tested_at || null,
    };
  }

  return null;
}

/**
 * Server-side Credential Storage: Encrypts and persists WordPress settings.
 */
export async function saveStoredWordPressSettings(settings: {
  website_url: string;
  username: string;
  application_password?: string;
  is_connected?: boolean;
}): Promise<void> {
  const existing = await getStoredWordPressSettings();
  const passToSave = settings.application_password && settings.application_password.trim().length > 0
    ? settings.application_password.trim()
    : existing?.application_password || '';

  if (!passToSave) {
    throw new Error('Application Password is required to save WordPress settings.');
  }

  const encryptedPass = encryptToken(passToSave);

  const payload = {
    website_url: sanitizeWordPressUrl(settings.website_url),
    username: settings.username.trim(),
    encrypted_password: encryptedPass,
    is_connected: Boolean(settings.is_connected),
    last_tested_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  fs.writeFileSync(CREDENTIALS_FILE_PATH, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
}

/**
 * Returns safe client-facing settings (Application Password is NEVER exposed).
 */
export async function getClientSafeWordPressSettings(): Promise<WordPressClientSettings> {
  const envUrl = process.env.WORDPRESS_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
  const envUser = process.env.WORDPRESS_USERNAME || process.env.WORDPRESS_USER;
  const envPass = process.env.WORDPRESS_APP_PASSWORD || process.env.WORDPRESS_PASSWORD;

  const stored = await getStoredWordPressSettings();

  const websiteUrl = stored?.website_url || (envUrl && envUrl.trim()) || '';
  const username = stored?.username || (envUser && envUser.trim()) || '';
  const hasPassword = Boolean(stored?.application_password || (envPass && envPass.trim()));

  return {
    website_url: websiteUrl,
    username: username,
    is_configured: Boolean(websiteUrl && username && hasPassword),
    has_password: hasPassword,
    is_connected: Boolean(stored?.is_connected),
    last_tested_at: stored?.last_tested_at || null,
  };
}
