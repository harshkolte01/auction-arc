import { getDatabase, ref, get, update, onValue } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const db = getDatabase();
    const auth = getAuth();
    const auctionGrid = document.getElementById('auctionGrid');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const toggleFilter = document.getElementById('toggleFilter');
    const filterPanel = document.getElementById('filterPanel');
    const sortPrice = document.getElementById('sortPrice');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const category = document.getElementById('category');
    const applyFilters = document.getElementById('applyFilters');
    let currentUserType = null;
    let allProducts = {}; // Store all products for filtering
    let auctionResults = {}; // Store auction results

    // Toggle filter panel visibility
    toggleFilter.addEventListener('click', () => {
        filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none';
    });

    // Update price range display
    priceRange.addEventListener('input', () => {
        priceValue.textContent = `Up to $${priceRange.value}`;
    });

    // Fetch user type
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = ref(db, `users/${user.uid}`);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    currentUserType = snapshot.val().userType;
                    loadProducts();
                    if (currentUserType === 'Buyer') {
                        listenForBidStart(); // Listen for bid start notifications for buyers
                    }
                }
            }).catch((error) => {
                console.error('Error fetching user type:', error);
            });
        } else {
            console.error('No user is signed in.');
        }
    });

    function listenForBidStart() {
        const productsRef = ref(db, 'products');
        onValue(productsRef, (snapshot) => {
            if (snapshot.exists()) {
                const products = snapshot.val();
                Object.entries(products).forEach(([productId, product]) => {
                    // Check if bid just started (bidStarted is true and was previously false or undefined)
                    if (product.bidStarted && !allProducts[productId]?.bidStarted) {
                        showNotification(`Bidding has started for "${product.productName}"!`);
                    }
                });
                allProducts = products; // Update allProducts to track bidStarted state
            }
        }, (error) => {
            console.error('Error listening for bid start:', error);
        });
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'bid-notification';
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-notification">×</button>
        `;
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500); // Match fade-out duration
        }, 5000);

        // Close button functionality
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        });
    }

    function loadProducts() {
        const productsRef = ref(db, 'products');
        const resultsRef = ref(db, 'auctionResults');

        // Fetch auction results in real-time
        onValue(resultsRef, (snapshot) => {
            auctionResults = snapshot.exists() ? snapshot.val() : {};
            // Fetch products in real-time
            onValue(productsRef, (snapshot) => {
                if (snapshot.exists()) {
                    allProducts = snapshot.val();
                    applyFilter(); // Apply filters to display products
                } else {
                    auctionGrid.innerHTML = '<p>No products available.</p>';
                }
            }, (error) => {
                console.error('Error fetching products:', error);
                auctionGrid.innerHTML = '<p>Error loading products.</p>';
            });
        }, (error) => {
            console.error('Error fetching auction results:', error);
        });
    }

    function applyFilter() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const sortOrder = sortPrice.value;
        const maxPrice = parseFloat(priceRange.value);
        const selectedCategory = category.value;
        const selectedPriceRange = document.querySelector('input[name="priceRangeRadio"]:checked').value;

        let filteredProducts = Object.entries(allProducts).filter(([productId, product]) => {
            const matchesSearch = product.productName.toLowerCase().includes(searchTerm) || 
                                 product.category.toLowerCase().includes(searchTerm);
            const matchesCategory = !selectedCategory || product.category === selectedCategory;
            const price = parseFloat(product.startingPrice);
            let matchesPrice = true;
            if (selectedPriceRange !== 'all') {
                const [min, max] = selectedPriceRange.split('-').map(Number);
                matchesPrice = (!min || price >= min) && (!max || price <= max);
            } else {
                matchesPrice = price <= maxPrice;
            }
            return matchesSearch && matchesCategory && matchesPrice;
        });

        // Sort products
        if (sortOrder === 'lowToHigh') {
            filteredProducts.sort((a, b) => parseFloat(a[1].startingPrice) - parseFloat(b[1].startingPrice));
        } else if (sortOrder === 'highToLow') {
            filteredProducts.sort((a, b) => parseFloat(b[1].startingPrice) - parseFloat(b[1].startingPrice));
        }

        displayProducts(Object.fromEntries(filteredProducts));
    }

    function displayProducts(products) {
        auctionGrid.innerHTML = ''; // Clear existing items
        for (const productId in products) {
            const product = products[productId];
            const isAuctionEnded = !!auctionResults[productId]; // Check if productId exists in auctionResults
            const winner = isAuctionEnded ? auctionResults[productId].userName : null;
            const highestBid = isAuctionEnded ? auctionResults[productId].highestBid : null;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'auction-item';
            itemDiv.innerHTML = `
                <img src="${product.productImageURL}" alt="${product.productName}">
                <h3>${product.productName}</h3>
                <p>Starting Price: $${product.startingPrice}</p>
                <p>Category: ${product.category}</p>
                <p>Total Bid Time: ${product.bidTimeValue}</p>
                ${
                    isAuctionEnded 
                    ? `
                        <div class="auction-ended-container">
                            <i class="fa fa-check-circle auction-ended-icon"></i>
                            <p class="auction-ended">
                                <span class="auction-ended-title">Auction Ended</span><br>
                                Highest Bid: <span class="auction-ended-highlight">$${highestBid}</span><br>
                                Winner: <span class="auction-ended-highlight">${winner}</span>
                            </p>
                        </div>
                    `
                    : `
                        <button data-product-id="${productId}" class="start-bid-btn" ${product.bidStarted || currentUserType !== 'Admin' ? 'disabled' : ''}>Start Bid</button>
                        <button data-product-id="${productId}" class="participate-btn" style="display: ${product.bidStarted ? 'block' : 'none'};">Participate</button>
                    `
                }
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

    // Search and filter event listeners
    searchInput.addEventListener('input', applyFilter);
    sortPrice.addEventListener('change', applyFilter);
    priceRange.addEventListener('change', applyFilter);
    category.addEventListener('change', applyFilter);
    applyFilters.addEventListener('click', applyFilter);
    document.querySelectorAll('input[name="priceRangeRadio"]').forEach(radio => {
        radio.addEventListener('change', applyFilter);
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form submission
    });
});