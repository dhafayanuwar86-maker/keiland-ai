import { describe, expect, it } from "vitest";
import { evaluationSummary } from "../shared/evaluationDataset";
import { retrieveSources } from "../shared/retrieval";

describe("knowledge retrieval", () => {
  it("ranks a semantically related health source above an unrelated source", () => {
    const result = retrieveSources("edukasi kesehatan dan dokter", [
      { id: "health", name: "Medis", excerpt: "Informasi kesehatan dan tenaga kesehatan untuk edukasi umum." },
      { id: "space", name: "Astronomi", excerpt: "Misi antariksa dan tata surya." },
    ]);
    expect(result[0]?.id).toBe("health");
    expect(result[0]?.retrievalMethod).toBe("hybrid-local");
  });

  it("returns the three-domain evaluation inventory", () => {
    const summary = evaluationSummary();
    expect(summary.totalCases).toBe(6);
    expect(summary.domains).toEqual({ medical: 2, space: 2, prehistory: 2 });
    expect(summary.medicalSafetyCases).toBe(1);
  });
});
