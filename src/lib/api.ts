import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type SiteConfig = Tables<"site_config">;
export type Project = Tables<"projects">;
export type Skill = Tables<"skills">;
export type GalleryItem = Tables<"gallery">;
export type Task = Tables<"tasks">;
export type Education = Tables<"education">;
export type Experience = Tables<"experience">;
export type BlogPost = Tables<"blog_posts">;

export async function fetchSiteConfig() {
  const { data, error } = await supabase.from("site_config").select("*").limit(1).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateSiteConfig(updates: TablesUpdate<"site_config">) {
  const existing = await fetchSiteConfig();
  if (existing) {
    const { data, error } = await supabase.from("site_config").update(updates).eq("id", existing.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("site_config").insert(updates as TablesInsert<"site_config">).select().single();
  if (error) throw error;
  return data;
}

export async function fetchProjects() {
  const { data, error } = await supabase.from("projects").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function fetchFeaturedProjects() {
  const { data, error } = await supabase.from("projects").select("*").eq("featured", true).order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function upsertProject(project: TablesInsert<"projects"> & { id?: string }) {
  if (project.id) {
    const { id, ...rest } = project;
    const { data, error } = await supabase.from("projects").update(rest as TablesUpdate<"projects">).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("projects").insert(project).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchSkills() {
  const { data, error } = await supabase.from("skills").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function upsertSkill(skill: TablesInsert<"skills"> & { id?: string }) {
  if (skill.id) {
    const { id, ...rest } = skill;
    const { data, error } = await supabase.from("skills").update(rest as TablesUpdate<"skills">).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("skills").insert(skill).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSkill(id: string) {
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchGallery() {
  const { data, error } = await supabase.from("gallery").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function upsertGalleryItem(item: TablesInsert<"gallery"> & { id?: string }) {
  if (item.id) {
    const { id, ...rest } = item;
    const { data, error } = await supabase.from("gallery").update(rest as TablesUpdate<"gallery">).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("gallery").insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGalleryItem(id: string) {
  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchTasks() {
  const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertTask(task: TablesInsert<"tasks"> & { id?: string }) {
  if (task.id) {
    const { id, ...rest } = task;
    const { data, error } = await supabase.from("tasks").update(rest as TablesUpdate<"tasks">).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("tasks").insert(task).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchEducation() {
  const { data, error } = await supabase.from("education").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function upsertEducation(edu: TablesInsert<"education"> & { id?: string }) {
  if (edu.id) {
    const { id, ...rest } = edu;
    const { data, error } = await supabase.from("education").update(rest as TablesUpdate<"education">).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("education").insert(edu).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEducation(id: string) {
  const { error } = await supabase.from("education").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchExperience() {
  const { data, error } = await supabase.from("experience").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function upsertExperience(exp: TablesInsert<"experience"> & { id?: string }) {
  if (exp.id) {
    const { id, ...rest } = exp;
    const { data, error } = await supabase.from("experience").update(rest as TablesUpdate<"experience">).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("experience").insert(exp).select().single();
  if (error) throw error;
  return data;
}

export async function deleteExperience(id: string) {
  const { error } = await supabase.from("experience").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchBlogPosts(publishedOnly = true) {
  let query = supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
  if (publishedOnly) query = query.eq("published", true);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function upsertBlogPost(post: TablesInsert<"blog_posts"> & { id?: string }) {
  if (post.id) {
    const { id, ...rest } = post;
    const { data, error } = await supabase.from("blog_posts").update(rest as TablesUpdate<"blog_posts">).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("blog_posts").insert(post).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBlogPost(id: string) {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadMedia(file: File, path: string) {
  const { data, error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("media").getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function checkIsAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
  return !!data;
}
