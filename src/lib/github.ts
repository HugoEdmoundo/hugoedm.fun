import { useQuery } from "@tanstack/react-query";

const GITHUB_API = "https://api.github.com";

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
}

export function useGitHubRepos(username: string | undefined) {
  return useQuery<GitHubRepo[]>({
    queryKey: ["github-repos", username],
    queryFn: async () => {
      if (!username) return [];
      const res = await fetch(`${GITHUB_API}/users/${username}/repos?sort=updated&per_page=10`);
      if (!res.ok) throw new Error("Failed to fetch repos");
      return res.json();
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });
}
