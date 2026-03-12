import { motion, useScroll, useTransform } from "framer-motion";
import { Star, GitFork, ExternalLink } from "lucide-react";
import { useGitHubRepos } from "@/lib/github";
import { useRef } from "react";

interface GitHubSectionProps {
  username: string | undefined;
}

export default function GitHubSection({ username }: GitHubSectionProps) {
  const { data: repos, isLoading } = useGitHubRepos(username);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  if (!username || isLoading) return null;
  if (!repos || repos.length === 0) return null;

  return (
    <section id="github" ref={ref} className="section-padding relative overflow-hidden">
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-primary/4 rounded-full blur-[100px]" />
      </motion.div>

      <div className="section-divider mb-24" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-sm font-mono text-primary tracking-[0.3em] uppercase mb-4">Open Source</h2>
          <p className="text-3xl md:text-4xl font-bold mb-14">Latest GitHub Repos</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {repos.map((repo, i) => (
            <motion.a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass-card p-6 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors font-mono">
                  {repo.name}
                </h3>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {repo.description && (
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{repo.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {repo.language && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
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
