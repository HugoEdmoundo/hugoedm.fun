import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, EyeOff, Key, ShieldCheck } from "lucide-react";
import { fetchSiteConfig, updateSiteConfig } from "@/lib/api";
import { motion } from "framer-motion";

export default function AdminAccount() {
  const { toast } = useToast();
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteConfig().then((config) => {
      if ((config as any)?.admin_code) setCurrentCode((config as any).admin_code);
    });
  }, []);

  const handleUpdateCode = async () => {
    if (!newCode.trim()) return;
    setSaving(true);
    try {
      const nextCode = newCode.trim();
      const { error: authError } = await supabase.auth.updateUser({ password: nextCode });
      if (authError) throw authError;
      await updateSiteConfig({ admin_code: nextCode } as any);
      setCurrentCode(nextCode);
      setNewCode("");
      toast({ title: "Access code updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Account Security</h2>
          <p className="text-xs text-muted-foreground">Kelola access code CMS</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 md:p-6 space-y-4 border border-border/30"
      >
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" /> Current Access Code
        </h3>
        <div className="flex items-center gap-2">
          <input
            type={showCode ? "text" : "password"}
            value={currentCode}
            readOnly
            className="flex-1 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm font-mono"
          />
          <button
            onClick={() => setShowCode(!showCode)}
            className="p-2.5 rounded-xl hover:bg-secondary/50 text-muted-foreground transition-colors"
          >
            {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 md:p-6 space-y-4 border border-border/30"
      >
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" /> Change Access Code
        </h3>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">New Code</label>
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            placeholder="Enter new code..."
          />
        </div>
        <button
          onClick={handleUpdateCode}
          disabled={saving || !newCode.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" /> {saving ? "Updating..." : "Update Code"}
        </button>
      </motion.div>
    </div>
  );
}
