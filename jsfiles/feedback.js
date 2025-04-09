import { auth, database } from './firebase-config.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const usernameInput = document.getElementById('username');
    const userTypeInput = document.getElementById('userType');
    const descriptionInput = document.getElementById('description');
    const ratingInput = document.getElementById('rating');
    const stars = document.querySelectorAll('.star-rating i');

    // Fetch user data when authenticated
    auth.onAuthStateChanged((user) => {
        if (user) {
            const userRef = ref(database, `users/${user.uid}`);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    usernameInput.value = userData.userName;
                    userTypeInput.value = userData.userType === 'Buyer' || userData.userType === 'Seller' 
                        ? userData.userType 
                        : 'Unknown';
                } else {
                    console.error('User data not found.');
                }
            }).catch((error) => {
                console.error('Error fetching user data:', error);
            });
        } else {
            window.location.href = 'login.html'; // Redirect to login if not authenticated
        }
    });

    // Star rating functionality
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.getAttribute('data-rating');
            ratingInput.value = rating;
            stars.forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.classList.add('selected');
                } else {
                    s.classList.remove('selected');
                }
            });
        });
    });

    // Form submission
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = auth.currentUser;
        if (!user) {
            alert('You must be logged in to submit feedback.');
            return;
        }

        const feedbackData = {
            username: usernameInput.value,
            userType: userTypeInput.value,
            description: descriptionInput.value,
            rating: parseInt(ratingInput.value) || 0,
            timestamp: Date.now(),
            userId: user.uid
        };

        if (feedbackData.rating === 0) {
            alert('Please select a rating.');
            return;
        }

        if (!feedbackData.description.trim()) {
            alert('Please enter a description.');
            return;
        }

        const feedbackRef = ref(database, `feedback/${user.uid}_${Date.now()}`);
        set(feedbackRef, feedbackData)
            .then(() => {
                alert('Feedback submitted successfully!');
                feedbackForm.reset();
                ratingInput.value = 0;
                stars.forEach(star => star.classList.remove('selected'));
            })
            .catch((error) => {
                console.error('Error submitting feedback:', error);
                alert('Error submitting feedback: ' + error.message);
            });
    });
});