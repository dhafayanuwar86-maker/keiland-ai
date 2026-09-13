# Keiland AI 1.1 — Roadmap Pengembangan

## Tujuan

Keiland AI 1.1 meningkatkan baseline RAG menjadi knowledge platform yang lebih mudah dikelola, lebih akurat, lebih aman, dan dapat dievaluasi. Target utama adalah jawaban yang grounded, citation yang dapat ditelusuri, serta knowledge yang dapat diperbarui tanpa mengubah kode chat.

## Status baseline 1.0

Versi saat ini sudah memiliki retrieval lexical/TF-IDF, chunking Markdown/TXT, citation, fallback ketika evidence tidak cukup, integrasi ke `server/routers.ts`, dan regression test. Retrieval masih membaca folder `knowledge/` dan belum memiliki dashboard upload atau vector database.

## Prioritas P0 — wajib untuk 1.1

| Fitur | Hasil yang diharapkan | Lokasi utama |
| --- | --- | --- |
| Knowledge document model | Dokumen, chunk, hash, status, owner, tenant, dan timestamp tersimpan | `drizzle/schema.ts`, `server/db.ts` |
| Admin upload | Admin dapat menambah dan menghapus dokumen yang diizinkan | `server/routers.ts`, halaman admin |
| Parser dokumen | Dukungan `.md`, `.txt`, PDF, dan DOCX dengan batas ukuran | `server/rag/ingest.ts` |
| Reindex aman | Dokumen berubah menghasilkan index baru tanpa downtime chat | ingestion worker/job |
| Citation terstruktur | Jawaban mengembalikan `source`, `title`, `chunk`, `score`, dan `contentHash` | `server/rag/types.ts`, `server/routers.ts` |
| Evaluation set | Pertanyaan normal, sulit, adversarial, dan out-of-domain | `server/rag.test.ts`, `shared/evaluationDataset.ts` |

## Prioritas P1 — peningkatan kualitas

| Fitur | Hasil yang diharapkan |
| --- | --- |
| Embedding retrieval | Menangani sinonim dan pertanyaan paraphrase |
| Hybrid search | Menggabungkan lexical search dan vector search |
| Reranking | Memilih evidence paling relevan sebelum prompt LLM |
| Query rewriting | Mengubah pertanyaan percakapan menjadi query retrieval yang jelas |
| Context compression | Mengurangi token tanpa menghilangkan provenance |
| Confidence threshold | Abstain jika score evidence tidak cukup |

## Prioritas P1 — keamanan

- Terapkan authorization dan tenant/user filter **sebelum retrieval**.
- Jangan izinkan isi dokumen mengubah system instruction.
- Validasi tipe, ukuran, dan mime type file upload.
- Simpan secrets hanya di environment platform deployment.
- Audit log ingestion, retrieval, model, prompt version, dan citation.
- Redact data pribadi dari log.

## Prioritas P2 — operasi

- Tambahkan request ID dan latency retrieval/LLM.
- Pantau error rate, groundedness, citation correctness, dan token cost.
- Tambahkan cache yang mempertimbangkan ACL dan freshness.
- Sediakan rollback index dan prompt version.
- Gunakan queue untuk parsing dokumen besar.
- Buat halaman status ingestion: `queued`, `processing`, `ready`, `failed`.

## Kontrak respons RAG 1.1

```ts
{
  content: string;
  grounded: boolean;
  citations: Array<{
    id: string;
    source: string;
    title: string;
    chunk: number;
    score: number;
    contentHash: string;
  }>;
  retrieval: {
    method: "lexical" | "hybrid" | "vector";
    topK: number;
    latencyMs: number;
  };
}
```

## Release gate 1.1

Sebelum publish, pastikan:

```bash
pnpm check
pnpm test
pnpm build
```

Selain itu:

- Tidak ada kegagalan authorization atau kebocoran dokumen.
- Pertanyaan di evaluation set memiliki hasil grounded yang stabil.
- Pertanyaan di luar knowledge menghasilkan abstention.
- Citation menunjuk ke dokumen dan chunk yang benar.
- P95 latency dan biaya masih sesuai target deployment.
- Owner dapat menambah knowledge tanpa commit source code.

## Urutan implementasi yang disarankan

1. Tambahkan schema dokumen dan chunk.
2. Tambahkan admin upload untuk Markdown/TXT.
3. Pindahkan index dari filesystem ke database.
4. Tambahkan parser PDF/DOCX.
5. Tambahkan embedding dan vector index.
6. Gabungkan hybrid retrieval dan reranking.
7. Tambahkan evaluasi, observability, dan ACL lengkap.
8. Deploy preview, uji dengan evaluation set, lalu publish.
