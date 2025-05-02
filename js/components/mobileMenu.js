const initMobileMenu = () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.close-btn');
    const menuLinks = document.querySelectorAll('.mobile-nav a');
    const overlay = document.querySelector('.menu-overlay');
    
    const isMobile = () => {
        return window.innerWidth <= 1020;
    }
    
    const openMobileMenu = () => {
        if (!isMobile()) return;
        
        overlay.classList.add('active');
        
        setTimeout(() => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                menuLinks.forEach((link, index) => {
                    setTimeout(() => {
                        link.style.opacity = '1';
                        link.style.transform = 'translateY(0)';
                    }, 80 * index);
                });
            }, 250);
        }, 50);
    }
    
    const closeMobileMenu = () => {
        menuLinks.forEach(link => {
            link.style.opacity = '0';
            link.style.transform = 'translateY(20px)';
        });
        
        setTimeout(() => {
            mobileMenu.classList.remove('active');
            
            setTimeout(() => {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }, 150);
        }, 200);
    }
    
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
        if (!isMobile() && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
} 