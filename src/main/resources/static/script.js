// Base URLs for the API endpoints
const INVENTORY_API = '/products';
const POS_API = '/pos';

// State Variables (Mimicking simple cart state)
let currentCart = [];
let currentTotal = 0.00;
let editProductId = null; // Used to track which product is being updated

// --- DOM Elements ---
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

// --- Utility Functions ---

/**
 * Displays a temporary message in the modal container.
 * @param {string} message - The message content.
 * @param {string} type - 'success' or 'error'.
 */
function showModalMessage(message, type) {
    let messageBox = document.querySelector('#modal-container .message-box');
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.className = 'message-box';
        // Ensure modal-content exists before appending
        const modalContent = document.querySelector('#modal-container .modal-content');
        if (modalContent) {
            modalContent.appendChild(messageBox);
        } else {
            console.error('Modal content not found for message box.');
            return;
        }
    }

    // Reset classes
    messageBox.className = 'message-box';
    messageBox.classList.add(type);
    messageBox.textContent = message;
    messageBox.style.display = 'block';

    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

/**
 * Switches between Inventory and POS views.
 * @param {string} viewId - 'inventory-view' or 'pos-view'
 */
function switchView(viewId) {
    if (viewId === 'inventory-view') {
        inventoryView.classList.add('active');
        posView.classList.remove('active');
        viewInventoryBtn.classList.add('active-view');
        viewPosBtn.classList.remove('active-view');
        fetchProducts(); // Always refresh inventory when switching back
    } else {
        inventoryView.classList.remove('active');
        posView.classList.add('active');
        viewInventoryBtn.classList.remove('active-view');
        viewPosBtn.classList.add('active-view');
    }
}

// --- Inventory CRUD Functions ---

/**
 * Fetches products based on search term and renders the table.
 * @param {string} searchTerm
 */
async function fetchProducts(searchTerm = '') {
    let url = INVENTORY_API;
    if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        renderProductTable(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        productListContainer.innerHTML = `<p class="error-message">Error loading products. Check backend connectivity.</p>`;
    }
}

/**
 * Generates the HTML table for products.
 * @param {Array<Object>} products
 */
function renderProductTable(products) {
    if (products.length === 0) {
        productListContainer.innerHTML = '<p style="padding: 20px;">No products found.</p>';
        return;
    }

    let tableHTML = `
        <table id="product-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Details</th>
                    <th>Type</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    products.forEach(product => {
        // Check if expiryDate exists on the product object
        const isPerishable = product.expiryDate !== undefined;
        const type = isPerishable ? 'Perishable' : 'Standard';
        const details = isPerishable
            ? `Expires: ${product.expiryDate}`
            : `N/A`; // Standard products don't have this specific detail

        tableHTML += `
            <tr>
                <td>${product.id.substring(0, 8)}...</td>
                <td>${product.name}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${details}</td>
                <td>${type}</td>
                <td>
                    <button class="btn-danger btn-delete" data-id="${product.id}">Delete</button>
                    <button class="btn-secondary btn-update" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-expiry="${product.expiryDate || ''}" data-type="${type}">Update</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    productListContainer.innerHTML = tableHTML;
}

/**
 * Deletes a product by ID.
 * @param {string} id
 */
async function deleteProduct(id) {
    // Use custom modal or message instead of confirm
    // For this demonstration, we'll temporarily use a simple confirm as per the prompt's original structure,
    // but in a real app, this should be replaced with a custom UI/Modal.
    if (!window.confirm(`Are you sure you want to delete product ID: ${id.substring(0, 8)}...?`)) {
        return;
    }

    try {
        const response = await fetch(`${INVENTORY_API}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Use custom modal/message instead of alert
            console.log('Product deleted successfully!');
            showModalMessage('Product deleted successfully!', 'success');
            fetchProducts();
        } else {
            // Use custom modal/message instead of alert
            const errorText = await response.text();
            console.error('Failed to delete product:', errorText);
            showModalMessage(`Failed to delete product: ${errorText}`, 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showModalMessage('An error occurred during deletion.', 'error');
    }
}

/**
 * Handles product creation via modal form submission.
 * @param {Event} e
 */
async function handleAddProduct(e) {
    e.preventDefault();
    const form = e.target;
    const isPerishable = form.id === 'add-perishable-form';

    const productData = {
        name: form.elements.name.value,
        price: parseFloat(form.elements.price.value),
    };

    let endpoint = `${INVENTORY_API}/add`;
    if (isPerishable) {
        productData.expiryDate = form.elements.expiryDate.value;
        endpoint = `${INVENTORY_API}/add-perishable`;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        const message = response.ok ? 'Product added successfully!' : await response.text();
        if (response.ok) {
            showModalMessage(message, 'success');
            form.reset();
            fetchProducts();
        } else {
            showModalMessage(`Failed to add product: ${message}`, 'error');
        }

    } catch (error) {
        console.error('Error adding product:', error);
        showModalMessage('An error occurred while adding the product.', 'error');
    }
}

/**
 * Handles product update via modal form submission.
 * @param {Event} e
 */
async function handleUpdateProduct(e) {
    e.preventDefault();
    if (!editProductId) return;

    const form = e.target;
    // Check if the expiryDate element exists in the form
    const isPerishable = form.elements.expiryDate !== undefined;

    const productData = {
        // ID is not sent in the body, but used in the path
        name: form.elements.name.value,
        price: parseFloat(form.elements.price.value),
    };

    if (isPerishable) {
        productData.expiryDate = form.elements.expiryDate.value;
    }

    try {
        const response = await fetch(`${INVENTORY_API}/${editProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            showModalMessage('Product updated successfully!', 'success');
            // Wait briefly for message to show before closing
            setTimeout(closeModal, 500);
            fetchProducts();
        } else {
            const errorText = await response.text();
            showModalMessage(`Failed to update product: ${errorText}`, 'error');
        }

    } catch (error) {
        console.error('Error updating product:', error);
        showModalMessage('An error occurred during update.', 'error');
    }
}

// --- Modal Functions ---

/**
 * Generates the HTML for the product creation/update forms.
 * @param {string} type - 'standard', 'perishable', or 'update'
 * @param {Object} data - Existing product data for update form
 */
function openModal(type, data = {}) {
    let title = '';
    let formId = '';
    let extraFields = '';
    let submitHandler = '';

    // Clear any previous edit ID
    editProductId = null;

    if (type === 'standard') {
        title = 'Add New Standard Product';
        formId = 'add-standard-form';
        submitHandler = 'handleAddProduct(event)';
    } else if (type === 'perishable') {
        title = 'Add New Perishable Product';
        formId = 'add-perishable-form';
        extraFields = `
            <label for="expiryDate">Expiry Date:</label>
            <input type="date" id="expiryDate" name="expiryDate" required value="${data.expiryDate || ''}">
        `;
        submitHandler = 'handleAddProduct(event)';
    } else if (type === 'update') {
        title = `Update Product: ${data.name}`;
        formId = 'update-product-form';
        editProductId = data.id; // Set ID for update handler

        // Determine if product being updated is perishable based on the data-type attribute
        if (data.type === 'Perishable') {
            extraFields = `
                <label for="expiryDate">Expiry Date:</label>
                <!-- Use the stored data-expiry value which is already a YYYY-MM-DD string or empty -->
                <input type="date" id="expiryDate" name="expiryDate" required value="${data.expiry || ''}">
            `;
        }
        submitHandler = 'handleUpdateProduct(event)';
    } else {
        return; // Invalid type
    }

    const modalHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h3>${title}</h3>
            <form id="${formId}" onsubmit="${submitHandler}">
                <label for="name">Name:</label>
                <!-- Use the stored data.name value -->
                <input type="text" id="name" name="name" required value="${data.name || ''}">

                <label for="price">Price ($):</label>
                <!-- Use the stored data.price value, which should be a number or converted to string -->
                <input type="number" id="price" name="price" step="0.01" min="0" required value="${data.price || ''}">
                
                ${extraFields}

                <button type="submit" class="btn-primary">${type === 'update' ? 'Save Changes' : 'Add Product'}</button>
            </form>
            <div class="message-box"></div>
        </div>
    `;

    modalContainer.innerHTML = modalHTML;
    modalContainer.style.display = 'flex'; // Use flex to center the modal content

    // Re-attach close event listener
    document.querySelector('.close-btn').onclick = closeModal;
}

function closeModal() {
    modalContainer.style.display = 'none';
    modalContainer.innerHTML = '';
    editProductId = null; // Clear ID after closing
}

// --- POS/Cart Functions ---

function updateCartDisplay() {
    cartList.innerHTML = '';

    if (currentCart.length === 0) {
        cartList.innerHTML = '<li><span class="placeholder-text">Cart is empty.</span></li>';
        cartTotalAmount.textContent = '$0.00';
        // Reset amount paid
        document.getElementById('amount-paid').value = '0.00';
        return;
    }

    currentCart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.quantity} x ${item.name}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        cartList.appendChild(li);
    });

    currentTotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalAmount.textContent = `$${currentTotal.toFixed(2)}`;
    // Pre-fill amount paid with the total for convenience
    document.getElementById('amount-paid').value = currentTotal.toFixed(2);
}

/**
 * Handles adding an item to the client-side cart.
 * @param {Event} e
 */
async function handleAddToCart(e) {
    e.preventDefault();
    const productIdInput = document.getElementById('pos-product-id');
    const quantityInput = document.getElementById('pos-quantity');

    const productId = productIdInput.value.trim();
    const quantity = parseInt(quantityInput.value);

    if (!productId || quantity <= 0 || isNaN(quantity)) {
        alert("Please enter a valid Product ID and Quantity.");
        return;
    }

    // 1. Fetch product details
    let productDetails;
    try {
        // Fetch by ID. Using search with the ID should work if the backend allows exact ID matching
        const response = await fetch(`${INVENTORY_API}/${productId}`);

        if (!response.ok) {
            // If fetching by exact ID fails (e.g., 404), try the search endpoint
            const searchResponse = await fetch(`${INVENTORY_API}?search=${productId}`);
            const products = await searchResponse.json();
            productDetails = products.find(p => p.id === productId);

            if (!productDetails) {
                throw new Error(`Product not found.`);
            }

        } else {
            // Product found by exact ID endpoint
            productDetails = await response.json();
        }

    } catch (error) {
        console.error('Error fetching single product:', error);
        alert(`Product with ID ${productId} not found!`);
        return;
    }

    // 2. Update client-side cart state
    const existingItem = currentCart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        currentCart.push({
            id: productId,
            name: productDetails.name,
            price: productDetails.price,
            quantity: quantity
        });
    }

    updateCartDisplay();
    productIdInput.value = '';
    quantityInput.value = 1;
}


/**
 * Handles finalizing the sale and sending payment info to the backend.
 * NOTE: This checkout simulates a transaction by sending payment info, but the backend
 * would typically need the cart items, not just the payment.
 */
async function handleCheckout(e) {
    e.preventDefault();

    if (currentCart.length === 0) {
        // Use custom message instead of alert
        showModalMessage("The cart is empty. Cannot checkout.", 'error');
        return;
    }

    const paymentInfo = {
        method: document.getElementById('payment-method').value,
        amountPaid: parseFloat(document.getElementById('amount-paid').value)
    };

    // Simple validation (Total must be covered by paid amount)
    if (paymentInfo.amountPaid < currentTotal) {
        // Use custom message instead of alert
        showModalMessage(`Amount paid ($${paymentInfo.amountPaid.toFixed(2)}) is less than the total ($${currentTotal.toFixed(2)}).`, 'error');
        return;
    }

    // In a real application, you would send the cart contents (currentCart) as well.
    const transactionData = {
        items: currentCart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price // Price at time of sale
        })),
        totalAmount: currentTotal,
        payment: paymentInfo
    };


    try {
        const response = await fetch(`${POS_API}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        });

        if (response.ok) {
            const saleResult = await response.json();
            // Use custom message instead of alert
            showModalMessage(`Sale Completed! ID: ${saleResult.id.substring(0, 8)}... Total: $${saleResult.totalAmount.toFixed(2)}`, 'success');

            // Clear cart state after successful checkout
            currentCart = [];
            currentTotal = 0.00;
            updateCartDisplay();

        } else {
            const errorText = await response.text();
            showModalMessage(`Checkout Failed: ${errorText}`, 'error');
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        showModalMessage('An error occurred during the checkout process.', 'error');
    }
}

// --- Event Listeners Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Load: Show Inventory
    switchView('inventory-view');

    // 2. View Switchers
    viewInventoryBtn.addEventListener('click', () => switchView('inventory-view'));
    viewPosBtn.addEventListener('click', () => switchView('pos-view'));

    // 3. Inventory Control
    // Ensure that search is triggered on click AND enter key press
    const performSearch = () => fetchProducts(searchInput.value);

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    refreshBtn.addEventListener('click', () => {
        searchInput.value = '';
        fetchProducts();
    });

    // 4. Modal Open Buttons
    // Check if elements exist before adding listeners
    const addStandardBtn = document.getElementById('show-add-standard-form-btn');
    const addPerishableBtn = document.getElementById('show-add-perishable-form-btn');

    if (addStandardBtn) addStandardBtn.addEventListener('click', () => openModal('standard'));
    if (addPerishableBtn) addPerishableBtn.addEventListener('click', () => openModal('perishable'));

    // 5. Dynamic Table Listeners (Delegation for Delete/Update)
    productListContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('btn-delete')) {
            deleteProduct(target.dataset.id);
        } else if (target.classList.contains('btn-update')) {
            openModal('update', {
                id: target.dataset.id,
                name: target.dataset.name,
                price: parseFloat(target.dataset.price),
                expiry: target.dataset.expiry, // Note: using data-expiry here
                type: target.dataset.type
            });
        }
    });

    // 6. Modal Form Submission Listeners (Delegation)
    // Note: The onsubmit attributes in openModal handle this directly,
    // but having a delegated listener here acts as a fallback or for future centralized logic.
    /*
    modalContainer.addEventListener('submit', (e) => {
        // Since we are using the 'onsubmit' attribute in the generated modal HTML,
        // these explicit checks are redundant but kept for completeness of original intent.
    });
    */

    // 7. POS Form Listeners
    const addToCartForm = document.getElementById('add-to-cart-form');
    const checkoutForm = document.getElementById('checkout-form');

    if (addToCartForm) addToCartForm.addEventListener('submit', handleAddToCart);
    if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckout);

    // Close modal when clicking outside
    modalContainer.addEventListener('click', (e) => {
        if (e.target.id === 'modal-container') {
            closeModal();
        }
    });

    // Initial cart display
    updateCartDisplay();
});
