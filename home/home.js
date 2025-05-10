/** Start NavBar in samll Screens */
const lineDash = document.querySelector(".line-dash");
const navLinks = document.querySelector(".links");
lineDash.addEventListener("click", () => {
    lineDash.classList.toggle("active");
    navLinks.classList.toggle("active");
});
navLinks.addEventListener("click", (event) => {
  if (event.target.tagName === 'A') {
    lineDash.classList.remove("active");
    navLinks.classList.remove("active");
  }
});/** End NavBar in samll Screens */

// if (!user || user.role !== "customer") {
//   window.location.href = "../auth/login.html";
// }
window.addEventListener("load", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const logout = document.getElementById("logout");
  const login = document.getElementById("login");
  const welcomeMessage = document.getElementById("username");
  const cart = document.getElementById("cart-link");
  const ordersLink = document.getElementById("orders-link");
 

  if (!user) {
    logout.style.display = "none";
    cart.style.display = "none";
    ordersLink.style.display = "none";
    login.style.display = "block";
    login.style.padding = "10px";
  } else {
    logout.style.display= "block";
    cart.style.display = "block";
    ordersLink.style.display = "block";
    login.style.display = "none";
  }
  login.addEventListener("click", function () {
    window.location.href = "./../auth/auth.html";
  });
    // console.log(user)
  cart.addEventListener("click", (e) => {
    e.preventDefault(); 
    window.location.href = "../cart/cart.html";
  });

  /**Welcome Message */
  function updateWelcomeMessage() {
  const now = new Date();
  console.log(now)
  const hour = now.getHours();
  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning, ';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon, ';
  } else {
    greeting = 'Good evening, ';
  }

  welcomeMessage.innerText = greeting + user.username + '!';
  }
  if (user && user.username) {
    updateWelcomeMessage();
  } else {
    welcomeMessage.innerText = 'Welcome, Customer!'
  }

  logout.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "../auth/login.html";
    console.log("User logged out.");
  });
  //fetch products to display in layout
  const searchInput = document.querySelector(".search-container input");
  const grid = document.querySelector(".product-grid");
  let allproducts = [];
  fetch("http://localhost:3000/products")
    .then((res) => res.json())
    .then((products) => {      
      function renderProducts(products) {
        grid.innerHTML = ""; //clear old products

        products.forEach((product) => {
          const card = document.createElement("div");
          card.classList.add("product-card");

          card.innerHTML = `
              <img src="${product.image}" alt="${product.name}">
              <div class = "product-content" >
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p><strong>${product.price} EGP</strong></p>
              </div>
              <button class="btn add-to-cart-btn">Add to Cart</button>
          `;

          const addToCartBtn = card.querySelector(".add-to-cart-btn");

          addToCartBtn.addEventListener("click", (e) => {
            if(!user){
              alert("Please log in to able to add products to cart.")
            }
          fetch("http://localhost:3000/cart")
            .then((res) => res.json())
            .then((orders) => {
              const userOrder = orders.find((order) => order.user.id === user.id);

              //First, IF user HAS Already A Basket..
              if (userOrder) {
                const existingProduct = userOrder.products.find(
                  (p) => p.id === product.id);

                let updatedProducts;
                // IF User has a basket and product is already inside it.
                if (existingProduct) {
                  updatedProducts = userOrder.products.map((p) => {
                    if (p.id === product.id) {
                      return { ...p, quantity: (p.quantity || 1) + 1 };
                    }
                    return p;
                  });
                } else { // IF User has a basket and first product of its type.
                  updatedProducts = [
                    ...userOrder.products,
                    {
                      id: product.id,
                      image: product.image,
                      name: product.name,
                      price: product.price,
                      description: product.description,
                      quantity: 1,
                      sellerid: product.sellerid
                    },
                  ];
                }
                //update old Basket with products
                fetch(`http://localhost:3000/cart/${userOrder.id}`, {
                  method: "PATCH",
                  headers: {"Content-Type": "application/json"},
                  body: JSON.stringify({ products: updatedProducts }),
                  
                }).then(() => {
                    console.log(`"${product.name}" updated in cart.`);
                  })
                  .catch((err) => console.error("Failed to update order:", err));

                  //IF User Hasn't a Basket, THen Create one For him.
              } else {
                fetch("http://localhost:3000/cart", {
                  method: "POST",
                  headers: {"Content-Type": "application/json"},
                  body: JSON.stringify({
                    user: {
                      id: user.id,
                      email: user.email,
                    },
                    products: [
                      {
                        id: product.id,
                        image: product.image,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        quantity: 1,
                        sellerid: product.serllerid
                      },
                    ],
                  }),
                })
                  .then(() => {
                    console.log(`New cart created and "${product.title}" added.`);

                  })
                  .catch((err) => console.error("Failed to create new order:", err));
              }

            }).catch((err) => console.error("Failed to fetch orders:", err));
        });

          grid.appendChild(card);
        });//end of foreach
      }//end of function

      allproducts = products.filter(product => product.status === "approved");
      renderProducts(allproducts);
      //Search Input
      searchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase();
        const filteredProducts = allproducts.filter(product =>
          product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query)
        );
        renderProducts(filteredProducts);
      });

    }).catch((err) => {
      console.error("Failed to fetch products:", err);
      grid.innerHTML = "<p>Unable to load products right now.</p>";
    });


 
});










