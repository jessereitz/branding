import smoothscroll from 'smoothscroll-polyfill';
import { isChildOfType } from './lib';
import Menu from './menu';

/**
 * findScrollTarget - Finds the element to which a link points in its href.
 *
 * @param {HTML Element} el The HTML link for which to find the target element.
 *
 * @returns {HTML Element} Returns the found HTML Element matching the id in the
 *  href attribute.
 */
function findScrollTarget(el) {
  return document.getElementById(el.href.substring(el.href.indexOf('#') + 1));
}

/**
 * smoothScroll - Checks if a link should cause a smooth scroll
 *  (data-scrolltype="smooth"), then smooth scrolls to its target. The target is
 *  found and cached on the target itself the first time this function is
 *  called.
 *
 * @param {Event} e The Click Event to check.
 *
 */
function smoothScroll(e) {
  const target = isChildOfType(e.target, 'A');
  if (!target) return;
  if (target.dataset.scrolltype === 'smooth') {
    if (!target.cachedTarget) {
      target.cachedTarget = findScrollTarget(target);
    }
    e.preventDefault();
    target.cachedTarget.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  }
}


document.addEventListener('DOMContentLoaded', () => {
  smoothscroll.polyfill();
  document.addEventListener('click', smoothScroll);
  const menu = Object.create(Menu);
  menu.init();
});
