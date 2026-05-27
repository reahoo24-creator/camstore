// --- DOM ELEMENTS ---
const themeToggle = document.getElementById('theme-toggle');
const cartBtn = document.getElementById('cart-btn');
const closeCart = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const checkoutBtn = document.getElementById('checkout-btn');
const paymentModal = document.getElementById('payment-modal');
const closeModal = document.getElementById('close-modal');
const paymentForm = document.getElementById('payment-form');
const paySubmitBtn = document.getElementById('pay-submit-btn');
const paymentSuccess = document.getElementById('payment-success');

const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');

let cart = [];

// --- DARK / LIGHT MODE ---
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// --- CART OPEN/CLOSE ---
cartBtn.addEventListener('click', () => cartSidebar.classList.add('active'));
closeCart.addEventListener('click', () => cartSidebar.classList.remove('active'));

// --- ADMIN MENU OPEN/CLOSE (បន្ថែមថ្មី) ---
const adminMenuBtn = document.getElementById('admin-menu-btn');
const closeAdmin = document.getElementById('close-admin');
const adminSidebar = document.getElementById('admin-sidebar');

adminMenuBtn.addEventListener('click', () => adminSidebar.classList.add('active'));
closeAdmin.addEventListener('click', () => adminSidebar.classList.remove('active'));

// --- CART FUNCTIONALITY ---
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;

    if(cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-msg">Your cart is empty.</p>`;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <small>${item.quantity}x - $${(item.price * item.quantity).toFixed(2)}</small>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.innerText = totalPrice.toFixed(2);
}

window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

// --- CHECKOUT & MODAL SYSTEM ---
checkoutBtn.addEventListener('click', () => {
    if(cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    cartSidebar.classList.remove('active');
    paymentModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
    paymentModal.classList.remove('active');
    paymentForm.classList.remove('hidden');
    paymentSuccess.classList.add('hidden');
});

// --- SCROLL ANIMATION DETECTOR ---
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('appear');
        }
    });
}, observerOptions);


// ==========================================
// --- DATABASE SYSTEM (LOCALSTORAGE) ---
// ==========================================

const defaultProducts = [
    { id: "1", name: "AeroSound Max", price: 299.00, stock: 50, imgUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" },
    { id: "2", name: "CyberClick Pro", price: 159.00, stock: 30, imgUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80" },
    { id: "3", name: "Chronos Minimalist", price: 199.00, stock: 20, imgUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80" }
];

function getDatabase() {
    const data = localStorage.getItem('techvault_db');
    return data ? JSON.parse(data) : defaultProducts;
}

function saveDatabase(data) {
    localStorage.setItem('techvault_db', JSON.stringify(data));
}

let productsDB = getDatabase();

const addProductForm = document.getElementById('add-product-form');
const productGrid = document.querySelector('.product-grid');
const stockTableBody = document.getElementById('stock-table-body');

// 🔄 មុខងារបង្ហាញ UI (ដែលអ្នកបានសួរ) គឺស្ថិតនៅត្រង់ផ្នែកនេះដដែល
function renderUI() {
    productGrid.innerHTML = '';
    stockTableBody.innerHTML = '';

    productsDB.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card scroll-animate'; 
        card.setAttribute('data-id', product.id);
        
        card.innerHTML = `
            <button class="card-delete-btn" onclick="deleteProduct('${product.id}')" title="Delete Product"><i class="fas fa-trash"></i></button>
            <div class="product-img"><img src="${product.imgUrl}" alt="${product.name}"></div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
                <button class="btn add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
            </div>
        `;
        
        const cartBtn = card.querySelector('.add-to-cart');
        cartBtn.addEventListener('click', () => {
            if (product.stock <= 0) { alert("Sorry, out of stock!"); return; }
            addToCart(product.id, product.name, parseFloat(product.price));
            cartBtn.innerText = "Added ✓";
            cartBtn.style.backgroundColor = "#10b981";
            setTimeout(() => { cartBtn.innerText = "Add to Cart"; cartBtn.style.backgroundColor = ""; }, 1000);
        });

        productGrid.appendChild(card);
        
        if (typeof observer !== 'undefined') {
            observer.observe(card);
        }

        const row = document.createElement('tr');
        row.setAttribute('data-id', product.id);
        row.innerHTML = `
            <td class="p-name">${product.name}</td>
            <td class="p-price">$${parseFloat(product.price).toFixed(2)}</td>
            <td class="stock-count">${product.stock === 0 ? `<span class="out-of-stock">Out of Stock</span>` : product.stock}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-edit" onclick="openEditModal('${product.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-delete" onclick="deleteProduct('${product.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        stockTableBody.appendChild(row);
    });
}

// ដំណើរការបង្ហាញទិន្នន័យដំបូង
renderUI();

// --- មុខងារ៖ បន្ថែមទំនិញថ្មី ---
addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('new-p-name').value;
    const price = parseFloat(document.getElementById('new-p-price').value);
    const imgUrl = document.getElementById('new-p-img').value;
    const stockQty = parseInt(document.getElementById('new-p-stock').value);
    const id = Date.now().toString(); 

    productsDB.push({ id, name, price, stock: stockQty, imgUrl });
    
    saveDatabase(productsDB);
    renderUI();

    addProductForm.reset();
    alert(`បានបន្ថែមទំនិញ "${name}" រួចរាល់!`);
});

// --- មុខងារ៖ EDIT PRODUCT & STOCK ---
const editModal = document.getElementById('edit-modal');
const closeEditModalBtn = document.getElementById('close-edit-modal');
const editProductForm = document.getElementById('edit-product-form');

window.openEditModal = function(id) {
    const product = productsDB.find(p => p.id === id);
    if (!product) return;

    document.getElementById('edit-p-id').value = product.id;
    document.getElementById('edit-p-name').value = product.name;
    document.getElementById('edit-p-price').value = product.price;
    document.getElementById('edit-p-stock').value = product.stock;

    editModal.classList.add('active');
}

closeEditModalBtn.addEventListener('click', () => editModal.classList.remove('active'));

editProductForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-p-id').value;
    const newName = document.getElementById('edit-p-name').value;
    const newPrice = parseFloat(document.getElementById('edit-p-price').value);
    const newStock = parseInt(document.getElementById('edit-p-stock').value);

    productsDB = productsDB.map(product => {
        if (product.id === id) {
            return { ...product, name: newName, price: newPrice, stock: newStock };
        }
        return product;
    });

    saveDatabase(productsDB);
    renderUI();
    editModal.classList.remove('active');
    alert("បានកែប្រែទិន្នន័យជោគជ័យ!");
});

// --- មុខងារ៖ លុបទំនិញ (DELETE) ---
window.deleteProduct = function(id) {
    const product = productsDB.find(p => p.id === id);
    if (!product) return;

    if (confirm(`តើអ្នកប្រាកដជាចង់លុបទំនិញ "${product.name}" មែនទេ?`)) {
        productsDB = productsDB.filter(p => p.id !== id);
        saveDatabase(productsDB);
        renderUI();
        removeFromCart(id); 
    }
}

// --- មុខងារកាត់ស្តុកអូតូពេលបង់ប្រាក់ ---
paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    paySubmitBtn.innerText = "Processing...";
    paySubmitBtn.disabled = true;

    setTimeout(() => {
        cart.forEach(cartItem => {
            productsDB = productsDB.map(product => {
                if (product.id === cartItem.id) {
                    let updatedStock = product.stock - cartItem.quantity;
                    return { ...product, stock: updatedStock < 0 ? 0 : updatedStock };
                }
                return product;
            });
        });

        saveDatabase(productsDB);
        renderUI();

        paymentForm.classList.add('hidden');
        paymentSuccess.classList.remove('hidden');
        cart = [];
        updateCartUI();
        paymentForm.reset();
        paySubmitBtn.innerText = "Pay Now";
        paySubmitBtn.disabled = false;
    }, 2000);
});

