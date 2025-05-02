const initProductPopup = () => {
    const elements = {
        popup: document.getElementById('product-popup'),
        overlay: document.getElementById('popup-overlay'),
        closeBtn: document.getElementById('popup-close'),
        popupImage: document.getElementById('popup-product-image'),
        popupId: document.getElementById('popup-product-id')
    };
    
    const { popup, overlay, closeBtn, popupImage, popupId } = elements;
    if (!popup || !overlay || !closeBtn || !popupImage || !popupId) return;
    
    const openProductPopup = (imageSrc, productId) => {
        popupImage.src = imageSrc;
        popupImage.alt = `Szczegółowy widok produktu ${productId}`;
        popupImage.loading = "lazy";
        
        const originalImage = imageSrc;
        popupImage.srcset = `${originalImage} 800w, ${originalImage} 1200w`;
        popupImage.sizes = "(max-width: 768px) 100vw, 80vw";
        
        popupId.textContent = `ID: ${productId}`;
        
        popup.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    const closeProductPopup = () => {
        popup.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    window.openProductPopup = openProductPopup;
    
    closeBtn.addEventListener('click', closeProductPopup);
    overlay.addEventListener('click', closeProductPopup);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('active')) {
            closeProductPopup();
        }
    });
};

export default initProductPopup; 