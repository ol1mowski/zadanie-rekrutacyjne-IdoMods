const initProductGrid = () => {
    let currentPage = 1;
    let productsPerPage = 14;

    let isMobileView = window.innerWidth <= 768;
    
    const fetchProductsForGrid = async (pageNumber, pageSize) => {
        try {
            const url = `https://brandstestowy.smallhost.pl/api/random?pageNumber=${pageNumber}&pageSize=${pageSize}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Błąd podczas pobierania produktów:', error);
            return { data: [], totalPages: 0, currentPage: pageNumber };
        }
    }
    
    const createProductElementForGrid = (product, index) => {
        const formattedIndex = (index + 1).toString().padStart(2, '0');
        
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
    }
    
    const loadInitialGridProducts = async () => {
        const productsGrid = document.getElementById('products-grid');
        const loader = document.getElementById('products-grid-loader');
        
        if (!productsGrid || !loader) return;
        
        currentPage = 1;
        
        const promoBanner = productsGrid.querySelector('.promo-banner');
        productsGrid.innerHTML = '';
        
        if (promoBanner) {
            productsGrid.appendChild(promoBanner);
        }
        
        hasMoreProducts = false;
        
        loader.style.display = 'flex';
        
        try {
            isLoading = true;
            
            const productsData = await fetchProductsForGrid(currentPage, productsPerPage);
            
            loader.style.display = 'none';
            
            if (productsData.data && productsData.data.length > 0) {
                const isMobileDevice = window.innerWidth <= 768;
                
                const productsBeforeBanner = isMobileDevice ? 4 : 5;
                
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
            
            isLoading = false;
        } catch (error) {
            console.error('Błąd podczas ładowania produktów:', error);
            loader.style.display = 'none';
            productsGrid.innerHTML = '<p class="error-message">Nie udało się załadować produktów. Spróbuj ponownie później.</p>';
            if (promoBanner) {
                productsGrid.appendChild(promoBanner);
            }
            isLoading = false;
        }
    }
    
    const initializeDropdownSelector = () => {
        const dropdownSelector = document.querySelector('.dropdown-selector');
        const selectedOption = document.querySelector('.selected-option');
        const dropdownOptions = document.querySelectorAll('.dropdown-option');
        
        if (!dropdownSelector || !selectedOption || !dropdownOptions.length) return;
        
        dropdownSelector.addEventListener('click', function(e) {
            dropdownSelector.classList.toggle('active');
            e.stopPropagation();
        });
        
        document.addEventListener('click', function() {
            dropdownSelector.classList.remove('active');
        });
        
        dropdownOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                const value = parseInt(this.dataset.value);
                
                selectedOption.textContent = value;
                
                productsPerPage = value;
                
                dropdownSelector.classList.remove('active');
                
                loadInitialGridProducts();
            });
        });
    }
    
    const initializeLazyLoading = () => {
    }
    
    window.addEventListener('resize', () => {
        const currentMobileState = window.innerWidth <= 768;
        
        if (currentMobileState !== isMobileView) {
            isMobileView = currentMobileState;
            loadInitialGridProducts();
        }
    });
    
    initializeDropdownSelector();
    loadInitialGridProducts();
    initializeLazyLoading();
} 