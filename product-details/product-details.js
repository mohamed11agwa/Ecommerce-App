
window.addEventListener("load", function() {
    const productId = localStorage.getItem("productId");
    const user = JSON.parse(localStorage.getItem("user"));
 
    const productDetails = this.document.querySelector(".product-details");
    const reviewsContainer = this.document.querySelector(".reviews-container");
    fetch(`http://localhost:3000/products/${productId}`)
    .then((res) => res.json())
    .then((product) => {

      productDetails.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <div class="product-info">
          <h2>${product.name}</h2>
          <p class="price">${product.price} EGP</p>
          <p>${product.description}</p>
        </div>
        <div class="add-to-cart-box">
          <button class="add-to-cart">Add to Cart</button>
        </div>
      `;

      reviewsContainer.innerHTML = `
          <h3>Comments</h3>
          <form id="review-form" style="margin-bottom: 20px;">
            <textarea id="review-text" placeholder="Write your review..." required></textarea>
            <button type="submit">Post</button>
          </form>
          <div id="reviews-list"></div>
      `;
        setupReviewForm(product.id);
        loadReviews(product.id);
      const addToCartBtn = document.querySelector(".add-to-cart");
      addToCartBtn.addEventListener("click", () => {
        if (!user) {
            alert("Please log in to add products to cart.");
            window.location.href = "../auth/login.html";
            return;
        }

    // Get existing cart
    fetch("http://localhost:3000/cart")
        .then((res) => res.json())
        .then((orders) => {
        const userOrder = orders.find((order) => order.user.id === user.id);

        // Product info to add
        const productToAdd = {
            id: product.id,
            image: product.image,
            name: product.name,
            price: product.price,
            description: product.description,
            quantity: 1,
            sellerid: product.sellerid || product.serllerid // typo fallback
        };

        // If user already has a cart
        if (userOrder) {
            const existingProduct = userOrder.products.find((p) => p.id === product.id);

            let updatedProducts;
            if (existingProduct) {
            updatedProducts = userOrder.products.map((p) => {
                if (p.id === product.id) {
                return { ...p, quantity: (p.quantity || 1) + 1 };
                }
                return p;
            });
            } else {
            updatedProducts = [...userOrder.products, productToAdd];
            }

            // PATCH to update existing cart
            fetch(`http://localhost:3000/cart/${userOrder.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products: updatedProducts }),
            })
            .then(() => {
            alert("Product added to your cart.");
            })
            .catch((err) => console.error("Failed to update cart:", err));
        }

        // If user doesn't have a cart
        else {
            fetch("http://localhost:3000/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user: {
                id: user.id,
                email: user.email,
                },
                products: [productToAdd],
            }),
            })
            .then(() => {
            alert("Cart created and product added.");
            })
            .catch((err) => console.error("Failed to create cart:", err));
          }
        }).catch((err) => console.error("Failed to fetch cart:", err));
    });

        function setupReviewForm(productId) {
    const form = document.getElementById("review-form");
    const textarea = document.getElementById("review-text");
    const reviewsList = document.getElementById("reviews-list");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!user) {
        alert("Please log in to post a comment.");
        window.location.href = "../auth/login.html";
        return;
        }

        const commentText = textarea.value.trim();
        if (!commentText) return;

        const newReview = {
        productid: productId,
        comment: commentText,
        date: new Date().toLocaleDateString("en-GB"),
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
            role: user.role
        }
        };

        fetch("http://localhost:3000/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
        })
        .then(res => res.json())
        .then(savedReview => {
        const reviewElement = document.createElement("div");
        reviewElement.classList.add("single-review");
        reviewElement.style.marginBottom = "10px";
        reviewElement.innerHTML = `
            <strong>${savedReview.user.username}</strong> <small>${savedReview.date}</small>
            <p>${savedReview.comment}</p>
            <hr />
        `;
        reviewsList.prepend(reviewElement);
        textarea.value = "";
        })
        .catch(err => {
        console.error("Failed to post review:", err);
        });
    });
    }
    function loadReviews(productId) {
    const reviewsList = document.getElementById("reviews-list");

    fetch(`http://localhost:3000/reviews?productid=${productId}`)
        .then(res => res.json())
        .then(reviews => {
        reviewsList.innerHTML = ""; // امسح القديم

        reviews.forEach(review => {
            const reviewElement = document.createElement("div");
            reviewElement.classList.add("single-review");
            reviewElement.style.marginBottom = "10px";
            reviewElement.innerHTML = `
            <strong>${review.user.username}</strong> <small>${review.date}</small>
            <p>${review.comment}</p>
            <hr />
            `;
            reviewsList.appendChild(reviewElement);
        });
        })
        .catch(err => {
        console.error("Failed to load reviews:", err);
        });
    }



    })
    .catch((err) => {
      console.error("Failed to fetch product:", err);
    });


});