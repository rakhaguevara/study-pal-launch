#!/bin/bash

# Script untuk mengecek dan memperbaiki error "Could not find the table 'public.user_profiles' in the schema cache"

set -e

echo "🔍 Memeriksa status Supabase migrations..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI tidak ditemukan."
    echo "📦 Install dengan: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI sudah terinstall"
echo ""

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Anda belum login ke Supabase CLI"
    echo "🔐 Jalankan: supabase login"
    echo ""
    echo "Atau set environment variable:"
    echo "export SUPABASE_ACCESS_TOKEN=your_token_here"
    exit 1
fi

echo "✅ Sudah login ke Supabase"
echo ""

# Try to link project if not linked
if ! supabase migration list &> /dev/null; then
    echo "⚠️  Project belum di-link"
    echo "🔗 Mencoba link project..."
    
    # Try with project ref from env.template
    PROJECT_REF="tugqiaqepvaqnnrairax"
    supabase link --project-ref "$PROJECT_REF" || {
        echo ""
        echo "❌ Gagal link project dengan ref: $PROJECT_REF"
        echo "🔧 Jalankan secara manual:"
        echo "   supabase link --project-ref <your-project-ref>"
        exit 1
    }
fi

echo "✅ Project sudah di-link"
echo ""

# List migrations
echo "📋 Daftar migrations:"
echo ""
supabase migration list

echo ""
echo "📤 Untuk push migrations ke database, jalankan:"
echo "   supabase db push"
echo ""
echo "🔄 Untuk refresh schema cache, jalankan:"
echo "   supabase db pull"
echo ""

