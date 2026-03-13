import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ensureAdminUserForCode, fetchSiteConfig } from "@/lib/api";

const DEFAULT_ADMIN_CODE = "?hl%3Did<26";

export default function AdminLogin() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = await fetchSiteConfig();
      const activeCode = String((config as any)?.admin_code ?? DEFAULT_ADMIN_CODE).trim();
      const inputCode = code.trim();

      if (!activeCode || inputCode !== activeCode) {
        toast({ title: "Access denied", description: "Invalid code", variant: "destructive" });
        return;
      }

      await ensureAdminUserForCode(inputCode);
      await signIn("hugoedm.fun@portfolio.local", inputCode);

      navigate("/admin");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-70" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/3 left-1/4 w-[520px] h-[520px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-[420px] h-[420px] bg-primary/8 rounded-full blur-[100px] animate-float" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="glass-card-strong p-8 md:p-10 w-full max-w-md relative z-10 border border-primary/20"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg">CMS Access</h1>
            <p className="text-xs text-muted-foreground">Masukkan kode akses untuk masuk</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Access Code</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/70 border border-border/70 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                required
                placeholder="Masukkan kode"
                autoComplete="current-password"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading || !code.trim()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Masuk CMS <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
