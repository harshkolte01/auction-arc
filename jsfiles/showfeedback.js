import { database } from './firebase-config.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const feedbackList = document.getElementById('feedbackList');
    const pagination = document.getElementById('pagination');
    const itemsPerPage = 10;
    let feedbacks = [];
    let currentPage = 1;

    // Fetch feedback from Firebase
    async function loadFeedback() {
        try {
            const feedbackRef = ref(database, 'feedback');
            const snapshot = await get(feedbackRef);
            
            if (snapshot.exists()) {
                feedbacks = Object.values(snapshot.val());
                displayFeedback();
                setupPagination();
            } else {
                feedbackList.innerHTML = '<p>No feedback available yet.</p>';
            }
        } catch (error) {
            console.error('Error loading feedback:', error);
            feedbackList.innerHTML = '<p>Error loading feedback.</p>';
        }
    }

    // Display feedback for current page
    function displayFeedback() {
        feedbackList.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageFeedbacks = feedbacks.slice(startIndex, endIndex);

        pageFeedbacks.forEach(feedback => {
            const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'feedback-item';
            feedbackDiv.innerHTML = `
                <div class="username">${feedback.username} (${feedback.userType})</div>
                <div class="rating">${stars}</div>
                <div class="description">${feedback.description}</div>
            `;
            feedbackList.appendChild(feedbackDiv);
        });
    }

    // Setup pagination buttons
    function setupPagination() {
        pagination.innerHTML = '';
        const totalPages = Math.ceil(feedbacks.length / itemsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = 'page-btn';
            btn.textContent = i;
            if (i === currentPage) btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                currentPage = i;
                displayFeedback();
                updatePaginationButtons();
            });
            
            pagination.appendChild(btn);
        }
    }

    // Update active state of pagination buttons
    function updatePaginationButtons() {
        const buttons = pagination.querySelectorAll('.page-btn');
        buttons.forEach((btn, index) => {
            btn.classList.toggle('active', index + 1 === currentPage);
        });
    }

    // Load feedback when page loads
    loadFeedback();
});