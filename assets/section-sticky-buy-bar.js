/*
  Sticky buy bar.

  It sits at the bottom of every product page and stays there. Its one job
  beyond that is to keep saying the same thing as the page above it: the price
  and the variant follow the picker, which announces changes on the document.
  Without that a shopper could pick the 1 litre and add the 500 ml from down
  here.

  The quantity stepper is desktop only. On a phone it is already in the buy
  column at its normal place, and the width down here is better spent on the
  button.
*/
if (!customElements.get('ghar-sticky-buy')) {
  customElements.define(
    'ghar-sticky-buy',
    class GharStickyBuy extends HTMLElement {
      connectedCallback() {
        this.priceEl = this.querySelector('[data-sticky-price]');
        this.mrpEl = this.querySelector('[data-sticky-mrp]');
        this.idInput = this.querySelector('[data-sticky-variant-id]');
        this.button = this.querySelector('[data-sticky-atc]');
        this.buttonText = this.querySelector('[data-sticky-atc-text]');
        this.quantityInput = this.querySelector('[data-sticky-quantity]');

        this.bindQuantity();
        this.bindVariants();
        this.show();

        /* The bar is taller on a desktop, where the quantity stepper is
           showing, so the room reserved for it under the page is re-measured
           when the window crosses the breakpoint. */
        this.breakpoint = window.matchMedia('(min-width: 750px)');
        this.onBreakpoint = () => this.show();
        this.breakpoint.addEventListener('change', this.onBreakpoint);
      }

      disconnectedCallback() {
        if (this.breakpoint) this.breakpoint.removeEventListener('change', this.onBreakpoint);
        document.body.style.paddingBottom = '';
        document.removeEventListener('ghar:variant:change', this.onVariant);
      }

      /* ---- when to show ---- */

      /* Always. It used to hide while the page's own buy button was on screen,
         on the reasoning that two buttons asking for the same tap is one too
         many. In practice a bar that comes and goes reads as something the
         page is doing rather than as furniture, and it is gone at exactly the
         moment the shopper is deciding. It stays put now, the way the shops
         we are matching do it. */
      show() {
        this.reserveRoom();
      }

      /* A fixed bar covers whatever is at the bottom of the page, so the page
         is given exactly as much extra room underneath as the bar takes up.
         Measured rather than guessed, because the bar is taller when the offer
         strip is on and shorter when it is off. */
      reserveRoom() {
        document.body.style.paddingBottom = `${this.offsetHeight}px`;
      }

      /* ---- quantity ---- */

      bindQuantity() {
        if (!this.quantityInput) return;

        this.querySelectorAll('[data-sticky-quantity-change]').forEach((button) => {
          button.addEventListener('click', () => {
            const step = button.dataset.stickyQuantityChange === 'plus' ? 1 : -1;
            const next = Math.max(1, (parseInt(this.quantityInput.value, 10) || 1) + step);
            this.quantityInput.value = next;
            this.quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
          });
        });
      }

      /* ---- follow the page's variant picker ---- */

      bindVariants() {
        this.onVariant = (event) => {
          const variant = event.detail;
          if (!variant) return;

          if (this.idInput) this.idInput.value = variant.id;
          if (this.priceEl) this.priceEl.innerHTML = variant.price;

          if (this.mrpEl) {
            this.mrpEl.innerHTML = variant.compare_at_price || '';
            this.mrpEl.hidden = !variant.compare_at_price;
          }

          if (this.button) {
            this.button.disabled = !variant.available;
            if (this.buttonText) {
              this.buttonText.textContent = variant.available
                ? this.button.dataset.addLabel
                : this.button.dataset.soldOutLabel;
            }
          }
        };

        document.addEventListener('ghar:variant:change', this.onVariant);
      }
    }
  );
}
