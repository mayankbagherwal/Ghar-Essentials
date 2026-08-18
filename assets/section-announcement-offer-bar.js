/*
  Offer bar rotation.

  One message is visible; the rest wait off to the right. On each tick the
  visible one slides away to the left while the next comes in behind it. All of it
  is CSS transitions on transform and opacity - this file only moves classes
  around and keeps the timing honest.

  Details that make it feel right rather than merely work:

  - The incoming message is snapped to its waiting position with transitions
    off, then released on the next animation frame. Without that the browser
    can collapse both states into one style recalculation and the element
    simply appears, with no movement at all.
  - A message that has finished leaving is returned to the waiting position
    the same way, so it never slides back across the bar in view.
  - Rotation pauses while the tab is hidden. Timers keep firing in a
    background tab, so without this you return to a bar mid-transition, or
    several transitions deep.
  - Rotation pauses on hover and on keyboard focus, so a message with a link
    in it cannot be pulled away while someone is reading or tabbing to it.
  - If the device asks for reduced motion, the classes still change but the
    stylesheet drops the movement.

  Being a custom element, connectedCallback runs again on theme editor
  re-renders, and disconnectedCallback clears the timer so nothing is left
  running against a detached element.
*/
if (!customElements.get('ghar-offer-bar')) {
  customElements.define(
    'ghar-offer-bar',
    class GharOfferBar extends HTMLElement {
      connectedCallback() {
        this.messages = Array.from(this.querySelectorAll('[data-offer-message]'));
        if (this.messages.length < 2) return;

        this.index = Math.max(0, this.messages.findIndex((el) => el.classList.contains('is-active')));
        this.interval = (parseInt(this.dataset.rotateSeconds, 10) || 5) * 1000;
        this.paused = false;

        this.onVisibility = this.onVisibility.bind(this);
        this.pause = this.pause.bind(this);
        this.resume = this.resume.bind(this);

        document.addEventListener('visibilitychange', this.onVisibility);
        this.addEventListener('mouseenter', this.pause);
        this.addEventListener('mouseleave', this.resume);
        this.addEventListener('focusin', this.pause);
        this.addEventListener('focusout', this.resume);

        this.start();
      }

      disconnectedCallback() {
        this.stop();
        document.removeEventListener('visibilitychange', this.onVisibility);
      }

      start() {
        this.stop();
        if (this.paused || document.hidden) return;
        this.timer = window.setInterval(() => this.advance(), this.interval);
      }

      stop() {
        if (!this.timer) return;
        window.clearInterval(this.timer);
        this.timer = null;
      }

      pause() {
        this.paused = true;
        this.stop();
      }

      resume() {
        this.paused = false;
        this.start();
      }

      onVisibility() {
        if (document.hidden) {
          this.stop();
        } else {
          this.start();
        }
      }

      advance() {
        const current = this.messages[this.index];
        const nextIndex = (this.index + 1) % this.messages.length;
        const next = this.messages[nextIndex];
        if (!current || !next || current === next) return;

        /* Put the incoming message at its waiting position with transitions
           off, so the browser has a start value to animate away from. */
        next.classList.add('is-reset');
        next.classList.remove('is-active', 'is-leaving');

        /* Reading a layout value flushes the styles above before the ones
           below are applied, which is what forces two distinct frames. */
        void next.offsetHeight;

        window.requestAnimationFrame(() => {
          next.classList.remove('is-reset');
          next.classList.add('is-active');

          current.classList.remove('is-active');
          current.classList.add('is-leaving');
        });

        this.settle(current);
        this.index = nextIndex;
      }

      /* Return the outgoing message to the waiting position once it has
         finished leaving, without letting it animate on the way back. */
      settle(element) {
        const done = (event) => {
          if (event) {
            /* Two properties are in flight and opacity finishes first. Acting
               on that one would snap the message back while it is still
               sliding, so only the transform end counts as finished. */
            if (event.target !== element || event.propertyName !== 'transform') return;
          }
          element.removeEventListener('transitionend', done);
          window.clearTimeout(element.gharSettleTimer);

          element.classList.add('is-reset');
          element.classList.remove('is-leaving');
          void element.offsetHeight;
          window.requestAnimationFrame(() => element.classList.remove('is-reset'));
        };

        element.addEventListener('transitionend', done);

        /* transitionend does not fire if the transition never runs - reduced
           motion, or a tab hidden mid-flight - so back it with a timeout.
           It has to outlast the 0.85s transform, hence 1.4s. */
        element.gharSettleTimer = window.setTimeout(done, 1400);
      }
    }
  );
}
