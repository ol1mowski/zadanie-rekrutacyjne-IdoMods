const initFeaturedProducts = () => {
    const fetchProducts = async () => {
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

    const generateBadge = () => {
        const badges = [
            { type: 'bestseller', label: 'BESTSELLER' },
            { type: 'limited', label: 'LIMITED EDITION' },
            { type: null, label: '' }
        ];
        
        // Losowy wybór odznaki, z większą szansą na odznakę niż brak odznaki
        const badgeIndex = Math.floor(Math.random() * 10); // Generuje liczbę od 0 do 9
        
        if (badgeIndex < 4) {
            return badges[0]; // 40% szans na bestseller
        } else if (badgeIndex < 8) {
            return badges[1]; // 40% szans na limited edition
        } else {
            return badges[2]; // 20% szans na brak odznaki
        }
    }

    const generateProductName = (text) => {
        const colors = ['Dark blue', 'Orange', 'Grey', 'Green', 'Black', 'Red', 'Navy'];
        const products = ['alpine climbing jacket', 'helmet for alpine TOUNDRA', 'climbing shoes', 'harness'];

        const color = colors[Math.floor(Math.random() * colors.length)];
        const product = products[Math.floor(Math.random() * products.length)];

        return `${color} ${product}`;
    }

    const generatePrice = () => {
        const prices = ['300,00', '250,00', '199,99', '349,00', '399,00'];
        return prices[Math.floor(Math.random() * prices.length)];
    }

    const createProductElement = (product) => {
        const badge = generateBadge();
        const productName = generateProductName(product.text);
        const price = generatePrice();

        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.dataset.id = product.id;

        const originalImage = product.image;
        const smallImage = originalImage;

        const productHtml = `
            <div class="product-image-container">
                ${badge.type ? `<div class="product-badge badge-${badge.type}">${badge.label}</div>` : ''}
                <img src="${product.image}" 
                     alt="${productName}" 
                     class="product-image"
                     loading="lazy"
                     srcset="${smallImage} 400w, ${originalImage} 800w"
                     sizes="(max-width: 768px) 50vw, 300px">
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

        const favoriteBtn = productElement.querySelector('.product-favorite');
        favoriteBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });

        return productElement;
    }

    const loadProducts = async () => {
        const productsWrapper = document.getElementById('products-wrapper');
        const loader = document.getElementById('products-loader');
        const scrollProgressBar = document.getElementById('scroll-progress-bar');

        try {
            loader.style.display = 'flex';

            const productsData = await fetchProducts();

            loader.style.display = 'none';

            productsWrapper.innerHTML = '';


            let productsToRender = [...productsData.data];
            if (productsToRender.length < 8) {
                while (productsToRender.length < 8) {
                    productsToRender = [...productsToRender, ...productsData.data];
                }
                productsToRender = productsToRender.slice(0, 12);
            }

            productsToRender.forEach(product => {
                const productElement = createProductElement(product);
                productsWrapper.appendChild(productElement);
            });

            setupScrolling();

            productsWrapper.scrollLeft = 0;

            setTimeout(() => {
                if (scrollProgressBar && productsWrapper.scrollWidth > productsWrapper.clientWidth) {
                    const initialProgressValue = 20;
                    scrollProgressBar.style.width = initialProgressValue + '%';
                }

                const scrollEvent = new Event('scroll');
                productsWrapper.dispatchEvent(scrollEvent);
            }, 500);

        } catch (error) {
            console.error('Błąd podczas ładowania produktów:', error);
            loader.style.display = 'none';
            productsWrapper.innerHTML = '<p class="error-message">Nie udało się załadować produktów. Spróbuj ponownie później.</p>';
        }
    }

    const setupScrolling = () => {
        const scrollLeftBtn = document.getElementById('scroll-left-btn');
        const scrollRightBtn = document.getElementById('scroll-right-btn');
        const productsWrapper = document.getElementById('products-wrapper');
        const scrollProgressBar = document.getElementById('scroll-progress-bar');

        if (!scrollLeftBtn || !scrollRightBtn || !productsWrapper) return;

        const initialProgressValue = 20;

        const updateScrollButtons = () => {
            const maxScrollLeft = productsWrapper.scrollWidth - productsWrapper.clientWidth;

            if (productsWrapper.scrollLeft <= 5) {
                scrollLeftBtn.style.display = 'none';
            } else {
                scrollLeftBtn.style.display = 'flex';
            }

            if (productsWrapper.scrollLeft >= maxScrollLeft - 5) {
                scrollRightBtn.style.display = 'none';
            } else {
                scrollRightBtn.style.display = 'flex';
            }

            if (scrollProgressBar) {
                const scrollRatio = productsWrapper.scrollLeft / maxScrollLeft;

                const scaledPercentage = initialProgressValue + (scrollRatio * (100 - initialProgressValue));

                scrollProgressBar.style.width = scaledPercentage + '%';
            }
        }

        window.addEventListener('resize', function () {
            updateScrollButtons();
        });

        scrollLeftBtn.style.display = 'none';

        if (scrollProgressBar) {
            scrollProgressBar.style.width = initialProgressValue + '%';
        }

        updateScrollButtons();

        scrollLeftBtn.addEventListener('click', function () {
            const cardWidth = productsWrapper.querySelector('.product-card').offsetWidth;
            const gapWidth = 24;
            const scrollAmount = cardWidth + gapWidth;

            const targetPosition = Math.max(0, productsWrapper.scrollLeft - scrollAmount);

            productsWrapper.scrollTo({ left: targetPosition, behavior: 'smooth' });
        });

        scrollRightBtn.addEventListener('click', function () {
            const cardWidth = productsWrapper.querySelector('.product-card').offsetWidth;
            const gapWidth = 24;
            const scrollAmount = cardWidth + gapWidth;

            const targetPosition = Math.min(
                productsWrapper.scrollWidth - productsWrapper.clientWidth,
                productsWrapper.scrollLeft + scrollAmount
            );

            productsWrapper.scrollTo({ left: targetPosition, behavior: 'smooth' });
        });

        productsWrapper.addEventListener('scroll', function () {
            updateScrollButtons();
        });
    }

    loadProducts();
} 