# Doppl Knowledge Space Prototype

Static GitHub Pages workbench for the production-bound knowledge repository.

Published target:

`https://doppl-life.github.io/mh-doppl-spike/prototypes/knowledge-space/`

## Refresh Data

From `spikes/knowledge-space`, run:

```bash
./demo
```

Then from this directory, run:

```bash
node scripts/export-static-data.mjs
```

The exporter copies web-ready JSON into `data/` from
`spikes/knowledge-space/out/`.

## Permalinks

The workbench keeps case and view state in the URL:

`?case=fsd-accident-economy&view=packet`

`?case=fsd-accident-economy&view=exclusions`
