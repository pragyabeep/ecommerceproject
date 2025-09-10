// Products page specific functionality
let filteredProducts = [];
let currentView = 'grid';

// Initialize products page
document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
    loadProducts();
    initializeEventListeners();
});

function initializeProductsPage() {
    // Check for search query from homepage
    const searchQuery = localStorage.getItem('searchQuery');
    if (searchQuery) {
        document.getElementById('searchInput').value = searchQuery;
        localStorage.removeItem('searchQuery');
    }
    
    // Check for selected category from homepage
    const selectedCategory = localStorage.getItem('selectedCategory');
    if (selectedCategory) {
        document.getElementById('categoryFilter').value = selectedCategory;
        localStorage.removeItem('selectedCategory');
    }
}

function initializeEventListeners() {
    // Filter controls
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortBy = document.getElementById('sortBy');
    const applyFilters = document.getElementById('applyFilters');
    const clearFilters = document.getElementById('clearFilters');
    
    if (categoryFilter) categoryFilter.addEventListener('change', applyFiltersAndSort);
    if (priceFilter) priceFilter.addEventListener('change', applyFiltersAndSort);
    if (sortBy) sortBy.addEventListener('change', applyFiltersAndSort);
    if (applyFilters) applyFilters.addEventListener('click', applyFiltersAndSort);
    if (clearFilters) clearFilters.addEventListener('click', clearAllFilters);
    
    // View toggle
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    
    if (gridView) gridView.addEventListener('click', () => switchView('grid'));
    if (listView) listView.addEventListener('click', () => switchView('list'));
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
}

function loadProducts() {
    const loading = document.getElementById('loading');
    const productsGrid = document.getElementById('productsGrid');
    const productsList = document.getElementById('productsList');
    
    if (loading) loading.style.display = 'block';
    
    // Simulate loading delay
    setTimeout(() => {
        filteredProducts = [...products];
        displayProducts();
        updateProductsCount();
        
        if (loading) loading.style.display = 'none';
    }, 500);
}

function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const productsList = document.getElementById('productsList');
    const noProducts = document.getElementById('noProducts');
    
    if (filteredProducts.length === 0) {
        if (productsGrid) productsGrid.style.display = 'none';
        if (productsList) productsList.style.display = 'none';
        if (noProducts) noProducts.style.display = 'block';
        return;
    }
    
    if (noProducts) noProducts.style.display = 'none';
    
    if (currentView === 'grid') {
        displayGridView();
    } else {
        displayListView();
    }
}

function displayGridView() {
    const productsGrid = document.getElementById('productsGrid');
    const productsList = document.getElementById('productsList');
    
    if (productsList) productsList.style.display = 'none';
    if (productsGrid) {
        productsGrid.style.display = 'grid';
        productsGrid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
    }
}

function displayListView() {
    const productsGrid = document.getElementById('productsGrid');
    const productsList = document.getElementById('productsList');
    
    if (productsGrid) productsGrid.style.display = 'none';
    if (productsList) {
        productsList.style.display = 'flex';
        productsList.innerHTML = filteredProducts.map(product => createProductListItem(product)).join('');
    }
}

function createProductCard(product) {
    const stockStatus = getStockStatus(product.stock);
    const stockClass = getStockClass(product.stock);
    
    return `
        <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">
                    <div class="stars">${generateStarRating(product.rating)}</div>
                    <span class="rating-text">(${product.rating})</span>
                </div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-stock ${stockClass}">${stockStatus}</div>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `;
}

function createProductListItem(product) {
    const stockStatus = getStockStatus(product.stock);
    const stockClass = getStockClass(product.stock);
    
    return `
        <div class="product-list-item" onclick="window.location.href='product-detail.html?id=${product.id}'">
            <img src="${product.image}" alt="${product.title}" class="product-list-image">
            <div class="product-list-info">
                <div class="product-list-details">
                    <h3 class="product-list-title">${product.title}</h3>
                    <p class="product-list-description">${product.description}</p>
                    <div class="product-list-rating">
                        <div class="stars">${generateStarRating(product.rating)}</div>
                        <span class="rating-text">(${product.rating})</span>
                    </div>
                    <div class="product-stock ${stockClass}">${stockStatus}</div>
                </div>
                <div class="product-list-actions">
                    <div class="product-list-price">$${product.price.toFixed(2)}</div>
                    <button class="product-list-cart" onclick="event.stopPropagation(); addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getStockStatus(stock) {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return `Only ${stock} left`;
    if (stock < 25) return `${stock} in stock`;
    return 'In Stock';
}

function getStockClass(stock) {
    if (stock === 0) return 'stock-low';
    if (stock < 10) return 'stock-low';
    if (stock < 25) return 'stock-medium';
    return 'stock-high';
}

function applyFiltersAndSort() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    
    // Start with all products
    filteredProducts = [...products];
    
    // Apply search filter
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(product =>
            product.title.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery) ||
            product.category.toLowerCase().includes(searchQuery)
        );
    }
    
    // Apply category filter
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
    }
    
    // Apply price filter
    if (priceFilter) {
        const [min, max] = priceFilter.split('-').map(p => p === '+' ? Infinity : parseFloat(p));
        filteredProducts = filteredProducts.filter(product => {
            if (max === Infinity) return product.price >= min;
            return product.price >= min && product.price <= max;
        });
    }
    
    // Apply sorting
    switch (sortBy) {
        case 'name':
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    displayProducts();
    updateProductsCount();
}

function clearAllFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('sortBy').value = 'name';
    document.getElementById('searchInput').value = '';
    
    filteredProducts = [...products];
    displayProducts();
    updateProductsCount();
}

function handleSearch() {
    applyFiltersAndSort();
}

function switchView(view) {
    currentView = view;
    
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    
    if (view === 'grid') {
        if (gridView) gridView.classList.add('active');
        if (listView) listView.classList.remove('active');
    } else {
        if (listView) listView.classList.add('active');
        if (gridView) gridView.classList.remove('active');
    }
    
    displayProducts();
}

function updateProductsCount() {
    const productsCount = document.getElementById('productsCount');
    if (productsCount) {
        productsCount.textContent = filteredProducts.length;
    }
}

// Utility function for debouncing search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for global access
window.clearAllFilters = clearAllFilters;
window.switchView = switchView;
