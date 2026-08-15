# Ghar Essentials — Shopify Theme

Live theme source for **gharessentials3.myshopify.com**, based on Shopify's
[Dawn](https://github.com/Shopify/dawn) theme.

| | |
|---|---|
| Base theme | Dawn |
| Dawn version | `16.0.0` (see `config/settings_schema.json` → `theme_info`) |
| Store | `gharessentials3.myshopify.com` |
| Imported from | Theme export, 15 Aug 2026 |

## Repository layout

This repo is a Shopify theme at its root — the folder structure below is
required by Shopify and must not be moved into a subfolder.

```
assets/      CSS, JS, SVG and images used by the theme
config/      settings_schema.json (theme editor definitions)
             settings_data.json  (the store's saved theme settings)
layout/      theme.liquid, password.liquid — the page shells
locales/     translation files (en.default.json is the source of truth)
sections/    Liquid sections available in the theme editor
snippets/    reusable Liquid partials
templates/   JSON/Liquid templates per page type
```

## Working on the theme

Local development with the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli):

```bash
shopify theme dev --store gharessentials3.myshopify.com   # hot-reloading preview
shopify theme check                                        # lint before committing
shopify theme push --unpublished                           # push as a new draft theme
```

Prefer `shopify theme dev` or pushing to a **draft/unpublished** theme while
iterating. Do not run `shopify theme push --live` unless the change is meant to
go live immediately.

## A note on `config/settings_data.json`

This file holds the settings a merchant picks in the **theme editor** (colours,
fonts, logo, section content). It is committed here so the theme can be
recreated exactly, but be aware:

- Edits made in the Shopify theme editor change this file **on the store**, not
  in git. Those changes are only in the repo if the connected branch syncs them
  back or the theme is re-exported.
- Overwriting it from git will **replace** the store's current editor settings.

The same caution applies to the `.json` files in `templates/` and the
`*-group.json` files in `sections/` — they carry section/block content edited
through the theme editor.

## Upgrading Dawn later

Because this is a Dawn export, upgrades are done by diffing against the upstream
Dawn release rather than overwriting:

```bash
git remote add dawn https://github.com/Shopify/dawn.git
git fetch dawn --tags
git diff v16.0.0 dawn/main -- sections/ snippets/ assets/
```

Never overwrite `config/settings_data.json`, `templates/*.json`, or
`sections/*-group.json` from upstream — those are store content, not theme code.
