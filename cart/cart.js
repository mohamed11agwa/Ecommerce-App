window.onload = function () {
    const cartContainer = document.querySelector(".cart-items");
    const totalPriceSpan = document.getElementById("totalPrice");
    const confirmBtn = document.getElementById("confirmBtn");
    const clearBtn = document.getElementById("clearBtn");
    const logout  = document.querySelector("#logout");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("You must be logged in");
      window.location.href = "../auth/login.html";
      return;
    }
    logout.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "../auth/login.html";
      console.log("User logged out.");
    });
    document.getElementById("username").textContent = user.username;
  
    fetch("http://localhost:3000/cart")
      .then(res => res.json())
      .then(allCarts => {
        //console.log(allCarts)
        const userCart = allCarts.find(c => c.user.id === user.id);
        ////////////////////////////////////
        console.log(userCart)
        if (!userCart || userCart.products.length === 0) {
          cartContainer.innerHTML = "<p>Your cart is empty.</p>";
          confirmBtn.style.display = "none";
          clearBtn.style.display = "none";
          totalPriceSpan.style.display = "none";
          return;
        }
        
        let total = 0;
        cartContainer.innerHTML = "";
  
        userCart.products.forEach((product, index) => {
          const item = document.createElement("div");
          item.className = "cart-card"; 

          item.innerHTML = `
          <img src="${product.image}" alt="${product.name}" />
          <div class="product-content">
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            <p>Price: ${product.price} EGP</p>
            <p style="font-size:20px">
              Quantity: 
              <span style="font-size:20px; margin:0px 10px" class="quantity">${product.quantity}</span>
              <button type="button" class="decreaseBtn" data-index="${index}">-</button>
              <button type="button" class="increaseBtn" data-index="${index}">+</button>
            </p>
            <button type="button" class="deleteBtn" data-index="${index}">Delete</button>
          </div>
        `;


          total += product.price * product.quantity;
          cartContainer.appendChild(item);
        });
  
        totalPriceSpan.textContent = total;
        clearBtn.style.display = "inline-block";
        confirmBtn.style.display = "inline-block";
  

        document.querySelectorAll(".deleteBtn").forEach(btn => {
          
          btn.addEventListener("click", function (e) {
            e.preventDefault();
            const productIndex = parseInt(this.getAttribute("data-index"));
            const updatedProducts = userCart.products.filter((_, i) => i !== productIndex);
  
            fetch(`http://localhost:3000/cart/${userCart.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ products: updatedProducts })
            })
              .then(() => console.log("Item deleted (page not reloaded)"))
              .catch(error => console.error("Error deleting item:", error));
          });
        });

      document.querySelectorAll(".increaseBtn").forEach(btn => {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          const index = parseInt(this.getAttribute("data-index"));
          userCart.products[index].quantity += 1;
          updateCart(userCart);
        });
      });

      document.querySelectorAll(".decreaseBtn").forEach(btn => {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          const index = parseInt(this.getAttribute("data-index"));
          if (userCart.products[index].quantity > 1) {
            userCart.products[index].quantity -= 1;
            updateCart(userCart);
          }
        });
      });

        clearBtn.addEventListener("click", function () {
          fetch(`http://localhost:3000/cart/${userCart.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products: [] })
          })
            .then(() => console.log("cart cleared"))
            .catch(error => console.error("Error clearing cart:", error));
        });
        
        confirmBtn.addEventListener("click", function () {
          const order = {
            user: user, 
            products: userCart.products,
            total: userCart.products.reduce((acc, product) => acc + (product.price * product.quantity), 0),
            status: "pending"
          };
          /////******* */
          localStorage.setItem("lastOrder", JSON.stringify(order));
          fetch("http://localhost:3000/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
          })
            .then(() => {
              return fetch(`http://localhost:3000/cart/${userCart.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ products: [] })
              });
            })
            .then(() => {
              window.location.href = "thankyou.html";
            })
            .catch(error => console.error("Error confirming order:", error));
        });
        
        function updateCart(cart) {
          fetch(`http://localhost:3000/cart/${cart.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products: cart.products })
          })
            .then(() => console.log("cart cleared"))
            .catch(error => console.error("Error updating quantity:", error));
        }

      }).catch(error => {
        console.error("Error loading cart:", error);
      });
};
  