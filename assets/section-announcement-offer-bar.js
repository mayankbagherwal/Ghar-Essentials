/*
  Offer bar: rotates between messages and remembers a dismissal.

  The dismissal key includes a hash of the message text, so publishing a new
  offer brings the bar back for someone who closed the old one.

  Being a custom element, connectedCallback runs again whenever the theme
  editor re-renders the section.
*/
if (!customElements.get('ghar-offer-bar')) {
  customElements.define(
    'ghar-offer-bar',
    class GharOfferBar extends HTMLElement {
      connectedCallback() {
        this.messages = Array.from(this.querySelectorAll('[data-offer-message]'));
        if (this.messages.length === 0) return;

        if (this.isDismissed()) {
          this.hidden = true;
          return;
        }

        const closeButton = this.querySelector('[data-offer-close]');
        if (closeButton) {
          closeButton.addEventListener('click', () => this.dismiss());
        }

        this.startRotating();
      }

      disconnectedCallback() {
        this.stopRotating();
      }

      startRotating() {
        if (this.messages.length < 2 || this.timer) return;

        const seconds = parseInt(this.dataset.rotateSeconds, 10) || 5;
        let index = 0;

        this.timer = setInterval(() => {
          this.messages[index].classList.remove('is-active');
          index = (index + 1) % this.messages.length;
          this.messages[index].classList.add('is-active');
        }, seconds * 1000);
      }

      stopRotating() {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
      }

      /* Cheap stable hash of the current messages, so changing the offer
         re-shows the bar to everyone who dismissed the previous one. */
      get storageKey() {
        const text = this.messages.map((el) => el.textContent.trim()).join('|');
        let hash = 0;
        for (let i = 0; i < text.length; i += 1) {
          hash = (hash << 5) - hash + text.charCodeAt(i);
          hash |= 0;
        }
        return `${this.dataset.storageKey}-${hash}`;
      }

      isDismissed() {
        try {
          return window.localStorage.getItem(this.storageKey) === '1';
        } catch (error) {
          return false;
        }
      }

      dismiss() {
        this.stopRotating();
        this.hidden = true;
        try {
          window.localStorage.setItem(this.storageKey, '1');
        } catch (error) {
          /* Private browsing blocks storage. Hiding for this page view is enough. */
        }
      }
    }
  );
}
