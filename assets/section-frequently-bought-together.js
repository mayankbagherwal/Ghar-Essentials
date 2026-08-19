/*
  Frequently bought together.

  Liquid renders the cards and their real prices; this keeps the totals, the
  button and the savings line in step as boxes are ticked, and adds every
  ticked product to the cart in one request.

  Nothing here invents a price. Each checkbox carries the variant's own price
  and compare-at price in data attributes, straight from Liquid, and the totals
  are those numbers added up. The struck-through figure is the MRPs added up,
  so "you save X" is the difference between two real amounts.
*/
if (!customElements.get('ghar-bundle')) {
  customElements.define(
    'ghar-bundle',
    class GharBundle extends HTMLElement {
      connectedCallback() {
        this.items = Array.from(this.querySelectorAll('[data-fbt-item]'));
        this.button = this.querySelector('[data-fbt-add]');
        this.buttonText = this.querySelector('[data-fbt-button-text]');
        this.spinner = this.querySelector('[data-fbt-spinner]');
        this.totalEl = this.querySelector('[data-fbt-total]');
        this.wasEl = this.querySelector('[data-fbt-was]');
        this.savingsEl = this.querySelector('[data-fbt-savings]');
        this.errorEl = this.querySelector('[data-fbt-error]');

        this.onChange = this.render.bind(this);
        this.items.forEach((item) => item.addEventListener('change', this.onChange));

        if (this.button) this.button.addEventListener('click', this.onAdd.bind(this));

        this.startTimer();
        this.render();
      }

      disconnectedCallback() {
        this.items.forEach((item) => item.removeEventListener('change', this.onChange));
        this.stopTimer();
      }

      get selected() {
        return this.items.filter((item) => item.checked);
      }

      money(cents) {
        return window.gharFormatMoney ? window.gharFormatMoney(cents) : String(Math.round(cents / 100));
      }

      render() {
        const selected = this.selected;
        const total = selected.reduce((sum, item) => sum + Number(item.dataset.price || 0), 0);
        const was = selected.reduce((sum, item) => sum + Number(item.dataset.compare || 0), 0);
        const saved = Math.max(0, was - total);
        const count = selected.length;

        if (this.totalEl) this.totalEl.textContent = this.money(total);

        /* The struck-through total only means something when there is a real
           gap between the MRPs and what is being charged. */
        if (this.wasEl) {
          this.wasEl.textContent = saved > 0 ? this.money(was) : '';
          this.wasEl.hidden = saved <= 0;
        }

        if (this.buttonText) {
          const label = count === 0 ? this.dataset.emptyLabel : this.dataset.buttonLabel;
          this.buttonText.textContent = (label || '').replace('{count}', count);
        }

        if (this.button) {
          this.button.disabled = count === 0;
        }

        if (this.savingsEl) {
          const template = this.dataset.savingsText || '';
          const show = template && count > 0 && saved > 0;
          this.savingsEl.textContent = show
            ? template
                .replace('{count}', count)
                .replace('{total}', this.money(total))
                .replace('{saved}', this.money(saved))
            : '';
          this.savingsEl.hidden = !show;
        }
      }

      /* ---- countdown ---- */

      startTimer() {
        this.timerEl = this.querySelector('[data-fbt-timer]');
        this.clockEl = this.querySelector('[data-fbt-clock]');
        if (!this.timerEl || !this.clockEl) return;

        const fixed = (this.dataset.timerEnd || '').trim();
        if (fixed) {
          /* A real deadline the owner typed in. Everyone sees the same one, and
             it does not come back when the page is reloaded. */
          const parsed = Date.parse(fixed.replace(' ', 'T'));
          if (Number.isNaN(parsed)) return;
          this.deadline = parsed;
        } else {
          /* No deadline set, so count down from this visit. Held in
             sessionStorage rather than restarted on every render, so moving
             between pages does not hand the shopper a fresh five minutes. */
          const key = this.dataset.timerKey;
          const minutes = Number(this.dataset.timerMinutes) || 5;
          let stored = null;
          try {
            stored = window.sessionStorage.getItem(key);
          } catch (error) {
            stored = null;
          }

          this.deadline = stored ? Number(stored) : Date.now() + minutes * 60000;

          if (!stored) {
            try {
              window.sessionStorage.setItem(key, String(this.deadline));
            } catch (error) {
              /* Private browsing. The countdown still runs for this page. */
            }
          }
        }

        this.timerEl.hidden = false;
        this.tick();
        this.timer = window.setInterval(() => this.tick(), 1000);
      }

      stopTimer() {
        if (!this.timer) return;
        window.clearInterval(this.timer);
        this.timer = null;
      }

      tick() {
        const remaining = this.deadline - Date.now();

        if (remaining <= 0) {
          if (this.dataset.timerOnEnd === 'restart' && !this.dataset.timerEnd) {
            const minutes = Number(this.dataset.timerMinutes) || 5;
            this.deadline = Date.now() + minutes * 60000;
            try {
              window.sessionStorage.setItem(this.dataset.timerKey, String(this.deadline));
            } catch (error) {
              /* nothing to do */
            }
            return;
          }

          /* The offer itself stays. Only the countdown goes, so nobody is told
             a deal has expired when it has not. */
          this.stopTimer();
          this.timerEl.hidden = true;
          return;
        }

        const totalSeconds = Math.floor(remaining / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const pad = (n) => String(n).padStart(2, '0');

        if (days > 0) {
          this.clockEl.textContent = `${days}d ${pad(hours)}h ${pad(minutes)}m`;
        } else if (hours > 0) {
          this.clockEl.textContent = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
        } else {
          this.clockEl.textContent = `${pad(minutes)}m : ${pad(seconds)}s`;
        }
      }

      /* ---- add to cart ---- */

      onAdd() {
        const selected = this.selected;
        if (selected.length === 0 || this.adding) return;

        this.adding = true;
        this.setLoading(true);
        this.showError('');

        const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');

        /* One request for the whole set. Adding them one at a time would fire
           the cart drawer open on each, and a failure halfway through would
           leave a part-built bundle in the cart. */
        const body = {
          items: selected.map((item) => ({ id: Number(item.value), quantity: 1 })),
        };

        if (cart) {
          body.sections = cart.getSectionsToRender().map((section) => section.id);
          body.sections_url = window.location.pathname;
          cart.setActiveElement(document.activeElement);
        }

        fetch(`${window.routes.cart_add_url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/javascript',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(body),
        })
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              this.showError(response.description || response.message);
              return;
            }

            if (cart) {
              cart.renderContents(response);
            } else {
              window.location = window.routes.cart_url;
            }
          })
          .catch(() => {
            this.showError(this.dataset.errorText || 'Something went wrong. Please try again.');
          })
          .finally(() => {
            this.adding = false;
            this.setLoading(false);
          });
      }

      setLoading(state) {
        if (this.button) this.button.setAttribute('aria-busy', state ? 'true' : 'false');
        if (this.spinner) this.spinner.hidden = !state;
      }

      showError(message) {
        if (!this.errorEl) return;
        this.errorEl.textContent = message || '';
        this.errorEl.hidden = !message;
      }
    }
  );
}
