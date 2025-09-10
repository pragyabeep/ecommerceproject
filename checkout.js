// Checkout Page Functionality
let currentStep = 1;
let orderData = {
    shipping: {},
    payment: {},
    items: [],
    totals: {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0
    }
};

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
    loadOrderSummary();
    initializeEventListeners();
    injectPayPalIfNeeded();
});

function initializeCheckout() {
    // Check if cart is empty
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }
    
    // Load cart items into order data
    orderData.items = [...cart];
    calculateTotals();
    updateOrderSummary();
}

function initializeEventListeners() {
    // Payment method change
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', togglePaymentForm);
    });
    
    // Form validation
    const shippingForm = document.getElementById('shippingForm');
    const paymentForm = document.getElementById('paymentForm');
    
    if (shippingForm) {
        shippingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateShippingForm()) {
                nextStep(2);
            }
        });
    }
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validatePaymentForm()) {
                nextStep(3);
            }
        });
    }
    
    // Real-time form validation
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// Dynamically inject PayPal SDK (no Node required) and prepare buttons container
function injectPayPalIfNeeded() {
    const existing = document.getElementById('paypal-sdk');
    if (existing) return;
    const paypalScript = document.createElement('script');
    // Use sandbox client id "sb" for testing; replace with your client id for live
    paypalScript.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD';
    paypalScript.id = 'paypal-sdk';
    paypalScript.onload = () => {
        ensurePayPalContainer();
        maybeRenderPayPalButtons();
    };
    document.head.appendChild(paypalScript);
}

function ensurePayPalContainer() {
    if (document.getElementById('paypalButtons')) return;
    const container = document.createElement('div');
    container.id = 'paypalButtons';
    container.style.display = 'none';
    container.style.marginTop = '1rem';
    const creditCardForm = document.getElementById('creditCardForm');
    if (creditCardForm && creditCardForm.parentNode) {
        creditCardForm.parentNode.insertBefore(container, creditCardForm.nextSibling);
    }
}

function maybeRenderPayPalButtons() {
    if (typeof window.paypal === 'undefined') return;
    const container = document.getElementById('paypalButtons');
    if (!container) return;
    // Avoid re-rendering duplicate buttons
    if (container.hasChildNodes()) return;
    
    window.paypal.Buttons({
        style: { layout: 'horizontal', color: 'blue', shape: 'rect', label: 'paypal' },
        createOrder: (data, actions) => {
            // Calculate amount
            calculateTotals();
            const value = orderData.totals.total.toFixed(2);
            return actions.order.create({
                purchase_units: [{
                    amount: { value },
                    description: 'ShopEasy Order'
                }]
            });
        },
        onApprove: async (data, actions) => {
            try {
                const details = await actions.order.capture();
                // Persist order locally (client-only)
                saveShippingData();
                const orderNumber = 'PP-' + (details.id || Date.now());
                const order = {
                    id: orderNumber,
                    date: new Date().toISOString(),
                    status: 'confirmed',
                    ...orderData,
                    payment: { method: 'paypal', paypalOrderId: details.id },
                    customer: currentUser || { email: orderData.shipping.email }
                };
                let orders = JSON.parse(localStorage.getItem('orders')) || [];
                orders.push(order);
                localStorage.setItem('orders', JSON.stringify(orders));
                // Clear cart
                cart = [];
                localStorage.removeItem('cart');
                updateCartCount();
                // Redirect to success
                window.location.href = 'success.html';
            } catch (e) {
                showNotification('Payment capture failed', 'error');
            }
        },
        onError: () => showNotification('PayPal error', 'error'),
        onCancel: () => {
            window.location.href = 'cancel.html';
        }
    }).render('#paypalButtons');
}

function showEmptyCart() {
    const checkoutContent = document.getElementById('checkoutContent');
    const emptyCart = document.getElementById('emptyCart');
    
    if (checkoutContent) checkoutContent.style.display = 'none';
    if (emptyCart) emptyCart.style.display = 'block';
}

function loadOrderSummary() {
    updateOrderSummary();
    updateSummarySidebar();
}

function updateOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const summaryItems = document.getElementById('summaryItems');
    
    if (orderItems) {
        orderItems.innerHTML = orderData.items.map(item => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.title}" class="order-item-image">
                <div class="order-item-info">
                    <div class="order-item-title">${item.title}</div>
                    <div class="order-item-price">$${item.price.toFixed(2)}</div>
                    <div class="order-item-quantity">Quantity: ${item.quantity}</div>
                </div>
            </div>
        `).join('');
    }
    
    if (summaryItems) {
        summaryItems.innerHTML = orderData.items.map(item => `
            <div class="summary-item">
                <img src="${item.image}" alt="${item.title}" class="summary-item-image">
                <div class="summary-item-info">
                    <div class="summary-item-title">${item.title}</div>
                    <div class="summary-item-price">$${item.price.toFixed(2)}</div>
                    <div class="summary-item-quantity">Qty: ${item.quantity}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Update totals
    updateTotals();
}

function calculateTotals() {
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    orderData.totals = {
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total
    };
}

function updateTotals() {
    const elements = {
        subtotal: document.getElementById('subtotal'),
        shipping: document.getElementById('shipping'),
        tax: document.getElementById('tax'),
        total: document.getElementById('total'),
        summarySubtotal: document.getElementById('summarySubtotal'),
        summaryShipping: document.getElementById('summaryShipping'),
        summaryTax: document.getElementById('summaryTax'),
        summaryTotal: document.getElementById('summaryTotal')
    };
    
    Object.keys(elements).forEach(key => {
        if (elements[key]) {
            elements[key].textContent = formatCurrency(orderData.totals[key.replace('summary', '').toLowerCase()]);
        }
    });
}

function updateSummarySidebar() {
    // This is handled by updateOrderSummary
}

// Step Navigation
function nextStep(step) {
    if (step === 2 && !validateShippingForm()) {
        return;
    }
    if (step === 3 && !validatePaymentForm()) {
        return;
    }
    
    // Hide current step
    const currentStepElement = document.querySelector('.checkout-step.active');
    if (currentStepElement) {
        currentStepElement.classList.remove('active');
    }
    
    // Show new step
    const newStepElement = document.getElementById(`step${step}`);
    if (newStepElement) {
        newStepElement.classList.add('active');
    }
    
    // Update step indicators
    updateStepIndicators(step);
    
    currentStep = step;
    
    // Save form data
    if (step === 2) {
        saveShippingData();
    } else if (step === 3) {
        savePaymentData();
    }
}

function previousStep(step) {
    // Hide current step
    const currentStepElement = document.querySelector('.checkout-step.active');
    if (currentStepElement) {
        currentStepElement.classList.remove('active');
    }
    
    // Show previous step
    const previousStepElement = document.getElementById(`step${step}`);
    if (previousStepElement) {
        previousStepElement.classList.add('active');
    }
    
    // Update step indicators
    updateStepIndicators(step);
    
    currentStep = step;
}

function updateStepIndicators(activeStep) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber === activeStep) {
            step.classList.add('active');
        } else if (stepNumber < activeStep) {
            step.classList.add('completed');
        }
    });
}

// Form Validation
function validateShippingForm() {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });
    
    // Email validation
    const email = document.getElementById('email');
    if (email && !isValidEmail(email.value)) {
        showFieldError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Phone validation
    const phone = document.getElementById('phone');
    if (phone && !isValidPhone(phone.value)) {
        showFieldError(phone, 'Please enter a valid phone number');
        isValid = false;
    }
    
    return isValid;
}

function validatePaymentForm() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!paymentMethod) {
        showNotification('Please select a payment method', 'error');
        return false;
    }
    
    if (paymentMethod.value === 'credit') {
        return validateCreditCardForm();
    }
    
    return true;
}

function validateCreditCardForm() {
    const requiredFields = ['cardNumber', 'expiryDate', 'cvv', 'cardName'];
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });
    
    // Card number validation
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber && !isValidCardNumber(cardNumber.value)) {
        showFieldError(cardNumber, 'Please enter a valid card number');
        isValid = false;
    }
    
    // Expiry date validation
    const expiryDate = document.getElementById('expiryDate');
    if (expiryDate && !isValidExpiryDate(expiryDate.value)) {
        showFieldError(expiryDate, 'Please enter a valid expiry date (MM/YY)');
        isValid = false;
    }
    
    // CVV validation
    const cvv = document.getElementById('cvv');
    if (cvv && !isValidCVV(cvv.value)) {
        showFieldError(cvv, 'Please enter a valid CVV');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    if (!field.value.trim()) {
        showFieldError(field, 'This field is required');
        return false;
    }
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Validation Helpers
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function isValidCardNumber(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return /^\d{13,19}$/.test(cleanNumber);
}

function isValidExpiryDate(expiryDate) {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(expiryDate)) return false;
    
    const [month, year] = expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    
    return expiry > now;
}

function isValidCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
}

// Payment Form Toggle
function togglePaymentForm() {
    const creditCardForm = document.getElementById('creditCardForm');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    
    const paypalButtons = document.getElementById('paypalButtons') || (ensurePayPalContainer(), document.getElementById('paypalButtons'));
    if (creditCardForm) {
        const isCard = paymentMethod && paymentMethod.value === 'credit';
        creditCardForm.style.display = isCard ? 'block' : 'none';
    }
    if (paypalButtons) {
        const isPayPal = paymentMethod && paymentMethod.value === 'paypal';
        paypalButtons.style.display = isPayPal ? 'block' : 'none';
        if (isPayPal) {
            maybeRenderPayPalButtons();
        }
    }
}

// Data Saving
function saveShippingData() {
    const form = document.getElementById('shippingForm');
    if (form) {
        const formData = new FormData(form);
        orderData.shipping = Object.fromEntries(formData.entries());
    }
}

function savePaymentData() {
    const form = document.getElementById('paymentForm');
    if (form) {
        const formData = new FormData(form);
        orderData.payment = Object.fromEntries(formData.entries());
    }
}

// Place Order
function placeOrder() {
    if (!validateShippingForm()) return;
    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (method === 'paypal') {
        // Ask user to use PayPal button
        showNotification('Click the PayPal button to complete payment');
        // Ensure buttons are visible and rendered
        togglePaymentForm();
        return;
    }
    // Fallback: simulate card payment locally (no backend)
    saveShippingData();
    const orderNumber = 'ORD-' + Date.now();
    const order = {
        id: orderNumber,
        date: new Date().toISOString(),
        status: 'confirmed',
        ...orderData,
        payment: { method: 'card' },
        customer: currentUser || { email: orderData.shipping.email }
    };
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    cart = [];
    localStorage.removeItem('cart');
    updateCartCount();
    window.location.href = 'success.html';
}

function showSuccessModal(orderNumber, total) {
    const modal = document.getElementById('successModal');
    const orderNumberSpan = document.getElementById('orderNumber');
    const orderTotalSpan = document.getElementById('orderTotal');
    
    if (orderNumberSpan) orderNumberSpan.textContent = orderNumber;
    if (orderTotalSpan) orderTotalSpan.textContent = formatCurrency(total);
    if (modal) modal.classList.add('show');
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Auto-format inputs
document.addEventListener('DOMContentLoaded', function() {
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV formatting
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }
    
    // Phone formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 6) {
                value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6, 10);
            } else if (value.length >= 3) {
                value = value.substring(0, 3) + '-' + value.substring(3);
            }
            e.target.value = value;
        });
    }
});

// Export functions for global access
window.nextStep = nextStep;
window.previousStep = previousStep;
window.placeOrder = placeOrder;
