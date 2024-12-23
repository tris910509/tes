// Deklarasi data awal
let products = [];
let categories = [];
let cart = [];
let transactions = [];

// Simpan dan ambil data dari localStorage
function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function loadData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Inisialisasi data
products = loadData('products');
categories = loadData('categories');
cart = loadData('cart');
transactions = loadData('transactions');

// Fungsi load kategori ke dropdown
function loadCategoryDropdown() {
    const categorySelect = document.getElementById('productCategory');
    categorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Fungsi load tabel produk
function loadProducts() {
    const tbody = document.getElementById('productTable').querySelector('tbody');
    tbody.innerHTML = '';
    products.forEach(product => {
        tbody.innerHTML += `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>Rp ${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>${product.category}</td>
                <td>${product.supplier}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.id}')">Hapus</button>
                </td>
            </tr>
        `;
    });
}

// Fungsi load tabel kategori
function loadCategories() {
    const tbody = document.getElementById('categoryTable').querySelector('tbody');
    tbody.innerHTML = '';
    categories.forEach(category => {
        tbody.innerHTML += `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteCategory('${category.id}')">Hapus</button>
                </td>
            </tr>
        `;
    });
    loadCategoryDropdown();
}

// Fungsi load keranjang
function loadCart() {
    const tbody = document.getElementById('cartTable').querySelector('tbody');
    tbody.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>Rp ${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>Rp ${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">Hapus</button>
                </td>
            </tr>
        `;
    });
    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

// Fungsi tambah produk
document.getElementById('productForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const id = document.getElementById('productId').value || Date.now().toString();
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const category = document.getElementById('productCategory').value;
    const supplier = document.getElementById('productSupplier').value;

    const existingProductIndex = products.findIndex(product => product.id === id);
    if (existingProductIndex > -1) {
        products[existingProductIndex] = { id, name, price, stock, category, supplier };
    } else {
        products.push({ id, name, price, stock, category, supplier });
    }

    saveData('products', products);
    loadProducts();
    event.target.reset();
    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
});

// Fungsi edit produk
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productSupplier').value = product.supplier;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('productModal')).show();
}

// Fungsi hapus produk
function deleteProduct(id) {
    products = products.filter(product => product.id !== id);
    saveData('products', products);
    loadProducts();
}

// Fungsi tambah kategori
document.getElementById('categoryForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const id = Date.now().toString();
    const name = document.getElementById('categoryName').value;

    categories.push({ id, name });
    saveData('categories', categories);
    loadCategories();
    event.target.reset();
    bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
});

// Fungsi hapus kategori
function deleteCategory(id) {
    categories = categories.filter(category => category.id !== id);
    saveData('categories', categories);
    loadCategories();
}

// Fungsi tambah ke keranjang
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product || product.stock <= 0) {
        alert('Produk tidak tersedia atau stok habis.');
        return;
    }

    const cartItem = cart.find(item => item.id === id);
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }

    product.stock--;
    saveData('products', products);
    saveData('cart', cart);
    loadProducts();
    loadCart();
}

// Fungsi hapus dari keranjang
function removeFromCart(id) {
    const cartItemIndex = cart.findIndex(item => item.id === id);
    if (cartItemIndex > -1) {
        const cartItem = cart[cartItemIndex];
        const product = products.find(p => p.id === id);
        if (product) {
            product.stock += cartItem.quantity;
        }
        cart.splice(cartItemIndex, 1);
        saveData('products', products);
        saveData('cart', cart);
        loadProducts();
        loadCart();
    }
}

// Fungsi checkout
document.getElementById('checkoutBtn').addEventListener('click', function () {
    if (cart.length === 0) {
        alert('Keranjang kosong.');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const paymentMethod = prompt('Masukkan metode pembayaran (cash, e-wallet, kartu):');
    const paidAmount = parseFloat(prompt(`Total belanja Rp ${total.toFixed(2)}.\nMasukkan jumlah pembayaran:`));

    if (isNaN(paidAmount) || paidAmount < total) {
        alert('Pembayaran tidak mencukupi.');
        return;
    }

    const change = paidAmount - total;

    // Simpan transaksi
    const transaction = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        paymentMethod,
        total,
        paidAmount,
        change,
        items: [...cart],
    };
    transactions.push(transaction);

    // Kosongkan keranjang
    cart = [];
    saveData('cart', cart);
    saveData('transactions', transactions);
    loadCart();
    alert(`Pembayaran berhasil!\nKembalian: Rp ${change.toFixed(2)}`);
});

// Load data saat halaman pertama kali dibuka
loadProducts();
loadCategories();
loadCart();
