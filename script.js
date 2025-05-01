document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.close-btn');
    const menuLinks = document.querySelectorAll('.mobile-nav a');
    const overlay = document.querySelector('.menu-overlay');
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

    // OBSŁUGA SEKCJI PRODUKTÓW

    // Funkcja do pobierania produktów z API
    async function fetchProducts() {
        try {
            const response = await fetch('https://brandstestowy.smallhost.pl/api/random');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Błąd podczas pobierania produktów:', error);
            return { data: [], totalPages: 0, currentPage: 1 };
        }
    }

    // Funkcja do generowania badge dla produktu (losowo)
    function generateBadge() {
        const badges = [
            { type: 'bestseller', label: 'BESTSELLER' },
            { type: 'limited', label: 'LIMITED EDITION' },
            { type: null, label: '' }
        ];
        return badges[Math.floor(Math.random() * badges.length)];
    }

    // Funkcja do generowania nazwy produktu
    function generateProductName(text) {
        const colors = ['Dark blue', 'Orange', 'Grey', 'Green', 'Black', 'Red', 'Navy'];
        const products = ['alpine climbing jacket', 'helmet for alpine TOUNDRA', 'climbing shoes', 'harness'];
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        
        return `${color} ${product}`;
    }

    // Funkcja do generowania ceny produktu
    function generatePrice() {
        const prices = ['300,00', '250,00', '199,99', '349,00', '399,00'];
        return prices[Math.floor(Math.random() * prices.length)];
    }

    // Funkcja do tworzenia elementu produktu
    function createProductElement(product) {
        const badge = generateBadge();
        const productName = generateProductName(product.text);
        const price = generatePrice();
        
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.dataset.id = product.id;
        
        const productHtml = `
            <div class="product-image-container">
                ${badge.type ? `<span class="product-badge badge-${badge.type}">${badge.label}</span>` : ''}
                <img src="${product.image}" alt="${productName}" class="product-image">
                <button class="product-favorite" aria-label="Dodaj do ulubionych">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>
            <h3 class="product-title">${productName}</h3>
            <p class="product-price">€${price} EUR</p>
        `;
        
        productElement.innerHTML = productHtml;
        
        // Dodanie obsługi kliknięcia przycisku "ulubione"
        const favoriteBtn = productElement.querySelector('.product-favorite');
        favoriteBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Zatrzymanie propagacji, aby nie wywoływać kliknięcia na całej karcie
            this.classList.toggle('active');
        });
        
        return productElement;
    }

    // Funkcja do ładowania produktów
    async function loadProducts() {
        const productsWrapper = document.getElementById('products-wrapper');
        const loader = document.getElementById('products-loader');
        const scrollProgressBar = document.getElementById('scroll-progress-bar');
        
        try {
            // Pokaż loader
            loader.style.display = 'flex';
            
            // Pobierz produkty
            const productsData = await fetchProducts();
            
            // Ukryj loader po załadowaniu
            loader.style.display = 'none';
            
            // Wyczyść kontener produktów
            productsWrapper.innerHTML = '';
            
            // Dodaj produkty do kontenera - zadbaj o wystarczającą liczbę produktów
            // aby karuzela mogła się przewijać
            
            // Jeśli mamy mniej niż 8 produktów, zduplikuj je aby zapewnić przewijanie
            let productsToRender = [...productsData.data];
            if (productsToRender.length < 8) {
                // Duplikuj produkty tyle razy, ile potrzeba, aby uzyskać co najmniej 8
                while (productsToRender.length < 8) {
                    productsToRender = [...productsToRender, ...productsData.data];
                }
                // Przytnij do maksymalnie 12 produktów, aby uniknąć zbyt dużej karuzeli
                productsToRender = productsToRender.slice(0, 12);
            }
            
            // Dodaj produkty do kontenera
            productsToRender.forEach(product => {
                const productElement = createProductElement(product);
                productsWrapper.appendChild(productElement);
            });
            
            // Obsługa przewijania produktów
            setupScrolling();
            
            // Ustaw początkową pozycję przewijania na 0 (pierwszy element)
            productsWrapper.scrollLeft = 0;
            
            // Poczekaj na załadowanie obrazów, aby móc obliczyć szerokość pierwszego elementu
            setTimeout(() => {
                // Ustaw początkowe wypełnienie paska postępu - odpowiadające pozycji końca pierwszego elementu
                if (scrollProgressBar && productsWrapper.scrollWidth > productsWrapper.clientWidth) {
                    // Obliczamy, jaki procent całkowitego przewijania stanowi pierwszy element
                    const firstCard = productsWrapper.querySelector('.product-card');
                    if (firstCard) {
                        const cardWidth = firstCard.offsetWidth;
                        const gapWidth = 24; // 1.5rem = 24px
                        const maxScrollLeft = productsWrapper.scrollWidth - productsWrapper.clientWidth;
                        
                        // Oblicz procent, jaki stanowi szerokość pierwszego elementu
                        const oneElementPercentage = (cardWidth + gapWidth) / maxScrollLeft * 100;
                        
                        // Ustaw szerokość paska na wartość odpowiadającą pierwszemu elementowi
                        scrollProgressBar.style.width = oneElementPercentage + '%';
                    }
                }
                
                // Zaktualizuj przyciski przewijania
                const scrollEvent = new Event('scroll');
                productsWrapper.dispatchEvent(scrollEvent);
            }, 500);
            
        } catch (error) {
            console.error('Błąd podczas ładowania produktów:', error);
            loader.style.display = 'none';
            productsWrapper.innerHTML = '<p class="error-message">Nie udało się załadować produktów. Spróbuj ponownie później.</p>';
        }
    }

    // Funkcja do obsługi przewijania produktów
    function setupScrolling() {
        const scrollLeftBtn = document.getElementById('scroll-left-btn');
        const scrollRightBtn = document.getElementById('scroll-right-btn');
        const productsWrapper = document.getElementById('products-wrapper');
        const scrollProgressBar = document.getElementById('scroll-progress-bar');
        
        if (!scrollLeftBtn || !scrollRightBtn || !productsWrapper) return;
        
        // Zmienna do przechowywania szerokości pierwszego elementu jako procent pełnego przewijania
        let initialProgressPercentage = 0;
        
        // Funkcja do obliczania początkowego procentu wypełnienia paska (za pierwszy element)
        function calculateInitialProgressPercentage() {
            const firstCard = productsWrapper.querySelector('.product-card');
            if (firstCard) {
                const cardWidth = firstCard.offsetWidth;
                const gapWidth = 24; // 1.5rem = 24px
                const maxScrollLeft = productsWrapper.scrollWidth - productsWrapper.clientWidth;
                
                // Procent, jaki stanowi pierwszy element
                initialProgressPercentage = (cardWidth + gapWidth) / maxScrollLeft * 100;
                return initialProgressPercentage;
            }
            return 25; // Domyślna wartość, jeśli nie można obliczyć
        }
        
        // Oblicz początkowy procent
        calculateInitialProgressPercentage();
        
        // Funkcja do sprawdzania stanu przewijania i aktualizacji przycisków
        function updateScrollButtons() {
            // Oblicz maksymalne przesunięcie w lewo
            const maxScrollLeft = productsWrapper.scrollWidth - productsWrapper.clientWidth - 5;
            
            // Sprawdź, czy można przewijać w lewo (pozwól na przewijanie w lewo, jeśli przesunięcie jest większe niż 5px)
            if (productsWrapper.scrollLeft <= 5) {
                scrollLeftBtn.style.display = 'none'; // Ukryj przycisk
            } else {
                scrollLeftBtn.style.display = 'flex'; // Pokaż przycisk
            }
            
            // Sprawdź, czy można przewijać w prawo
            if (productsWrapper.scrollLeft >= maxScrollLeft) {
                scrollRightBtn.style.display = 'none'; // Ukryj przycisk
            } else {
                scrollRightBtn.style.display = 'flex'; // Pokaż przycisk
            }
            
            // Aktualizacja paska postępu
            if (scrollProgressBar) {
                // Jeśli jesteśmy na początku (bez przewinięcia), pokaż pasek za pierwszy element
                if (productsWrapper.scrollLeft <= 5) {
                    scrollProgressBar.style.width = initialProgressPercentage + '%';
                } else {
                    // W przeciwnym razie oblicz procent przewinięcia
                    const scrollPercentage = (productsWrapper.scrollLeft / maxScrollLeft) * 100;
                    
                    // Ograniczenie wartości do zakresu 0-100
                    const boundedPercentage = Math.min(100, Math.max(0, scrollPercentage));
                    
                    // Aktualizuj szerokość paska postępu
                    scrollProgressBar.style.width = boundedPercentage + '%';
                }
            }
        }
        
        // Nasłuchuj na zmiany rozmiaru okna, aby zaktualizować procent początkowy
        window.addEventListener('resize', function() {
            calculateInitialProgressPercentage();
            updateScrollButtons();
        });
        
        // Ustaw początkowy stan przycisków - lewy przycisk powinien być ukryty na początku
        scrollLeftBtn.style.display = 'none';
        updateScrollButtons();
        
        // Obsługa przewijania w lewo
        scrollLeftBtn.addEventListener('click', function() {
            // Przewijanie o dokładnie jeden element
            const cardWidth = productsWrapper.querySelector('.product-card').offsetWidth;
            const gapWidth = 24; // 1.5rem = 24px
            const scrollAmount = cardWidth + gapWidth;
            
            productsWrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        
        // Obsługa przewijania w prawo
        scrollRightBtn.addEventListener('click', function() {
            // Przewijanie o dokładnie jeden element
            const cardWidth = productsWrapper.querySelector('.product-card').offsetWidth;
            const gapWidth = 24; // 1.5rem = 24px
            const scrollAmount = cardWidth + gapWidth;
            
            productsWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
        
        // Nasłuchiwanie zdarzenia przewijania, aby aktualizować przyciski
        productsWrapper.addEventListener('scroll', function() {
            updateScrollButtons();
        });
    }

    // Załaduj produkty przy inicjalizacji strony
    loadProducts();
});
