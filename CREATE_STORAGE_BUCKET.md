# 🔧 Quick Fix: Membuat Storage Bucket untuk Avatars

## ⚠️ Error yang Terjadi
```
StorageApiError: Bucket not found
```

## ✅ Solusi Cepat (5 menit)

**LANGKAH 1:** Buka Supabase Dashboard
- Kunjungi: https://supabase.com/dashboard/project/tugqiaqepvaqnnrairax/storage/buckets
- Atau: https://supabase.com/dashboard → Pilih project → **Storage** (sidebar kiri) → **Buckets**

**LANGKAH 2:** Create Bucket
1. Klik tombol **"New bucket"** (biasanya di pojok kanan atas atau tengah halaman)
2. Di form yang muncul, isi:
   - **Name:** `avatars` ← Harus persis ini (huruf kecil semua)
   - **Public bucket:** ✅ **CENTANG** (wajib agar avatar bisa dilihat)
   - **File size limit:** `5242880` (ini sudah default 5MB, boleh kosongkan jika mau)
   - **Allowed MIME types:** (opsional, biarkan kosong atau tambahkan):
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/gif`
     - `image/webp`

3. Klik **"Create bucket"**

**LANGKAH 3:** Verifikasi
- Pastikan bucket `avatars` muncul di list buckets
- Status harus menunjukkan "Public" atau ada ikon globe 🌐

**LANGKAH 4:** Test Upload
- Kembali ke aplikasi
- Coba upload avatar lagi di halaman Settings
- Error seharusnya sudah hilang! ✅

---

## 📋 Detail Lengkap (Opsional)

### Set Storage Policies (Sudah Otomatis)

Storage policies sudah dibuat via migration, tapi jika perlu verifikasi:

1. Klik bucket `avatars` yang baru dibuat
2. Pergi ke tab **"Policies"**
3. Pastikan ada 4 policies:
   - ✅ Public Avatar Access (SELECT)
   - ✅ Authenticated Avatar Upload (INSERT)
   - ✅ Authenticated Avatar Update (UPDATE)
   - ✅ Authenticated Avatar Delete (DELETE)

Jika policies belum ada, migration seharusnya sudah membuatnya. Jika belum, bisa tambahkan secara manual:

**Policy untuk SELECT (Public Read):**
- Name: `Public Avatar Access`
- Operation: `SELECT`
- Target roles: `public`
- Policy definition: `(bucket_id = 'avatars')`

**Policy untuk INSERT (Upload):**
- Name: `Authenticated Avatar Upload`
- Operation: `INSERT`
- Target roles: `anon` (karena pakai Firebase Auth)
- Policy definition: `(bucket_id = 'avatars')`

**Policy untuk UPDATE:**
- Name: `Authenticated Avatar Update`
- Operation: `UPDATE`
- Target roles: `anon`
- Policy definition: `(bucket_id = 'avatars')`

**Policy untuk DELETE:**
- Name: `Authenticated Avatar Delete`
- Operation: `DELETE`
- Target roles: `anon`
- Policy definition: `(bucket_id = 'avatars')`

---

## 🔍 Troubleshooting

### Error masih muncul setelah membuat bucket?
1. **Cek nama bucket:** Harus persis `avatars` (huruf kecil, tanpa spasi)
2. **Refresh browser:** Tekan Ctrl+R atau Cmd+R
3. **Restart dev server:** `npm run dev` (jika development)

### Bucket sudah dibuat tapi masih error?
1. Pastikan bucket di-set sebagai **Public bucket** ✅
2. Cek browser console untuk error detail
3. Pastikan Storage Policies sudah ada di tab "Policies"

### Tidak bisa akses Dashboard?
- Pastikan sudah login ke Supabase
- Pastikan project ID benar: `tugqiaqepvaqnnrairax`
- Cek URL: `https://supabase.com/dashboard/project/tugqiaqepvaqnnrairax`

---

## ✅ Setelah Bucket Dibuat

Setelah bucket `avatars` dibuat, aplikasi akan otomatis bisa:
- ✅ Upload avatar gambar
- ✅ Menampilkan avatar di profil
- ✅ Update avatar
- ✅ Delete avatar lama saat upload baru

**Storage policies sudah otomatis dibuat via migration, jadi tidak perlu setup lagi!**

---

## 📝 Catatan Teknis

- Bucket storage di Supabase **tidak bisa** dibuat via SQL migration
- Harus dibuat **manual** via Dashboard atau API
- Policies sudah dibuat via migration `20251021000004_create_avatars_bucket.sql`
- Security tetap terjaga karena aplikasi memverifikasi bahwa user hanya bisa upload/mengubah avatarnya sendiri
