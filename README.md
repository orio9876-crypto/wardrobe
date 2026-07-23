<div align="center">

# Wardrobe

A private digital wardrobe that grows at your pace.

[![License: MIT](https://img.shields.io/badge/license-MIT-191919?style=flat-square)](LICENSE)
[![Node 22+](https://img.shields.io/badge/node-22%2B-191919?style=flat-square)](package.json)

</div>

## Application shell

The default interface is Hebrew-first and renders in RTL. Use the language picker at the top of the screen to switch to English for development and QA; it updates the document `lang` and `dir` automatically. The current shell includes the Today empty state and navigation placeholders for Wardrobe, Add, Outfits, and Profile. It deliberately does **not** implement authentication, cloud storage, AI processing, detection, duplicate matching, or outfit generation.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The existing local import middleware and Codex workflows remain in the repository for their later migration; the new shell does not invoke them.

## Validate

```bash
npm test
npm run build
npm run check
```

The smoke tests verify the Hebrew RTL and English LTR contracts, navigation labels, Today empty state/action structure, and responsive/safe-area stylesheet guards. The build is the browser compilation check.

## Legacy local workflows

The repository still retains its existing local image/import code in `scripts/`, `src/App.jsx`, `src/import-flow.jsx`, and the bundled Codex skills. Those workflows are intentionally isolated from the new application shell until the later cloud migration phases.

## License

[MIT](LICENSE)

## GitHub Pages deployment

Enable **Settings → Pages → Build and deployment → Source: GitHub Actions** in the repository. Once enabled, every push to `main` runs the deployment workflow after its tests and build succeed. You can also run it manually from **Actions → Deploy GitHub Pages → Run workflow**.

The published site is expected at [https://orio9876-crypto.github.io/wardrobe/](https://orio9876-crypto.github.io/wardrobe/). To disable deployment, disable or delete `.github/workflows/deploy-pages.yml` and change the repository Pages source away from GitHub Actions in **Settings → Pages**.
