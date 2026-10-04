import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, Key, ShieldCheck, ShieldAlert } from "lucide-react";
import { fetchAccessCodeStatus, updateAccessCode } from "@/lib/api";
import { motion } from "framer-motion";

export default function AdminAccount() {
  const { toast } = useToast();
  const [status, setStatus] = useState<{ configured: boolean; hashed: boolean } | null>(null);
  const [newCode, setNewCode] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAccessCodeStatus()
      .then(setStatus)
      .catch((err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }));
  }, [toast]);

  const handleUpdateCode = async () => {
    if (newCode.trim().length < 8) {
      toast({ title: "Terlalu pendek", description: "Access code minimal 8 karakter", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await updateAccessCode(newCode.trim());
      setNewCode("");
      setStatus({ configured: true, hashed: true });
      toast({ title: "Access code diperbarui" });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Gagal update", variant: "destructive" });
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
        className="glass-card p-5 md:p-6 space-y-3 border border-border/30"
      >
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" /> Current Access Code
        </h3>
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="flex-1 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/30 tracking-widest select-none">
            ••••••••••••
          </span>
          <span
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border ${
              status?.hashed
                ? "text-primary border-primary/30 bg-primary/10"
                : "text-amber-500 border-amber-500/30 bg-amber-500/10"
            }`}
          >
            {status?.hashed ? "bcrypt hash" : "belum di-hash"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Kode disimpan sebagai hash bcrypt di database dan tidak bisa dibaca kembali dari API. Kalau lupa, set ulang
          <span className="font-mono"> ADMIN_CODE</span> lalu jalankan ulang seed.
        </p>
        {status && !status.hashed && (
          <p className="text-xs text-amber-500 flex items-start gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            Kode lama masih plaintext — akan otomatis di-upgrade ke hash saat login berikutnya berhasil.
          </p>
        )}
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
            placeholder="Minimal 8 karakter..."
            autoComplete="new-password"
          />
        </div>
        <button
          onClick={handleUpdateCode}
          disabled={saving || newCode.trim().length < 8}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" /> {saving ? "Updating..." : "Update Code"}
        </button>
      </motion.div>
    </div>
  );
}
