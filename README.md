# Hotel Booking API Web Application

This is a web application that uses a JSON Server as the backend API to manage users, products, cart, and reviews.

## How to Run the Application

### 1. Start the Backend Server

First, you need to start the JSON Server that acts as the backend API:

```bash
cd database
npm start
```

This will start the JSON Server on `http://localhost:3000` with the following endpoints:
- `http://localhost:3000/users` - User management
- `http://localhost:3000/products` - Product catalog
- `http://localhost:3000/cart` - Shopping cart
- `http://localhost:3000/reviews` - Product reviews

### 2. Open the Web Application

Once the server is running, you can open the web application by:

1. Opening `index.html` in your web browser, or
2. Using a local web server to serve the static files

The application will automatically redirect to `home/home.html`.

## Application Features

- **User Authentication**: Login system with admin, seller, and customer roles
- **Product Management**: Browse and manage products
- **Shopping Cart**: Add/remove items from cart
- **Reviews**: Product review system
- **Admin Panel**: User and product administration
- **Seller Dashboard**: Product management for sellers

## Default Users

The application comes with pre-configured users:

- **Admin**: admin@gmail.com / 123456
- **Seller**: seller@gmail.com / 112233
- **Seller2**: seller2@gmail.com / 123123

## Troubleshooting

If you see "Unable to connect to web server" or similar errors:

1. Make sure the JSON Server is running on port 3000
2. Check that no firewall is blocking port 3000
3. Verify the database/db.json file exists and is valid JSON

## Project Structure

```
├── index.html              # Main entry point
├── home/                   # Home page components
├── auth/                   # Authentication pages
├── admin/                  # Admin panel
├── seller/                 # Seller dashboard
├── product-details/        # Product detail pages
├── cart/                   # Shopping cart
├── order/                  # Order management
├── assets/                 # Static assets (CSS, JS, images)
├── database/              # Backend API
│   ├── db.json           # Database file
│   ├── package.json      # Server dependencies
│   └── start-server.js   # Server startup script
└── README.md             # This file
```