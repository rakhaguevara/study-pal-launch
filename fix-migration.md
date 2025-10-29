# Panduan Memperbaiki Error "Could not find the table 'public.user_profiles' in the schema cache"

## Masalah
Error ini terjadi karena tabel `user_profiles` belum ada di database atau schema cache perlu di-refresh.

## Solusi

### Opsi 1: Menggunakan Supabase CLI (Disarankan)

1. **Login ke Supabase CLI:**
   ```bash
   supabase login
   ```
   Browser akan terbuka untuk autentikasi.

2. **Link project ke Supabase:**
   ```bash
   supabase link --project-ref tugqiaqipatednnrairax
   ```
   Atau gunakan project ID dari `supabase/config.toml`:
   ```bash
   supabase link --project-ref wdxfkdwlqaezrlfggmbi
   ```

3. **Cek status migration:**
   ```bash
   supabase migration list
   ```

4. **Push semua migration ke database:**
   ```bash
   supabase db push
   ```

5. **Refresh schema cache (optional):**
   ```bash
   supabase db pull
   ```

### Opsi 2: Menggunakan Supabase Dashboard (Manual)

Jika CLI tidak tersedia atau ada masalah autentikasi:

1. **Buka Supabase Dashboard:**
   - Kunjungi: https://supabase.com/dashboard/project/tugqiaqepvaqnnrairax
   - Atau: https://mcp.supabase.com/mcp?project_ref=tugqiaqepvaqnnrairax

2. **Buka SQL Editor:**
   - Pilih menu "SQL Editor" di sidebar kiri
   - Klik "New query"

3. **Jalankan migration files secara berurutan:**

   **a. Jalankan migration utama (20251017090909):**
   ```sql
   -- Copy seluruh isi file:
   -- supabase/migrations/20251017090909_314ffc2a-0558-4f85-84c8-9bbd45543719.sql
   ```
   
   **b. Jalankan migration add avatar (20251020000000):**
   ```sql
   -- Copy seluruh isi file:
   -- supabase/migrations/20251020000000_add_avatar_url.sql
   ```
   
   **c. Jalankan migration fix RLS (20250101000000):**
   ```sql
   -- Copy seluruh isi file:
   -- supabase/migrations/20250101000000_fix_rls_policies_for_firebase.sql
   ```

4. **Verifikasi tabel sudah dibuat:**
   - Buka menu "Table Editor"
   - Pastikan tabel `user_profiles` muncul di list

### Opsi 3: Verifikasi Manual dengan SQL

Jalankan query berikut di SQL Editor untuk memeriksa apakah tabel sudah ada:

```sql
-- Cek apakah tabel user_profiles ada
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'user_profiles'
);

-- Lihat struktur tabel
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;
```

## Verifikasi Setelah Perbaikan

1. **Restart development server:**
   ```bash
   npm run dev
   ```

2. **Test di aplikasi:**
   - Login ke aplikasi
   - Coba akses Settings atau Dashboard
   - Error seharusnya sudah hilang

## Catatan Penting

- Proyek ini menggunakan **Firebase Authentication**, bukan Supabase Auth
- Tabel `user_profiles` menggunakan kolom `firebase_uid TEXT` (bukan `user_id uuid`)
- Pastikan semua migration files dijalankan secara berurutan
- Jika masih ada error, cek browser console untuk detail error yang lebih spesifik

