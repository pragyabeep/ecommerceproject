// Admin Dashboard Functionality
let currentPage = 'dashboard';
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    loadDashboardData();
    initializeEventListeners();
});

function initializeAdmin() {
    // Check if user is admin (in real app, this would be server-side authentication)
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
        // For demo purposes, set admin flag
        localStorage.setItem('isAdmin', 'true');
    }
}

function initializeEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.admin-navbar .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('href').replace('admin-', '').replace('.html', '');
            if (page === 'admin') page = 'dashboard';
            navigateToPage(page);
        });
    });
    
    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Modal close buttons
    const closeProductModal = document.getElementById('closeProductModal');
    const closeOrderModal = document.getElementById('closeOrderModal');
    
    if (closeProductModal) closeProductModal.addEventListener('click', closeProductModalFunc);
    if (closeOrderModal) closeOrderModal.addEventListener('click', closeOrderModalFunc);
    
    // Search and filters
    const productSearch = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    
    if (productSearch) productSearch.addEventListener('input', filterProducts);
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
    if (orderStatusFilter) orderStatusFilter.addEventListener('change', filterOrders);
}

function navigateToPage(page) {
    currentPage = page;
    
    // Update navigation
    const navLinks = document.querySelectorAll('.admin-navbar .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(page) || (page === 'dashboard' && link.getAttribute('href') === 'admin.html')) {
            link.classList.add('active');
        }
    });
    
    // Show/hide pages
    const pages = document.querySelectorAll('.admin-page, .admin-dashboard');
    pages.forEach(p => p.style.display = 'none');
    
    if (page === 'dashboard') {
        document.querySelector('.admin-dashboard').style.display = 'block';
        loadDashboardData();
    } else {
        const pageElement = document.getElementById(`admin${page.charAt(0).toUpperCase() + page.slice(1)}Page`);
        if (pageElement) {
            pageElement.style.display = 'block';
            loadPageData(page);
        }
    }
}

function loadDashboardData() {
    loadStats();
    loadRecentOrders();
    loadTopProducts();
}

function loadStats() {
    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totals.total, 0);
    const totalCustomers = new Set(orders.map(order => order.customer.email)).size;
    const totalProducts = products.length;
    
    // Update DOM
    const elements = {
        totalOrders: document.getElementById('totalOrders'),
        totalRevenue: document.getElementById('totalRevenue'),
        totalCustomers: document.getElementById('totalCustomers'),
        totalProducts: document.getElementById('totalProducts')
    };
    
    if (elements.totalOrders) elements.totalOrders.textContent = totalOrders;
    if (elements.totalRevenue) elements.totalRevenue.textContent = formatCurrency(totalRevenue);
    if (elements.totalCustomers) elements.totalCustomers.textContent = totalCustomers;
    if (elements.totalProducts) elements.totalProducts.textContent = totalProducts;
}

function loadRecentOrders() {
    const recentOrdersTable = document.getElementById('recentOrdersTable');
    if (!recentOrdersTable) return;
    
    const recentOrders = orders.slice(-5).reverse(); // Last 5 orders, newest first
    
    recentOrdersTable.innerHTML = recentOrders.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${order.customer.email}</td>
            <td>${formatDate(order.date)}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${formatCurrency(order.totals.total)}</td>
            <td>
                <button class="btn-icon btn-view" onclick="viewOrder('${order.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function loadTopProducts() {
    const topProductsGrid = document.getElementById('topProductsGrid');
    if (!topProductsGrid) return;
    
    // Calculate product sales (simplified - in real app, this would be more sophisticated)
    const productSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!productSales[item.id]) {
                productSales[item.id] = { ...item, totalSold: 0 };
            }
            productSales[item.id].totalSold += item.quantity;
        });
    });
    
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 4);
    
    topProductsGrid.innerHTML = topProducts.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.title}">
            <h4>${product.title}</h4>
            <p>${product.totalSold} sold</p>
        </div>
    `).join('');
}

function loadPageData(page) {
    switch (page) {
        case 'products':
            loadProductsTable();
            break;
        case 'orders':
            loadOrdersTable();
            break;
        case 'customers':
            loadCustomersTable();
            break;
    }
}

function loadProductsTable() {
    const productsTableBody = document.getElementById('productsTableBody');
    if (!productsTableBody) return;
    
    productsTableBody.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.image}" alt="${product.title}"></td>
            <td><strong>${product.title}</strong></td>
            <td>${product.category}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${product.stock > 0 ? 'status-confirmed' : 'status-cancelled'}">${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editProduct(${product.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct(${product.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadOrdersTable() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (!ordersTableBody) return;
    
    ordersTableBody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${order.customer.email}</td>
            <td>${formatDate(order.date)}</td>
            <td>${order.items.length} items</td>
            <td>${formatCurrency(order.totals.total)}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" onclick="viewOrder('${order.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="updateOrderStatus('${order.id}')" title="Update Status">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadCustomersTable() {
    // This would load customer data in a real application
    console.log('Loading customers table...');
}

// Product Management
function showAddProductModal() {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');
    
    if (title) title.textContent = 'Add New Product';
    if (form) form.reset();
    if (modal) modal.classList.add('show');
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');
    
    if (title) title.textContent = 'Edit Product';
    if (form) {
        form.reset();
        document.getElementById('productName').value = product.title;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productRating').value = product.rating;
        document.getElementById('productImage').value = product.image;
        
        // Store product ID for update
        form.dataset.productId = productId;
    }
    if (modal) modal.classList.add('show');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const index = products.findIndex(p => p.id === productId);
        if (index > -1) {
            products.splice(index, 1);
            localStorage.setItem('products', JSON.stringify(products));
            loadProductsTable();
            showNotification('Product deleted successfully!');
        }
    }
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
        title: formData.get('name'),
        category: formData.get('category'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        rating: parseFloat(formData.get('rating')) || 4.0,
        image: formData.get('image')
    };
    
    const productId = e.target.dataset.productId;
    
    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id === parseInt(productId));
        if (index > -1) {
            products[index] = { ...products[index], ...productData };
            showNotification('Product updated successfully!');
        }
    } else {
        // Add new product
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        products.push({
            id: newId,
            ...productData
        });
        showNotification('Product added successfully!');
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    closeProductModalFunc();
    loadProductsTable();
    loadStats(); // Update stats
}

function closeProductModalFunc() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('show');
}

// Order Management
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderDetailsContent');
    
    if (content) {
        content.innerHTML = `
            <div class="order-details-section">
                <h4>Order Information</h4>
                <div class="order-info">
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <p><strong>Date:</strong> ${formatDate(order.date)}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
                    <p><strong>Total:</strong> ${formatCurrency(order.totals.total)}</p>
                </div>
            </div>
            
            <div class="order-details-section">
                <h4>Customer Information</h4>
                <div class="order-info">
                    <p><strong>Name:</strong> ${order.shipping.firstName} ${order.shipping.lastName}</p>
                    <p><strong>Email:</strong> ${order.shipping.email}</p>
                    <p><strong>Phone:</strong> ${order.shipping.phone}</p>
                    <p><strong>Address:</strong> ${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}</p>
                </div>
            </div>
            
            <div class="order-details-section">
                <h4>Order Items</h4>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.title}">
                            <div class="order-item-info">
                                <div class="order-item-title">${item.title}</div>
                                <div class="order-item-price">${formatCurrency(item.price)}</div>
                                <div class="order-item-quantity">Quantity: ${item.quantity}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="order-details-section">
                <h4>Order Totals</h4>
                <div class="order-info">
                    <p><strong>Subtotal:</strong> ${formatCurrency(order.totals.subtotal)}</p>
                    <p><strong>Shipping:</strong> ${formatCurrency(order.totals.shipping)}</p>
                    <p><strong>Tax:</strong> ${formatCurrency(order.totals.tax)}</p>
                    <p><strong>Total:</strong> ${formatCurrency(order.totals.total)}</p>
                </div>
            </div>
        `;
    }
    
    if (modal) modal.classList.add('show');
}

function updateOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    const currentIndex = statuses.indexOf(order.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];
    
    order.status = newStatus;
    localStorage.setItem('orders', JSON.stringify(orders));
    
    loadOrdersTable();
    loadRecentOrders();
    showNotification(`Order status updated to ${newStatus}`);
}

function closeOrderModalFunc() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.classList.remove('show');
}

// Filtering
function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    const productsTableBody = document.getElementById('productsTableBody');
    if (productsTableBody) {
        productsTableBody.innerHTML = filteredProducts.map(product => `
            <tr>
                <td><img src="${product.image}" alt="${product.title}"></td>
                <td><strong>${product.title}</strong></td>
                <td>${product.category}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.stock}</td>
                <td><span class="status-badge ${product.stock > 0 ? 'status-confirmed' : 'status-cancelled'}">${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editProduct(${product.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteProduct(${product.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function filterOrders() {
    const status = document.getElementById('orderStatusFilter').value;
    
    const filteredOrders = orders.filter(order => !status || order.status === status);
    
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (ordersTableBody) {
        ordersTableBody.innerHTML = filteredOrders.map(order => `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>${order.customer.email}</td>
                <td>${formatDate(order.date)}</td>
                <td>${order.items.length} items</td>
                <td>${formatCurrency(order.totals.total)}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewOrder('${order.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="updateOrderStatus('${order.id}')" title="Update Status">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function exportData() {
    const data = {
        products: products,
        orders: orders,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopeasy-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!');
}

// Export functions for global access
window.navigateToPage = navigateToPage;
window.showAddProductModal = showAddProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
window.closeProductModalFunc = closeProductModalFunc;
window.closeOrderModalFunc = closeOrderModalFunc;
window.exportData = exportData;

