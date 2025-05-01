// Moduł obsługujący popup produktów
function initProductPopup() {
    const popup = document.getElementById('product-popup');
    const overlay = document.getElementById('popup-overlay');
    const closeBtn = document.getElementById('popup-close');
    const popupImage = document.getElementById('popup-product-image');
    const popupId = document.getElementById('popup-product-id');
    
    if (!popup || !overlay || !closeBtn || !popupImage || !popupId) return;
    
    // Funkcja otwierająca pop-up
    window.openProductPopup = function(imageSrc, productId) {
        popupImage.src = imageSrc;
        popupImage.alt = `Szczegółowy widok produktu ${productId}`;
        popupImage.loading = "lazy";
        
        // Dodajemy obsługę srcset dla responsywnych obrazów
        const originalImage = imageSrc;
        popupImage.srcset = `${originalImage} 800w, ${originalImage} 1200w`;
        popupImage.sizes = "(max-width: 768px) 100vw, 80vw";
        
        popupId.textContent = `ID: ${productId}`;
        popup.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Blokada przewijania strony
    };
    
    // Funkcja zamykająca pop-up
    function closeProductPopup() {
        popup.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Przywrócenie przewijania strony
    }
    
    // Obsługa kliknięcia przycisku zamykania
    closeBtn.addEventListener('click', closeProductPopup);
    
    // Obsługa kliknięcia na overlay (tło)
    overlay.addEventListener('click', closeProductPopup);
    
    // Obsługa klawisza Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.classList.contains('active')) {
            closeProductPopup();
        }
    });
} 