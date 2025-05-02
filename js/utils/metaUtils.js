let originalTitle = '';
let originalDescription = '';

export const initMetaTags = () => {
    const pageTitle = document.querySelector('title');
    const pageDescription = document.querySelector('meta[name="description"]');
    
    originalTitle = pageTitle ? pageTitle.textContent : 'Forma\'Sint';
    originalDescription = pageDescription ? pageDescription.getAttribute('content') : 'Forma\'Sint - profesjonalna strona internetowa';
    
    return { originalTitle, originalDescription };
};

export const updateProductMetaTags = (productId, productName = '') => {
    const pageTitle = document.querySelector('title');
    const pageDescription = document.querySelector('meta[name="description"]');
    
    if (pageTitle) {
        const titleText = productName ? `${productName} - Forma'Sint` : `Produkt ${productId} - Forma'Sint`;
        pageTitle.textContent = titleText;
    }
    
    if (pageDescription) {
        const descriptionText = productName 
            ? `Szczegóły produktu ${productName} (ID: ${productId}) w sklepie Forma'Sint.` 
            : `Szczegóły produktu o ID: ${productId} w sklepie Forma'Sint.`;
        pageDescription.setAttribute('content', descriptionText);
    }
};

export const restoreOriginalMetaTags = () => {
    const pageTitle = document.querySelector('title');
    const pageDescription = document.querySelector('meta[name="description"]');
    
    if (pageTitle && originalTitle) {
        pageTitle.textContent = originalTitle;
    }
    
    if (pageDescription && originalDescription) {
        pageDescription.setAttribute('content', originalDescription);
    }
}; 