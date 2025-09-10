// Product Detail Page Functionality
let currentProduct = null;
let currentImageIndex = 0;
let productImages = [];

// Initialize product detail page
document.addEventListener('DOMContentLoaded', function() {
    initializeProductDetail();
    initializeEventListeners();
});

function initializeProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductDetail(parseInt(productId));
    } else {
        showProductNotFound();
    }
}

function initializeEventListeners() {
    // Image gallery
    const closeImageModal = document.getElementById('closeImageModal');
    const prevImage = document.getElementById('prevImage');
    const nextImage = document.getElementById('nextImage');
    
    if (closeImageModal) closeImageModal.addEventListener('click', closeImageModalFunc);
    if (prevImage) prevImage.addEventListener('click', showPreviousImage);
    if (nextImage) nextImage.addEventListener('click', showNextImage);
    
    // Quantity controls
    const quantityInput = document.querySelector('.quantity-input');
    if (quantityInput) {
        quantityInput.addEventListener('change', updateQuantity);
    }
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}

function loadProductDetail(productId) {
    const loading = document.getElementById('loading');
    const productDetailContent = document.getElementById('productDetailContent');
    
    if (loading) loading.style.display = 'block';
    
    // Simulate loading delay
    setTimeout(() => {
        currentProduct = products.find(p => p.id === productId);
        
        if (currentProduct) {
            displayProductDetail();
            loadRelatedProducts();
        } else {
            showProductNotFound();
        }
        
        if (loading) loading.style.display = 'none';
    }, 500);
}

function displayProductDetail() {
    if (!currentProduct) return;
    
    const productDetailContent = document.getElementById('productDetailContent');
    const productCategory = document.getElementById('productCategory');
    const productTitle = document.getElementById('productTitle');
    
    // Update breadcrumb
    if (productCategory) productCategory.textContent = currentProduct.category;
    if (productTitle) productTitle.textContent = currentProduct.title;
    
    // Generate product images (in real app, this would come from the product data)
    productImages = [
        currentProduct.image,
        currentProduct.image, // In real app, these would be different images
        currentProduct.image,
        currentProduct.image
    ];
    
    const stockStatus = getStockStatus(currentProduct.stock);
    const stockClass = getStockClass(currentProduct.stock);
    
    productDetailContent.innerHTML = `
        <div class="product-detail-grid">
            <div class="product-images">
                <img src="${currentProduct.image}" alt="${currentProduct.title}" class="main-image" id="mainImage" onclick="openImageModal(0)">
                <div class="thumbnail-images">
                    ${productImages.map((img, index) => `
                        <img src="${img}" alt="${currentProduct.title}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                             onclick="changeMainImage(${index})">
                    `).join('')}
                </div>
            </div>
            
            <div class="product-info">
                <h1 class="product-title">${currentProduct.title}</h1>
                
                <div class="product-rating">
                    <div class="stars">${generateStarRating(currentProduct.rating)}</div>
                    <span class="rating-text">${currentProduct.rating}</span>
                    <a href="#" class="review-count">(24 reviews)</a>
                </div>
                
                <div class="product-price">$${currentProduct.price.toFixed(2)}</div>
                
                <div class="product-description">
                    ${currentProduct.description}
                </div>
                
                <div class="product-features">
                    <h4>Key Features</h4>
                    <ul class="features-list">
                        <li><i class="fas fa-check"></i> High quality materials</li>
                        <li><i class="fas fa-check"></i> 30-day money back guarantee</li>
                        <li><i class="fas fa-check"></i> Free shipping on orders over $50</li>
                        <li><i class="fas fa-check"></i> 24/7 customer support</li>
                    </ul>
                </div>
                
                <div class="product-options">
                    <div class="option-group">
                        <label for="sizeSelect">Size:</label>
                        <select class="option-select" id="sizeSelect">
                            <option value="small">Small</option>
                            <option value="medium" selected>Medium</option>
                            <option value="large">Large</option>
                            <option value="xlarge">X-Large</option>
                        </select>
                    </div>
                    
                    <div class="option-group">
                        <label for="colorSelect">Color:</label>
                        <select class="option-select" id="colorSelect">
                            <option value="black" selected>Black</option>
                            <option value="white">White</option>
                            <option value="blue">Blue</option>
                            <option value="red">Red</option>
                        </select>
                    </div>
                </div>
                
                <div class="quantity-selector">
                    <label>Quantity:</label>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="decreaseQuantity()">-</button>
                        <input type="number" class="quantity-input" value="1" min="1" max="${currentProduct.stock}">
                        <button class="quantity-btn" onclick="increaseQuantity()">+</button>
                    </div>
                </div>
                
                <div class="stock-status ${stockClass}">
                    <i class="fas fa-${currentProduct.stock === 0 ? 'times-circle' : 'check-circle'}"></i>
                    ${stockStatus}
                </div>
                
                <div class="product-actions">
                    <button class="btn-primary" onclick="addToCart(${currentProduct.id})" ${currentProduct.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${currentProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button class="btn-secondary" onclick="addToWishlist(${currentProduct.id})">
                        <i class="fas fa-heart"></i>
                        Wishlist
                    </button>
                </div>
                
                <div class="product-tabs">
                    <div class="tab-nav">
                        <button class="tab-btn active" data-tab="description">Description</button>
                        <button class="tab-btn" data-tab="specifications">Specifications</button>
                        <button class="tab-btn" data-tab="reviews">Reviews</button>
                        <button class="tab-btn" data-tab="shipping">Shipping</button>
                    </div>
                    
                    <div class="tab-content active" id="description">
                        <h4>Product Description</h4>
                        <p>${currentProduct.description}</p>
                        <p>This product is designed with the latest technology and highest quality materials to ensure durability and performance. Perfect for everyday use and special occasions.</p>
                        <p>Our commitment to quality means you can trust this product to meet your expectations and provide excellent value for money.</p>
                    </div>
                    
                    <div class="tab-content" id="specifications">
                        <h4>Technical Specifications</h4>
                        <table class="specifications-table">
                            <tr>
                                <th>Brand</th>
                                <td>ShopEasy</td>
                            </tr>
                            <tr>
                                <th>Model</th>
                                <td>SE-${currentProduct.id.toString().padStart(3, '0')}</td>
                            </tr>
                            <tr>
                                <th>Category</th>
                                <td>${currentProduct.category}</td>
                            </tr>
                            <tr>
                                <th>Weight</th>
                                <td>1.2 lbs</td>
                            </tr>
                            <tr>
                                <th>Dimensions</th>
                                <td>10" x 8" x 2"</td>
                            </tr>
                            <tr>
                                <th>Warranty</th>
                                <td>1 Year</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="tab-content" id="reviews">
                        <h4>Customer Reviews</h4>
                        <p>This product has received excellent reviews from our customers. Here are some highlights:</p>
                        <div class="review-summary">
                            <div class="overall-rating">
                                <span class="rating-number">${currentProduct.rating}</span>
                                <div class="stars">${generateStarRating(currentProduct.rating)}</div>
                                <span class="review-count">Based on 24 reviews</span>
                            </div>
                        </div>
                        <p><strong>Most helpful review:</strong> "Great product! Exceeded my expectations. Fast shipping and excellent quality." - Sarah M.</p>
                    </div>
                    
                    <div class="tab-content" id="shipping">
                        <h4>Shipping Information</h4>
                        <p><strong>Free Shipping:</strong> On orders over $50</p>
                        <p><strong>Standard Shipping:</strong> 3-5 business days ($5.99)</p>
                        <p><strong>Express Shipping:</strong> 1-2 business days ($12.99)</p>
                        <p><strong>Overnight Shipping:</strong> Next business day ($19.99)</p>
                        <p>All orders are processed within 1-2 business days. You will receive a tracking number once your order ships.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Re-initialize event listeners for new elements
    initializeEventListeners();
}

function loadRelatedProducts() {
    const relatedProducts = document.getElementById('relatedProducts');
    const relatedProductsGrid = document.getElementById('relatedProductsGrid');
    
    if (!relatedProducts || !relatedProductsGrid) return;
    
    // Get products from the same category, excluding current product
    const related = products
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 4);
    
    if (related.length > 0) {
        relatedProducts.style.display = 'block';
        relatedProductsGrid.innerHTML = related.map(product => `
            <div class="related-product-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
                <img src="${product.image}" alt="${product.title}" class="related-product-image">
                <div class="related-product-info">
                    <h3 class="related-product-title">${product.title}</h3>
                    <div class="related-product-price">$${product.price.toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    }
}

function showProductNotFound() {
    const productDetailContent = document.getElementById('productDetailContent');
    const productNotFound = document.getElementById('productNotFound');
    
    if (productDetailContent) productDetailContent.style.display = 'none';
    if (productNotFound) productNotFound.style.display = 'block';
}

// Image Gallery Functions
function changeMainImage(index) {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (mainImage && productImages[index]) {
        mainImage.src = productImages[index];
        mainImage.onclick = () => openImageModal(index);
        
        // Update active thumbnail
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
        
        currentImageIndex = index;
    }
}

function openImageModal(index) {
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    if (imageModal && modalImage && productImages[index]) {
        modalImage.src = productImages[index];
        modalImage.alt = currentProduct.title;
        currentImageIndex = index;
        imageModal.classList.add('show');
    }
}

function closeImageModalFunc() {
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.classList.remove('show');
    }
}

function showPreviousImage() {
    const prevIndex = currentImageIndex > 0 ? currentImageIndex - 1 : productImages.length - 1;
    const modalImage = document.getElementById('modalImage');
    
    if (modalImage && productImages[prevIndex]) {
        modalImage.src = productImages[prevIndex];
        currentImageIndex = prevIndex;
    }
}

function showNextImage() {
    const nextIndex = currentImageIndex < productImages.length - 1 ? currentImageIndex + 1 : 0;
    const modalImage = document.getElementById('modalImage');
    
    if (modalImage && productImages[nextIndex]) {
        modalImage.src = productImages[nextIndex];
        currentImageIndex = nextIndex;
    }
}

// Quantity Functions
function increaseQuantity() {
    const quantityInput = document.querySelector('.quantity-input');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value);
        const maxValue = parseInt(quantityInput.max);
        if (currentValue < maxValue) {
            quantityInput.value = currentValue + 1;
        }
    }
}

function decreaseQuantity() {
    const quantityInput = document.querySelector('.quantity-input');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    }
}

function updateQuantity() {
    const quantityInput = document.querySelector('.quantity-input');
    if (quantityInput) {
        const value = parseInt(quantityInput.value);
        const min = parseInt(quantityInput.min);
        const max = parseInt(quantityInput.max);
        
        if (value < min) quantityInput.value = min;
        if (value > max) quantityInput.value = max;
    }
}

// Tab Functions
function switchTab(tabName) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active class from all tabs
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(tabName);
    
    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
}

// Wishlist Function
function addToWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        showNotification('Added to wishlist!');
    } else {
        showNotification('Already in wishlist!', 'info');
    }
}

// Utility Functions
function getStockStatus(stock) {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return `Only ${stock} left in stock`;
    if (stock < 25) return `${stock} in stock`;
    return 'In Stock';
}

function getStockClass(stock) {
    if (stock === 0) return 'stock-out';
    if (stock < 10) return 'stock-low';
    if (stock < 25) return 'stock-medium';
    return 'stock-high';
}

// Close image modal when clicking outside
document.addEventListener('click', function(e) {
    const imageModal = document.getElementById('imageModal');
    if (e.target === imageModal) {
        closeImageModalFunc();
    }
});

// Keyboard navigation for image modal
document.addEventListener('keydown', function(e) {
    const imageModal = document.getElementById('imageModal');
    if (imageModal && imageModal.classList.contains('show')) {
        if (e.key === 'Escape') {
            closeImageModalFunc();
        } else if (e.key === 'ArrowLeft') {
            showPreviousImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        }
    }
});

// Export functions for global access
window.changeMainImage = changeMainImage;
window.openImageModal = openImageModal;
window.closeImageModalFunc = closeImageModalFunc;
window.showPreviousImage = showPreviousImage;
window.showNextImage = showNextImage;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.updateQuantity = updateQuantity;
window.switchTab = switchTab;
window.addToWishlist = addToWishlist;
