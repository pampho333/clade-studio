# Clade Studio

**Offline phylogenetic tree editor · Version 1.8**

[한국어](README.md) · [ภาษาไทย](README_TH.md)

## Open the application

1. Download `Clade_Studio_Offline_v1.8_EN.html` from the repository's Releases, or download and extract the source ZIP.
2. Open the HTML file in Chrome or Edge. No installation, server, or internet connection is required.
3. Choose **Open tree** or drop a tree file onto the workspace. Try **Open example tree** to explore the controls.

The header's **Language** menu switches between Korean, English, and Thai. All three HTML editions have the same features; only their initial language differs. Your choice is remembered separately for each starting edition when browser storage is available. Switching language preserves tree data, scientific names, custom labels, taxon names, and undo history. Language preference is separate from project files.

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
