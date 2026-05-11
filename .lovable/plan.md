# Rapihin Skills, Achievements & Gallery

## 1. Skills (Stack.config) — Soft Skills tetap, Achievements dihapus

File: `src/components/admin/AdminSkills.tsx`

- **Tetap**: kategori `Soft Skills` (60+ entries) di `PREDEFINED_SKILLS` — masuk wajar di Stack.config karena masih representasi kemampuan.
- **Hapus**: semua entry `category: "Achievements"` (~55 item, baris ±387–440) dari `PREDEFINED_SKILLS`. Achievement bukan "skill" — lebih tepat sebagai pengalaman non-formal.
- Tidak ada perubahan UI Stack.config. SkillsWindow & SkillsSection sudah otomatis grouping per kategori, jadi begitu Achievements hilang dari library, dia gak akan muncul lagi sebagai grup.
- Catatan: kalau user pernah save skill kategori "Achievements" ke DB, row itu masih ada. Tidak akan dihapus otomatis — user bisa hapus manual dari Admin Skills list (atau gue bisa kasih SQL cleanup terpisah kalau diminta).

## 2. Achievements pindah ke Experience & Education (sudah ada)

Tidak perlu schema baru. Field `achievements` (text) **sudah ada** di kedua tabel:
- `education.achievements` + `education.activities` — dipakai untuk pencapaian akademik / non-formal course (Dean's List, Cum Laude, sertifikasi, hackathon course, dll.)
- `experience.achievements` — dipakai untuk pencapaian kerja (Promoted, Employee of the Year, dll.)

Jadi achievement = entry di Education (Non-Formal) atau Experience, bukan tag terpisah. Konsisten dengan instruksi user: "achievement termasuk experience/education non-formal".

Opsional polish (kalau mau, bilang aja): tambahin placeholder/hint text di textarea `achievements` di AdminEducation & AdminExperience yang nyontohin "Hackathon Winner, Dean's List, Promoted to Senior, …" biar user tau itu tempatnya nulis achievement. Default plan: **gak diubah** dulu, biar minimal.

## 3. Gallery.app — kasih jarak antar foto

File: `src/components/os/GalleryWindow.tsx`

Sekarang `gap: 0` + zero padding bikin foto dempet kayak mosaic. Ubah jadi:
- Padding container: `p-3` (12px)
- Gap antar foto: `gap: 10px` (responsive: 8px mobile)
- Tiap thumbnail: `rounded-lg overflow-hidden` biar pojok smooth + ada border tipis `border border-border/40`
- Aspect tetap `aspect-square`, hover scale tetap

Lightbox tidak diubah.

## Files Affected
- `src/components/admin/AdminSkills.tsx` — hapus block Achievements dari `PREDEFINED_SKILLS`
- `src/components/os/GalleryWindow.tsx` — padding + gap + rounded thumbnails
