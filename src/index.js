import smoothscroll from 'smoothscroll-polyfill';
import Menu from './menu';

document.addEventListener('DOMContentLoaded', () => {
  smoothscroll.polyfill();
  const menu = Object.create(Menu);
  menu.init();
});
