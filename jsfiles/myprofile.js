// import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
// import { ref, get, update } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';
// import { database } from './firebase-config.js'; // Adjust the path as needed

// document.addEventListener('DOMContentLoaded', () => {
//     const auth = getAuth();

//     onAuthStateChanged(auth, (user) => {
//         if (user) {
//             const userRef = ref(database, 'users/' + user.uid);

//             get(userRef).then((snapshot) => {
//                 if (snapshot.exists()) {
//                     const userData = snapshot.val();
//                     document.getElementById('username').value = userData.userName;
//                     document.getElementById('email').value = userData.email;
//                     document.getElementById('pass_word').value = userData.pass_word; // password
//                     document.getElementById('moneyIn').value = userData.moneyIn; // Load moneyIn value
//                 } else {
//                     console.log("No data available");
//                 }
//             }).catch((error) => {
//                 console.error("Error fetching data:", error);
//             });
//         } else {
//             // Redirect to login if not signed in
//             window.location.href = 'signin.html';
//         }
//     });

//     // Toggle password visibility
//     const togglePassword = document.querySelector('.toggle-password');
//     if (togglePassword) {
//         togglePassword.addEventListener('click', function () {
//             const passwordField = document.getElementById(this.dataset.target);
//             if (passwordField) {
//                 const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
//                 passwordField.setAttribute('type', type);
//                 this.classList.toggle('fa-eye-slash');
//             } else {
//                 console.error("Password field not found");
//             }
//         });
//     } else {
//         console.error("Password toggle button not found");
//     }

//     // Add money functionality
//     const addMoneyButton = document.querySelector('.addmoney');
//     if (addMoneyButton) {
//         addMoneyButton.addEventListener('click', function () {
//             const moneyField = document.getElementById(this.dataset.target);
//             if (moneyField) {
//                 const addAmount = parseInt(prompt("Enter the amount to add:"), 10);
//                 if (!isNaN(addAmount) && addAmount > 0) {
//                     const currentMoney = parseInt(moneyField.value, 10);
//                     const newMoneyAmount = currentMoney + addAmount;

//                     const userRef = ref(database, 'users/' + auth.currentUser.uid);
//                     update(userRef, {
//                         moneyIn: newMoneyAmount
//                     }).then(() => {
//                         moneyField.value = newMoneyAmount;
//                         alert("Money added successfully!");
//                     }).catch((error) => {
//                         console.error("Error updating money:", error);
//                         alert("Failed to add money. Please try again.");
//                     });
//                 } else {
//                     alert("Invalid amount. Please enter a positive number.");
//                 }
//             } else {
//                 console.error("Money field not found");
//             }
//         });
//     } else {
//         console.error("Add money button not found");
//     }

//     // Edit profile button
//     document.getElementById('editProfileButton').addEventListener('click', () => {
//         const newUsername = prompt("Enter your new username:");
//         const newPassword = prompt("Enter your new password:");

//         if (newUsername && newPassword) {
//             const userRef = ref(database, 'users/' + auth.currentUser.uid);
            
//             // Update username in Firebase Realtime Database
//             update(userRef, {
//                 userName: newUsername,
//                 pass_word: newPassword
//             }).then(() => {
//                 // Update password in Firebase Authentication
//                 const user = auth.currentUser;
//                 updatePassword(user, newPassword).then(() => {
//                     document.getElementById('username').value = newUsername;
//                     document.getElementById('pass_word').value = newPassword;
//                     alert("Profile updated successfully!");
//                 }).catch((error) => {
//                     console.error("Error updating password in Firebase Auth:", error);
//                     alert("Failed to update password. Please try again.");
//                 });
//             }).catch((error) => {
//                 console.error("Error updating username in Firebase Database:", error);
//                 alert("Failed to update profile. Please try again.");
//             });
//         } else {
//             alert("Username or password cannot be empty.");
//         }
//     });
// });


import { getAuth, onAuthStateChanged, updatePassword } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { ref, get, update } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';
import { database } from './firebase-config.js'; // Adjust the path as needed

document.addEventListener('DOMContentLoaded', () => {
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = ref(database, 'users/' + user.uid);

            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    document.getElementById('username').value = userData.userName;
                    document.getElementById('email').value = userData.email;
                    document.getElementById('pass_word').value = userData.pass_word; // password
                    document.getElementById('moneyIn').value = userData.moneyIn; // Load moneyIn value
                } else {
                    console.log("No data available");
                }
            }).catch((error) => {
                console.error("Error fetching data:", error);
            });
        } else {
            // Redirect to login if not signed in
            window.location.href = 'signin.html';
        }
    });

    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const passwordField = document.getElementById(this.dataset.target);
            if (passwordField) {
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);
                this.classList.toggle('fa-eye-slash');
            } else {
                console.error("Password field not found");
            }
        });
    } else {
        console.error("Password toggle button not found");
    }

    // Add money functionality
    const addMoneyButton = document.querySelector('.addmoney');
    if (addMoneyButton) {
        addMoneyButton.addEventListener('click', function () {
            const moneyField = document.getElementById(this.dataset.target);
            if (moneyField) {
                const addAmount = parseInt(prompt("Enter the amount to add:"), 10);
                if (!isNaN(addAmount) && addAmount > 0) {
                    const currentMoney = parseInt(moneyField.value, 10);
                    const newMoneyAmount = currentMoney + addAmount;

                    const userRef = ref(database, 'users/' + auth.currentUser.uid);
                    update(userRef, {
                        moneyIn: newMoneyAmount
                    }).then(() => {
                        moneyField.value = newMoneyAmount;
                        alert("Money added successfully!");
                    }).catch((error) => {
                        console.error("Error updating money:", error);
                        alert("Failed to add money. Please try again.");
                    });
                } else {
                    alert("Invalid amount. Please enter a positive number.");
                }
            } else {
                console.error("Money field not found");
            }
        });
    } else {
        console.error("Add money button not found");
    }

    // Edit profile button functionality
    document.getElementById('editProfileButton').addEventListener('click', () => {
        const choice = prompt("What do you want to edit? Enter 'username', 'password', or 'both':").toLowerCase();

        if (choice === 'username' || choice === 'both') {
            const newUsername = prompt("Enter your new username:");
            if (newUsername) {
                const userRef = ref(database, 'users/' + auth.currentUser.uid);
                update(userRef, { userName: newUsername })
                    .then(() => {
                        document.getElementById('username').value = newUsername;
                        alert("Username updated successfully!");
                    })
                    .catch((error) => {
                        console.error("Error updating username:", error);
                        alert("Failed to update username. Please try again.");
                    });
            } else {
                alert("Username cannot be empty.");
            }
        }

        if (choice === 'password' || choice === 'both') {
            const newPassword = prompt("Enter your new password:");
            if (newPassword) {
                const user = auth.currentUser;
                updatePassword(user, newPassword)
                    .then(() => {
                        const userRef = ref(database, 'users/' + auth.currentUser.uid);
                        update(userRef, { pass_word: newPassword })
                            .then(() => {
                                document.getElementById('pass_word').value = newPassword;
                                alert("Password updated successfully!");
                            })
                            .catch((error) => {
                                console.error("Error updating password in database:", error);
                                alert("Failed to update password in database. Please try again.");
                            });
                    })
                    .catch((error) => {
                        console.error("Error updating password in Firebase Auth:", error);
                        alert("Failed to update password. Please try again.");
                    });
            } else {
                alert("Password cannot be empty.");
            }
        }

        if (choice !== 'username' && choice !== 'password' && choice !== 'both') {
            alert("Invalid choice. Please enter 'username', 'password', or 'both'.");
        }
    });
});
