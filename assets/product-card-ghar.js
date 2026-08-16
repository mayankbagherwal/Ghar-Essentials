/*
  Ghar Essentials product card — variant swap inside the grid.

  Lets a shopper change size without leaving the grid. Reads the variant data
  printed into the card by product-card-ghar.liquid (prices are pre-formatted
  server-side by the money filter, so no currency formatting happens here) and
  updates the price row, size line, hidden variant id and Add to Cart state.

  Adding to cart is handled by Dawn's own product-form.js — this element does
  not touch it.

  Being a custom element, connectedCallback runs again whenever the theme
  editor re-renders a section, so no shopify:section:load listener is needed.
*/
if (!customElements.get('ghar-product-card')) {
  customElements.define(
    'ghar-product-card',
    class GharProductCard extends HTMLElement {
      connectedCallback() {
        this.select = this.querySelector('[data-ghar-variant-select]');
        if (!this.select || this.dataset.gharBound === 'true') return;

        const dataEl = this.querySelector('[data-ghar-variants]');
        if (!dataEl) return;

        try {
          this.variants = JSON.parse(dataEl.textContent);
        } catch (error) {
          console.error('Ghar card: could not parse variant data', error);
          return;
        }

        this.priceEl = this.querySelector('[data-ghar-price]');
        this.mrpEl = this.querySelector('[data-ghar-mrp]');
        this.offEl = this.querySelector('[data-ghar-off]');
        this.badgeEl = this.querySelector('[data-ghar-badge-off]');
        this.sizeEl = this.querySelector('[data-ghar-size]');
        this.idInput = this.querySelector('[data-ghar-variant-id]');
        this.button = this.querySelector('[data-ghar-atc]');
        this.buttonText = this.button ? this.button.querySelector('[data-ghar-atc-text]') : null;

        this.select.addEventListener('change', this.onVariantChange.bind(this));
        this.dataset.gharBound = 'true';
      }

      onVariantChange() {
        const variant = this.variants.find((item) => String(item.id) === this.select.value);
        if (!variant) return;

        if (this.idInput) this.idInput.value = variant.id;
        if (this.priceEl) this.priceEl.innerHTML = variant.price;
        if (this.sizeEl) this.sizeEl.textContent = variant.title;

        if (this.mrpEl) {
          this.mrpEl.innerHTML = variant.compare_at_price || '';
          this.mrpEl.hidden = !variant.compare_at_price;
        }

        const hasDiscount = variant.discount > 0;

        if (this.offEl) {
          this.offEl.textContent = hasDiscount ? `${variant.discount}% off` : '';
          this.offEl.hidden = !hasDiscount;
        }

        if (this.badgeEl) {
          this.badgeEl.textContent = hasDiscount ? `${variant.discount}% OFF` : '';
          this.badgeEl.hidden = !hasDiscount || !variant.available;
        }

        this.updateButton(variant.available);
      }

      updateButton(available) {
        if (!this.button) return;

        this.button.disabled = !available;
        if (this.buttonText && this.button.dataset.soldOutLabel && this.button.dataset.addLabel) {
          this.buttonText.textContent = available
            ? this.button.dataset.addLabel
            : this.button.dataset.soldOutLabel;
        }
      }
    }
  );
}
