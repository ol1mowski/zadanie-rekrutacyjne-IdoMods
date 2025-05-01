document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.close-btn');
    const menuLinks = document.querySelectorAll('.mobile-nav a');
    const overlay = document.querySelector('.menu-overlay');
    
    // Funkcja sprawdzająca, czy jesteśmy na urządzeniu mobilnym
    function isMobile() {
        return window.innerWidth <= 1020; // Zmieniona wartość z 768px na 1020px
    }
    
    // Funkcja do otwierania menu z animacją
    function openMobileMenu() {
        // Otwieramy menu tylko na urządzeniach mobilnych
        if (!isMobile()) return;
        
        // Najpierw pokazujemy overlay z animacją
        overlay.classList.add('active');
        
        // Następnie, po małym opóźnieniu, pokazujemy menu
        setTimeout(() => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden'; // Blokada przewijania strony
            
            // Animacja elementów menu
            setTimeout(() => {
                menuLinks.forEach((link, index) => {
                    setTimeout(() => {
                        link.style.opacity = '1';
                        link.style.transform = 'translateY(0)';
                    }, 80 * index); // Przyspieszenie animacji
                });
            }, 250); // Skrócenie czasu oczekiwania
        }, 50);
    }
    
    // Funkcja do zamykania menu
    function closeMobileMenu() {
        // Resetujemy animację elementów menu
        menuLinks.forEach(link => {
            link.style.opacity = '0';
            link.style.transform = 'translateY(20px)';
        });
        
        // Opóźniamy usunięcie klasy active, aby animacja mogła się zakończyć
        setTimeout(() => {
            mobileMenu.classList.remove('active');
            
            // Po zamknięciu menu, po małym opóźnieniu, zamykamy overlay
            setTimeout(() => {
                overlay.classList.remove('active');
                document.body.style.overflow = ''; // Przywrócenie przewijania strony
            }, 150);
        }, 200); // Szybsze zamykanie menu
    }
    
    // Inicjalizacja stylów dla animacji
    menuLinks.forEach(link => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(20px)';
        link.style.transition = 'opacity 0.25s ease, transform 0.25s ease'; // Szybsza animacja
    });
    
    // Nasłuchiwanie kliknięcia na przycisk menu
    mobileMenuBtn.addEventListener('click', openMobileMenu);
    
    // Nasłuchiwanie kliknięcia na przycisk zamknięcia
    closeBtn.addEventListener('click', closeMobileMenu);
    
    // Nasłuchiwanie kliknięcia na overlay (zamknięcie menu po kliknięciu poza nim)
    overlay.addEventListener('click', closeMobileMenu);
    
    // Nasłuchiwanie kliknięcia na linki w menu (zamykanie po kliknięciu)
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Nasłuchiwanie zmiany rozmiaru okna
    window.addEventListener('resize', function() {
        // Jeśli szerokość ekranu jest większa niż 1020px, zamykamy menu
        if (!isMobile() && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
});
