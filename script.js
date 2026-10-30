// Initial Mock Inventory Data
let inventory = JSON.parse(localStorage.getItem('smartmart_inventory')) || [
    { id: 1, name: 'Basmati Rice 5kg', category: 'Groceries', price: 450.00, stock: 25 },
    { id: 2, name: 'Sunflower Oil 1L', category: 'Groceries', price: 130.00, stock: 40 },
    { id: 3, name: 'Whole Wheat Atta 5kg', category: 'Groceries', price: 220.00, stock: 30 },
    { id: 4, name: 'Toothpaste 150g', category: 'Personal Care', price: 95.00, stock: 50 },
    { id: 5, name: 'Bath Soap 3-Pack', category: 'Personal Care', price: 120.00, stock: 60 },
    { id: 6, name: 'Tea Powder 500g', category: 'Beverages', price: 210.00, stock: 20 }
];

let cart = [];
let salesHistory = JSON.parse(localStorage.getItem('smartmart_sales')) || [];

// Switch Tabs Navigation
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${tabId}-tab`).classList.add('active');
    event.currentTarget.classList.add('active');

    if (tabId === 'inventory') renderInventoryTable();
    if (tabId === 'sales') renderSalesHistory();
}

// Initialize Application Display
function init() {
    renderProductGrid();
    renderCart();
    renderInventoryTable();
    renderSalesHistory();
}

// Render Products Grid for POS
function renderProductGrid(items = inventory) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    items.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => addToCart(prod.id);
        card.innerHTML = `
            <h4>${prod.name}</h4>
            <p>₹${prod.price.toFixed(2)}</p>
            <p style="font-size:0.75rem; color:${prod.stock > 0 ? '#16a34a' : '#dc2626'}">Stock: ${prod.stock}</p>
        `;
        grid.appendChild(card);
    });
}

// Filter Products in POS search
function filterProducts() {
    const query = document.getElementById('search-product').value.toLowerCase();
    const filtered = inventory.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    renderProductGrid(filtered);
}

// Add Item to Cart
function addToCart(productId) {
    const product = inventory.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
        alert('Product out of stock!');
        return;
    }

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        if (cartItem.qty < product.stock) {
            cartItem.qty++;
        } else {
            alert('Cannot add more than available stock.');
        }
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    }
    renderCart();
}

// Render Cart Table
function renderCart() {
    const tbody = document.getElementById('cart-body');
    tbody.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        let total = item.price * item.qty;
        subtotal += total;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>${item.qty}</td>
            <td>₹${total.toFixed(2)}</td>
            <td><button class="btn-danger" onclick="removeFromCart(${index})">X</button></td>
        `;
        tbody.appendChild(row);
    });

    let tax = subtotal * 0.05; // 5% tax
    let grandTotal = subtotal + tax;

    document.getElementById('subtotal').innerText = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax').innerText = `₹${tax.toFixed(2)}`;
    document.getElementById('grand-total').innerText = `₹${grandTotal.toFixed(2)}`;
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

// Complete Checkout Process
function checkout() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }

    // Deduct stock
    cart.forEach(cartItem => {
        const prod = inventory.find(p => p.id === cartItem.id);
        if (prod) prod.stock -= cartItem.qty;
    });

    // Save sale
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const grandTotal = subtotal * 1.05;
    
    const saleRecord = {
        invoiceId: 'INV-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString(),
        itemsCount: cart.reduce((sum, item) => sum + item.qty, 0),
        totalAmount: grandTotal
    };

    salesHistory.push(saleRecord);
    
    // Save to LocalStorage
    localStorage.setItem('smartmart_inventory', JSON.stringify(inventory));
    localStorage.setItem('smartmart_sales', JSON.stringify(salesHistory));

    alert(`Checkout Successful! Grand Total: ₹${grandTotal.toFixed(2)}`);
    
    // Reset Cart
    cart = [];
    renderCart();
    renderProductGrid();
}

// Add New Product to Inventory
function addProduct(event) {
    event.preventDefault();
    const name = document.getElementById('prod-name').value;
    const category = document.getElementById('prod-category').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const stock = parseInt(document.getElementById('prod-stock').value);

    const newProduct = {
        id: inventory.length ? inventory[inventory.length - 1].id + 1 : 1,
        name,
        category,
        price,
        stock
    };

    inventory.push(newProduct);
    localStorage.setItem('smartmart_inventory', JSON.stringify(inventory));
    
    document.getElementById('product-form').reset();
    renderInventoryTable();
    renderProductGrid();
    alert('Product added successfully!');
}

// Render Inventory Management Table
function renderInventoryTable() {
    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = '';
    inventory.forEach(prod => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${prod.id}</td>
            <td>${prod.name}</td>
            <td>${prod.category}</td>
            <td>₹${prod.price.toFixed(2)}</td>
            <td>${prod.stock}</td>
            <td><button class="btn-danger" onclick="deleteProduct(${prod.id})">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Delete Product from Inventory
function deleteProduct(id) {
    inventory = inventory.filter(p => p.id !== id);
    localStorage.setItem('smartmart_inventory', JSON.stringify(inventory));
    renderInventoryTable();
    renderProductGrid();
}

// Render Sales History Table
function renderSalesHistory() {
    const tbody = document.getElementById('sales-body');
    tbody.innerHTML = '';
    salesHistory.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.invoiceId}</td>
            <td>${sale.date}</td>
            <td>${sale.itemsCount}</td>
            <td>₹${sale.totalAmount.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Run init on load
window.onload = init;