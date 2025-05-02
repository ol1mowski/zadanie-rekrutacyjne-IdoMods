import initMobileMenu from './components/mobileMenu.js';
import initFeaturedProducts from './components/featuredProducts.js';
import initProductGrid from './components/productGrid.js';
import initProductPopup from './components/productPopup.js';

const initHeader = () => {
  const header = document.querySelector('header');
  const body = document.body;

  const handleStickyHeader = () => {
    const scrollY = window.scrollY;
    if (scrollY > 100) {
      header.classList.add('sticky');
      body.classList.add('has-sticky-header');
    } else {
      header.classList.remove('sticky');
      body.classList.remove('has-sticky-header');
    }
  };

  window.addEventListener('scroll', handleStickyHeader);
};

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  
  initFeaturedProducts();
  initProductGrid();
  initProductPopup();
}); 