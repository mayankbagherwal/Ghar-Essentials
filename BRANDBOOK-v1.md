# BRANDBOOK.md — Ghar Essentials

Transcribed from *Ghar Essentials Brand Guidelines, Vol. 01 · 2026*.
Read alongside `CLAUDE.md` (how to write code here) and `BUILD-SPEC.md`
(what to build). **On colour, type and layout, this file wins.**

## Colour palette — six values, one lemon

| Role | Name | Hex | Where it is allowed |
|---|---|---|---|
| Primary | Ghar Green | `#0F7A4E` | Buttons, logo, icons, links |
| Deep | Forest | `#08432B` | Footer, dark panels, festive contrast |
| Accent | Lemon | `#F2C230` | Offer bar, % OFF badges. **Nothing else** |
| Tint | Leaf | `#E8F5EE` | Alternating section backgrounds, chips |
| Text | Ink | `#12211B` | Headings, product titles, prices |
| Base | Warm White | `#FBFAF7` | Page background. **Never pure white** |

Green and warm white carry ~85% of any surface. Lemon never sits behind body
text. Two tinted sections in a row is the maximum.

### Theme colour schemes (as configured)

| Scheme | Background | Text | Button | Purpose |
|---|---|---|---|---|
| 1 | Warm White | Ink | Ghar Green | Default surface |
| 2 | Leaf | Ink | Ghar Green | Alternating bands |
| 3 | Lemon | Ink | Ink | Offer bar only |
| 4 | Forest | Warm White | Lemon | Dark panels, footer |
| 5 | Warm White | Ink | Ghar Green | Spare |

## Typography — two typefaces, no exceptions

Both load from Shopify's font picker; nothing is fetched from an outside server.

- **Headings:** Poppins SemiBold 600 (`poppins_n6`)
- **Body, UI, labels:** Work Sans Regular 400 (`work_sans_n4`)

| Level | Family · weight | Mobile | Desktop |
|---|---|---|---|
| Display | Poppins 600 | 32px | 48px |
| H2 / Section | Poppins 600 | 24px | 32px |
| H3 / Card | Poppins 600 | 20px | 24px |
| Body | Work Sans 400 | 16px | 17px |
| Price | Work Sans 700 | 18px | 20px |
| Badge / micro | Work Sans 500 | 13px | 13px |

**Nothing below 13px, ever.** No light or thin weights. No all-caps except
badges. Body line length capped at 65 characters. Prices set with tabular
numerals so grids never wobble.

## Imagery

**Do:** real Indian kitchens — steel utensils, a gas hob, tiles with grout ·
natural daylight, soft shadow, slightly warm · hands in frame, mid-action ·
the bottle is the hero and its label is legible.

**Don't:** white Scandinavian kitchens or marble islands · stock imagery of
Western families · cartoon germs, sparkle bursts, glowing surfaces · heavy
retouching.

**Shot list to brief first:** bottle on a real counter · hand spraying a greasy
hob · wipe-down mid-action · bottle held, label forward · flat-lay of the range.

**Icons:** 24px grid, 2px stroke, round caps, mono green, inline SVG drawn
in-house. No icon libraries — they cost load time, and every icon must be a
swappable theme setting anyway.

## Store UI

- **Buttons:** 48px tall, 8px radius, 600 weight, sentence case. Never
  "SHOP NOW". Never uppercase.
- **Badges:** lemon with ink text, never red. Red reads mass-market and works
  against the price tier.
- **Motion:** 150–200ms, ease-out, opacity and transform only. No parallax, no
  auto-rotating carousels, no bounce.
- **Speed:** under 2.5s LCP on a throttled mobile connection.
- **Always visible:** Add to Cart never hides behind a hover. Price, rating and
  COD visible without a tap.

## Accessibility

Ink on warm white 13.9:1 (AAA) · white on Ghar Green 4.9:1 (AA) · ink on lemon
10.4:1 (AAA). Body never below 16px on web. Tap targets 44×44px minimum. Never
signal by colour alone — sold out gets a word, not a grey tint. Alt text on
every image, written as a real description.

## Tone of voice

Warm, plain and specific. A friend who knows the product — not a chemical
company, not a lifestyle magazine.

| Write this | Not this |
|---|---|
| Cuts kitchen grease in one wipe. | Revolutionary cleaning technology. |
| One bottle, about 40 cleans. | Premium quality assured. |
| Plant-based cleansers from coconut. | 100% chemical-free, fully natural. |
| Cash on delivery available. | Elevate your everyday cleaning ritual. |
| Safe around food and children. | Kills 99.9% of everything, always. |

Hinglish is allowed in a headline or campaign line. The site itself is written
in English. No Devanagari in the interface.

## Claims

Environmental claims must be substantiated. "Eco-friendly", "non-toxic",
"biodegradable" and "chemical-free" are absolute claims — a disclaimer does not
rescue them.

| Safe to say | Do not say |
|---|---|
| Plant-based cleansers from coconut | 100% natural, chemical-free |
| Bottle made from recycled plastic | Completely eco-friendly |
| No added SLES, phthalates, phosphates | Non-toxic, totally safe |
| Cleans better than an ordinary cleaner | Beats [named competitor] |

Every claim must trace back to a supplier document or a test report.

## Festive mode

Diwali is 8 November 2026. Demand peaks about two weeks before, not on the day.

**The only visual change:** lemon becomes the dominant accent, Forest its
contrast, plus one warm marigold (`#E88C1A`) for festive graphics only. One
banner image. Both are theme settings, so October needs no code.

**Offer depth 15–25%**, through bundles and a Diwali Clean-Home Kit rather than
deep cuts on single bottles. No diyas scattered across the layout. No red and
gold.
