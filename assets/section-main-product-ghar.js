/*
  Ghar Essentials product page — variant switching and the quantity stepper.

  Prices are pre-formatted server-side by the money filter and printed into the
  page as JSON, so no currency formatting happens here. Adding to cart is
  Dawn's product-form.js; this element never touches it.

  Being a custom element, connectedCallback runs again whenever the theme
  editor re-renders the section, so no shopify:section:load listener is needed.
*/
if (!customElements.get('ghar-product-info')) {
  customElements.define(
    'ghar-product-info',
    class GharProductInfo extends HTMLElement {
      connectedCallback() {
        if (this.dataset.gharBound === 'true') return;

        const dataEl = this.querySelector('[data-ghar-variants]');
        if (dataEl) {
          try {
            this.variants = JSON.parse(dataEl.textContent);
          } catch (error) {
            console.error('Ghar product page: could not parse variant data', error);
            this.variants = [];
          }
        } else {
          this.variants = [];
        }

        this.priceEl = this.querySelector('[data-ghar-price]');
        this.mrpEl = this.querySelector('[data-ghar-mrp]');
        this.offEl = this.querySelector('[data-ghar-off]');
        this.idInput = this.querySelector('[data-ghar-variant-id]');
        this.button = this.querySelector('[data-ghar-atc]');
        this.buttonText = this.button ? this.button.querySelector('[data-ghar-atc-text]') : null;
        this.quantityInput = this.querySelector('[data-ghar-quantity]');

        this.bindVariants();
        this.bindQuantity();
        this.dataset.gharBound = 'true';
      }

      bindVariants() {
        const inputs = this.querySelectorAll('[data-ghar-variant-option]');
        inputs.forEach((input) => {
          input.addEventListener('change', () => this.onVariantChange(input.value));
        });
      }

      onVariantChange(variantId) {
        const variant = this.variants.find((item) => String(item.id) === String(variantId));
        if (!variant) return;

        if (this.idInput) this.idInput.value = variant.id;
        if (this.priceEl) this.priceEl.innerHTML = variant.price;

        if (this.mrpEl) {
          this.mrpEl.innerHTML = variant.compare_at_price || '';
          this.mrpEl.hidden = !variant.compare_at_price;
        }

        if (this.offEl) {
          const hasDiscount = variant.discount > 0;
          this.offEl.textContent = hasDiscount ? `${variant.discount}% off` : '';
          this.offEl.hidden = !hasDiscount;
        }

        this.updateButton(variant.available);
        this.updateUrl(variant.id);

        /* Anything else on the page that shows this product's price - the
           sticky buy bar at the bottom - listens for this rather than reaching
           into the picker itself, so neither has to know the other exists. */
        document.dispatchEvent(
          new CustomEvent('ghar:variant:change', { bubbles: true, detail: variant })
        );
      }

      updateButton(available) {
        if (!this.button) return;

        this.button.disabled = !available;
        if (this.buttonText && this.button.dataset.addLabel && this.button.dataset.soldOutLabel) {
          this.buttonText.textContent = available
            ? this.button.dataset.addLabel
            : this.button.dataset.soldOutLabel;
        }
      }

      /* Keeps the URL shareable and correct on reload, without a page fetch. */
      updateUrl(variantId) {
        if (!window.history.replaceState) return;
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variantId);
        window.history.replaceState({}, '', url.toString());
      }

      bindQuantity() {
        if (!this.quantityInput) return;

        this.querySelectorAll('[data-ghar-quantity-change]').forEach((button) => {
          button.addEventListener('click', () => {
            const step = button.dataset.gharQuantityChange === 'plus' ? 1 : -1;
            const min = parseInt(this.quantityInput.min, 10) || 1;
            const current = parseInt(this.quantityInput.value, 10) || min;
            this.quantityInput.value = Math.max(min, current + step);
            this.quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
          });
        });
      }
    }
  );
}

/*
  Product gallery.

  The swiping itself is not done here - the slides sit in a scroller with snap
  points, so the browser handles the gesture with its own momentum and does it
  before this file has loaded. What this adds is the link between the big
  photograph and the thumbnail rail, in both directions:

  - Tapping a thumbnail scrolls the rail to that photograph.
  - Swiping marks the thumbnail for whichever photograph has settled in view.

  The second half reads the scroller with an IntersectionObserver rather than a
  scroll listener, so nothing runs on every frame of a flick, and momentum
  scrolling reports the photograph it lands on rather than each one it passes.

  Which photograph is current is still held by the radio inputs, exactly as
  before, because the thumbnail highlight is a CSS rule keyed to them. Setting
  one from here updates the rail without this file needing to know how the
  highlight is drawn.
*/
if (!customElements.get('ghar-gallery')) {
  customElements.define(
    'ghar-gallery',
    class GharGallery extends HTMLElement {
      connectedCallback() {
        this.track = this.querySelector('.ghar-gallery__main');
        this.slides = Array.from(this.querySelectorAll('.ghar-gallery__slide'));
        this.radios = Array.from(this.querySelectorAll('.ghar-gallery__radio'));
        if (!this.track || this.slides.length < 2) return;

        this.bindThumbs();
        this.watchSlides();
      }

      disconnectedCallback() {
        if (this.observer) this.observer.disconnect();
      }

      bindThumbs() {
        this.querySelectorAll('.ghar-gallery__thumb label').forEach((label, index) => {
          label.addEventListener('click', () => {
            const slide = this.slides[index];
            if (!slide) return;

            /* Measured against the track's own scroll position rather than the
               page, so it is right whether the gallery is in the phone's single
               column or beside the buy panel on a desktop. */
            this.track.scrollTo({ left: slide.offsetLeft - this.track.offsetLeft });
          });
        });
      }

      watchSlides() {
        if (!('IntersectionObserver' in window)) return;

        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;

              const index = this.slides.indexOf(entry.target);
              const radio = this.radios[index];
              if (radio && !radio.checked) radio.checked = true;
            });
          },
          { root: this.track, threshold: 0.6 }
        );

        this.slides.forEach((slide) => this.observer.observe(slide));
      }
    }
  );
}
