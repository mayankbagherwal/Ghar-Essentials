/*
  Sticky buy bar.

  Two jobs: decide when the bar should be on screen, and keep it saying the
  same thing as the product page above it.

  Visibility is tied to the real Add to cart button rather than to a scroll
  distance. A distance is a guess that is wrong on every screen it was not
  measured on - on a tall phone the button is still visible at 600px, on a
  short one it left at 300px. Watching the button itself is right everywhere,
  and IntersectionObserver does it without running code on every scroll frame.

  The bar's price and variant follow the picker on the page, which announces
  changes on the document. Without that a shopper could pick the 1 litre and
  add the 500 ml from down here.
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
        this.watchBuyButton();

        /* Rotating a phone or dragging a window across the breakpoint changes
           which button is on screen, and with it which one the bar should be
           watching. */
        this.breakpoint = window.matchMedia('(min-width: 750px)');
        this.onBreakpoint = () => {
          if (this.observer) this.observer.disconnect();
          this.watchBuyButton();
        };
        this.breakpoint.addEventListener('change', this.onBreakpoint);
      }

      disconnectedCallback() {
        if (this.observer) this.observer.disconnect();
        if (this.breakpoint) this.breakpoint.removeEventListener('change', this.onBreakpoint);
        document.removeEventListener('ghar:variant:change', this.onVariant);
      }

      /* ---- when to show ---- */

      watchBuyButton() {
        /* Whichever button is the page's own call to action. When the buy
           column's Add to cart is turned off, that is the bundle's button, and
           the bar takes over once it scrolls away - so there are never two
           buttons on screen asking for the same tap.

           Deliberately not falling back to any .product-form__submit on the
           page: the related-products grid further down has those, and watching
           one of them would keep the bar hidden for most of the page. */
        const buyButton = document.querySelector('[data-ghar-atc]');

        /* The buy column's button is in the markup on every screen and hidden
           by CSS above the phone breakpoint, so its presence is not the
           question - whether it is actually being shown is. offsetParent is
           null for anything display:none, which answers that without this file
           needing to know what the breakpoint is. */
        const target = buyButton && buyButton.offsetParent !== null
          ? buyButton
          : document.querySelector('[data-fbt-add]');

        /* No buy button on the page to hide behind - a gift card template, say.
           Showing the bar unconditionally is the safe answer: the shopper can
           still buy, which is the whole point of it. */
        if (!target || !('IntersectionObserver' in window)) {
          this.toggle(true);
          return;
        }

        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              this.toggle(!entry.isIntersecting);
            });
          },
          { rootMargin: '0px 0px -20px 0px' }
        );

        this.observer.observe(target);
      }

      /* A fixed bar covers whatever is at the bottom of the page, so the page
         is given exactly as much extra room underneath as the bar takes up.
         Measured rather than guessed, because the bar is taller when the offer
         strip is on and shorter when it is off. */
      toggle(visible) {
        this.classList.toggle('is-visible', visible);
        document.body.style.paddingBottom = visible ? `${this.offsetHeight}px` : '';
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
