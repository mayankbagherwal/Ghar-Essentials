# CLAUDE.md — Shopify Dawn Theme Repository

## What this repo is

This repo is a Shopify Dawn theme, connected to a Shopify store through
Shopify's GitHub integration. Every commit pushed to the connected branch
syncs automatically into the theme in the Shopify admin.
Treat every commit as a deployment.

## Golden rules — never break these

1. Never hand-edit `config/settings_data.json`. Shopify writes this file
   from the theme editor. Editing it manually wipes saved settings.
2. Never delete or rename existing files in `templates/`, `layout/`, or
   `config/`. Dawn expects them.
3. Never add a build step. No Tailwind, webpack, or Vite. Shopify serves
   these files directly — plain `.liquid`, `.css`, `.js` only.
4. Never add a JS framework. No React, Vue, or jQuery. Dawn uses vanilla
   JS with custom elements — follow that pattern.
5. Never hardcode text, images, prices, or links inside a section. Each
   one must be a theme-editor setting so the owner can change it without code.
6. Never force-push or rewrite history. Shopify's bot commits to this
   branch too; rewriting history breaks the sync.

## Folder structure

```
assets/     CSS, JS, static images. Flat folder, no subfolders.
config/     settings_schema.json + settings_data.json (DO NOT EDIT)
layout/     theme.liquid — the page wrapper. Edit with care.
sections/   Reusable page sections. Most work happens here.
snippets/   Small partials included with {% render %}.
templates/  JSON files defining which sections appear on each page type.
```

## Building a new section

Create `sections/my-section.liquid`:

```liquid
{{ 'section-my-section.css' | asset_url | stylesheet_tag }}

<div class="my-section page-width">
  {%- if section.settings.heading != blank -%}
    <h2>{{ section.settings.heading }}</h2>
  {%- endif -%}

  {%- for block in section.blocks -%}
    <div class="my-section__item" {{ block.shopify_attributes }}>
      {{ block.settings.text }}
    </div>
  {%- endfor -%}
</div>

{% schema %}
{
  "name": "My Section",
  "tag": "section",
  "class": "section",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading",
      "default": "Our story" }
  ],
  "blocks": [
    { "type": "item", "name": "Item",
      "settings": [
        { "type": "richtext", "id": "text", "label": "Text" }
      ]
    }
  ],
  "presets": [
    { "name": "My Section", "blocks": [{ "type": "item" }] }
  ]
}
{% endschema %}
```

Schema rules:

- `presets` is REQUIRED, or the section never appears in the theme editor's
  "Add section" list.
- `{{ block.shopify_attributes }}` is required on every block wrapper, or
  live editor preview breaks.
- Setting `id` values must be unique and must never be renamed after launch
  — renaming wipes the saved value.
- Maximum 50 blocks per section.
- Give every setting a sensible `default`.
- Use plain English labels, not `t:` translation keys.

To place a section on a page, add it to the matching file in `templates/`
(e.g. `templates/index.json` for the homepage).

## CSS

- One stylesheet per section: `assets/section-my-section.css`, loaded at the
  top of the section file.
- Do not dump styles into `base.css` — it is large and shared.
- Reuse Dawn's CSS custom properties (`--color-foreground`, `--page-width`,
  `--font-heading-family`) so sections respect the owner's theme settings.
- Mobile-first. Desktop styles go inside
  `@media screen and (min-width: 750px)` — Dawn's breakpoint.

## JavaScript

- Only when CSS cannot do it.
- Dawn's pattern:

```js
class MySectionCarousel extends HTMLElement {
  connectedCallback() { }
}
customElements.define('my-section-carousel', MySectionCarousel);
```

- Load with `defer="defer"`.
- Must survive editor re-renders: listen for `shopify:section:load`.

## Images and performance

Audience is real people in India on mobile data. Slow pages lose sales.

- Always size images:
  `{{ section.settings.image | image_url: width: 1500 | image_tag:
     loading: 'lazy', sizes: '100vw' }}`
- Hero images above the fold: `loading="eager"`, `fetchpriority="high"`.
- No external fonts beyond the theme settings. No icon libraries. No
  third-party sliders.
- Prices always through the `money` filter, never hardcoded.

## Design direction

- Normal, readable text. No tiny micro-labels, no 10px captions, no
  whisper-thin type.
- Everyday readable fonts by default. Display fonts only for a headline or
  logo — never body copy, buttons, or labels.
- No futuristic, sci-fi, dark-neon, or "AI demo" aesthetics.
- Practical and transparent over atmospheric: real products, real prices,
  real contact details, clear delivery and return information. A visitor
  should understand what the business sells and how to buy within one screen.
- Each project should look like its own brand. Vary section order, grid
  rhythm, image treatment, and type pairing per project — no house layout
  reused across clients.

## Working method

1. Read the existing file before changing it; match repo conventions.
2. One section per commit, clear message ("Add legacy story section").
3. Commit directly to the connected branch — no pull requests.
4. Do not refactor unrelated files while working on a task.
5. If a change touches `theme.liquid`, `settings_schema.json`, or a
   template JSON, say so before doing it.

## Before finishing any task, verify

- [ ] Section appears in the theme editor's "Add section" list.
- [ ] Every text and image is editable as a setting.
- [ ] Schema JSON is valid — no trailing commas.
- [ ] Layout checked at 375px width, then desktop.
- [ ] No hardcoded prices, phone numbers, or another client's copy.
- [ ] No new dependencies added.
