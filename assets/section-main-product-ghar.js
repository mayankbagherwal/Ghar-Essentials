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
