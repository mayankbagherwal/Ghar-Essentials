/*
  "Clean it up".

  The clean photograph sits underneath as a normal image. The dirty one is
  painted onto a canvas on top, and a finger dragged across the canvas erases
  it - destination-out compositing, which removes pixels rather than painting
  over them. So the shopper is uncovering the real second photograph. That is
  what makes it feel like wiping instead of like a cross-fade.

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
        this.source = this.querySelector('[data-clean-source]');
        this.resetButton = this.querySelector('[data-clean-reset]');
        this.skipButton = this.querySelector('[data-clean-skip]');
        if (!this.frame || !this.canvas || !this.source) return;

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) return;

        this.threshold = Math.min(95, Math.max(10, Number(this.dataset.threshold) || 60));
        this.grid = 24;
        this.done = false;
        this.painting = false;

        this.onDown = this.onDown.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onUp = this.onUp.bind(this);
        this.onResize = this.onResize.bind(this);

        this.frame.addEventListener('pointerdown', this.onDown);
        this.frame.addEventListener('pointermove', this.onMove);
        window.addEventListener('pointerup', this.onUp);
        window.addEventListener('resize', this.onResize);

        if (this.resetButton) this.resetButton.addEventListener('click', () => this.reset());

        /* Not everyone can drag: a keyboard, a switch, a screen reader. The
           skip button gets them the same payoff. */
        if (this.skipButton) this.skipButton.addEventListener('click', () => this.finish());

        if (this.source.complete && this.source.naturalWidth) {
          this.paint();
        } else {
          this.source.addEventListener('load', () => this.paint(), { once: true });
        }
      }

      disconnectedCallback() {
        window.removeEventListener('pointerup', this.onUp);
        window.removeEventListener('resize', this.onResize);
        window.clearTimeout(this.resizeTimer);
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
        this.drawCover(this.source, this.width, this.height);

        this.cells = new Array(this.grid * this.grid).fill(false);
        this.cleared = 0;
        this.done = false;
        this.last = null;
        this.classList.remove('cleangame--done', 'cleangame--started');
      }

      /* object-fit: cover, done by hand, so the dirty photograph is framed
         exactly like the clean one underneath it. Any mismatch would show as
         the edges jumping the moment the canvas fades. */
      drawCover(image, width, height) {
        const iw = image.naturalWidth;
        const ih = image.naturalHeight;
        if (!iw || !ih) return;

        const scale = Math.max(width / iw, height / ih);
        const w = iw * scale;
        const h = ih * scale;
        this.ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
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
        this.paint();
      }

      /* The canvas is sized in CSS pixels, so a rotation or a resized window
         leaves it stretched. Repainting restarts the game, which is the honest
         outcome - half a wipe cannot be carried across a new canvas size. */
      onResize() {
        window.clearTimeout(this.resizeTimer);
        this.resizeTimer = window.setTimeout(() => {
          const rect = this.frame.getBoundingClientRect();
          if (Math.abs(rect.width - (this.width || 0)) < 2) return;
          this.paint();
        }, 200);
      }
    }
  );
}
