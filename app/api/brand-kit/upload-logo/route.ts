import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const LOCAL_BRAND_KIT_PATH = path.join(process.cwd(), 'data', 'brand-kit.json');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'main';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads/brand-kit directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'brand-kit');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Determine clean filename
    const ext = path.extname(file.name) || '.png';
    const filename = `${type}_logo_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/brand-kit/${filename}`;

    // Read and update local brand-kit.json immediately
    let currentKit: any = {
      brand_name: 'Al Tanzeel Quran Academy',
      default_logo_position: 'top-right',
      default_logo_size: 'medium',
    };

    if (fs.existsSync(LOCAL_BRAND_KIT_PATH)) {
      try {
        currentKit = { ...currentKit, ...JSON.parse(fs.readFileSync(LOCAL_BRAND_KIT_PATH, 'utf-8')) };
      } catch (e) {
        console.warn('Could not parse local brand-kit.json:', e);
      }
    }

    if (type === 'main') {
      currentKit.main_logo_url = publicUrl;
    } else if (type === 'secondary') {
      currentKit.secondary_logo_url = publicUrl;
    } else if (type === 'icon') {
      currentKit.icon_logo_url = publicUrl;
    }
    currentKit.default_logo_position = currentKit.default_logo_position || 'top-right';

    const dataDir = path.dirname(LOCAL_BRAND_KIT_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_BRAND_KIT_PATH, JSON.stringify(currentKit, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      url: publicUrl,
      brandKit: currentKit,
    });
  } catch (err: unknown) {
    console.error('Error uploading brand logo:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Logo upload failed' },
      { status: 500 }
    );
  }
}
