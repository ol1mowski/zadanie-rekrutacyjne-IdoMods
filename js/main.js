// Główny plik JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Inicjalizacja komponentów nagłówka i menu mobilnego
    initHeader();
    initMobileMenu();
    
    // Inicjalizacja sekcji produktów
    initFeaturedProducts();
    initProductGrid();
    initProductPopup();
    
    // Ustawienie odpowiedniego obrazu hero w zależności od szerokości ekranu
    updateHeroImage();
    
    // Nasłuchiwanie na zmianę rozmiaru okna, aby zaktualizować obraz hero
    window.addEventListener('resize', updateHeroImage);
});

// Importy modułów
function initHeader() {
    const header = document.querySelector('header');
    const body = document.body;
    
    // Funkcja do obsługi sticky header
    function handleStickyHeader() {
        const scrollY = window.scrollY;
        // Zmień wartość 100 na wysokość, po której header ma stać się sticky
        if (scrollY > 100) {
            header.classList.add('sticky');
            body.classList.add('has-sticky-header');
        } else {
            header.classList.remove('sticky');
            body.classList.remove('has-sticky-header');
        }
    }
    
    // Nasłuchiwanie zdarzenia przewijania dla sticky header
    window.addEventListener('scroll', handleStickyHeader);
}

// Funkcja zmieniająca obraz hero w zależności od szerokości ekranu
function updateHeroImage() {
    const heroImg = document.getElementById('hero-img');
    if (!heroImg) return;
    
    if (window.innerWidth <= 768) {
        // Urządzenia mobilne
        heroImg.src = 'images/hero_mobile.webp';
    } else {
        // Desktop i większe tablety
        heroImg.src = 'images/hero.webp';
    }
} 