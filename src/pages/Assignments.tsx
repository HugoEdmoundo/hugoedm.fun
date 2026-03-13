import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/components/portfolio/Navbar";
import TasksSection from "@/components/portfolio/TasksSection";
import { fetchTasks, fetchSiteConfig } from "@/lib/api";

export default function Assignments() {
  const { data: tasks } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });
  const { data: config } = useQuery({ queryKey: ["site-config"], queryFn: fetchSiteConfig });

  return (
    <div className="min-h-screen bg-background relative noise-overlay overflow-hidden">
      <Navbar />

      <div className="absolute inset-0 bg-mesh opacity-70 pointer-events-none" />
      <div className="absolute top-24 left-1/3 w-[460px] h-[460px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="pt-24 relative z-10">
        <section className="px-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto glass-card p-6 md:p-8"
          >
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Assignments</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">Semua tugas terkumpul di halaman terpisah dengan tampilan fokus dan rapi.</p>
          </motion.div>
        </section>

        <TasksSection tasks={tasks ?? []} />
      </main>

      <div className="section-divider" />
      <footer className="py-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {config?.site_name ?? "Portfolio"}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
