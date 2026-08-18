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

        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.onKeydown = this.onKeydown.bind(this);

        this.menus.forEach((menu) => {
          menu.addEventListener('toggle', () => {
            if (menu.open) this.closeOthers(menu);
          });
        });

        this.setupSearch();

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

      /* Search opens in place. focus() has to run inside the click handler
         itself - iOS only raises the keyboard during a real user gesture, so
         deferring it with a timeout would open the bar without the keyboard. */
      setupSearch() {
        this.search = this.querySelector('[data-ghar-search]');
        if (!this.search) return;

        this.searchInput = this.search.querySelector('[data-ghar-search-input]');
        this.recent = this.search.querySelector('[data-ghar-recent]');
        this.recentList = this.search.querySelector('[data-ghar-recent-list]');

        this.querySelectorAll('[data-ghar-search-toggle]').forEach((button) => {
          button.addEventListener('click', () => this.toggleSearch(button));
        });

        const close = this.search.querySelector('[data-ghar-search-close]');
        if (close) close.addEventListener('click', () => this.closeSearch());

        const clear = this.search.querySelector('[data-ghar-recent-clear]');
        if (clear) {
          clear.addEventListener('click', () => {
            this.writeRecent([]);
            this.renderRecent();
          });
        }

        const form = this.search.querySelector('form');
        if (form) {
          form.addEventListener('submit', () => {
            const term = this.searchInput.value.trim();
            if (!term) return;
            const list = this.readRecent().filter((item) => item !== term);
            list.unshift(term);
            this.writeRecent(list.slice(0, 6));
          });
        }
      }

      toggleSearch(button) {
        if (this.search.hidden) {
          this.menus.forEach((menu) => (menu.open = false));
          this.search.hidden = false;
          this.renderRecent();
          if (this.searchInput) this.searchInput.focus();
        } else {
          this.closeSearch();
        }

        this.querySelectorAll('[data-ghar-search-toggle]').forEach((el) => {
          el.setAttribute('aria-expanded', String(!this.search.hidden));
        });
        if (button && !this.search.hidden) button.setAttribute('aria-expanded', 'true');
      }

      closeSearch() {
        if (!this.search) return;
        this.search.hidden = true;
        this.querySelectorAll('[data-ghar-search-toggle]').forEach((el) => {
          el.setAttribute('aria-expanded', 'false');
        });
      }

      readRecent() {
        try {
          const raw = window.localStorage.getItem('ghar-recent-searches');
          const list = raw ? JSON.parse(raw) : [];
          return Array.isArray(list) ? list : [];
        } catch (error) {
          return [];
        }
      }

      writeRecent(list) {
        try {
          window.localStorage.setItem('ghar-recent-searches', JSON.stringify(list));
        } catch (error) {
          /* Private browsing blocks storage. Search still works without it. */
        }
      }

      renderRecent() {
        if (!this.recent || !this.recentList) return;

        const list = this.readRecent();
        this.recent.hidden = list.length === 0;
        this.recentList.textContent = '';

        list.forEach((term) => {
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.className = 'ghar-search__recent-item';
          link.href = `${window.routes ? window.routes.search_url : '/search'}?q=${encodeURIComponent(term)}`;
          link.textContent = term;
          item.appendChild(link);
          this.recentList.appendChild(item);
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

        if (this.search && !this.search.hidden) this.closeSearch();
      }
    }
  );
}
