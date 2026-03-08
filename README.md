# Travox Frontend

Travox is a modern service marketplace platform connecting trusted professionals with customers. This repository contains the frontend implementation built with React and Vite.

## 🚀 Key Features

### For Customers (Users)
- **Service Discovery:** Browse and search for verified professionals across various categories.
- **Secure Bookings:** Instant or scheduled booking of services.
- **Escrow Payments:** Payments are held securely and released only upon service completion.
- **Dashboards:** Manage active bookings, view history, and track payment status.
- **Dispute Resolution:** Raise concerns directly through the platform.

### For Service Providers
- **Profile Management:** Create and manage professional profiles.
- **KYC Verification:** Simple document upload for identity and business verification.
- **Service Listings:** Add and manage services with customizable pricing.
- **Earning Analytics:** Track earnings, pending releases, and withdrawal history.
- **Order Management:** Accept, reject, and manage incoming service requests.

### For Administrators
- **User Management:** Oversee both clients and providers.
- **KYC Approval:** Review and verify provider documentation.
- **Payment Monitoring:** Track platform revenue and manage escrow releases.
- **Dispute Oversight:** Resolve issues between users and providers.

## 🛠️ Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4 & Bootstrap 5
- **Routing:** React Router 7
- **Icons:** Lucide React & React Icons
- **Charts:** Recharts
- **Payment Integration:** Stripe (React Stripe JS)
- **Backend/Auth:** Firebase

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/parasharr/Travox-Frontend.git
   cd travox-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your configuration:
   ```env
   VITE_BASE_URL=your_backend_api_url
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

- `src/admin`: Admin dashboard and management pages.
- `src/provider`: Service provider portal and tools.
- `src/auth`: Global login and registration components.
- `src/Component`: Shared UI components, home, payment, and booking flows.
- `src/pages`: Main entry points like the Landing Page and Profile Page.
- `src/LanguageContext.jsx`: Multi-language support configuration.

## 📄 License
Private project. All rights reserved.
