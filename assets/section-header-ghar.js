/*
  Header behaviour that CSS cannot cover on its own.

  The menus are <details> elements, so they already open and close without
  JavaScript. This adds only what a mouse and keyboard user expects on top:
  clicking outside closes an open menu, Escape closes it and returns focus,
  and opening one dropdown closes any other.

  Being a custom element, connectedCallback runs again whenever the theme
  editor re-renders the section.
*/
if (!customElements.get('ghar-header')) {
  customElements.define(
    'ghar-header',
    class GharHeader extends HTMLElement {
      connectedCallback() {
        if (this.dataset.gharBound === 'true') return;

        this.menus = Array.from(this.querySelectorAll('[data-ghar-dropdown], [data-ghar-drawer]'));
        if (this.menus.length === 0) return;

        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.onKeydown = this.onKeydown.bind(this);

        this.menus.forEach((menu) => {
          menu.addEventListener('toggle', () => {
            if (menu.open) this.closeOthers(menu);
          });
        });

        document.addEventListener('click', this.onDocumentClick);
        document.addEventListener('keydown', this.onKeydown);
        this.dataset.gharBound = 'true';
      }

      disconnectedCallback() {
        document.removeEventListener('click', this.onDocumentClick);
        document.removeEventListener('keydown', this.onKeydown);
      }

      closeOthers(current) {
        this.menus.forEach((menu) => {
          if (menu !== current) menu.open = false;
        });
      }

      onDocumentClick(event) {
        this.menus.forEach((menu) => {
          if (menu.open && !menu.contains(event.target)) menu.open = false;
        });
      }

      onKeydown(event) {
        if (event.key !== 'Escape') return;

        this.menus.forEach((menu) => {
          if (!menu.open) return;
          menu.open = false;
          const summary = menu.querySelector('summary');
          if (summary) summary.focus();
        });
      }
    }
  );
}
