import { fetchProducts } from '../utils/apiUtils.js';
import { formatIndex, isMobile, showLoader, hideLoader } from '../utils/domUtils.js';


const initProductGrid = () => {

    const state = {
        currentPage: 1,
        productsPerPage: 14,
        isMobileView: isMobile(),
        isLoading: false,
        hasMoreProducts: false
    };

    const createProductElementForGrid = (product, index) => {
        const formattedIndex = formatIndex(index);
        
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.dataset.id = product.id;
        productElement.dataset.image = product.image;
        productElement.dataset.formattedIndex = formattedIndex;
        
        const originalImage = product.image;
        const smallImage = originalImage;
        
        let tagsHTML = '';
        if (product.tags && product.tags.length > 0) {
            tagsHTML = '<div class="product-tags">';
            product.tags.forEach(tag => {
                tagsHTML += `<span class="product-tag">${tag}</span>`;
            });
            tagsHTML += '</div>';
        }
        
        const productHtml = `
            <div class="product-image-container">
                <span class="product-id">ID: ${formattedIndex}</span>
                <img src="${product.image}" 
                     alt="Produkt ${formattedIndex}" 
                     class="product-image" 
                     loading="lazy"
                     srcset="${smallImage} 400w, ${originalImage} 800w"
                     sizes="(max-width: 768px) 100vw, (max-width: 1020px) 33vw, 25vw">
                ${tagsHTML}
            </div>
        `;
        
        productElement.innerHTML = productHtml;
        
        productElement.addEventListener('click', () => {
            window.openProductPopup(product.image, formattedIndex);
        });
        
        return productElement;
    };
    
    const loadInitialGridProducts = async () => {
        const productsGrid = document.getElementById('products-grid');
        const loader = document.getElementById('products-grid-loader');
        
        if (!productsGrid || !loader) return;
        
        state.currentPage = 1;
        
        const promoBanner = productsGrid.querySelector('.promo-banner');
        productsGrid.innerHTML = '';
        
        if (promoBanner) {
            productsGrid.appendChild(promoBanner);
        }
        
        state.hasMoreProducts = false;
        
        showLoader(loader);
        
        try {
            state.isLoading = true;
            
            const productsData = await fetchProducts({
                pageNumber: state.currentPage,
                pageSize: state.productsPerPage
            });
            
            hideLoader(loader);
            
            if (productsData.data && productsData.data.length > 0) {
                const currentMobileView = isMobile();
                
                const productsBeforeBanner = currentMobileView ? 4 : 5;
                
                for (let i = 0; i < productsBeforeBanner && i < productsData.data.length; i++) {
                    const productElement = createProductElementForGrid(productsData.data[i], i);
                    productsGrid.insertBefore(productElement, promoBanner);
                }
                
                for (let i = productsBeforeBanner; i < productsData.data.length; i++) {
                    const productElement = createProductElementForGrid(productsData.data[i], i);
                    productsGrid.appendChild(productElement);
                }
            } else {
                productsGrid.innerHTML = '<p class="error-message">Brak produktów do wyświetlenia.</p>';
                if (promoBanner) {
                    productsGrid.appendChild(promoBanner);
                }
            }
            
            state.isLoading = false;
        } catch (error) {
            console.error('Błąd podczas ładowania produktów:', error);
            hideLoader(loader);
            productsGrid.innerHTML = '<p class="error-message">Nie udało się załadować produktów. Spróbuj ponownie później.</p>';
            if (promoBanner) {
                productsGrid.appendChild(promoBanner);
            }
            state.isLoading = false;
        }
    };
    
    const initializeDropdownSelector = () => {
        const dropdownSelector = document.querySelector('.dropdown-selector');
        const dropdownHeader = document.querySelector('.dropdown-header');
        const selectedOption = document.querySelector('.selected-option');
        const dropdownOptions = document.querySelectorAll('.dropdown-option');
        
        if (!dropdownSelector || !dropdownHeader || !selectedOption || !dropdownOptions.length) return;
        
        // Ukryj opcję, która odpowiada aktualnemu wyborowi
        const updateVisibleOptions = () => {
            const currentValue = selectedOption.textContent.trim();
            
            dropdownOptions.forEach(option => {
                if (option.dataset.value === currentValue) {
                    option.style.display = 'none';
                } else {
                    option.style.display = 'flex';
                    option.style.justifyContent = 'center';
                    option.style.alignItems = 'center';
                }
            });
        };
        
        // Inicjalne ukrycie opcji
        updateVisibleOptions();
        
        // Po kliknięciu w nagłówek dropdown
        dropdownHeader.addEventListener('click', (e) => {
            // Przełącz stan aktywny
            dropdownSelector.classList.toggle('active');
            
            // Aktualizuj widoczne opcje
            updateVisibleOptions();
            
            e.stopPropagation();
        });
        
        // Zamknij dropdown po kliknięciu poza nim
        document.addEventListener('click', () => {
            dropdownSelector.classList.remove('active');
        });
        
        // Obsługa kliknięcia na opcje
        dropdownOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                const value = parseInt(this.dataset.value);
                
                // Aktualizuj wybraną opcję
                selectedOption.textContent = value;
                state.productsPerPage = value;
                
                // Zamknij dropdown
                dropdownSelector.classList.remove('active');
                
                // Aktualizuj widoczne opcje
                updateVisibleOptions();
                
                // Załaduj produkty z nowym limitem
                loadInitialGridProducts();
            });
        });
    };
    
    
    window.addEventListener('resize', () => {
        const currentMobileState = isMobile();
        
        if (currentMobileState !== state.isMobileView) {
            state.isMobileView = currentMobileState;
            loadInitialGridProducts();
        }
    });
    
    initializeDropdownSelector();
    loadInitialGridProducts();
};

export default initProductGrid; 