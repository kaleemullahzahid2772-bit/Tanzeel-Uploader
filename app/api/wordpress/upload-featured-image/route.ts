import { NextRequest, NextResponse } from 'next/server';
import {
  getStoredWordPressSettings,
  uploadAndSetFeaturedImage,
  uploadMediaToWordPress,
  findPostBySlug,
  setPostFeaturedImage,
  sanitizeSlug,
} from '@/lib/wordpress/client';

export const dynamic = 'force-dynamic';

/**
 * POST: Uploads thumbnail image to WordPress Media Library and sets as post's Featured Image.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imageBase64 = body.imageBase64 || body.image_base64 || body.image;
    const rawSlug = body.slug || body.post_slug;
    const postTitle = (body.postTitle || body.post_title || body.title || '').trim();
    const rawPostId = body.postId ?? body.post_id;
    const postId = rawPostId && !isNaN(Number(rawPostId)) ? Number(rawPostId) : undefined;
    const rawFormat = (body.mimeType || body.image_format || body.format || 'image/png').toLowerCase();
    const mimeType = rawFormat.includes('/')
      ? rawFormat
      : rawFormat === 'jpg' || rawFormat === 'jpeg'
      ? 'image/jpeg'
      : rawFormat === 'webp'
      ? 'image/webp'
      : 'image/png';
    const allowUploadWithoutPost = Boolean(body.allowUploadWithoutPost || body.allow_upload_without_post);

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Image data is required for upload.' },
        { status: 400 }
      );
    }

    if (!rawSlug || typeof rawSlug !== 'string' || !rawSlug.trim()) {
      return NextResponse.json(
        { success: false, message: 'Blog slug is required for WordPress upload.' },
        { status: 400 }
      );
    }

    const cleanSlug = sanitizeSlug(rawSlug);
    if (!cleanSlug) {
      return NextResponse.json(
        { success: false, message: 'A valid blog slug or URL is required.' },
        { status: 400 }
      );
    }

    const settings = await getStoredWordPressSettings();
    if (!settings || !settings.website_url || !settings.username || !settings.application_password) {
      return NextResponse.json(
        {
          success: false,
          message: 'WordPress settings are not configured. Please configure your WordPress site first in Settings.',
          needs_configuration: true,
        },
        { status: 400 }
      );
    }

    // Convert Base64 (stripping potential Data URL prefix) to binary Buffer
    const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    if (imageBuffer.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or empty image buffer received.' },
        { status: 400 }
      );
    }

    const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png';
    const filename = `${cleanSlug}.${ext}`;

    // If specific postId already provided from previous step:
    if (postId && Number(postId) > 0) {
      const uploadedMedia = await uploadMediaToWordPress(
        settings,
        imageBuffer,
        filename,
        mimeType,
        postTitle || cleanSlug
      );

      await setPostFeaturedImage(settings, Number(postId), uploadedMedia.id);

      return NextResponse.json({
        success: true,
        media_id: uploadedMedia.id,
        media_url: uploadedMedia.source_url,
        post_id: Number(postId),
        post_title: postTitle || cleanSlug,
        featured_media_updated: true,
        message: `Successfully uploaded and set Featured Image on post #${postId}!`,
      });
    }

    // Otherwise, perform full search and upload workflow
    const match = await findPostBySlug(settings, cleanSlug);

    if (!match.found && !allowUploadWithoutPost) {
      return NextResponse.json({
        success: false,
        post_not_found: true,
        slug: cleanSlug,
        message: `No WordPress post was found with the slug "${cleanSlug}".`,
      });
    }

    const result = await uploadAndSetFeaturedImage(
      settings,
      imageBuffer,
      cleanSlug,
      postTitle,
      mimeType
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Error uploading thumbnail to WordPress:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        message: `WordPress upload failed: ${msg}`,
      },
      { status: 500 }
    );
  }
}
