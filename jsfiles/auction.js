import { getDatabase, ref, get, update, onValue } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const db = getDatabase();
    const auth = getAuth();
    const auctionGrid = document.getElementById('auctionGrid');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    let currentUserType = null;
    let allProducts = {}; // Store all products for filtering

    // Fetch user type
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = ref(db, `users/${user.uid}`);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    currentUserType = snapshot.val().userType;
                    loadProducts(); // Load products after determining the user type
                }
            }).catch((error) => {
                console.error('Error fetching user type:', error);
            });
        } else {
            console.error('No user is signed in.');
        }
    });

    function loadProducts() {
        const productsRef = ref(db, 'products');
        
        onValue(productsRef, (snapshot) => {
            if (snapshot.exists()) {
                allProducts = snapshot.val();
                displayProducts(allProducts); // Initial display of all products
            } else {
                auctionGrid.innerHTML = '<p>No products available.</p>';
            }
        }, (error) => {
            console.error('Error fetching products:', error);
            auctionGrid.innerHTML = '<p>Error loading products.</p>';
        });
    }

    function displayProducts(products) {
        auctionGrid.innerHTML = ''; // Clear existing items
        for (const productId in products) {
            const product = products[productId];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'auction-item';
            itemDiv.innerHTML = `
                <img src="${product.productImageURL}" alt="${product.productName}">
                <h3>${product.productName}</h3>
                <p>Starting Price: $${product.startingPrice}</p>
                <p>Category: ${product.category}</p>
                <p>Total Bid Time: ${product.bidTimeValue}</p>
                <button data-product-id="${productId}" class="start-bid-btn" ${product.bidStarted ? 'disabled' : ''}>Start Bid</button>
                <button data-product-id="${productId}" class="participate-btn" style="display: ${product.bidStarted ? 'block' : 'none'};">Participate</button>
            `;
            auctionGrid.appendChild(itemDiv);
        }

        // Add event listeners to buttons
        addButtonListeners();
    }

    function addButtonListeners() {
        document.querySelectorAll('.start-bid-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                if (currentUserType === 'Admin') {
                    const productId = e.target.getAttribute('data-product-id');
                    startBid(productId);
                } else {
                    alert('Only admins can start the bid.');
                }
            });
        });

        document.querySelectorAll('.participate-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                if (currentUserType === 'Buyer' || currentUserType === 'Admin') {
                    const productId = e.target.getAttribute('data-product-id');
                    window.location.href = `biditemon.html?productId=${productId}`;
                }
            });
        });
    }

    function startBid(productId) {
        const productRef = ref(db, `products/${productId}`);
        const now = new Date().toISOString();

        update(productRef, {
            bidStarted: true,
            bidStartTime: now
        }).then(() => {
            window.location.href = `biditemon.html?productId=${productId}`;
        }).catch((error) => {
            console.error('Error starting bid:', error);
        });
    }

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterAuctions(searchTerm);
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form submission
    });

    function filterAuctions(searchTerm) {
        const filteredProducts = {};
        for (const productId in allProducts) {
            const product = allProducts[productId];
            if (product.productName.toLowerCase().includes(searchTerm) || 
                product.category.toLowerCase().includes(searchTerm)) {
                filteredProducts[productId] = product;
            }
        }
        displayProducts(filteredProducts);
    }
});