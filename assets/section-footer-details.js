/*
  Footer groups.

  The markup ships with every group open, so with no JavaScript the footer is
  simply an expanded, readable list - which is the right thing to fall back to.
  This closes them on small screens, where an accordion saves a lot of
  scrolling, and reopens them above the breakpoint where they are columns.

  A group the visitor has opened or closed themselves is left alone, so
  resizing or rotating the phone does not undo their choice.
*/
if (!customElements.get('ghar-footer')) {
  customElements.define(
    'ghar-footer',
    class GharFooter extends HTMLElement {
      connectedCallback() {
        this.groups = Array.from(this.querySelectorAll('[data-footer-group]'));
        if (this.groups.length === 0) return;

        this.query = window.matchMedia('(min-width: 750px)');
        this.apply = this.apply.bind(this);

        this.groups.forEach((group) => {
          group.addEventListener('toggle', () => {
            if (!this.query.matches) group.dataset.touched = 'true';
          });
        });

        this.apply();

        if (this.query.addEventListener) {
          this.query.addEventListener('change', this.apply);
        } else {
          /* Safari before 14 only has the deprecated listener. */
          this.query.addListener(this.apply);
        }
      }

      disconnectedCallback() {
        if (!this.query) return;
        if (this.query.removeEventListener) {
          this.query.removeEventListener('change', this.apply);
        } else {
          this.query.removeListener(this.apply);
        }
      }

      apply() {
        const isDesktop = this.query.matches;

        this.groups.forEach((group) => {
          if (isDesktop) {
            group.open = true;
            return;
          }

          if (group.dataset.touched === 'true') return;
          group.open = false;
        });
      }
    }
  );
}
