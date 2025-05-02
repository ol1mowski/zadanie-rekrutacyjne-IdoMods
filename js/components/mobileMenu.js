import { isMobile, addClassWithDelay, removeClassWithDelay } from '../utils/domUtils.js';

const initMobileMenu = () => {
    const elements = {
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        mobileMenu: document.querySelector('.mobile-menu'),
        closeBtn: document.querySelector('.close-btn'),
        menuLinks: document.querySelectorAll('.mobile-nav a'),
        overlay: document.querySelector('.menu-overlay'),
    };

    const { mobileMenuBtn, mobileMenu, closeBtn, menuLinks, overlay } = elements;
    if (!mobileMenuBtn || !mobileMenu || !closeBtn || !menuLinks.length || !overlay) return;

    const openMobileMenu = () => {
        if (!isMobile(1020)) return;

        addClassWithDelay(overlay, 'active', 0);

        addClassWithDelay(mobileMenu, 'active', 50);

        setTimeout(() => {
            document.body.style.overflow = 'hidden';

            menuLinks.forEach((link, index) => {
                setTimeout(() => {
                    link.style.opacity = '1';
                    link.style.transform = 'translateY(0)';
                }, 80 * index);
            }, 250);
        });
    };


    const closeMobileMenu = () => {
        menuLinks.forEach(link => {
            link.style.opacity = '0';
            link.style.transform = 'translateY(20px)';
        });

        setTimeout(() => {
            removeClassWithDelay(mobileMenu, 'active', 0);


            setTimeout(() => {
                removeClassWithDelay(overlay, 'active', 0);
                document.body.style.overflow = '';
            }, 150);
        }, 200);
    };

    menuLinks.forEach(link => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(20px)';
        link.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    });

    mobileMenuBtn.addEventListener('click', openMobileMenu);
    closeBtn.addEventListener('click', closeMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);

    menuLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    window.addEventListener('resize', () => {
        if (!isMobile(1020) && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
};

export default initMobileMenu; 