// Global Variables
let products = JSON.parse(sessionStorage.getItem('products')) || [];
let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
let transactions = JSON.parse(sessionStorage.getItem('transactions')) || [];
let currentUserRole = 'admin'; // Default role

// Utility Functions
function saveProducts(data) {
    products = data;
    sessionStorage.setItem('products', JSON.stringify(products));
}

function saveCart(data) {
    cart = data;
    sessionStorage.setItem('cart', JSON.stringify(cart));
}

function saveTransactions(data) {
    transactions = data;
    sessionStorage.setItem('transactions', JSON.stringify(transactions));
}

// Role Management
document.getElementById('userRole').addEventListener('change', function () {
    currentUserRole = this.value;
    loadProducts();
});

// Load Products
function loadProducts() {
    const tbody = document.getElementById('productTable');
    tbody.innerHTML = '';
    products.forEach((product, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>${product.category}</td>
                <td>${product.supplier}</td>
                <td>
                    ${(currentUserRole === 'admin' || currentUserRole === 'supervisor') ? `<button class="btn btn-info btn-sm" onclick="editProduct(${index})">Edit</button>` : ''}
                    ${currentUserRole === 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteProduct(${index})">Delete</button>` : ''}
                </td>
            </tr>
        `;
    });

    document.getElementById('addProductBtn').style.display = currentUserRole === 'admin' || currentUserRole === 'supervisor' ? 'block' : 'none';
}

// Add or Edit Product
document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value, 10);
    const category = document.getElementById('productCategory').value;
    const supplier = document.getElementById('productSupplier').value;

    if (id) {
        // Edit Product
        const index = products.findIndex(p => p.id == id);
        products[index] = { id, name, price, stock, category, supplier };
    } else {
        // Add Product
        products.push({ id: Date.now(), name, price, stock, category, supplier });
    }
    saveProducts(products);
    loadProducts();
    document.getElementById('productForm').reset();
    const productModal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    productModal.hide();
});

// Edit Product
function editProduct(index) {
    const product = products[index];
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productSupplier').value = product.supplier;
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    productModal.show();
}

// Delete Product
function deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        products.splice(index, 1);
        saveProducts(products);
        loadProducts();
    }
}

// Load Cart
function loadCart() {
    const tbody = document.getElementById('cartTable');
    tbody.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>${subtotal.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Remove</button></td>
            </tr>
        `;
    });

    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

// Add to Cart
function addToCart(productIndex) {
    const product = products[productIndex];
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }
    saveCart(cart);
    loadCart();
}

// Remove from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart(cart);
    loadCart();
}

// Checkout
document.getElementById('checkoutBtn').addEventListener('click', function () {
    if (cart.length === 0) {
        alert('Cart is empty.');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const transaction = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        amount: total,
        paymentMethod: 'cash',
    };

    transactions.push(transaction);
    saveTransactions(transactions);
    cart = [];
    saveCart(cart);
    loadCart();
    loadTransactions();
    alert('Checkout successful!');
});

// Load Transactions
function loadTransactions() {
    const tbody = document.getElementById('transactionTable');
    tbody.innerHTML = '';
    transactions.forEach(transaction => {
        tbody.innerHTML += `
            <tr>
                <td>${transaction.id}</td>
                <td>${transaction.date}</td>
                <td>${transaction.amount.toFixed(2)}</td>
                <td>${transaction.paymentMethod}</td>
            </tr>
        `;
    });
}

// Backup and Restore
document.getElementById('backupBtn').addEventListener('click', function () {
    const data = { products, transactions };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'backup.json';
    link.click();
});

document.getElementById('restoreBtn').addEventListener('click', function () {
    const fileInput = document.getElementById('restoreInput');
    if (fileInput.files.length === 0) {
        alert('Please select a backup file.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            products = data.products || [];
            transactions = data.transactions || [];
            saveProducts(products);
            saveTransactions(transactions);
            loadProducts();
            loadTransactions();
            alert('Data restored successfully.');
        } catch (error) {
            alert('Failed to restore data. Invalid file format.');
        }
    };
    reader.readAsText(file);
});

// Initial Load
document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
    loadCart();
    loadTransactions();
});
