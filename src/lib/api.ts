import type {
  Education,
  Experience,
  GalleryItem,
  Project,
  SiteConfig,
  Skill,
  SocialLink,
  Task,
} from "@/lib/types";

export type { Education, Experience, GalleryItem, Project, SiteConfig, Skill, SocialLink, Task };

/**
 * `VITE_API_URL` sengaja boleh dikosongkan di production karena frontend dan API
 *BERBAGIAN origin (Vercel rewrite /api/*). Karena itu fallback-nya pakai `||`,
 * bukan `??`: env yang dikosongkan jadi string kosong, bukan undefined.
 */
const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
const TOKEN_KEY = "hugoedm_admin_token";

type Doc = Record<string, unknown> & { _id?: string };

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** MongoDB memakai `_id`, layer UI lebih nyaman pakai `id` */
function normalize<T>(doc: Doc | null): T | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id, ...rest } as T;
}

function normalizeMany<T>(docs: Doc[]): T[] {
  return docs.map((doc) => normalize<T>(doc) as T);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && token) {
    setToken(null);
    throw new Error("Sesi berakhir, login ulang");
  }

  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error ?? `Request failed (${res.status})`);
  return payload as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });
const put = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "PUT", body: JSON.stringify(body) });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

/* ── Auth ─────────────────────────────────────────────────── */

export async function loginWithCode(code: string) {
  const res = await post<{ token: string; user: { role: string; site_name?: string } }>("/auth/login", {
    code: code.trim(),
  });
  setToken(res.token);
  return res;
}

export interface AccessCodeStatus {
  configured: boolean;
  hashed: boolean;
}

/** Kode akses tidak pernah dikirim ulang; API hanya melaporkan statusnya. */
export async function fetchAccessCodeStatus(): Promise<AccessCodeStatus> {
  return get<AccessCodeStatus>("/auth/code");
}

export async function updateAccessCode(code: string) {
  return put<{ ok: boolean }>("/auth/code", { code: code.trim() });
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    await get<{ user: { role: string } }>("/auth/me");
    return true;
  } catch {
    return false;
  }
}

/* ── Site config ──────────────────────────────────────────── */

export async function fetchSiteConfig(): Promise<SiteConfig | null> {
  return normalize<SiteConfig>(await get<Doc>("/site-config"));
}

export async function updateSiteConfig(updates: Partial<SiteConfig>) {
  return normalize<SiteConfig>(await put<Doc>("/site-config", updates));
}

/* ── Collections ──────────────────────────────────────────── */

type Collection<T> = { path: string };

function createCollectionApi<T>({ path }: Collection<T>) {
  return {
    list: async () => normalizeMany<T>(await get<Doc[]>(path)),
    create: async (payload: Partial<T>) => normalize<T>(await post<Doc>(path, payload)),
    update: async (id: string, payload: Partial<T>) => normalize<T>(await put<Doc>(`${path}/${id}`, payload)),
    remove: async (id: string) => del<{ ok: boolean }>(`${path}/${id}`),
    /** create kalau `id` kosong, update kalau ada (setara upsert lama) */
    save: async (payload: Partial<T> & { id?: string }) =>
      payload.id
        ? normalize<T>(await put<Doc>(`${path}/${payload.id}`, payload))
        : normalize<T>(await post<Doc>(path, payload)),
  };
}

const projectsApi = createCollectionApi<Project>({ path: "/projects" });
const skillsApi = createCollectionApi<Skill>({ path: "/skills" });
const galleryApi = createCollectionApi<GalleryItem>({ path: "/gallery" });
const tasksApi = createCollectionApi<Task>({ path: "/tasks" });
const educationApi = createCollectionApi<Education>({ path: "/education" });
const experienceApi = createCollectionApi<Experience>({ path: "/experience" });
const socialApi = createCollectionApi<SocialLink>({ path: "/social-links" });

export const fetchProjects = projectsApi.list;
export const upsertProject = projectsApi.save;
export const deleteProject = projectsApi.remove;

export const fetchSkills = skillsApi.list;
export const upsertSkill = skillsApi.save;
export const deleteSkill = skillsApi.remove;

export const fetchGallery = galleryApi.list;
export const upsertGalleryItem = galleryApi.save;
export const deleteGalleryItem = galleryApi.remove;

export const fetchTasks = tasksApi.list;
export const upsertTask = tasksApi.save;
export const deleteTask = tasksApi.remove;

export const fetchEducation = educationApi.list;
export const upsertEducation = educationApi.save;
export const deleteEducation = educationApi.remove;

export const fetchExperience = experienceApi.list;
export const upsertExperience = experienceApi.save;
export const deleteExperience = experienceApi.remove;

export const fetchSocialLinks = socialApi.list;
export const upsertSocialLink = socialApi.save;
export const deleteSocialLink = socialApi.remove;

/* ── Media ────────────────────────────────────────────────── */

export async function uploadMedia(file: File, _path?: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await request<{ url: string }>("/upload", { method: "POST", body: form });
  return res.url;
}
