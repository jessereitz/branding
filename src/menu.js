import { generateButton, generateElement } from './lib';

const hoverCardClass = 'hover-card';
const baseClass = 'r_menu';
const ctnClass = `${baseClass}__ctn`;
const navClass = `${baseClass}__nav`;
const hiddenClass = `${navClass}--hidden`;
const btnClass = `${baseClass}__button`;
const targetClass = 'menuTarget';

/**
 * HeadingMenu - A HeadingMenu finds all elements with the class "menuTarget"
 *  and generates links to them.
 *
 */
const HeadingMenu = {

  /**
   * init - Initialize the menu.
   *
   * @returns {HeadingMenu} Returns the new Menu.
   */
  init() {
    this.ctn = generateElement('div', { klasses: ctnClass });
    this.toggleBtn = generateButton('Menu', { klasses: btnClass });
    this.toggleBtn.addEventListener('click', this.toggleDisplay.bind(this));
    this.ctn.appendChild(this.toggleBtn);

    this.nav = generateElement('nav', { klasses: [navClass, hiddenClass] });
    this.nav.addEventListener('click', this.hide.bind(this));
    this.ctn.appendChild(this.nav);

    this.links = this.generateLinks();
    document.body.appendChild(this.ctn);
    this.resizeCtn();
    document.addEventListener('click', (e) => {
      if (!this.ctn.contains(e.target)) this.hide();
    });
  },

  /**
   * resizeCtn - Resize the container based on its contents.
   *
   */
  resizeCtn() {
    const btnRect = this.toggleBtn.getBoundingClientRect();
    if (this.ctn.classList.contains(hoverCardClass)) {
      this.ctn.style.maxWidth = `${window.innerWidth}px`;
      this.ctn.style.maxHeight = `${window.innerHeight}px`;
      this.ctn.style.paddingRight = `${btnRect.width * 1.5}px`;
    } else {
      this.ctn.style.maxWidth = `${btnRect.width + 10}px`;
      this.ctn.style.maxHeight = `${btnRect.height + 10}px`;
    }
  },

  /**
   * generateLinks - Iterates through all targets and creates links pointing to
   *  them. If the target has data-scrolltarget set, it will use that as the
   *  href for the link. Otherwise it uses its id attribute.
   *
   */
  generateLinks() {
    this.links = [];
    const targets = document.querySelectorAll(`.${targetClass}`);
    targets.forEach((target) => {
      const link = generateElement(
        'a',
        {
          href: `#${target.dataset.scrolltarget || target.id}`,
          textContent: target.textContent,
          'data-scrolltype': 'smooth',
        },
      );
      this.links.push(link);
      this.nav.appendChild(link);
    });
  },

  /**
   * hide - Hide the menu.
   *
   */
  hide() {
    if (this.ctn.classList.contains(hoverCardClass)) {
      this.ctn.classList.remove(hoverCardClass);
      this.nav.classList.add(hiddenClass);
      this.toggleBtn.innerHTML = 'Menu';
      this.resizeCtn();
    }
  },

  /**
   * display - Display the menu.
   *
   */
  display() {
    if (this.nav.classList.contains(hiddenClass)) {
      this.ctn.classList.add(hoverCardClass);
      this.nav.classList.remove(hiddenClass);
      this.toggleBtn.innerHTML = '&times;';
      this.resizeCtn();
    }
  },

  /**
   * toggleDisplay - Hides or shows the menu.
   *
   */
  toggleDisplay() {
    if (this.nav.classList.contains(hiddenClass)) {
      this.display();
    } else {
      this.hide();
    }
  },
};

export default HeadingMenu;
