const STORAGE_KEY_USERS = 'pos-users';
const STORAGE_KEY_PRODUCTS = 'pos-products';
const STORAGE_KEY_TRANSACTIONS = 'pos-transactions';

// Load data from localStorage
let users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
let products = JSON.parse(localStorage.getItem(STORAGE_KEY_PRODUCTS)) || [];
let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TRANSACTIONS)) || [];

// Initialize App
function init() {
    loadProducts();
    loadTransactions();
    loadReports();
    loadUsers();

    document.getElementById('nav-products').addEventListener('click', loadProducts);
    document.getElementById('nav-transactions').addEventListener('click', loadTransactions);
    document.getElementById('nav-reports').addEventListener('click', loadReports);
    document.getElementById('nav-users').addEventListener('click', loadUsers);

    // Other event listeners...
}

// Load Users Section
function loadUsers() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h3>Manage Users</h3>
        <form id="user-form">
            <div class="form-group">
                <label for="user-name">Name</label>
                <input type="text" id="user-name" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="user-email">Email</label>
                <input type="email" id="user-email" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="user-password">Password</label>
                <input type="password" id="user-password" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="user-role">Role</label>
                <select id="user-role" class="form-control" required>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Add User</button>
        </form>
        <h4>User List</h4>
        <ul id="user-list" class="list-group mt-3"></ul>
    `;

    displayUsers();

    document.getElementById('user-form').addEventListener('submit', addUser);
}

// Display Users
function displayUsers() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    users.forEach((user, index) => {
        userList.innerHTML += `
            <li class="list-group-item">
                ${user.name} - ${user.email} - Role: ${user.role}
                <button class="btn btn-danger btn-sm float-right" onclick="deleteUser(${index})">Delete</button>
            </li>
        `;
    });
}

// Add User
function addUser(e) {
    e.preventDefault();

    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value.trim();
    const role = document.getElementById('user-role').value.trim();

    if (name && email && password) {
        const newUser = { id: Date.now(), name, email, password, role };
        users.push(newUser);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

        displayUsers();
        e.target.reset();
    }
}

// Delete User
function deleteUser(index) {
    users.splice(index, 1);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    displayUsers();
}

// Load Products Section
function loadProducts() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h3>Manage Products</h3>
        <form id="product-form">
            <div class="form-group">
                <label for="product-name">Product Name</label>
                <input type="text" id="product-name" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="product-price">Price</label>
                <input type="number" id="product-price" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary">Add Product</button>
        </form>
        <h4>Product List</h4>
        <ul id="product-list" class="list-group mt-3"></ul>
    `;

    displayProducts();

    document.getElementById('product-form').addEventListener('submit', addProduct);
}

// Display Products
function displayProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    products.forEach((product, index) => {
        productList.innerHTML += `
            <li class="list-group-item">
                ${product.name} - $${product.price.toFixed(2)}
                <button class="btn btn-danger btn-sm float-right" onclick="deleteProduct(${index})">Delete</button>
            </li>
        `;
    });
}

// Add Product
function addProduct(e) {
    e.preventDefault();

    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);

    if (name && !isNaN(price)) {
        const newProduct = { id: Date.now(), name, price };
        products.push(newProduct);
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));

        displayProducts();
        e.target.reset();
    }
}

// Delete Product
function deleteProduct(index) {
    products.splice(index, 1);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    displayProducts();
}

// Load Transactions Section
function loadTransactions() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h3>Manage Transactions</h3>
        <form id="transaction-form">
            <div class="form-group">
                <label for="transaction-product">Product</label>
                <select id="transaction-product" class="form-control" required>
                    <option value="" disabled selected>Select Product</option>
                    ${products.map((product, index) => `<option value="${index}">${product.name} - $${product.price}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="transaction-quantity">Quantity</label>
                <input type="number" id="transaction-quantity" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary">Add Transaction</button>
        </form>
        <h4>Transaction List</h4>
        <ul id="transaction-list" class="list-group mt-3"></ul>
    `;

    displayTransactions();

    document.getElementById('transaction-form').addEventListener('submit', addTransaction);
}

// Display Transactions
function displayTransactions() {
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';

    transactions.forEach((transaction, index) => {
        const product = products[transaction.productIndex];
        transactionList.innerHTML += `
            <li class="list-group-item">
                ${product.name} - Quantity: ${transaction.quantity} - Total: $${(product.price * transaction.quantity).toFixed(2)}
                <button class="btn btn-danger btn-sm float-right" onclick="deleteTransaction(${index})">Delete</button>
            </li>
        `;
    });
}

// Add Transaction
function addTransaction(e) {
    e.preventDefault();

    const productIndex = parseInt(document.getElementById('transaction-product').value);
    const quantity = parseInt(document.getElementById('transaction-quantity').value);

    if (productIndex !== -1 && quantity > 0) {
        const newTransaction = { productIndex, quantity, timestamp: new Date() };
        transactions.push(newTransaction);
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));

        displayTransactions();
        e.target.reset();
    }
}

// Delete Transaction
function deleteTransaction(index) {
    transactions.splice(index, 1);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    displayTransactions();
}

// Load Reports Section
function loadReports() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h3>Reports</h3>
        <form id="report-form">
            <div class="form-group">
                <label for="report-type">Select Report Type</label>
                <select id="report-type" class="form-control" required>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Generate Report</button>
        </form>
        <div id="report-output" class="mt-3"></div>
    `;

    document.getElementById('report-form').addEventListener('submit', generateReport);
}

// Generate Reports
function generateReport(e) {
    e.preventDefault();

    const reportType = document.getElementById('report-type').value;
    const reportOutput = document.getElementById('report-output');

    let filteredTransactions;

    const today = new Date();
    if (reportType === 'daily') {
        filteredTransactions = transactions.filter(transaction => {
            const date = new Date(transaction.timestamp);
            return date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
        });
    } else if (reportType === 'monthly') {
        filteredTransactions = transactions.filter(transaction => {
            const date = new Date(transaction.timestamp);
            return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        });
    } else if (reportType === 'annual') {
        filteredTransactions = transactions.filter(transaction => {
            const date = new Date(transaction.timestamp);
            return date.getFullYear() === today.getFullYear();
        });
    }

    const totalRevenue = filteredTransactions.reduce((total, transaction) => {
        const product = products[transaction.productIndex];
        return total + (product.price * transaction.quantity);
    }, 0);

    reportOutput.innerHTML = `
        <h4>Total Revenue: $${totalRevenue.toFixed(2)}</h4>
        <ul class="list-group">
            ${filteredTransactions.map(transaction => {
                const product = products[transaction.productIndex];
                return `<li class="list-group-item">${product.name} - Quantity: ${transaction.quantity} - Total: $${(product.price * transaction.quantity).toFixed(2)}</li>`;
            }).join('')}
        </ul>
    `;
}
