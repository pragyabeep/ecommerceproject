// Global variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Sample product data
const sampleProducts = [
    {
        id: 1,
        title: "Wireless Bluetooth Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 99.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "electronics",
        rating: 4.5,
        stock: 50
    },
    {
        id: 2,
        title: "Smart Fitness Watch",
        description: "Track your fitness with this advanced smartwatch",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "electronics",
        rating: 4.8,
        stock: 30
    },
    {
        id: 3,
        title: "Cotton T-Shirt",
        description: "Comfortable cotton t-shirt in various colors",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "clothing",
        rating: 4.2,
        stock: 100
    },
    {
        id: 4,
        title: "Denim Jeans",
        description: "Classic blue denim jeans with perfect fit",
        price: 59.99,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "clothing",
        rating: 4.4,
        stock: 75
    },
    {
        id: 5,
        title: "Coffee Maker",
        description: "Automatic coffee maker for the perfect morning brew",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "home",
        rating: 4.6,
        stock: 25
    },
    {
        id: 6,
        title: "Garden Tools Set",
        description: "Complete set of gardening tools for your backyard",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "home",
        rating: 4.3,
        stock: 40
    },
    {
        id: 7,
        title: "Yoga Mat",
        description: "Premium non-slip yoga mat for all exercises",
        price: 39.99,
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "sports",
        rating: 4.7,
        stock: 60
    },
    {
        id: 8,
        title: "Dumbbell Set",
        description: "Adjustable dumbbell set for home workouts",
        price: 149.99,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "sports",
        rating: 4.5,
        stock: 20
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    products = sampleProducts;
    updateCartCount();
    loadFeaturedProducts();
    initializeEventListeners();
    
    // Check if user is logged in
    if (currentUser) {
        updateUserInterface();
    }
});

// Event Listeners
function initializeEventListeners() {
    // Cart functionality
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const cartSidebar = document.getElementById('cartSidebar');
    
    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (closeCart) closeCart.addEventListener('click', closeCartSidebar);
    
    // User modal functionality
    const userBtn = document.getElementById('userBtn');
    const closeUserModal = document.getElementById('closeUserModal');
    const userModal = document.getElementById('userModal');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    if (userBtn) userBtn.addEventListener('click', toggleUserModal);
    if (closeUserModal) closeUserModal.addEventListener('click', closeUserModalFunc);
    if (showRegister) showRegister.addEventListener('click', showRegisterForm);
    if (showLogin) showLogin.addEventListener('click', showLoginForm);
    
    // Form submissions
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (newsletterForm) newsletterForm.addEventListener('submit', handleNewsletter);
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput) searchInput.addEventListener('keypress', handleSearch);
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    
    // Close modals when clicking outside
    if (userModal) {
        userModal.addEventListener('click', function(e) {
            if (e.target === userModal) {
                closeUserModalFunc();
            }
        });
    }
    
    if (cartSidebar) {
        cartSidebar.addEventListener('click', function(e) {
            if (e.target === cartSidebar) {
                closeCartSidebar();
            }
        });
    }
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    updateCartDisplay();
    showNotification('Product added to cart!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    updateCartDisplay();
    showNotification('Product removed from cart!');
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCart();
            updateCartCount();
            updateCartDisplay();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Your cart is empty</p>';
        if (cartTotal) cartTotal.textContent = '0.00';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) cartTotal.textContent = total.toFixed(2);
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('open');
        updateCartDisplay();
    }
}

function closeCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.remove('open');
    }
}

// Product Functions
function loadFeaturedProducts() {
    const featuredProducts = document.getElementById('featuredProducts');
    if (!featuredProducts) return;
    
    const featured = products.slice(0, 4); // Show first 4 products as featured
    
    featuredProducts.innerHTML = featured.map(product => `
        <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function filterProducts(category) {
    // This will be used on the products page
    localStorage.setItem('selectedCategory', category);
    window.location.href = 'products.html';
}

function searchProducts(query) {
    if (!query.trim()) return products;
    
    return products.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );
}

// User Authentication Functions
function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    // Simple validation (in real app, this would be server-side)
    if (email && password) {
        currentUser = {
            email: email,
            name: email.split('@')[0],
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserInterface();
        closeUserModalFunc();
        showNotification('Login successful!');
        e.target.reset();
    } else {
        showNotification('Please fill in all fields', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = e.target.querySelector('input[placeholder="Full Name"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[placeholder="Password"]').value;
    const confirmPassword = e.target.querySelector('input[placeholder="Confirm Password"]').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (name && email && password) {
        currentUser = {
            name: name,
            email: email,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserInterface();
        closeUserModalFunc();
        showNotification('Registration successful!');
        e.target.reset();
    } else {
        showNotification('Please fill in all fields', 'error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserInterface();
    showNotification('Logged out successfully!');
}

function updateUserInterface() {
    const userBtn = document.getElementById('userBtn');
    if (userBtn && currentUser) {
        userBtn.innerHTML = `<i class="fas fa-user"></i>`;
        userBtn.title = `Logged in as ${currentUser.name}`;
    }
}

// Modal Functions
function toggleUserModal() {
    const userModal = document.getElementById('userModal');
    if (userModal) {
        userModal.classList.toggle('show');
    }
}

function closeUserModalFunc() {
    const userModal = document.getElementById('userModal');
    if (userModal) {
        userModal.classList.remove('show');
    }
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// Form Handlers
function handleNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    if (email) {
        showNotification('Thank you for subscribing!');
        e.target.reset();
    }
}

function handleSearch(e) {
    if (e.type === 'keypress' && e.key !== 'Enter') return;
    
    const query = document.getElementById('searchInput').value;
    if (query.trim()) {
        localStorage.setItem('searchQuery', query);
        window.location.href = 'products.html';
    }
}

// Utility Functions
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1003;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Export functions for use in other pages
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.logout = logout;
window.formatCurrency = formatCurrency;
window.generateStarRating = generateStarRating;
