import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, EyeOff, Key } from "lucide-react";
import { fetchSiteConfig, updateSiteConfig } from "@/lib/api";

export default function AdminAccount() {
  const { toast } = useToast();
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteConfig().then((config) => {
      if (config?.admin_code) setCurrentCode(config.admin_code);
    });
  }, []);

  const handleUpdateCode = async () => {
    if (!newCode) return;
    setSaving(true);
    try {
      // Update password in auth
      const { error: authError } = await supabase.auth.updateUser({ password: newCode });
      if (authError) throw authError;

      // Update code in site_config
      await updateSiteConfig({ admin_code: newCode } as any);

      setCurrentCode(newCode);
      setNewCode("");
      toast({ title: "Code updated!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Account Settings</h2>

      <div className="space-y-6">
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Key className="w-4 h-4" /> Current Access Code
          </h3>
          <div className="flex items-center gap-2">
            <input
              type={showCode ? "text" : "password"}
              value={currentCode}
              readOnly
              className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm font-mono"
            />
            <button
              onClick={() => setShowCode(!showCode)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
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
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter new code..."
            />
          </div>
          <button
            onClick={handleUpdateCode}
            disabled={saving || !newCode}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Update Code
          </button>
        </div>
      </div>
    </div>
  );
}
