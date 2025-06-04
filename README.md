# AuctionArc

![AuctionArc Logo](/images/logo-white-removebg-preview.png) <!-- Replace with actual logo if available -->

**Innovative Auctions, Infinite Possibilities**

AuctionArc is a dynamic online auction platform that connects buyers and sellers in a seamless, secure, and engaging environment. Whether you're bidding on unique items, selling products, or managing auctions as an admin, AuctionArc offers a robust and user-friendly experience with real-time bidding, advanced filtering, and a comprehensive feedback system.

## Features

- **Real-Time Bidding**: Participate in live auctions with a countdown timer and bid history updates.
- **Advanced Search & Filters**: Browse auctions by search term, price range, category, and auction status (Not Started, Ended, All).
- **Role-Based Access**: Admin-specific features (start bids, delete auctions) and buyer/seller functionalities.
- **User Management**: Sign up, log in, edit profiles, and manage funds for bidding.
- **Product Management**: Sellers can add products with details like name, image, starting price, and category.
- **Order & Payment System**: View won auctions and complete payments using in-app funds.
- **Feedback System**: Submit and view user feedback to build trust in the community.
- **Notifications**: Buyers receive alerts when auctions start.
- **Responsive Design**: Consistent UI across pages (assumes CSS ensures mobile compatibility).

## Technologies

- **Frontend**:
  - HTML5
  - CSS3 (assumed for styling, not provided)
  - JavaScript (ES6+)
- **Backend & Database**:
  - Google Firebase:
    - Firebase Authentication (email/password)
    - Firebase Realtime Database (products, users, bids, auction results)
    - Firebase Storage (product images)
- **Dependencies**:
  - Firebase JavaScript SDK (v10.12.5)
  - Font Awesome (for icons, assumed based on `fa` classes)

## Setup Instructions

### Prerequisites
- A web browser (Chrome, Firefox, etc.)
- A [Firebase](https://firebase.google.com/) account

### Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/harshkolte01/auction-arc
   cd auctionarc
   ```

2. **Set Up Firebase**:
   - Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable Authentication (Email/Password provider).
   - Set up Realtime Database and Storage.
   - Add a web app to your Firebase project and copy the configuration.
   - Update `js/firebase-config.js` with your Firebase configuration:
     ```javascript
     const firebaseConfig = {
         apiKey: "YOUR_API_KEY",
         authDomain: "YOUR_AUTH_DOMAIN",
         projectId: "YOUR_PROJECT_ID",
         storageBucket: "YOUR_STORAGE_BUCKET",
         databaseURL: "YOUR_DATABASE_URL",
         messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
         appId: "YOUR_APP_ID",
         measurementId: "YOUR_MEASUREMENT_ID"
     };
     ```

3. **Configure Firebase Security Rules**:
   - In the Firebase Console, set Realtime Database rules to secure data access (e.g., only authenticated users can read/write).
     ```json
     {
        "rules": {
          ".read": "auth != null",
          ".write": "auth != null",
            "feedback": {
            ".read": "true",  // Allow anyone to read feedback
            ".write": "auth != null"  // Only authenticated users can write feedback
          },
        }
      }
     ```
   - Set Storage rules to allow authenticated users to upload product images.

4. **Serve the Application**:
   - Use a local server (e.g., with Node.js):
     ```bash
     npm install -g http-server
     http-server .
     ```
   - Or open `index.html` directly in a browser (note: some Firebase features may require a server).

5. **Access the App**:
   - Open `http://localhost:3000` (or the port provided by your server) in a browser.
   - Start at `index.html` for guest access or sign up to explore full features.

## Usage

1. **Guest Access**:
   - Visit `index.html` to view the welcome page and sign up.
   - Browse public feedback on `showfeedback.html`.

2. **User Actions**:
   - **Sign Up**: Use the signup form (linked from `index.html`) to create an account (Buyer, Seller, or Admin).
   - **Browse Auctions**: Go to `auction.html` to filter and view products.
   - **Bid**: Click "Participate" on an active auction to bid on `biditemon.html`.
   - **Sell**: Add products via `sellinfoadd.html` (for sellers).
   - **Manage Profile**: Update details and view funds on `myprofile.html`.
   - **View Orders**: Check won auctions and complete payments on `orderlist.html`.
   - **Submit Feedback**: Share feedback on `feedback.html`.

3. **Admin Actions**:
   - Start bids on `auction.html`.
   - Delete auctions on `auctionlist.html`.
   - Access the admin dashboard on `adminpage.html`.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make changes and commit (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request with a clear description of your changes.

Please ensure your code follows:
- Consistent formatting (use Prettier or similar).
- Clear comments for complex logic.
- No sensitive data (e.g., Firebase keys) in commits.

## Known Issues

- Passwords are stored in the database (`users/uid/pass_word`), which is a security risk. Future updates will remove this.
- No fund deposit feature for `moneyIn` (planned for future releases).
- Limited error handling for network issues; consider adding retry logic.

## Future Enhancements

- Add a fund deposit page/modal for users to add money.
- Implement email notifications for auction winners using Firebase Cloud Functions.
- Enhance mobile responsiveness with CSS media queries.
- Add minimum bid increments to prevent trivial bids.
- Optimize search with debouncing to reduce database queries.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, contact the project maintainers at:
- Email: harshkolte01@gmail.com
- GitHub Issues: [Open an issue](https://github.com/harshkolte01/auction-arc/issues)

Join AuctionArc today and experience the future of auctions!