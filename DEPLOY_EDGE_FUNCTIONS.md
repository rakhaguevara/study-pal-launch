# Panduan Deploy Edge Functions ke Supabase

## Masalah yang Diperbaiki

Error `FunctionsFetchError: Failed to send a request to the Edge Function` terjadi karena Edge Function belum di-deploy atau belum dikonfigurasi dengan benar.

**Solusi Sementara:** Kode sudah diperbaiki dengan menambahkan fallback - jika Edge Function gagal, akan menyimpan langsung ke database.

## Deploy Edge Functions (Opsional)

Jika ingin menggunakan Edge Functions untuk performa yang lebih baik, ikuti langkah berikut:

### 1. Login ke Supabase CLI

```bash
supabase login
```

### 2. Link Project (jika belum)

```bash
supabase link --project-ref tugqiaqepvaqnnrairax
```

Atau jika menggunakan project ID dari config.toml:

```bash
supabase link --project-ref wdxfkdwlqaezrlfggmbi
```

### 3. Set Environment Variables

Edge Functions membutuhkan environment variables berikut:

```bash
# Set di Supabase Dashboard > Settings > Edge Functions > Secrets
supabase secrets set SUPABASE_URL=https://yectqiaqepvaqnnrairax.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Atau set via Dashboard:
1. Buka: https://supabase.com/dashboard/project/tugqiaqepvaqnnrairax/settings/functions
2. Klik "Add Secret"
3. Tambahkan:
   - `SUPABASE_URL` = `https://tugqiaqepvaqnnrairax.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (dapatkan dari Settings > API > service_role key)

### 4. Deploy Edge Functions

Deploy semua functions:

```bash
supabase functions deploy process-quiz
supabase functions deploy ai-chat
```

Atau deploy semua sekaligus:

```bash
supabase functions deploy
```

### 5. Verifikasi Deploy

Cek apakah functions sudah ter-deploy:

```bash
supabase functions list
```

### 6. Test Edge Function

Test secara manual:

```bash
curl -i --location --request POST 'https://tugqiaqepvaqnnrairax.supabase.co/functions/v1/process-quiz' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"test","visualScore":10,"audioScore":8,"textScore":12,"kinestheticScore":9,"timeTaken":120,"age":18}'
```

## Catatan

- **Fallback sudah tersedia:** Jika Edge Function tidak tersedia, aplikasi akan otomatis menyimpan quiz results langsung ke database
- **Tidak wajib:** Edge Functions tidak wajib di-deploy untuk menggunakan aplikasi
- **Environment Variables:** Pastikan `SUPABASE_SERVICE_ROLE_KEY` tidak pernah diekspos ke client-side code

## Troubleshooting

### Error: "Failed to send a request to the Edge Function"

**Solusi:**
1. Pastikan function sudah di-deploy: `supabase functions list`
2. Cek environment variables di Supabase Dashboard
3. Aplikasi akan otomatis menggunakan fallback jika function tidak tersedia

### Error: "User profile not found"

**Solusi:**
- Pastikan user sudah membuat profile di halaman Onboarding
- Cek tabel `user_profiles` di Supabase Dashboard

### Error: "Unauthorized" atau 401

**Solusi:**
- Pastikan `VITE_SUPABASE_ANON_KEY` sudah di-set di `.env` file
- Restart development server setelah mengubah `.env`

