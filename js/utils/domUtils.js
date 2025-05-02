export const isMobile = (breakpoint = 768) => window.innerWidth <= breakpoint;

export const formatIndex = (index) => (index + 1).toString().padStart(2, '0');

export const addClassWithDelay = (element, className, delay = 0) => {
  setTimeout(() => {
    element.classList.add(className);
  }, delay);
};

export const removeClassWithDelay = (element, className, delay = 0) => {
  setTimeout(() => {
    element.classList.remove(className);
  }, delay);
};


export const showLoader = (loader) => {
  if (loader) loader.style.display = 'flex';
};


export const hideLoader = (loader) => {
  if (loader) loader.style.display = 'none';
}; 