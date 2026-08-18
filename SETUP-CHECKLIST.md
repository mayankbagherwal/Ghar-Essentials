# SETUP-CHECKLIST.md — what the owner needs to supply

Everything below is a placeholder in the theme right now. None of it needs code.
Each item says where to set it and what "good" looks like.

Anything marked **[SUBSTANTIATE BEFORE LAUNCH]** is a claim that needs proof you
can show if challenged — ASCI's Green Claims Guidelines apply to all of it.
Do not launch with those markers still visible on the site.

## Settled — no longer open questions

- **Discount depth.** The 47% off on the kitchen cleaner is deliberate and set
  by the owner. It sits above the 15–25% band in BUILD-SPEC §10 and the brand
  book, and that trade-off has been considered and accepted.
- **Judge.me sample reviews.** Switched on intentionally while the site is
  being built, so layout can be checked with stars in place. The owner removes
  them before going live. Three places carry them: the product page Star
  Ratings block, and the two homepage carousels.

---

## 1. Shopify admin — before anything looks right

| What | Where | Why it matters |
|---|---|---|
| At least one product | Products → Add product | Without products the bestsellers grid and product page have nothing to render |
| A **compare-at price** on each product | Product → Pricing → Compare-at price | This is what makes the `% OFF` badge and the struck-through MRP appear. No compare-at price = no badge, by design |
| Two photos per product | Product → Media | The second one is what shows on hover in the grid |
| Variants named by size | Product → Variants, e.g. `500 ml`, `1 L` | Drives the size pills on the product page and the dropdown in the card |
| A collection called **Bestsellers** | Products → Collections | Then pick it in the Bestsellers grid section settings |
| Cart type set to **Drawer** | Theme editor → Theme settings → Cart | Saves a tap on the way to checkout |
| Dynamic checkout on | Settings → Payments → Dynamic checkout buttons | Otherwise the Buy Now button renders nothing |
| Cash on delivery enabled | Settings → Payments | The site says COD is available — it must actually be |
| The prepaid discount | Discounts → automatic discount | The product page advertises "Extra 5% off on prepaid". The text is live; the discount itself is not |

---

## 2. Images to shoot or source

All of these are `image_picker` settings in the theme editor, and each one repeats
this description in its help text so you do not need this file open while working.

### Hero — mobile
**Tall, ~1000×1200px.** A real Indian kitchen, mid-use: a hand spraying a counter
or wiping a stove, bottle visible. Keep the bottle in the lower half so the
headline sits over empty space. No empty white studio kitchens — they read as
stock photography and cost trust.

### Hero — desktop
**Wide, ~2000×1100px.** Same scene, reframed. Bottle to one side, clear space on
the other for the headline and button.

### Hero — video (optional, replaces the images)
**5–8 seconds, silent, looping, under 5MB.** Spray → wipe → clean surface. A phone
camera in a real kitchen is fine and reads as more honest than a studio shoot.
Anything heavier will hurt you on mobile data.

### Trust strip — four icons
**Square, ~120×120px, transparent PNG or SVG.** Flat line icons, all four in one
visual style: same stroke weight, same single colour (brand green works). Suggested
set: a leaf, a shield, a rupee note or delivery truck, a calendar or clock.

### Product photos
**Square, at least 1200×1200px.** Plain, uncluttered background. At least two per
product: one straight-on pack shot, one in-use or in-context. Consistent lighting
and framing across the range — this is most of what makes a store look premium.

---

## 3. Copy placeholders to replace

| Placeholder | Where | Note |
|---|---|---|
| `[ADD REAL PROOF - e.g. 4.7 stars from 200 verified reviews]` | Hero → Small proof line | Fill in from the real Judge.me count once there are enough reviews to quote |
| Coconut-derived cleanser claim | Product page → Benefit bullets | **[SUBSTANTIATE BEFORE LAUNCH]** |
| "No added SLES, phthalates, sulphates, phosphates" | Product page → Benefit bullets and Ingredients | **[SUBSTANTIATE BEFORE LAUNCH]** |
| "Safe to use around food preparation areas" | Product page → Benefit bullets | **[SUBSTANTIATE BEFORE LAUNCH]** |
| Full ingredient list | Product page → Ingredients row | **[SUBSTANTIATE BEFORE LAUNCH]** |
| "Delivered in 3-5 working days" | Product page → Delivery and returns | Confirm with your courier before promising it |
| "Returned within 7 days" | Product page → Delivery and returns | Must match your actual policy page |

**Rules for anything you write yourself:** specific and provable beats broad.
"Plant-based cleansers derived from coconut" is fine. "100% eco-friendly",
"completely chemical-free" and "totally non-toxic" are not — they are absolute
claims and a disclaimer does not rescue them. Compare against "a regular cleaner",
never against a brand by name.

---

## 4. Business details still needed

For the footer, which is not built yet:

- Registered company name and address
- GST number
- Phone number and WhatsApp number
- Policy pages: shipping, returns, privacy, terms
- Logo file — the green house-and-leaf mark, PNG or SVG with transparency

In India this block is a trust signal, not legal boilerplate. First-time buyers
look for it.

---

## 5. Not built yet

Coming in later steps, so nothing to prepare beyond the above:
problem picker, bundles, comparison block, ingredients transparency, product demo,
testimonials, founder story, FAQ, offer bar, footer, Judge.me carousel.

Testimonials will ship with `[REPLACE WITH REAL REVIEW]` placeholders and must not
go live until you have real quotes with real names and cities.
