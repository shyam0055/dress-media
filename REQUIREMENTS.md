# DressSwipe — Product Requirements Document (PRD)

This document serves as the source of truth for the **DressSwipe** marketplace application. It outlines the product vision, core user roles, functional requirements, database schema layouts, and technical constraints.

---

## 1. Product Vision & MVP

DressSwipe is a **desktop-first, high-fashion editorial marketplace** designed to bridge the gap between social media video browsing (like Instagram Reels) and e-commerce checkouts. 

### Core Features
- **Swipe-to-Buy UX:** Users swipe left to add a dress to their **Wishlist** (likes), swipe right to add it to their **Cart**, or swipe down to **Skip**.
- **Dual Marketplace Roles:** A segmented onboarding flow divides users into **Buyers** (consumers) and **Sellers** (creators/designers).
- **Responsive Layouts:** Emulates Instagram Web on desktop viewports (left navigation sidebar, center video card, right info overlays) and collapses to mobile-first tab rails on smaller screens.
- **Strict Styling Guidelines:** Monochromatic Balenciaga-inspired design system (`#000000` / `#FFFFFF`) with font scaling and padding offsets strictly following the **Golden Ratio (1.618)**.

---

## 2. User Roles & Stories

### 👗 A. The Buyer (Consumer)
> *"As a buyer, I want a frictionless, visual shopping experience so that discovering and buying clothes feels like scrolling social media."*

- **Onboarding:** Register with a username, email, password, and select the **Buyer** role.
- **Home Feed:** Scroll through standard posts showing stories filtering bars, post headers (sponsored brand tags), and caption sections underneath the video window.
- **Reels Tab:** View a clean 9:16 vertical video card, with captions aligned to the left of the card, actions to the right, and navigation chevrons to step between items.
- **Collection Management:** View items swiped left on in the **Wishlist** tab, and items swiped right on in the **Cart** tab.
- **Purchase:** Click **Complete Purchase** in the Cart to simulate an order checkout, clearing the cart and creating individual fulfillment records.

### 💼 B. The Seller (Merchant / Designer)
> *"As a seller, I want to upload product video reels and track my order fulfillment so that I can manage my customer sales pipeline."*

- **Onboarding:** Register with a username, email, password, and select the **Seller** role.
- **Sales Dashboard:** Access a high-contrast administration dashboard showing total revenue, order count, active listings, weekly performance SVG charts, and order queue trackers.
- **Fulfillment Tracker:** View orders placed for items they sold, with the ability to update shipping status (`Pending` ➔ `Shipped` ➔ `Delivered`).
- **Catalogue Manager:** Upload new dress reels (video files, titles, brands, prices, sizes) and edit or delete existing active listings.

---

## 3. Database Schema Design (Firestore NoSQL)

Firestore collection structures are laid out as follows:

### 1. `users` (Collection)
Tracks user credentials, roles, preferences, and shopping carts.
```json
{
  "uid": "string (Firebase Auth UID)",
  "email": "string",
  "username": "string",
  "avatarUrl": "string",
  "role": "string ('buyer' | 'seller' | 'admin')",
  "preferences": {
    "theme": "string ('dark' | 'light')",
    "sizes": "array of strings",
    "priceRange": { "min": 0, "max": 10000 }
  },
  "wishlist": ["array of dress document IDs"],
  "cart": ["array of dress document IDs"],
  "createdAt": "string (ISO timestamp)"
}
```

### 2. `dresses` (Collection)
Stores active clothing catalog items and video reels.
```json
{
  "id": "string",
  "title": "string",
  "brand": "string",
  "category": "string",
  "sizes": ["array of strings (e.g., S, M, L)"],
  "price": "number",
  "videoUrl": "string (URL to video file)",
  "thumbnailUrl": "string (URL to poster image)",
  "userId": "string (Seller UID who uploaded it)",
  "isActive": "boolean",
  "viewCount": "number",
  "createdAt": "string (ISO timestamp)"
}
```

### 3. `interactions` (Collection)
Registers buyer swipe behaviors to exclude seen/swiped items from their feeds.
```json
{
  "id": "string (uid_dressId)",
  "userId": "string (Buyer UID)",
  "dressId": "string (Dress ID)",
  "action": "string ('wishlist' | 'buy' | 'skip')",
  "createdAt": "string (ISO timestamp)"
}
```

### 4. `orders` (Collection)
Tracks mock checkout checkouts and shipping statuses.
```json
{
  "id": "string",
  "buyerId": "string (Buyer UID)",
  "buyerUsername": "string",
  "sellerId": "string (Seller UID)",
  "dressId": "string (Dress ID)",
  "dressTitle": "string",
  "dressPrice": "number",
  "dressThumbnail": "string",
  "size": "string",
  "status": "string ('pending' | 'shipped' | 'delivered')",
  "createdAt": "string (ISO timestamp)"
}
```

---

## 4. Technical Constraints & Decisions
- **In-Memory Feed Resolution:** Bypasses composite Firestore index limitations by pulling active documents and filtering out seen interaction IDs inside `dressController.js` in-memory.
- **Stateless Backend Routing:** Express JWT middleware decodes Firebase tokens on every request. Roles are validated dynamically on catalog modification or checkout queries.
- **Modular Test Harnesses:** Frontend UI testing utilizes JSDOM + Vitest, while server API security routes utilize Jest + Supertest.
