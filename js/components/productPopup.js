import { initMetaTags, updateProductMetaTags, restoreOriginalMetaTags } from '../utils/metaUtils.js';

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
    
    initMetaTags();
    
    const openProductPopup = (imageSrc, productId, productName = '') => {
        popupImage.src = imageSrc;
        popupImage.alt = `Szczegółowy widok produktu ${productId}`;
        popupImage.loading = "lazy";
        
        const originalImage = imageSrc;
        popupImage.srcset = `${originalImage} 800w, ${originalImage} 1200w`;
        popupImage.sizes = "(max-width: 768px) 100vw, 80vw";
        
        popupId.textContent = `ID: ${productId}`;
        
        updateProductMetaTags(productId, productName);
        
        popup.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    const closeProductPopup = () => {
        restoreOriginalMetaTags();
        
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