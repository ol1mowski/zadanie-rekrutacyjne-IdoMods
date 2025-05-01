// Moduł obsługujący siatkę produktów
function initProductGrid() {
    // Zmienne globalne dla produktów w siatce
    let currentPage = 1;
    let productsPerPage = 14; // Domyślna liczba produktów
    let isLoading = false;
    let hasMoreProducts = false; // Zmieniamy na false, bo chcemy tylko jedną stronę produktów
    let isMobileView = window.innerWidth <= 768; // Zmienna śledząca, czy jesteśmy w widoku mobilnym
    
    // Funkcja do ładowania produktów z API z parametrami strony i rozmiaru
    async function fetchProductsForGrid(pageNumber, pageSize) {
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
    
    // Funkcja do tworzenia elementu produktu dla siatki
    function createProductElementForGrid(product, index) {
        // Formatowanie indeksu z wiodącym zerem (01, 02, 03 itd.)
        const formattedIndex = (index + 1).toString().padStart(2, '0');
        
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.dataset.id = product.id;
        productElement.dataset.image = product.image;
        productElement.dataset.formattedIndex = formattedIndex;
        
        const productHtml = `
            <div class="product-image-container">
                <span class="product-id">ID: ${formattedIndex}</span>
                <img src="${product.image}" alt="Product ${formattedIndex}" class="product-image">
                <button class="product-favorite" aria-label="Dodaj do ulubionych">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>
        `;
        
        productElement.innerHTML = productHtml;
        
        // Dodanie obsługi kliknięcia przycisku "ulubione"
        const favoriteBtn = productElement.querySelector('.product-favorite');
        favoriteBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Zatrzymanie propagacji, aby nie wywoływać kliknięcia na całej karcie
            this.classList.toggle('active');
        });
        
        // Dodanie obsługi kliknięcia na kartę produktu - otwieranie pop-upu
        productElement.addEventListener('click', function() {
            window.openProductPopup(product.image, formattedIndex);
        });
        
        return productElement;
    }
    
    // Funkcja do ładowania pierwszej partii produktów
    async function loadInitialGridProducts() {
        const productsGrid = document.getElementById('products-grid');
        const loader = document.getElementById('products-grid-loader');
        
        if (!productsGrid || !loader) return;
        
        // Resetujemy stan
        currentPage = 1;
        
        // Zachowaj banner promocyjny, który jest już w HTML
        const promoBanner = productsGrid.querySelector('.promo-banner');
        productsGrid.innerHTML = '';
        
        // Przywróć banner promocyjny
        if (promoBanner) {
            productsGrid.appendChild(promoBanner);
        }
        
        hasMoreProducts = false; // Nie chcemy ładować więcej produktów
        
        // Pokazujemy loader
        loader.style.display = 'flex';
        
        try {
            isLoading = true;
            
            // Pobieramy dokładnie tyle produktów, ile wybrano w selektorze
            const productsData = await fetchProductsForGrid(currentPage, productsPerPage);
            
            // Ukrywamy loader
            loader.style.display = 'none';
            
            // Dodajemy produkty do siatki
            if (productsData.data && productsData.data.length > 0) {
                // Sprawdź, czy jesteśmy na urządzeniu mobilnym
                const isMobileDevice = window.innerWidth <= 768;
                
                // Określ, ile produktów ma być przed bannerem (5 na desktopie, 4 na mobile)
                const productsBeforeBanner = isMobileDevice ? 4 : 5;
                
                // Dodajemy pierwsze produkty przed bannerem
                for (let i = 0; i < productsBeforeBanner && i < productsData.data.length; i++) {
                    const productElement = createProductElementForGrid(productsData.data[i], i);
                    productsGrid.insertBefore(productElement, promoBanner);
                }
                
                // Dodajemy pozostałe produkty po bannerze
                for (let i = productsBeforeBanner; i < productsData.data.length; i++) {
                    const productElement = createProductElementForGrid(productsData.data[i], i);
                    productsGrid.appendChild(productElement);
                }
            } else {
                productsGrid.innerHTML = '<p class="error-message">Brak produktów do wyświetlenia.</p>';
                // Przywróć banner, jeśli nie ma produktów
                if (promoBanner) {
                    productsGrid.appendChild(promoBanner);
                }
            }
            
            isLoading = false;
        } catch (error) {
            console.error('Błąd podczas ładowania produktów:', error);
            loader.style.display = 'none';
            productsGrid.innerHTML = '<p class="error-message">Nie udało się załadować produktów. Spróbuj ponownie później.</p>';
            // Przywróć banner w przypadku błędu
            if (promoBanner) {
                productsGrid.appendChild(promoBanner);
            }
            isLoading = false;
        }
    }
    
    // Funkcja do inicjalizacji dropdown selectora
    function initializeDropdownSelector() {
        const dropdownSelector = document.querySelector('.dropdown-selector');
        const selectedOption = document.querySelector('.selected-option');
        const dropdownOptions = document.querySelectorAll('.dropdown-option');
        
        if (!dropdownSelector || !selectedOption || !dropdownOptions.length) return;
        
        // Obsługa kliknięcia w dropdown
        dropdownSelector.addEventListener('click', function(e) {
            dropdownSelector.classList.toggle('active');
            e.stopPropagation(); // Zapobieganie zamknięciu dropdown przez kliknięcie w jego elementy
        });
        
        // Zamykanie dropdown po kliknięciu poza nim
        document.addEventListener('click', function() {
            dropdownSelector.classList.remove('active');
        });
        
        // Obsługa wyboru opcji
        dropdownOptions.forEach(option => {
            option.addEventListener('click', function() {
                const value = parseInt(this.dataset.value);
                
                // Aktualizacja wybranej opcji
                selectedOption.textContent = value;
                
                // Aktualizacja liczby produktów na stronę
                productsPerPage = value;
                
                // Przeładowanie produktów z nową liczbą na stronę
                loadInitialGridProducts();
                
                // Zamknięcie dropdown
                dropdownSelector.classList.remove('active');
            });
        });
    }
    
    // Funkcja placeholder dla lazy loading (intencjonalnie pusta)
    function initializeLazyLoading() {
        // Funkcja intencjonalnie pozostawiona pusta - nie chcemy automatycznego ładowania
    }
    
    // Nasłuchujemy na zmiany rozmiaru okna i przeładowujemy produkty, gdy zmienia się widok mobilny/desktopowy
    window.addEventListener('resize', function() {
        const currentMobileState = window.innerWidth <= 768;
        
        // Jeśli zmieniliśmy się z mobilnego na desktop lub odwrotnie, przeładuj produkty
        if (currentMobileState !== isMobileView) {
            isMobileView = currentMobileState;
            loadInitialGridProducts();
        }
    });
    
    // Inicjalizacja funkcji dla siatki produktów
    initializeDropdownSelector();
    loadInitialGridProducts(); // Wywołujemy ładowanie pierwszej partii produktów na starcie
    initializeLazyLoading();
} 