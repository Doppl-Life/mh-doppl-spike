# Boundary Contracts

This folder is the human-readable boundary inventory for the kernel prototype.

The reusable typed source of truth lives in `src/contracts/index.ts`. This doc
exists so a reader can see the factory boundaries without reading code.

## Current boundaries

| Module | Enters from | Input contract | Output contract | Exits to |
| --- | --- | --- | --- | --- |
| `generate` | `FixtureSeedStore` | `SeedFixture` | `CandidatePool` | `fitness` |
| `fitness` | `generate` | `CandidatePool` | `ScoredCandidatePool` | `select` |
| `select` | `fitness` | `ScoredCandidatePool + SelectionSchedule` | `SelectionComparison` | `trace` |
| `trace` | `select` | `KernelRun` | `RunTrace` | `MicroscopeTools` |

`SeedFixture` contains the seed, source packets, and operators. `CandidatePool`
contains generated candidates plus the lineage ledger.

## Rule

Every new boundary gets a contract before it gets clever implementation. The
contract says what crosses the boundary, where it came from, where it goes, and what
goal check proves it behaved.
