export interface SiteConfig {
  id: string;
  site_name: string;
  description: string | null;
  github_username: string | null;
  favicon_url: string | null;
  cv_url: string | null;
  hero_name: string | null;
  hero_headline: string | null;
  hero_photo_url: string | null;
  about_text: string | null;
  marketplace_cta_text: string;
  marketplace_cta_url: string;
  bg_day_url: string | null;
  bg_night_url: string | null;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  tech_stack: string[] | null;
  live_demo_url: string | null;
  github_url: string | null;
  screenshot_url: string | null;
  featured: boolean | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  icon: string | null;
  sort_order: number | null;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  github_repo: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  institution: string;
  education_type: string | null;
  program_name: string | null;
  provider: string | null;
  duration: string | null;
  degree: string | null;
  field_of_study: string | null;
  year: string | null;
  start_date: string | null;
  end_date: string | null;
  expected_graduation: string | null;
  location: string | null;
  logo_url: string | null;
  certificate_url: string | null;
  credential_id: string | null;
  activities: string | null;
  topics: string | null;
  achievements: string | null;
  projects_url: string | null;
  status: string | null;
  sort_order: number | null;
  created_at: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string | null;
  duration: string | null;
  description: string | null;
  logo_url: string | null;
  employment_type: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  responsibilities: string | null;
  achievements: string | null;
  technologies: string[] | null;
  reference_contact: string | null;
  attachment_url: string | null;
  status: string | null;
  is_current: boolean | null;
  sort_order: number | null;
  created_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  sort_order: number | null;
  created_at: string;
}
