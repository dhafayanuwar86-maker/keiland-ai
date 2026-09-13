export type RetrievableSource = {
  id: string;
  documentId?: string;
  name: string;
  excerpt: string;
  page?: number;
  chunk?: number;
  url?: string;
};

const stopWords = new Set([
  "yang", "dan", "atau", "untuk", "dari", "dengan", "pada", "dalam", "ini", "itu", "apa", "bagaimana", "the", "and", "of", "to", "in", "is", "are", "a",
]);

const synonyms: Record<string, string[]> = {
  dokter: ["medis", "kesehatan", "klinis", "tenaga kesehatan"],
  kesehatan: ["medis", "penyakit", "pencegahan", "klinis"],
  planet: ["tata surya", "dunia", "mars", "venus", "jupiter"],
  antariksa: ["ruang angkasa", "kosmos", "astronomi", "wahana", "misi"],
  fosil: ["evolusi", "manusia purba", "arkeologi", "artefak"],
  manusia: ["homo", "evolusi", "leluhur", "prasejarah"],
};

export function tokenize(value: string): string[] {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((token) => token.length > 2 && !stopWords.has(token));
}

function expandedTerms(query: string): Set<string> {
  const terms = new Set(tokenize(query));
  for (const term of Array.from(terms)) for (const synonym of synonyms[term] ?? []) for (const token of tokenize(synonym)) terms.add(token);
  return terms;
}

function cosineSimilarity(a: string[], b: string[]): number {
  const left = new Map<string, number>();
  const right = new Map<string, number>();
  for (const token of a) left.set(token, (left.get(token) ?? 0) + 1);
  for (const token of b) right.set(token, (right.get(token) ?? 0) + 1);
  const keys = new Set(Array.from(left.keys()).concat(Array.from(right.keys())));
  let dot = 0, leftNorm = 0, rightNorm = 0;
  Array.from(keys).forEach((key) => { const l = left.get(key) ?? 0; const r = right.get(key) ?? 0; dot += l * r; leftNorm += l * l; rightNorm += r * r; });
  return leftNorm && rightNorm ? dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm)) : 0;
}

export function retrieveSources(query: string, sources: RetrievableSource[], limit = 4): Array<RetrievableSource & { score: number; retrievalMethod: "hybrid-local" }> {
  const terms = expandedTerms(query);
  return sources.map((source) => {
    const sourceTokens = tokenize(`${source.name} ${source.excerpt}`);
    const overlap = sourceTokens.reduce((count, token) => count + (terms.has(token) ? 1 : 0), 0);
    const similarity = cosineSimilarity(Array.from(terms), sourceTokens);
    const score = Math.min(1, similarity * 0.7 + Math.min(overlap / Math.max(terms.size, 1), 1) * 0.3);
    return { ...source, score: Number(score.toFixed(4)), retrievalMethod: "hybrid-local" as const };
  }).filter((source) => source.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}
