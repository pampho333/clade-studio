# Clade Studio

**Offline phylogenetic tree editor · Version 1.9**

[한국어](README.md) · [ภาษาไทย](README_TH.md)

## Open the application

1. Download `Clade_Studio_Offline_v1.9_EN.html` from the repository's Releases, or download and extract the source ZIP.
2. Open the HTML file in Chrome or Edge. No installation, server, or internet connection is required.
3. Choose **Open tree** or drop a tree file onto the workspace. Try **Open example tree** to explore the controls.

The header's **Language** menu switches between Korean, English, and Thai. All three HTML editions have the same features; only their initial language differs. Your choice is remembered separately for each starting edition when browser storage is available. Switching language preserves tree data, scientific names, custom labels, taxon names, and undo history. Language preference is separate from project files.


## v1.9: Species delimitation comparison

Click **Species delimitation** in the tree toolbar to import delimitation group assignments. Each method becomes a column to the right of the rectangular tree. Import multiple files together or sequentially, and use **Open species delimitation example** in the example menu to load a synthetic four-method demonstration.

**Wide CSV/TSV** (one method per column):
```csv
taxon,ASAP,ABGD,bPTP,GMYC
A1,A,A,1,A
A2,A,A,1,A
B1,B,B,2,B
```

**Long CSV/TSV** (tip, method, group):
```tsv
taxon	method	group
A1	ASAP	A
A2	ASAP	A
B1	ABGD	B
```

Verified supported output variants:

| Method | Recognized content | Synthetic fixture |
| --- | --- | --- |
| ASAP | `Partition_N.csv` with tip and numeric group | [ASAP](tests/fixtures/asap.Partition_1.csv) |
| ABGD | `Group[ N ] n: K ;id: ...` entries | [ABGD](tests/fixtures/abgd.groupe1.txt) |
| bPTP / mPTP | `Species N:` / `Species N (support = ...)` specimen lists | [bPTP](tests/fixtures/ptp.PTPhSupportPartition.txt), [mPTP](tests/fixtures/mptp.webserver.txt) |
| GMYC | Table containing `GMYC_spec,sample_name` | [GMYC](tests/fixtures/gmyc.csv) |
| BOLD BIN | CSV containing `processid` or `sampleid` and `bin_uri` | [BIN](tests/fixtures/bold.csv) |

The supported variants are grounded in documented/public example output formats; **no research data are committed**. For alternative tool outputs (e.g. SPART, serialized R objects, posterior reports) supply a representative export containing headers and a few records for verification. No unverified parser is enabled. When auto-detection is not possible, choose the format explicitly.

Tip matching uses **exact names first, then whitespace/underscore/quote normalization**. Unmatched tip names on either side are shown separately. Use the manual mapping controls; unmatched tips are never silently paired.

Adjacent visible tips with the same group are drawn as one bar. Discontinuous or non-monophyletic groups are split into separate bars, with dashed linking and warning marks. Mixed collapsed clades use hatching. Singletons can be bars or dots. Configure widths, gaps, colors, labels, and header orientation. The new columns sit next to the existing taxon bands without overlap. Circular views omit the columns and display an explanation.

The summary reports the number of groups, singletons, non-monophyletic groups and pairwise **coassignment Jaccard** and **adjusted Rand index**, with CSV export. Optional consensus columns show only exactly matching groups across all methods. All operations support undo/redo. Version 1.9 saves settings, assignments, and mappings in **project schema 2**, while opening existing schema 1 (v1.8) projects. SVG and PNG include the columns; Newick output remains unchanged.

Examples: [synthetic tree](examples/demo-species.nwk), [four-method table](examples/demo-delimitation.csv), [example SVG](examples/demo-species.svg).


### Verified bPTP web-server files (v1.9 follow-up)

The web server returns two different partitions. Clade Studio imports these **as separately named methods**:

- `output.PTPMLPartition.txt` → **bPTP ML**, the recommended default.
- `output.PTPhSupportPartition.txt` → **bPTP highest support**, an alternative heuristic partition.
- `output.PTPPartitonSummary.txt` → **not a partition**; it lists possibly overlapping MCMC candidate groups and support values. When selected alongside partition files, it is skipped with a warning. The misspelling `Partiton` originates from the server.

Example (only synthetic taxon labels):

```text
# Max likilhood partition
Species 1 (support = 0.898)
     taxon_01,taxon_02,taxon_03

Species 2 (support = 1.000)
     taxon_04
```

Species membership is extracted from the comma-separated tip lists. For **direct bPTP imports only**, a terminal accession version suffix replaced by the server is recognized in the narrowly scoped form `OM089662_1` ↔ `OM089662.1`, after exact matching. Ambiguous names remain unmatched for manual mapping. Generic wide/long tables are not subject to this exception.

The **GMYC web result summary** contains model statistics and cluster counts, not tip memberships; it is rejected as a delimitation table. Export an actual membership table from R `splits` (`spec.list`) instead.

Synthetic fixtures: [ML](tests/fixtures/bptp_output.PTPMLPartition.txt) · [highest support](tests/fixtures/bptp_output.PTPhSupportPartition.txt) · [summary](tests/fixtures/bptp_output.PTPPartitonSummary.txt).

**Benchmark**: `node tests/benchmark-delimitation-v19.mjs` (10,000 synthetic tips × five methods). Development commands are `npm run check`, `npm test`, and `python3 build-offline.py`.

## Main features

- Import Newick, NEXUS (including TRANSLATE and multiple trees), and IQ-TREE `.treefile` / `.contree` files.
- Rectangular and circular views, branch-length or topology scaling, zoom, and pan.
- Collapse individual clades without deleting descendants. Resize each collapsed shape; automatically match its original horizontal extent or set its width manually.
- Reroot at the midpoint of the selected node's incoming branch. Preserve branch distances and edge support values. Sort or reverse child order.
- Change total tree width while preserving relative branch lengths.
- Italicize only scientific names or manually selected parts of a label. Move black bootstrap values by dragging or entering offsets.
- Add taxon color bars and independent solid or gradient backgrounds. Bars and backgrounds appear in rectangular view; branch and label colors also work in circular view.
- Choose from 12 font families or enter the name of another installed font. Missing fonts use a system fallback; SVG files do not embed fonts.
- Save editable `.clade.json` projects, Newick data, SVG figures, and PNG images.

## Common controls

| Key | Action |
| --- | --- |
| `C` | Collapse / expand the selected clade |
| `R` | Reverse child order |
| `Shift+R` | Reroot using the selected node |
| `F` | Fit to view |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+S` | Save project |
| `/` | Search nodes |

Save a `.clade.json` file to continue editing later. Autosave retains only the latest project in the current browser and can be affected by browser settings or HTML file location. Newick preserves tree structure, not display styling; collapsed clades are exported with all descendants. SVG and PNG omit editing handles and selection outlines.

Files are limited to 8 MB, 10,000 nodes, and a depth of 500. Larger trees may be slower. Missing and negative branch lengths are drawn as zero; original negative values remain in the data. The application edits existing trees and does not infer phylogenies or recalculate bootstrap support. Example data is synthetic. Tree data stays in the browser; there is no tree-upload service.

## Development

Requires Node.js 20+ and Python 3.9+. No third-party packages are required.

```bash
npm run check
npm test
python3 build-offline.py
node --check .build/bundle-check.js
```

On Windows, use `py -3 build-offline.py` if `python3` is unavailable. Edit files in `src/`; the build creates the three language editions and `index.html`. Translations are in `src/i18n.js`. Tests include localization and data-preservation checks. Two optional tests that require a separate research dataset are skipped by default. Automated tests do not replace browser visual testing.

Clade Studio is an independent editor inspired by [iTOL](https://itol.embl.de/), not an official iTOL product. The header includes the user-provided Kangwon National University Insect Taxonomy Laboratory logo. See [CHANGELOG.md](CHANGELOG.md) for version history.
