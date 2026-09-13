export type KnowledgeDomain = "general" | "medical" | "space" | "prehistory";

export type DomainKnowledge = {
  label: string;
  description: string;
  guardrail: string;
  sources: Array<{ title: string; url: string; excerpt: string }>;
};

export const domainKnowledge: Record<KnowledgeDomain, DomainKnowledge> = {
  general: {
    label: "Umum",
    description: "Pengetahuan umum dan percakapan serbaguna",
    guardrail: "Jika pertanyaan memerlukan data khusus atau terbaru, nyatakan batas pengetahuan dan minta sumber yang relevan.",
    sources: [],
  },
  medical: {
    label: "Medis",
    description: "Edukasi kesehatan berbasis sumber publik tepercaya",
    guardrail: "Berikan edukasi umum, bukan diagnosis, resep, atau pengganti tenaga kesehatan. Untuk gejala gawat darurat, arahkan mencari layanan medis segera. Jangan menyimpulkan kondisi seseorang hanya dari chat.",
    sources: [
      {
        title: "WHO Fact Sheets",
        url: "https://www.who.int/news-room/fact-sheets",
        excerpt: "WHO menyediakan lembar fakta kesehatan publik yang membahas kondisi, faktor risiko, pencegahan, dan informasi kesehatan. Gunakan sebagai rujukan edukasi umum dan periksa tanggal pembaruan pada halaman sumber.",
      },
      {
        title: "WHO Guidelines",
        url: "https://www.who.int/publications/who-guidelines",
        excerpt: "Pedoman WHO berisi rekomendasi untuk praktik klinis atau kebijakan kesehatan publik. Pedoman perlu dibaca dalam konteks populasi, negara, tanggal, dan kondisi klinis yang berlaku.",
      },
    ],
  },
  space: {
    label: "Ruang Angkasa",
    description: "Astronomi, tata surya, dan eksplorasi antariksa",
    guardrail: "Bedakan fakta observasional, model ilmiah, dan spekulasi. Untuk misi atau angka yang berubah, sarankan verifikasi ke halaman NASA/JPL terbaru.",
    sources: [
      {
        title: "NASA Solar System Exploration",
        url: "https://science.nasa.gov/solar-system/",
        excerpt: "Tata surya mencakup Matahari, delapan planet, lima planet katai yang diakui secara resmi, serta ratusan bulan dan ribuan asteroid serta komet. Klasifikasi dan angka dapat berkembang ketika observasi baru tersedia.",
      },
      {
        title: "NASA Solar System Facts",
        url: "https://science.nasa.gov/solar-system/solar-system-facts/",
        excerpt: "Halaman fakta NASA menjelaskan objek, struktur, dan karakteristik tata surya. Jawaban harus membedakan ukuran, jarak, waktu tempuh cahaya, dan waktu tempuh wahana antariksa.",
      },
      {
        title: "NASA/JPL Eyes on the Solar System",
        url: "https://eyes.nasa.gov/apps/solar-system",
        excerpt: "Visualisasi NASA/JPL digunakan untuk mengeksplorasi tata surya dan misi antariksa dalam konteks lintasan serta posisi objek.",
      },
    ],
  },
  prehistory: {
    label: "Pra-Sejarah",
    description: "Evolusi manusia, fosil, dan budaya sebelum catatan tertulis",
    guardrail: "Bedakan bukti fosil, artefak, penanggalan, dan interpretasi. Jangan menyajikan tanggal atau hubungan evolusi sebagai kepastian jika bukti masih diperdebatkan.",
    sources: [
      {
        title: "Smithsonian Human Origins Program",
        url: "https://humanorigins.si.edu/",
        excerpt: "Program Human Origins Smithsonian menyediakan materi tentang evolusi manusia, bukti fosil, artefak, adaptasi, dan penelitian lapangan serta laboratorium.",
      },
      {
        title: "Smithsonian Human Evolution Research",
        url: "https://humanorigins.si.edu/research",
        excerpt: "Penelitian evolusi manusia mencakup adaptasi awal manusia melalui bukti lapangan dan laboratorium. Kesimpulan ilmiah perlu dibaca bersama metode dan bukti yang digunakan.",
      },
      {
        title: "Smithsonian Homo sapiens Evidence",
        url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens",
        excerpt: "Bukti Smithsonian menjelaskan bahwa Homo sapiens prasejarah menggunakan alat batu yang beragam dan semakin kompleks. Artefak dan fosil perlu dipahami bersama konteks lapisan serta penanggalannya.",
      },
    ],
  },
};

export function getDomainContext(domain: KnowledgeDomain) {
  const pack = domainKnowledge[domain];
  const sources = pack.sources.map((source, index) => `[Domain source ${index + 1}: ${source.title}]\n${source.excerpt}\nURL: ${source.url}`).join("\n\n");
  return { pack, context: [pack.description, pack.guardrail, sources].filter(Boolean).join("\n\n") };
}
