import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/portfolio/Navbar";
import TasksSection from "@/components/portfolio/TasksSection";
import { fetchTasks, fetchSiteConfig } from "@/lib/api";

export default function Assignments() {
  const { data: tasks } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });
  const { data: config } = useQuery({ queryKey: ["site-config"], queryFn: fetchSiteConfig });

  return (
    <div className="min-h-screen bg-background relative noise-overlay">
      <Navbar />
      <div className="pt-20">
        <TasksSection tasks={tasks ?? []} />
      </div>
      <div className="section-divider" />
      <footer className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {config?.site_name ?? "Portfolio"}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
