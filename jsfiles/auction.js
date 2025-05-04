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
    const category = document.getElementById('category');
    const auctionStatus = document.getElementById('auctionStatus');
    const applyFilters = document.getElementById('applyFilters');
    let currentUserType = null;
    let allProducts = {}; // Store all products for filtering
    let auctionResults = {}; // Store auction results
    // Load notified bids from localStorage or initialize as empty Set
    const notifiedBids = new Set(JSON.parse(localStorage.getItem('notifiedBids') || '[]'));

    // Save notifiedBids to localStorage whenever it changes
    function saveNotifiedBids() {
        localStorage.setItem('notifiedBids', JSON.stringify([...notifiedBids]));
    }

    // Toggle filter panel visibility
    toggleFilter.addEventListener('click', () => {
        filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none';
    });

    // Fetch user type
    onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed, user:', user?.uid); // Debug: Log user ID
        if (user) {
            const userRef = ref(db, `users/${user.uid}`);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    currentUserType = snapshot.val().userType;
                    console.log('User type:', currentUserType); // Debug: Log user type
                    loadProducts();
                    if (currentUserType === 'Buyer') {
                        listenForBidStart(); // Listen for bid start notifications for buyers
                    }
                } else {
                    console.error('User data not found for UID:', user.uid);
                }
            }).catch((error) => {
                console.error('Error fetching user type:', error);
            });
        } else {
            console.error('No user is signed in.');
            loadProducts(); // Load products even if no user is signed in
        }
    });

    function listenForBidStart() {
        const productsRef = ref(db, 'products');
        let previousProducts = { ...allProducts }; // Initialize with current products

        onValue(productsRef, (snapshot) => {
            if (snapshot.exists()) {
                const products = snapshot.val();
                Object.entries(products).forEach(([productId, product]) => {
                    // Skip if auction has ended or already notified
                    if (auctionResults[productId] || notifiedBids.has(productId)) {
                        return;
                    }
                    // Check if bid just started
                    if (
                        product.bidStarted &&
                        !previousProducts[productId]?.bidStarted
                    ) {
                        showNotification(`Bidding has started for "${product.productName}"!`);
                        notifiedBids.add(productId); // Mark as notified
                        saveNotifiedBids(); // Save to localStorage
                    }
                });
                previousProducts = { ...products }; // Update previous state
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
            console.log('Auction results:', auctionResults); // Debug: Log auction results
            // Fetch products in real-time
            onValue(productsRef, (snapshot) => {
                if (snapshot.exists()) {
                    allProducts = snapshot.val();
                    console.log('Products loaded:', allProducts); // Debug: Log products
                    applyFilter(); // Apply filters to display products
                } else {
                    console.log('No products available');
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
        try {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const sortOrder = sortPrice.value;
            const selectedCategory = category.value;
            const selectedAuctionStatus = auctionStatus.value;
            const priceRangeRadio = document.querySelector('input[name="priceRangeRadio"]:checked');
            const selectedPriceRange = priceRangeRadio ? priceRangeRadio.value : 'all';

            console.log('Filter inputs:', { searchTerm, sortOrder, selectedCategory, selectedAuctionStatus, selectedPriceRange }); // Debug: Log filter inputs

            let filteredProducts = Object.entries(allProducts).filter(([productId, product]) => {
                // Search filter
                const matchesSearch = product.productName.toLowerCase().includes(searchTerm) || 
                                     product.category.toLowerCase().includes(searchTerm);
                // Category filter
                const matchesCategory = !selectedCategory || product.category === selectedCategory;
                // Price filter
                const price = parseFloat(product.startingPrice) || 0;
                let matchesPrice = true;
                if (selectedPriceRange !== 'all') {
                    const [min, max] = selectedPriceRange.split('-').map(Number);
                    matchesPrice = (!min || price >= min) && (!max || price <= max);
                }
                // Auction status filter
                let matchesStatus = true;
                if (selectedAuctionStatus === 'notStarted') {
                    matchesStatus = !product.bidStarted && !auctionResults[productId];
                } else if (selectedAuctionStatus === 'ended') {
                    matchesStatus = !!auctionResults[productId];
                }

                return matchesSearch && matchesCategory && matchesPrice && matchesStatus;
            });

            // Sort products
            if (sortOrder === 'lowToHigh' || sortOrder === 'highToLow') {
                filteredProducts.sort((a, b) => {
                    const priceA = parseFloat(a[1].startingPrice) || 0;
                    const priceB = parseFloat(b[1].startingPrice) || 0;
                    return sortOrder === 'lowToHigh' ? priceA - priceB : priceB - priceA;
                });
            }

            console.log('Filtered products:', filteredProducts); // Debug: Log filtered products
            displayProducts(Object.fromEntries(filteredProducts));
        } catch (error) {
            console.error('Error in applyFilter:', error);
            auctionGrid.innerHTML = '<p>Error applying filters.</p>';
        }
    }

    function displayProducts(products) {
        auctionGrid.innerHTML = ''; // Clear existing items
        console.log('Displaying products:', products); // Debug: Log products to display
        if (Object.keys(products).length === 0) {
            auctionGrid.innerHTML = '<p>No products match the current filters.</p>';
            return;
        }
        for (const productId in products) {
            const product = products[productId];
            const isAuctionEnded = !!auctionResults[productId]; // Check if productId exists in auctionResults
            const winner = isAuctionEnded ? auctionResults[productId].userName : null;
            const highestBid = isAuctionEnded ? auctionResults[productId].highestBid : null;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'auction-item';
            itemDiv.innerHTML = `
                <img src="${product.productImageURL || 'https://via.placeholder.com/150'}" alt="${product.productName}">
                <h3>${product.productName}</h3>
                <p>Starting Price: $${parseFloat(product.startingPrice) || 'N/A'}</p>
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
    category.addEventListener('change', applyFilter);
    auctionStatus.addEventListener('change', applyFilter);
    applyFilters.addEventListener('click', () => {
        applyFilter();
        filterPanel.style.display = 'none'; // Close filter panel
    });
    document.querySelectorAll('input[name="priceRangeRadio"]').forEach(radio => {
        radio.addEventListener('change', applyFilter);
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form submission
    });
});