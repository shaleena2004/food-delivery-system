# BiteFlow — Food Delivery Management System
Full-Stack Practical Project with Microservices Architecture

BiteFlow is a full-featured, microservice-powered food delivery platform built with **Node.js/Express**, **MongoDB/Mongoose**, and **React 18 + Vite + Tailwind CSS v4**.


## 1. System Architecture

The solution comprises five independent backend microservices and one single-page React frontend.

```
food-delivery-system/
│
├── auth-service/           # Port 5001 - Authentication, JWT, and Role RBAC
├── restaurant-service/     # Port 5002 - Restaurant Profiles & Categorized Menus
├── order-service/          # Port 5003 - Authoritative Order Calculation & Lifecycle
├── delivery-service/       # Port 5004 - Delivery Assignments & Real-Time Sync
├── customer-service/       # Port 5005 - Customer Profiles & Address Book
├── frontend/               # Port 3000 - React + Vite + Tailwind CSS v4 SPA
├── docker-compose.yml      # Orchestration of all 6 services + MongoDB
└── README.md
```

### Microservices Overview

| Service | Port | Primary Responsibility |
|---|---|---|
| **Auth Service** | `5001` | User registration, bcrypt hashing, JWT issuance & verification, role management (`CUSTOMER`, `RESTAURANT_ADMIN`, `DELIVERY_PERSON`, `ADMIN`), account status |
| **Restaurant Service** | `5002` | Restaurant details, cuisine filtering, category-based menus, item pricing, live availability toggles |
| **Order Service** | `5003` | Authoritative item validation, subtotal/fee/total calculation, order status lifecycle, cancellation rules |
| **Delivery Service** | `5004` | Delivery record creation on `READY_FOR_PICKUP`, rider self-assignment, status tracking & sync with Order Service |
| **Customer Service** | `5005` | Customer profile management, delivery address book with default address rules |
| **Frontend (React)** | `3000` | BiteFlow Single Page Application built with Vite, Tailwind CSS v4, Context API, and role-based routing |


## 2. Demo User Accounts

The database seeds with the following pre-configured demo accounts:

| Role | Email | Password | Allowed Landing Area |
|---|---|---|---|
| **Customer** | `customer@biteflow.com` | `Customer123!` | `/restaurants` (Browse, Cart, Orders, Profile) |
| **Restaurant Owner** | `owner@biteflow.com` | `Owner123!` | `/my-restaurant`, `/menu`, `/incoming-orders` |
| **Delivery Rider** | `delivery@biteflow.com` | `Delivery123!` | `/my-deliveries` (Available Orders, Active Tasks) |
| **System Admin** | `admin@biteflow.com` | `Admin123!` | Full Access & `/admin/users` Management |


## 3. End-to-End Business Flow

1. **Customer Registration & Login**: Customer registers or logs in with JWT authentication stored in localStorage.
2. **Browse Menus**: Customer browses open restaurants and adds items from "Bella Napoli Trattoria" to their cart. Cart enforces single-restaurant orders with user warnings.
3. **Authoritative Checkout**: Customer selects their saved address and submits checkout. The Order Service queries the Restaurant Service directly via HTTP (`/api/menu/validate`) to ensure authoritative prices and item availability.
4. **Order Confirmation & Preparation**: The restaurant owner views the incoming order and advances its status: `PENDING` &rarr; `CONFIRMED` &rarr; `PREPARING` &rarr; `READY_FOR_PICKUP`.
5. **Delivery Dispatch**: When the order transitions to `READY_FOR_PICKUP`, Order Service immediately calls the Delivery Service (`POST /api/deliveries`) to publish an unassigned delivery record.
6. **Rider Acceptance & Tracking**: A logged-in Delivery Rider views available orders in their dashboard, accepts the task (`ASSIGNED`), and progresses through `PICKED_UP` &rarr; `ON_THE_WAY` &rarr; `DELIVERED`.
7. **Two-Way Synchronization**: Every rider update automatically synchronizes with the Order Service via HTTP (`PATCH /api/orders/:id/delivery-status`).
8. **Customer Live Order Tracker**: The customer watches the visual status tracker update in real-time with an automated 10-second polling interval with cleanup.


## 4. Key API Endpoints

### Auth Service (Port 5001)
- `GET  /health` - Service health status
- `POST /api/auth/register` - Register new user (rejects ADMIN)
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET  /api/auth/me` - Authenticated user profile
- `GET  /api/auth/users` - List all users (ADMIN only)
- `PATCH /api/auth/users/:id/status` - Activate/deactivate user (ADMIN only)

### Restaurant Service (Port 5002)
- `GET  /health` - Service health status
- `GET  /api/restaurants` - List restaurants with `search` & `cuisine` query filters
- `GET  /api/restaurants/:id` - Get restaurant details
- `GET  /api/restaurants/my-restaurant` - Get owner's restaurant
- `POST /api/restaurants` - Create restaurant (Owner / Admin)
- `PUT  /api/restaurants/:id` - Update restaurant (Owner / Admin)
- `PATCH /api/restaurants/:id/status` - Toggle OPEN / CLOSED
- `GET  /api/menu/restaurant/:restaurantId` - Get menu (filters available for public)
- `POST /api/menu/restaurant/:restaurantId` - Add dish (Owner / Admin)
- `PUT  /api/menu/item/:itemId` - Update dish & availability (Owner / Admin)
- `DELETE /api/menu/item/:itemId` - Delete dish (Owner / Admin)
- `POST /api/menu/validate` - Authoritative item pricing lookup (Internal/Order Service)

### Order Service (Port 5003)
- `GET  /health` - Service health status
- `POST /api/orders` - Place new order (Customer)
- `GET  /api/orders/my-orders` - Customer's order history
- `GET  /api/orders/restaurant/:restaurantId` - Orders for a specific restaurant
- `GET  /api/orders/:id` - Order details & status history
- `PATCH /api/orders/:id/status` - Update status or cancel (Customer / Owner)
- `PATCH /api/orders/:id/delivery-status` - Sync delivery progress (Internal/Delivery Service)

### Delivery Service (Port 5004)
- `GET  /health` - Service health status
- `POST /api/deliveries` - Create delivery record (from Order Service)
- `GET  /api/deliveries/available` - Unassigned deliveries waiting for rider
- `GET  /api/deliveries/my-deliveries` - Rider's accepted & completed deliveries
- `GET  /api/deliveries/order/:orderId` - Get delivery by order ID
- `PATCH /api/deliveries/:id/accept` - Accept an available delivery
- `PATCH /api/deliveries/:id/status` - Update delivery progress (`PICKED_UP`, `ON_THE_WAY`, `DELIVERED`, `FAILED`)

### Customer Service (Port 5005)
- `GET  /health` - Service health status
- `GET  /api/customers/profile` - Get customer profile
- `PUT  /api/customers/profile` - Update customer profile details
- `GET  /api/customers/addresses` - List customer addresses
- `POST /api/customers/addresses` - Add address (first address auto-defaults)
- `PUT  /api/customers/addresses/:id` - Update address
- `DELETE /api/customers/addresses/:id` - Delete address
- `PATCH /api/customers/addresses/:id/default` - Mark as default address


## 5. Running the Application

### Option A: Using Docker Compose (Recommended for Evaluation)

Ensure Docker Desktop is running, then execute from the project root:

```bash
docker compose up --build
```

All 6 containers will spin up together:
- Frontend: `http://localhost:3000`
- Auth Service: `http://localhost:5001`
- Restaurant Service: `http://localhost:5002`
- Order Service: `http://localhost:5003`
- Delivery Service: `http://localhost:5004`
- Customer Service: `http://localhost:5005`
- MongoDB: `localhost:27017`

### Option B: Running Locally Outside Docker

All backend services include an automatic persistent local store fallback if a local MongoDB instance is not active.

1. **Start Backend Services**:
   ```bash
   # Terminal 1
   cd auth-service && npm start

   # Terminal 2
   cd restaurant-service && npm start

   # Terminal 3
   cd order-service && npm start

   # Terminal 4
   cd delivery-service && npm start

   # Terminal 5
   cd customer-service && npm start
   ```

2. **Start React Frontend**:
   ```bash
   # Terminal 6
   cd frontend
   npm run dev
   ```

3. Open **`http://localhost:3000`** in your browser.

---

## 6. Frontend Component Architecture Highlights

- **Vite + Tailwind CSS v4**: Modern `@tailwindcss/vite` integration without UI component libraries.
- **App Shell & React Router**: Nested layouts with `<Outlet />`, `useParams`, and active route indicator pills.
- **Custom Hooks**:
  - `useFetch`: Handles API lifecycle, `AbortController` cleanup on unmount, and manual `res.ok` status validation.
  - `useForm`: Controlled inputs, validation rules, touched state tracking, and disabled submit states.
- **Component Composition (Week 5)**:
  - **Compound Card**: `Card`, `Card.Header`, `Card.Body`, `Card.Footer` used for restaurants and orders.
  - **Panel**: Named slots (`title`, `subtitle`, `badge`, `actions`, `footer`, `children`).
  - **DataState**: Children-as-function component handling loading, error with retry, and empty states.
- **Context API (Week 6)**:
  - `AuthContext`: Session recovery from localStorage, 401 interceptor auto-logout, and role enforcement.
  - `CartContext`: Single-restaurant basket guard with conflict warning modal, dynamic pricing calculations.
