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

Open [http://localhost:5173/](http://localhost:5173/). The existing local import middleware and Codex workflows remain in the repository for their later migration; the new shell does not invoke them.

## GitHub Pages review deployment

Pushes to `main` run the **Deploy GitHub Pages** workflow, which installs from `package-lock.json`, runs the smoke tests and repository check, builds the static Vite site, and deploys `dist/` using the official GitHub Pages actions. The expected public review URL is:

[https://orio9876-crypto.github.io/wardrobe/](https://orio9876-crypto.github.io/wardrobe/)

To redeploy, push a commit to `main` or open **Actions → Deploy GitHub Pages → Run workflow**. To disable deployment, disable the workflow in **Actions** or remove `.github/workflows/deploy-pages.yml`; in **Settings → Pages**, ensure the site is configured to use **GitHub Actions** before the first deployment. No repository secrets are required.


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
