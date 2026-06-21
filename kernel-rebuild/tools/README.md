# Kernel-Rebuild Tools

Use `pnpm serve` unless you need a specific artifact.

| Surface | Command | Owns |
| --- | --- | --- |
| Local viewer | `pnpm serve` | Owns port 4317 by default: frees it first, then serves one localhost hub, one nav, `/api/trace`, Assay, Microscope, Architecture, static Architecture v2, Review Digest. |
| Default proof | `pnpm build` | Typecheck plus compact multi-fixture proof board. |
| Proof only | `pnpm proof` | Compact proof board without typecheck. |
| Deploy HTML | `pnpm publish:html` | Direct-renders the same view functions into committed `published/*.html`. |
| Assay file output | `pnpm assay` | Optional static `out/assay/**` inspection files; no local save path. |
| Review Digest file | `pnpm assay:report` | Optional `out/assay-review/index.html` from the local judgment ledger. |
| Single-seed microscope | `pnpm microscope` | Optional `out/microscope/index.html` from `renderHtml(trace)`. |
| Standalone architecture | `pnpm architecture` | Optional `out/microscope/architecture.html` from `renderArchitecture(trace)`. |
| Terminal walkthrough | `pnpm walkthrough` | Short single-seed terminal explanation. |

Canonical sources:

- Trace truth: `src/trace.ts` via `buildRunTrace()`.
- View nav: `tools/view-nav.ts`.
- Live server: `tools/serve.ts`.
- Deploy publisher: `tools/publish.ts`.
- Static design fork: `tools/microscope/architecture-v2.html`; it is not derived from `/api/trace`.

Deleted surfaces stay deleted unless a named consumer returns: `tools/assay-local.ts`, `tools/microscope/digest.ts`, `tools/microscope/report.ts`.
