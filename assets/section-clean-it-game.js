/*
  "Clean it up".

  One photograph of a clean kitchen sits underneath as a normal image. The
  grime over it is drawn onto a canvas in code - a greasy film, splatter,
  specks and a few drips - and a finger dragged across erases it, using
  destination-out compositing, which removes pixels rather than painting over
  them. So the shopper is uncovering the real photograph underneath. That is
  what makes it feel like wiping instead of like a cross-fade.

  Drawing the mess rather than photographing it means there is no second shot
  to keep framed identically, and the dirt lands somewhere different every time
  the game is played.

  Two decisions worth knowing about:

  - Progress is measured on a coarse grid of cells marked as the brush passes
    over them, not by reading the canvas back with getImageData. Reading pixels
    on every pointer move is expensive on a phone, and a canvas holding an image
    from Shopify's CDN can refuse the read outright depending on how it was
    served. Counting cells is cheap, cannot throw, and is accurate enough to
    answer the only question being asked: has most of it been wiped yet.

  - Once the threshold is passed the rest clears itself. Leaving someone to
    hunt the last specks out of the corners turns a nice moment into a chore.

  touch-action on the frame is pan-y, so a horizontal drag wipes and a vertical
  one still scrolls the page. Wiping the stove should never trap the shopper on
  it.
*/
if (!customElements.get('ghar-clean-game')) {
  customElements.define(
    'ghar-clean-game',
    class GharCleanGame extends HTMLElement {
      connectedCallback() {
        this.frame = this.querySelector('[data-clean-frame]');
        this.canvas = this.querySelector('[data-clean-canvas]');
        this.resetButton = this.querySelector('[data-clean-reset]');
        this.skipButton = this.querySelector('[data-clean-skip]');
        if (!this.frame || !this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) return;

        this.threshold = Math.min(95, Math.max(10, Number(this.dataset.threshold) || 60));
        this.level = Math.min(10, Math.max(1, Number(this.dataset.grimeLevel) || 6));
        this.grime = this.rgb(this.dataset.grimeColor) || { r: 107, g: 74, b: 34 };
        this.seed = Math.floor(Math.random() * 1e9);
        this.grid = 24;
        this.done = false;
        this.painting = false;

        this.onDown = this.onDown.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onUp = this.onUp.bind(this);
        this.tryPaint = this.tryPaint.bind(this);

        this.frame.addEventListener('pointerdown', this.onDown);
        this.frame.addEventListener('pointermove', this.onMove);
        window.addEventListener('pointerup', this.onUp);

        if (this.resetButton) this.resetButton.addEventListener('click', () => this.reset());

        /* Not everyone can drag: a keyboard, a switch, a screen reader. The
           skip button gets them the same payoff. */
        if (this.skipButton) this.skipButton.addEventListener('click', () => this.finish());

        /* The grime is drawn, not fetched, so the only thing worth waiting for
           is the frame having a size. A frame that is off screen, or in a tab
           that has not been shown yet, measures zero - so rather than painting
           once and hoping, its size is watched. */
        if ('ResizeObserver' in window) {
          this.sizeObserver = new ResizeObserver(this.tryPaint);
          this.sizeObserver.observe(this.frame);
        } else {
          window.addEventListener('resize', this.tryPaint);
        }

        this.tryPaint();
      }

      disconnectedCallback() {
        window.removeEventListener('pointerup', this.onUp);
        window.removeEventListener('resize', this.tryPaint);
        if (this.sizeObserver) this.sizeObserver.disconnect();
      }

      /* Paint only when there is something to paint onto something. The width
         check also stops a resize that changed nothing from wiping away a game
         already in progress. */
      tryPaint() {
        const rect = this.frame.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        if (this.painted && Math.abs(rect.width - this.width) < 2) return;

        this.painted = true;
        this.paint();
      }

      /* ---- painting the dirt on ---- */

      paint() {
        const rect = this.frame.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        /* Capped at 2: past that the extra pixels cost memory and fill rate on
           a mid-range phone and nobody can see the difference. */
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = Math.round(rect.width * dpr);
        this.canvas.height = Math.round(rect.height * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.width = rect.width;
        this.height = rect.height;
        this.brush = Math.max(28, Math.min(this.width, this.height) * 0.16);

        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawGrime(this.width, this.height);

        this.cells = new Array(this.grid * this.grid).fill(false);
        this.cleared = 0;
        this.done = false;
        this.last = null;
        this.classList.remove('cleangame--done', 'cleangame--started');
      }

      /* ---- drawing the mess ---- */

      /* A seeded generator rather than Math.random, so one game is one mess:
         the pattern survives a repaint from a resize instead of the dirt
         jumping to new places under the shopper's finger mid-wipe. Playing
         again reseeds, which is where the variety belongs. */
      random() {
        this.seed |= 0;
        this.seed = (this.seed + 0x6d2b79f5) | 0;
        let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      }

      between(min, max) {
        return min + this.random() * (max - min);
      }

      rgb(value) {
        const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(value || '').trim());
        if (!match) return null;
        return {
          r: parseInt(match[1], 16),
          g: parseInt(match[2], 16),
          b: parseInt(match[3], 16),
        };
      }

      shade(amount, alpha) {
        const c = this.grime;
        const mix = (channel) => Math.round(Math.max(0, Math.min(255, channel * amount)));
        return `rgba(${mix(c.r)}, ${mix(c.g)}, ${mix(c.b)}, ${alpha})`;
      }

      /* Four passes, coarse to fine. Real kitchen grime is not one thing: it is
         a dulling film, then splashes, then the fine speckle of spices and
         crumbs, with a few drips where something ran down. Drawing them as
         separate layers is what stops it reading as a brown rectangle. */
      drawGrime(width, height) {
        const ctx = this.ctx;
        const density = this.level / 10;
        const area = (width * height) / 100000;
        ctx.save();

        this.filmPass(width, height, density);
        this.splatterPass(width, height, density, area);
        this.speckPass(width, height, density, area);
        this.dripPass(width, height, density);

        ctx.restore();
      }

      /* The film. Broad soft patches rather than a flat wash, so the surface
         looks unevenly grubby the way a real one does. */
      filmPass(width, height, density) {
        const ctx = this.ctx;
        const patches = 5 + Math.round(density * 5);

        for (let i = 0; i < patches; i += 1) {
          const x = this.between(0, width);
          const y = this.between(0, height);
          const radius = this.between(width * 0.25, width * 0.7);
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, this.shade(1, 0.1 + density * 0.16));
          gradient.addColorStop(1, this.shade(1, 0));
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        }
      }

      /* Splashes. Each one is a handful of overlapping circles rather than a
         single disc - a perfect circle reads as a sticker, a lumpy cluster
         reads as something that landed. */
      splatterPass(width, height, density, area) {
        const ctx = this.ctx;
        const blobs = Math.round((8 + density * 26) * Math.max(1, area / 8));

        for (let i = 0; i < blobs; i += 1) {
          const cx = this.between(0, width);
          const cy = this.between(0, height);
          const size = this.between(width * 0.012, width * 0.055);
          const alpha = this.between(0.18, 0.34) * (0.5 + density);
          ctx.fillStyle = this.shade(this.between(0.75, 1.15), Math.min(0.62, alpha));

          const lobes = 3 + Math.floor(this.random() * 4);
          for (let l = 0; l < lobes; l += 1) {
            const ox = cx + this.between(-size, size);
            const oy = cy + this.between(-size, size);
            ctx.beginPath();
            ctx.arc(ox, oy, size * this.between(0.35, 0.95), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      /* Spices, crumbs, burnt bits. Small, dark and plentiful - this is the
         layer that makes it read as a kitchen rather than as mud. */
      speckPass(width, height, density, area) {
        const ctx = this.ctx;
        const specks = Math.round((90 + density * 320) * Math.max(1, area / 8));

        for (let i = 0; i < specks; i += 1) {
          const x = this.between(0, width);
          const y = this.between(0, height);
          const radius = this.between(width * 0.0012, width * 0.0042);
          ctx.fillStyle = this.shade(this.between(0.35, 0.8), this.between(0.35, 0.85));
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* A few runs where something splashed and slid down. Tapered, because a
         drip is heavy at the top and thins as it goes. */
      dripPass(width, height, density) {
        const ctx = this.ctx;
        const drips = Math.round(2 + density * 6);

        for (let i = 0; i < drips; i += 1) {
          const x = this.between(0, width);
          const top = this.between(0, height * 0.55);
          const length = this.between(height * 0.06, height * 0.28);
          const wide = this.between(width * 0.004, width * 0.011);
          const gradient = ctx.createLinearGradient(x, top, x, top + length);
          gradient.addColorStop(0, this.shade(0.9, this.between(0.25, 0.45)));
          gradient.addColorStop(1, this.shade(0.9, 0));

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(x - wide, top);
          ctx.lineTo(x + wide, top);
          ctx.lineTo(x, top + length);
          ctx.closePath();
          ctx.fill();
        }
      }

      /* ---- wiping it off ---- */

      point(event) {
        const rect = this.frame.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
      }

      onDown(event) {
        if (this.done || !this.cells) return;

        this.painting = true;
        this.classList.add('cleangame--started');
        if (this.frame.setPointerCapture) this.frame.setPointerCapture(event.pointerId);

        const p = this.point(event);
        this.last = p;
        this.wipe(p, p);
      }

      onMove(event) {
        if (!this.painting || this.done) return;

        const p = this.point(event);
        this.wipe(this.last || p, p);
        this.last = p;
      }

      onUp() {
        this.painting = false;
        this.last = null;
      }

      wipe(from, to) {
        const ctx = this.ctx;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = this.brush;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        this.mark(from, to);
      }

      /* Mark every grid cell the stroke passed over. Stepping along the line
         rather than only marking its ends means a fast flick still counts the
         ground it covered. */
      mark(from, to) {
        const distance = Math.hypot(to.x - from.x, to.y - from.y);
        const steps = Math.max(1, Math.ceil(distance / (this.brush / 2)));
        const radius = this.brush / 2;

        for (let s = 0; s <= steps; s += 1) {
          const x = from.x + ((to.x - from.x) * s) / steps;
          const y = from.y + ((to.y - from.y) * s) / steps;

          const minCol = Math.floor(((x - radius) / this.width) * this.grid);
          const maxCol = Math.floor(((x + radius) / this.width) * this.grid);
          const minRow = Math.floor(((y - radius) / this.height) * this.grid);
          const maxRow = Math.floor(((y + radius) / this.height) * this.grid);

          for (let row = minRow; row <= maxRow; row += 1) {
            for (let col = minCol; col <= maxCol; col += 1) {
              if (row < 0 || col < 0 || row >= this.grid || col >= this.grid) continue;

              const index = row * this.grid + col;
              if (this.cells[index]) continue;

              this.cells[index] = true;
              this.cleared += 1;
            }
          }
        }

        if ((this.cleared / this.cells.length) * 100 >= this.threshold) this.finish();
      }

      finish() {
        if (this.done) return;
        this.done = true;
        this.painting = false;
        this.classList.add('cleangame--started', 'cleangame--done');
      }

      reset() {
        this.seed = Math.floor(Math.random() * 1e9);
        this.paint();
      }

    }
  );
}
