import { fetchProducts } from '../utils/apiUtils.js';
import { showLoader, hideLoader } from '../utils/domUtils.js';

const initFeaturedProducts = () => {
    const productData = {
        badges: [
            { type: 'bestseller', label: 'BESTSELLER' },
            { type: 'limited', label: 'LIMITED EDITION' },
            { type: null, label: '' }
        ],
        colors: ['Dark blue', 'Orange', 'Grey', 'Green', 'Black', 'Red', 'Navy'],
        products: ['alpine climbing jacket', 'helmet for alpine TOUNDRA', 'climbing shoes', 'harness'],
        prices: ['300,00', '250,00', '199,99', '349,00', '399,00']
    };

    const generateBadge = () => {
        const badgeIndex = Math.floor(Math.random() * 10);

        if (badgeIndex < 4) {
            return productData.badges[0];
        } else if (badgeIndex < 8) {
            return productData.badges[1];
        } else {
            return productData.badges[2];
        }
    };

    const generateProductName = () => {
        const color = productData.colors[Math.floor(Math.random() * productData.colors.length)];
        const product = productData.products[Math.floor(Math.random() * productData.products.length)];
        return `${color} ${product}`;
    };

    const generatePrice = () => {
        return productData.prices[Math.floor(Math.random() * productData.prices.length)];
    };

    const createProductElement = (product) => {
        const badge = generateBadge();
        const productName = generateProductName();
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
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.currentTarget.classList.toggle('active');
        });

        return productElement;
    };

    const loadProducts = async () => {
        const productsWrapper = document.getElementById('products-wrapper');
        const loader = document.getElementById('products-loader');
        const scrollProgressBar = document.getElementById('scroll-progress-bar');

        if (!productsWrapper || !loader) return;

        showLoader(loader);

        try {
            const productsData = await fetchProducts();
            hideLoader(loader);

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
            setupDragging(productsWrapper);

            productsWrapper.scrollLeft = 0;

            setTimeout(() => {
                if (scrollProgressBar && productsWrapper.scrollWidth > productsWrapper.clientWidth) {
                    updateScrollProgress(0);
                }

                const scrollEvent = new Event('scroll');
                productsWrapper.dispatchEvent(scrollEvent);
            }, 500);

        } catch (error) {
            console.error('Błąd podczas ładowania produktów:', error);
            hideLoader(loader);
            productsWrapper.innerHTML = '<p class="error-message">Nie udało się załadować produktów. Spróbuj ponownie później.</p>';
        }
    };

    const setupDragging = (productsWrapper) => {
        let isDown = false;
        let startX;
        let scrollLeft;

        productsWrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            productsWrapper.classList.add('grabbing');
            startX = e.pageX - productsWrapper.offsetLeft;
            scrollLeft = productsWrapper.scrollLeft;
            e.preventDefault();
        });

        productsWrapper.addEventListener('mouseleave', () => {
            isDown = false;
            productsWrapper.classList.remove('grabbing');
        });

        productsWrapper.addEventListener('mouseup', () => {
            isDown = false;
            productsWrapper.classList.remove('grabbing');
        });

        productsWrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            const x = e.pageX - productsWrapper.offsetLeft;
            const walk = (x - startX) * 1.5;
            productsWrapper.scrollLeft = scrollLeft - walk;
        });

        productsWrapper.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - productsWrapper.offsetLeft;
            scrollLeft = productsWrapper.scrollLeft;
        }, { passive: true });

        productsWrapper.addEventListener('touchend', () => {
            isDown = false;
        }, { passive: true });

        productsWrapper.addEventListener('touchcancel', () => {
            isDown = false;
        }, { passive: true });

        productsWrapper.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - productsWrapper.offsetLeft;
            const walk = (x - startX) * 1.5;
            productsWrapper.scrollLeft = scrollLeft - walk;
        }, { passive: true });
    };

    const updateScrollProgress = (scrollRatio) => {
        const scrollProgressBar = document.getElementById('scroll-progress-bar');
        if (!scrollProgressBar) return;

        const scrollbarWidth = scrollProgressBar.parentElement.offsetWidth;
        const progressWidth = 60;
        
        const maxTranslate = scrollbarWidth - progressWidth;
        
        const translateX = scrollRatio * maxTranslate;
        
        scrollProgressBar.style.transform = `translateX(${translateX}px)`;
    };

    const setupScrolling = () => {
        const scrollLeftBtn = document.getElementById('scroll-left-btn');
        const scrollRightBtn = document.getElementById('scroll-right-btn');
        const productsWrapper = document.getElementById('products-wrapper');

        if (!scrollLeftBtn || !scrollRightBtn || !productsWrapper) return;

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

            if (maxScrollLeft > 0) {
                const scrollRatio = productsWrapper.scrollLeft / maxScrollLeft;
                updateScrollProgress(scrollRatio);
            }
        };

        window.addEventListener('resize', updateScrollButtons);

        scrollLeftBtn.style.display = 'none';
        updateScrollButtons();

        scrollLeftBtn.addEventListener('click', () => {
            const cardWidth = productsWrapper.querySelector('.product-card').offsetWidth;
            const gapWidth = 24;
            const scrollAmount = cardWidth + gapWidth;

            const targetPosition = Math.max(0, productsWrapper.scrollLeft - scrollAmount);
            productsWrapper.scrollTo({ left: targetPosition, behavior: 'smooth' });
        });

        scrollRightBtn.addEventListener('click', () => {
            const cardWidth = productsWrapper.querySelector('.product-card').offsetWidth;
            const gapWidth = 24;
            const scrollAmount = cardWidth + gapWidth;

            const targetPosition = Math.min(
                productsWrapper.scrollWidth - productsWrapper.clientWidth,
                productsWrapper.scrollLeft + scrollAmount
            );

            productsWrapper.scrollTo({ left: targetPosition, behavior: 'smooth' });
        });

        productsWrapper.addEventListener('scroll', updateScrollButtons);
    };

    loadProducts();
};

export default initFeaturedProducts; 