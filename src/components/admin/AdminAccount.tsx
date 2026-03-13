import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, EyeOff, Key, ShieldCheck } from "lucide-react";
import { fetchSiteConfig, updateSiteConfig } from "@/lib/api";

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
      <div className="glass-card p-5 md:p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Account Security</h2>
        </div>
        <p className="text-sm text-muted-foreground">Kelola access code CMS. Kode ini dipakai untuk login admin.</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Key className="w-4 h-4" /> Current Access Code
        </h3>
        <div className="flex items-center gap-2">
          <input
            type={showCode ? "text" : "password"}
            value={currentCode}
            readOnly
            className="flex-1 px-3 py-2 rounded-lg bg-secondary/70 border border-border text-sm font-mono"
          />
          <button
            onClick={() => setShowCode(!showCode)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle access code visibility"
          >
            {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Key className="w-4 h-4" /> Change Access Code
        </h3>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">New Code</label>
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-secondary/70 border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Enter new code..."
          />
        </div>
        <button
          onClick={handleUpdateCode}
          disabled={saving || !newCode.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "Updating..." : "Update Code"}
        </button>
      </div>
    </div>
  );
}
