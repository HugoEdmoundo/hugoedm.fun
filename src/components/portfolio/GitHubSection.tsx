import { motion } from "framer-motion";
import { Star, GitFork, ExternalLink } from "lucide-react";
import { useGitHubRepos } from "@/lib/github";

interface GitHubSectionProps {
  username: string | undefined;
}

export default function GitHubSection({ username }: GitHubSectionProps) {
  const { data: repos, isLoading } = useGitHubRepos(username);

  if (!username || isLoading) return null;
  if (!repos || repos.length === 0) return null;

  return (
    <section id="github" className="section-padding">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-sm font-mono text-primary tracking-widest uppercase mb-4">Open Source</h2>
          <p className="text-3xl font-bold mb-12">Latest GitHub Repos</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {repos.map((repo, i) => (
            <motion.a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 hover-lift group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors font-mono">
                  {repo.name}
                </h3>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {repo.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{repo.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  {repo.forks_count}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
