const user = JSON.parse(localStorage.getItem("user")); 
    fetch("http://localhost:3000/orders")
      .then(response => response.json())
      .then(data => {
        const userOrders = data.filter(order => order.user.id === user.id);
        console.log(userOrders)
        const container = document.getElementById("ordersContainer");

        if (userOrders.length === 0) {
          container.innerHTML = `
          <div>
            <p>You Have No orders Yet!</p>
            <button onclick="window.location.href='../home/home.html'">Go back For Shopping</button>
          </div>`
          return;
        }

        userOrders.forEach(order => {
          const card = document.createElement("div");
          card.classList.add("order-card");

          const date = new Date(order.date || order.orderDate).toLocaleDateString();

          // Product cards
          const productCards = order.products.map(p => `
            <div class="product-card">
              <img src="${p.image}" alt="${p.name}" />
              <p><strong>${p.name}</strong></p>
              <p>${p.quantity} pcs</p>
            </div>
          `).join("");

          card.innerHTML = `
            <h3>Order #${order.id || Math.floor(Math.random() * 100000)}</h3>
            <div class="order-info">
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Total:</strong> $${order.total}</p>
              <p><strong>Status:</strong> <span class="status ${order.status}">${order.status}</span></p>
              <div class="product-list">
                ${productCards}
              </div>
            </div>
          `;

          container.appendChild(card);
        });
      })
      .catch(err => {
        console.error("Failed to load orders:", err);
        document.getElementById("ordersContainer").innerHTML = "<p>Error loading orders.</p>";
      });

    