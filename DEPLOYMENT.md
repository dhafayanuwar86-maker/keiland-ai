# Deployment Keiland AI + RAG

Panduan ini ditujukan untuk owner proyek Manus yang terhubung ke repository GitHub:

```text
https://github.com/dhafayanuwar86-maker/keiland-ai
```

## Versi yang harus digunakan

Gunakan branch `main` dan pastikan commit terbaru sudah tersinkron:

```text
01242d5 Harden RAG ingestion and add regression tests
```

## Langkah deployment di Manus

1. Buka project **Keiland AI** sebagai owner.
2. Pastikan koneksi GitHub mengarah ke repository `dhafayanuwar86-maker/keiland-ai`.
3. Pilih branch `main`.
4. Jalankan **Sync/Pull latest changes**.
5. Pastikan file berikut terlihat:

```text
server/routers.ts
server/rag/
knowledge/
```

6. Jalankan build atau preview.
7. Jika build berhasil, pilih **Publish/Deploy**.
8. Buka website hasil deployment dan uji chat.

## Pemeriksaan lokal sebelum publish

Jika platform menyediakan terminal, jalankan:

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

Hasil yang diharapkan:

```text
Type-check berhasil
9 tests passed
Build berhasil
```

## Knowledge base

Dokumen knowledge diletakkan di folder:

```text
knowledge/
```

Format yang didukung baseline saat ini:

```text
.md
.txt
```

Contoh:

```text
knowledge/
├── faq.md
├── panduan-produk.md
└── informasi-perusahaan.txt
```

Setelah menambah dokumen:

```bash
git add knowledge/
git commit -m "Add Keiland AI knowledge documents"
git push origin main
```

Kemudian owner perlu melakukan sync dan redeploy kembali jika auto-deploy tidak aktif.

## Pengujian chat

Gunakan pertanyaan yang jawabannya memang terdapat dalam dokumen knowledge. Jawaban seharusnya menyertakan baris:

```text
Sumber konteks: ...
```

Jika tidak ada evidence relevan, sistem harus menyatakan informasi belum ditemukan dan tidak mengarang jawaban dari knowledge base.

## Environment variables

Jangan commit nilai secret ke GitHub. Pastikan environment variables server yang sudah digunakan aplikasi tetap tersedia di platform deployment, khususnya konfigurasi Manus Forge/LLM dan database yang diperlukan oleh aplikasi.

Jangan upload:

```text
.env
.env.local
API key
JWT secret
OAuth secret
password database
data pengguna
```

## Catatan baseline RAG

Integrasi saat ini menggunakan retrieval lexical/TF-IDF sederhana. Ini sudah cukup untuk baseline dan demonstrasi. Pengembangan berikutnya dapat menambahkan parser PDF/DOCX, vector embeddings, hybrid search, reranking, upload admin, dan ACL dokumen.
