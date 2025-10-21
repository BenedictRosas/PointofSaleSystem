// Base URLs for the API endpoints (match your controllers)
const INVENTORY_API = '/products';
const POS_API = '/Point_Of_Sale';

// State Variables
let currentCart = [];
let currentTotal = 0.0;
let editProductId = null;

// DOM Elements
const inventoryView = document.getElementById('inventory-view');
const posView = document.getElementById('pos-view');
const viewInventoryBtn = document.getElementById('view-inventory-btn');
const viewPosBtn = document.getElementById('view-pos-btn');

const productListContainer = document.getElementById('product-list-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const refreshBtn = document.getElementById('refresh-btn');

const modalContainer = document.getElementById('modal-container');
const cartList = document.getElementById('cart-list');
const cartTotalAmount = document.getElementById('cart-total-amount');

// Utility
function showModalMessage(message, type) {
    let messageBox = document.querySelector('#modal-container .message-box');
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.className = 'message-box';
        // attach inside existing modal content if available
        const modalContent = document.querySelector('#modal-container .modal-content');
        if (modalContent) modalContent.appendChild(messageBox);
        else modalContainer.appendChild(messageBox);
    }
    messageBox.className = 'message-box ' + type;
    messageBox.textContent = message;
    messageBox.style.display = 'block';
    setTimeout(() => { messageBox.style.display = 'none'; }, 3000);
}

function switchView(viewId) {
    if (viewId === 'inventory-view') {
        inventoryView.classList.add('active');
        posView.classList.remove('active');
        viewInventoryBtn.classList.add('active-view');
        viewPosBtn.classList.remove('active-view');
        fetchProducts();
    } else {
        inventoryView.classList.remove('active');
        posView.classList.add('active');
        viewInventoryBtn.classList.remove('active-view');
        viewPosBtn.classList.add('active-view');
    }
}

// Fetch products (optionally with search)
async function fetchProducts(searchTerm = '') {
    let url = INVENTORY_API;
    if (searchTerm) url += `?search=${encodeURIComponent(searchTerm)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const products = await res.json();
        renderProductTable(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        productListContainer.innerHTML = `<p class="error-message">Error loading products. Check backend connectivity (open browser console & network tab).</p>`;
    }
}

function renderProductTable(products) {
    try {
        if (!Array.isArray(products) || products.length === 0) {
            productListContainer.innerHTML = '<p style="padding:20px">No products found.</p>';
            return;
        }

        let html = `
        <table id="product-table">
            <thead>
                <tr>
                    <th>ID</th><th>Name</th><th>Price</th><th>Qty</th><th>Details</th><th>Type</th><th>Actions</th>
                </tr>
            </thead>
            <tbody>
        `;

        products.forEach(p => {
            const idStr = String(p.id ?? '');
            const displayId = idStr.length > 8 ? `${idStr.slice(0,8)}...` : idStr;
            const priceNum = Number(p.price) || 0;
            const quantity = (p.quantity !== undefined && p.quantity !== null) ? p.quantity : 0;
            const isPerishable = p.expiryDate !== undefined && p.expiryDate !== null && p.expiryDate !== '';
            const type = isPerishable ? 'Perishable' : 'Standard';
            const details = isPerishable ? `Expires: ${p.expiryDate}` : 'N/A';

            html += `
            <tr>
                <td>${displayId}</td>
                <td>${p.name ?? ''}</td>
                <td>$${priceNum.toFixed(2)}</td>
                <td>${quantity}</td>
                <td>${details}</td>
                <td>${type}</td>
                <td>
                    <button class="btn-danger btn-delete" data-id="${idStr}">Delete</button>
                    <button class="btn-secondary btn-update"
                        data-id="${idStr}"
                        data-name="${p.name ?? ''}"
                        data-price="${priceNum}"
                        data-quantity="${quantity}"
                        data-expiry="${p.expiryDate ?? ''}"
                        data-type="${type}">Update</button>
                </td>
            </tr>
            `;
        });

        html += `</tbody></table>`;
        productListContainer.innerHTML = html;
    } catch (err) {
        console.error('renderProductTable error:', err);
        productListContainer.innerHTML = '<p class="error-message">Error rendering products. See console.</p>';
    }
}

// Delete product
async function deleteProduct(id) {
    const short = String(id).slice(0,8);
    if (!window.confirm(`Are you sure you want to delete product ID: ${short}...?`)) return;

    try {
        const res = await fetch(`${INVENTORY_API}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showModalMessage('Product deleted successfully!', 'success');
            fetchProducts();
        } else {
            const text = await res.text();
            showModalMessage(`Failed to delete: ${text}`, 'error');
        }
    } catch (err) {
        console.error('deleteProduct error:', err);
        showModalMessage('Error deleting product. See console.', 'error');
    }
}

// Add product (works for both standard and perishable forms)
async function handleAddProduct(e) {
    e.preventDefault();
    const form = e.target;
    const isPerishable = form.id === 'add-perishable-form';

    const name = (form.elements.name && form.elements.name.value) ? form.elements.name.value.trim() : '';
    const price = parseFloat(form.elements.price ? form.elements.price.value : 0) || 0;
    // If quantity exists in form use it; otherwise default 0
    const quantity = form.elements.quantity ? parseInt(form.elements.quantity.value) || 0 : 0;

    if (!name) {
        showModalMessage('Name is required.', 'error');
        return;
    }

    const productData = { name, price, quantity };

    if (isPerishable) {
        const expiry = form.elements.expiryDate ? form.elements.expiryDate.value : '';
        if (!expiry) {
            showModalMessage('Expiry date required for perishable.', 'error');
            return;
        }
        productData.expiryDate = expiry;
    }

    const endpoint = isPerishable ? `${INVENTORY_API}/add-perishable` : `${INVENTORY_API}/add`;

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        if (res.ok) {
            showModalMessage('Product added successfully!', 'success');
            form.reset();
            fetchProducts();
        } else {
            const txt = await res.text();
            showModalMessage(`Failed to add product: ${txt}`, 'error');
        }
    } catch (err) {
        console.error('handleAddProduct error:', err);
        showModalMessage('Error adding product. See console.', 'error');
    }
}

// Update product
async function handleUpdateProduct(e) {
    e.preventDefault();
    if (!editProductId) return;

    const form = e.target;
    const name = (form.elements.name && form.elements.name.value) ? form.elements.name.value.trim() : '';
    const price = parseFloat(form.elements.price ? form.elements.price.value : 0) || 0;
    const quantity = form.elements.quantity ? parseInt(form.elements.quantity.value) || 0 : 0;

    const payload = { name, price, quantity };
    if (form.elements.expiryDate) payload.expiryDate = form.elements.expiryDate.value;

    try {
        const res = await fetch(`${INVENTORY_API}/${editProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showModalMessage('Product updated successfully!', 'success');
            setTimeout(closeModal, 400);
            fetchProducts();
        } else {
            const txt = await res.text();
            showModalMessage(`Failed to update: ${txt}`, 'error');
        }
    } catch (err) {
        console.error('handleUpdateProduct error:', err);
        showModalMessage('Error updating product. See console.', 'error');
    }
}

// Modal helpers (keeps your dynamic modal behavior)
function openModal(type, data = {}) {
    let title = '';
    let formId = '';
    let extra = '';
    let submitHandler = '';
    let quantityField = '';

    editProductId = null;

    if (type === 'standard') {
        title = 'Add New Standard Product';
        formId = 'add-standard-form-dynamic';
        submitHandler = 'handleAddProduct(event)';
        quantityField = `
            <label for="quantity">Quantity:</label>
            <input type="number" id="quantity" name="quantity" min="0" required value="0">
        `;
    } else if (type === 'perishable') {
        title = 'Add New Perishable Product';
        formId = 'add-perishable-form-dynamic';
        submitHandler = 'handleAddProduct(event)';
        extra = `
            <label for="expiryDate">Expiry Date:</label>
            <input type="date" id="expiryDate" name="expiryDate" required value="${data.expiryDate || ''}">
        `;
        quantityField = `
            <label for="quantity">Quantity:</label>
            <input type="number" id="quantity" name="quantity" min="0" required value="0">
        `;
    } else if (type === 'update') {
        title = `Update Product: ${data.name || ''}`;
        formId = 'update-product-form';
        editProductId = data.id;
        quantityField = `
            <label for="quantity">Quantity:</label>
            <input type="number" id="quantity" name="quantity" min="0" required value="${data.quantity || 0}">
        `;
        if (data.type === 'Perishable') {
            extra = `
                <label for="expiryDate">Expiry Date:</label>
                <input type="date" id="expiryDate" name="expiryDate" required value="${data.expiry || ''}">
            `;
        }
        submitHandler = 'handleUpdateProduct(event)';
    } else return;

    const html = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h3>${title}</h3>
        <form id="${formId}" onsubmit="${submitHandler}">
          <label for="name">Name:</label>
          <input type="text" id="name" name="name" required value="${data.name || ''}">
          <label for="price">Price ($):</label>
          <input type="number" id="price" name="price" step="0.01" min="0" required value="${data.price || ''}">
          ${quantityField}
          ${extra}
          <button type="submit" class="btn-primary">${type === 'update' ? 'Save Changes' : 'Add Product'}</button>
        </form>
        <div class="message-box"></div>
      </div>
    `;
    modalContainer.innerHTML = html;
    modalContainer.style.display = 'flex';
    const closeBtn = modalContainer.querySelector('.close-btn');
    if (closeBtn) closeBtn.onclick = closeModal;

    // Attach listeners for dynamic form if needed
    const dynForm = document.getElementById(formId);
    if (dynForm) {
        if (formId.includes('add')) dynForm.addEventListener('submit', handleAddProduct);
        else dynForm.addEventListener('submit', handleUpdateProduct);
    }
}

function closeModal() {
    modalContainer.style.display = 'none';
    modalContainer.innerHTML = '';
    editProductId = null;
}

// POS/cart functions
function updateCartDisplay() {
    cartList.innerHTML = '';
    if (currentCart.length === 0) {
        cartList.innerHTML = '<li><span class="placeholder-text">Cart is empty.</span></li>';
        cartTotalAmount.textContent = '$0.00';
        const amt = document.getElementById('amount-paid');
        if (amt) amt.value = '0.00';
        return;
    }
    currentCart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.quantity} x ${item.name}</span><span>$${(item.price * item.quantity).toFixed(2)}</span>`;
        cartList.appendChild(li);
    });
    currentTotal = currentCart.reduce((s,i)=> s + (i.price * i.quantity), 0);
    cartTotalAmount.textContent = `$${currentTotal.toFixed(2)}`;
    const amt = document.getElementById('amount-paid');
    if (amt) amt.value = currentTotal.toFixed(2);
}

async function handleAddToCart(e) {
    e.preventDefault();
    const productIdInput = document.getElementById('pos-product-id');
    const quantityInput = document.getElementById('pos-quantity');
    const productId = productIdInput.value.trim();
    const quantity = parseInt(quantityInput.value);

    if (!productId || quantity <= 0 || isNaN(quantity)) {
        alert('Please enter a valid Product ID and Quantity.');
        return;
    }

    // Use search endpoint to find product (no /products/{id} endpoint)
    try {
        const searchRes = await fetch(`${INVENTORY_API}?search=${encodeURIComponent(productId)}`);
        if (!searchRes.ok) throw new Error('Search failed');
        const products = await searchRes.json();
        // try to match by id or name
        const matched = products.find(p => String(p.id) === productId || (p.name && p.name.toLowerCase() === productId.toLowerCase()));
        if (!matched) {
            alert(`Product with ID or name "${productId}" not found.`);
            return;
        }
        const productDetails = matched;

        const existing = currentCart.find(i => String(i.id) === String(productDetails.id));
        if (existing) existing.quantity += quantity;
        else currentCart.push({ id: String(productDetails.id), name: productDetails.name, price: Number(productDetails.price) || 0, quantity });

        updateCartDisplay();
        productIdInput.value = '';
        quantityInput.value = 1;
    } catch (err) {
        console.error('handleAddToCart error:', err);
        alert('Error finding product. Check console.');
    }
}

async function handleCheckout(e) {
    e.preventDefault();
    if (currentCart.length === 0) {
        showModalMessage('The cart is empty. Cannot checkout.', 'error');
        return;
    }
    const paymentInfo = {
        method: document.getElementById('payment-method').value,
        amountPaid: parseFloat(document.getElementById('amount-paid').value) || 0
    };
    if (paymentInfo.amountPaid < currentTotal) {
        showModalMessage(`Amount paid ($${paymentInfo.amountPaid.toFixed(2)}) is less than the total ($${currentTotal.toFixed(2)}).`, 'error');
        return;
    }
    const transactionData = {
        items: currentCart.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })),
        totalAmount: currentTotal,
        payment: paymentInfo
    };

    try {
        const res = await fetch(`${POS_API}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        });
        if (res.ok) {
            const sale = await res.json();
            const saleIdShort = String(sale.id ?? '').slice(0,8);
            showModalMessage(`Sale Completed! ID: ${saleIdShort} Total: $${(sale.totalAmount || currentTotal).toFixed(2)}`, 'success');
            currentCart = [];
            currentTotal = 0;
            updateCartDisplay();
        } else {
            const txt = await res.text();
            showModalMessage(`Checkout failed: ${txt}`, 'error');
        }
    } catch (err) {
        console.error('handleCheckout error:', err);
        showModalMessage('Error during checkout. See console.', 'error');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    switchView('inventory-view');

    viewInventoryBtn.addEventListener('click', () => switchView('inventory-view'));
    viewPosBtn.addEventListener('click', () => switchView('pos-view'));

    const performSearch = () => fetchProducts(searchInput.value);
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') { e.preventDefault(); performSearch(); }});
    refreshBtn.addEventListener('click', () => { searchInput.value = ''; fetchProducts(); });

    const addStandardBtn = document.getElementById('show-add-standard-form-btn');
    const addPerishableBtn = document.getElementById('show-add-perishable-form-btn');
    if (addStandardBtn) addStandardBtn.addEventListener('click', () => openModal('standard'));
    if (addPerishableBtn) addPerishableBtn.addEventListener('click', () => openModal('perishable'));

    // If static forms exist in index.html, attach submit listeners so they use AJAX
    const addStandardForm = document.getElementById('add-standard-form');
    const addPerishableForm = document.getElementById('add-perishable-form');
    if (addStandardForm) addStandardForm.addEventListener('submit', handleAddProduct);
    if (addPerishableForm) addPerishableForm.addEventListener('submit', handleAddProduct);

    productListContainer.addEventListener('click', e => {
        const t = e.target;
        if (t.classList.contains('btn-delete')) deleteProduct(t.dataset.id);
        else if (t.classList.contains('btn-update')) {
            openModal('update', {
                id: t.dataset.id,
                name: t.dataset.name,
                price: parseFloat(t.dataset.price),
                quantity: parseInt(t.dataset.quantity),
                expiry: t.dataset.expiry,
                type: t.dataset.type
            });
        }
    });

    const addToCartForm = document.getElementById('add-to-cart-form');
    const checkoutForm = document.getElementById('checkout-form');
    if (addToCartForm) addToCartForm.addEventListener('submit', handleAddToCart);
    if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckout);

    modalContainer.addEventListener('click', e => { if (e.target.id === 'modal-container') closeModal(); });

    updateCartDisplay();
});
