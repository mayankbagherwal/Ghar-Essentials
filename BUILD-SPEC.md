# BUILD-SPEC.md — Ghar Essentials Storefront

Read this before building anything. `CLAUDE.md` covers **how** to write code in
this repo. This file covers **what** to build and **why**.

## 1. The brand

**Ghar Essentials** — an Indian home-care brand. Plant-based cleaners for the
kitchen, bathroom and floor, plus useful kitchen essentials. Sold on this
Shopify store, and later on Amazon and Flipkart.

- **Price tier:** premium-eco. Benchmark is Happi Planet (₹200–₹300 for 500ml),
  not Vim (₹99).
- **Look:** modern and accessible — closer to Mamaearth than a traditional
  Ayurvedic brand. Not earthy, not terracotta, no Devanagari-heavy design. That
  direction was rejected deliberately: it puts a psychological barrier between
  the product and a modern urban buyer.
- **Logo:** green rounded house outline containing a leaf, lowercase "ghar" in a
  bold rounded sans, letterspaced "ESSENTIALS" beneath.
- **Colour cue:** green-to-yellow, lemon-derived. Lemon reads as "clean" in an
  Indian kitchen. Avoid the blues of Domex/Harpic and the greens of Vim.

**Buyer:** urban and Tier-2 Indian households, largely women aged 25–45, buying
on a phone, often at night, often first-time buyers of this brand. They have
never heard of Ghar Essentials. Every design decision has to earn trust from
zero.

## 2. What this site must do

**Two to three taps from landing to a completed purchase.** That is the design
constraint everything else bends to.

- Home → product page → checkout.
- Or home → add to cart from the card → checkout.
- No forced collection browsing, no popups blocking the path, no "explore our
  story" detours before a price is visible.

The homepage exists to sell products, not to explain a brand. Brand explanation
is one small section near the bottom.

## 3. Design direction

The research is clear and it contradicts the obvious instinct. Indian
marketplaces (Amazon, Flipkart, Meesho) are visually dense. Successful Indian
D2C brands (Happi Planet, Beco, Koparo, Minimalist, The Whole Truth) are not.
They use a clean, card-based, generously spaced layout — and then layer specific
promotional and trust modules on top.

So: build a clean layout. Add density only through these specific modules.

| Include — these convert | Exclude — these are noise |
|---|---|
| Offer/announcement bar | Auto-rotating hero carousels |
| MRP strikethrough + % off on every card | Countdown timers |
| Star rating + review count on every card | Gamified "price drop" mechanics |
| Trust strip (COD, safe, delivery) | Full catalogue dumped on homepage |
| Bundles / buy-more-save-more | Celebrity endorsement walls |
| Problem picker ("what are you cleaning?") | Long brand manifestos above the fold |
| Real testimonials with names and cities | Stock photos of white kitchens |
| WhatsApp contact | Newsletter popup on entry |

**Colour usage:** green as the primary, lemon-yellow as the accent for offers and
badges, white/off-white as the base. Saturated accents belong on price badges,
offer bars and CTAs. Everything else stays calm. This is how a premium-eco brand
looks promotional without looking cheap.

**Typography:** everyday readable fonts. Body text 16px minimum on mobile. No
10px micro-labels, no thin weights, no display fonts outside the logo and
section headings.

## 4. Homepage sections, in order

Build each as a separate `.liquid` file in `sections/`, each with a full
`{% schema %}` and `presets` so every one is editable and re-orderable in the
theme editor.

1. **`announcement-offer-bar.liquid`** — Thin, sticky, dismissible. Rotating text
   set as schema blocks: free shipping threshold, current offer, COD available.
   Lemon-yellow background, dark text.
2. **`hero-primary.liquid`** — Single image or short muted looping video — no
   carousel. Contains: benefit headline, one-line subhead, primary CTA button,
   and a microproof line ("4.7 ★ · 1,200+ Indian homes"). Image settings for
   mobile and desktop separately. CTA links wherever the schema says — default to
   the bestseller product.
3. **`trust-strip.liquid`** — Four icon-and-label blocks. Defaults:
   "Plant-based & non-toxic", "Safe around food & kids", "Cash on delivery",
   "Delivers in 3–5 days". Icons as image settings so they can be swapped without
   code.
4. **`bestsellers-grid.liquid`** — 4–6 products, chosen via a collection picker.
   Uses the product card snippet (section 5 below). This is the main revenue
   section — it sits high on purpose.
5. **`problem-picker.liquid`** — "What are you cleaning today?" — tiles routing to
   products or collections. Defaults: Kitchen grease · Chimney & stove ·
   Bathroom & tiles · Floors · Hard-water stains. Each tile is a block with
   image, label, and link.
6. **`product-demo.liquid`** — A short real demo video (spray → wipe → clean) with
   a poster image and text alongside.

   On the **before/after slider**: it was in the original plan. Build it as an
   optional block inside this section rather than a separate section, and default
   it **off**. Reason below in section 9 — before/after claims in the Indian
   cleaning category are legally exposed under ASCI rules and easy to challenge.
   An honest demo video does the same job with less risk. If used, the imagery
   must be genuine and unretouched.
7. **`comparison-block.liquid`** — "Why Ghar Essentials over a regular cleaner." A
   simple two-column table built from schema blocks. Compare against a generic
   "regular cleaner" — **never name a competitor brand**. Rows like: plant-based
   cleansers vs harsh chemicals; safe near food prep; gentle on hands; same
   grease-cutting power.
8. **`ingredients-transparency.liquid`** — Two lists: "What's inside" and "What's
   not inside" (no SLES, no phthalates, no sulphates, no phosphates). Every claim
   must be one the brand can actually substantiate.
9. **`bundles.liquid`** — Combo and refill packs with per-unit value framing
   ("₹X per bottle — save ₹Y"). This is the AOV engine.
10. **`testimonials.liquid`** — Blocks with quote, name, city, optional photo.
    Defaults must be placeholders clearly marked `[REPLACE WITH REAL REVIEW]` —
    never ship invented testimonials.
11. **`founder-story.liquid`** — Short. Three or four sentences and a photo. Why
    this brand exists.
12. **`faq.liquid`** — Accordion. Defaults: Is it safe around children and food? ·
    Do you offer cash on delivery? · How long does delivery take? · What if I
    don't like it? · How do I use it? · Is the bottle recyclable?
13. **Footer** — Company name, address, GST number, phone, WhatsApp link, and all
    policy pages. This transparency is a trust signal in India, not legal
    boilerplate — treat it as part of the design.

Nothing else. If a section doesn't move someone toward buying, it doesn't ship.

## 5. The product card — build this first

Create `snippets/product-card-ghar.liquid`. Every grid on the site uses it.
Getting this right matters more than any single section.

Contents, top to bottom:

1. Product image, with a second image swapped on hover where available. Fixed
   aspect ratio so grids never jump.
2. Badge overlay, top-left: "X% OFF" — **calculated, not hardcoded**. Second
   optional badge slot for "Bestseller" / "New".
3. Product title, two lines maximum, ellipsis after.
4. Size / variant line ("500 ml").
5. Review row — see section 6. Must render even when empty.
6. Price row: sale price bold, MRP struck through beside it, "% off" in the
   accent colour. Always via the `money` filter. Add "Inclusive of all taxes" as
   a small line — it's expected in India.
7. Variant selector if the product has one, so size can be changed without
   leaving the grid.
8. **"Add to Cart" button, always visible** — not on hover, not hidden behind a
   tap. This is what makes two-tap purchase possible.

Rules:

- Everything comes from the product object. Nothing hardcoded.
- Card must work at 375px width and in a 2-column mobile grid.
- Sold-out state must degrade gracefully.
- No card-level JavaScript beyond the add-to-cart fetch and variant swap.

## 6. Judge.me — prepare the ground now

Judge.me will be installed later. The theme must be ready for it so it drops in
without a rebuild.

In the **product card**, place this exactly where the rating row belongs:

```html
<div class="jdgm-widget jdgm-preview-badge" data-id="{{ product.id }}"></div>
```

Reserve a fixed height for it in CSS (roughly 20px) so the grid doesn't shift
when Judge.me loads. Judge.me finds this div and injects the stars automatically.

On the **product page**, add these anchor points:

- Preview badge near the title:
  `<div class="jdgm-widget jdgm-preview-badge" data-id="{{ product.id }}"></div>`
- Full review widget below the description:
  `<div class="jdgm-widget jdgm-review-widget" data-id="{{ product.id }}"></div>`

On the **homepage**, add an empty section `judgeme-carousel.liquid` containing
`<div class="jdgm-carousel-wrapper"></div>` with a schema toggle, defaulted off.
Turn it on once real reviews exist.

Do not install Judge.me's script manually — the app injects it. Just leave the
hooks and the reserved space.

## 7. Product page

Same two-tap logic. **Above the fold on mobile:** image, title, rating, price
with MRP and % off, variant selector, quantity, Add to Cart, and Buy Now. Below
that: benefit bullets, how to use, ingredients, delivery and returns, then the
Judge.me widget.

Add a small "Extra 5% off on prepaid" line near the buttons. Reason in section 8.

## 8. Commerce rules to build around

- **Cash on delivery must be visible and prominent.** Around 60–65% of Indian
  e-commerce orders are COD, and it's the single biggest trust unlock for a
  first-time buyer of an unknown brand.
- But COD returns run far higher than prepaid — roughly 25–30% versus under 2%.
  So nudge toward prepaid with a small discount and make it visible at the point
  of decision. Don't remove COD; incentivise around it.
- **Free shipping threshold** in the offer bar, always visible.
- **Speed is a conversion feature.** Roughly three-quarters of Indian e-commerce
  traffic is mobile, on connections that are often slow. Target under 2.5s to
  largest contentful paint. Every image compressed and lazy-loaded below the
  fold, hero image eager with high fetch priority. No icon libraries, no external
  fonts beyond theme settings, no third-party sliders.

## 9. Claims — do not improvise these

India's advertising code (ASCI Green Claims Guidelines, in force since February
2024) requires that environmental claims be substantiated. "Eco-friendly",
"sustainable", "non-toxic", "biodegradable" and "chemical-free" are absolute
claims, and a disclaimer or QR code does not rescue them.

So, in all copy written into schema defaults:

- Prefer **specific and provable**: "plant-based cleansers derived from coconut",
  "bottle made from recycled plastic".
- Avoid **blanket**: "100% eco-friendly", "completely chemical-free", "totally
  non-toxic".
- Comparative claims must be against a **generic category, never a named brand**,
  and must be factual.
- Any before/after or performance demonstration must be genuine.
- Leave placeholder text where a claim needs the founder's substantiation, marked
  `[SUBSTANTIATE BEFORE LAUNCH]`. **Do not invent certifications, review counts,
  customer numbers, or awards.**

## 10. Festive readiness

Diwali 2026 falls on Sunday 8 November. Indian cleaning demand peaks in the
roughly four weeks before it — traffic and sales climb hardest around two weeks
out.

Build for this now so nothing needs coding in October:

- Offer bar text, colours and link are all schema settings.
- Hero image, headline and CTA are all schema settings.
- Bundles section can hold a "Diwali Clean-Home Kit" without new code.
- A `festive_mode` toggle in `settings_schema.json` that swaps the accent colour,
  if it can be done cleanly.

Discount depth for a premium-eco brand should be **15–25%**, delivered through
bundles and gift packs rather than deep cuts on single units. Deep discounting
damages the price positioning this brand depends on.

## 11. Build order

1. `snippets/product-card-ghar.liquid` — everything depends on it
2. Product page template
3. Hero, trust strip, bestsellers grid
4. Problem picker, bundles
5. Comparison, ingredients, demo
6. Testimonials, founder story, FAQ
7. Offer bar, footer, Judge.me hooks
8. Speed pass — image sizing, lazy loading, unused CSS

Commit after each. One section per commit.

## 12. Definition of done

- [ ] Every section appears in the theme editor's "Add section" list.
- [ ] Every piece of text, image, link, colour and price is a theme setting.
      Nothing hardcoded.
- [ ] Home → product → checkout is three taps. Add-to-cart from the grid is two.
- [ ] Product card renders correctly with no reviews, no sale price, no second
      image, and sold out.
- [ ] Judge.me hook divs are present on card, product page and carousel section,
      with reserved height.
- [ ] Mobile checked at 375px before desktop.
- [ ] No invented reviews, claims, certifications or customer numbers anywhere.
- [ ] Largest contentful paint under 2.5s on a throttled mobile connection.
