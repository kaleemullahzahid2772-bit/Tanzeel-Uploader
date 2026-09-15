export interface WordPressSettings {
  id?: string;
  user_id?: string;
  website_url: string;
  username: string;
  application_password?: string;
  is_connected?: boolean;
  last_tested_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WordPressClientSettings {
  website_url: string;
  username: string;
  is_configured: boolean;
  has_password: boolean;
  is_connected?: boolean;
  last_tested_at?: string | null;
}

export interface WordPressTestResult {
  success: boolean;
  message: string;
  user_display_name?: string;
  site_name?: string;
  site_url?: string;
  error_code?: string;
}

export interface WordPressPostMatch {
  found: boolean;
  post_id?: number;
  post_title?: string;
  post_slug?: string;
  post_url?: string;
  post_type?: 'post' | 'page';
  has_existing_featured_image?: boolean;
  existing_media_id?: number;
  existing_media_url?: string | null;
  message?: string;
}

export interface WordPressUploadResult {
  success: boolean;
  media_id?: number;
  media_url?: string;
  post_id?: number;
  post_title?: string;
  post_url?: string;
  featured_media_updated?: boolean;
  message: string;
}
