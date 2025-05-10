const user = JSON.parse(localStorage.getItem("user")); 
document.getElementById("go-shopping").addEventListener("click", function() {
  window.location.href = "../home/home.html";
});

fetch("http://localhost:3000/orders")
  .then(response => response.json())
  .then(data => {
    const userOrders = data.filter(order => order.user.id === user.id);
    console.log(userOrders)
    const ordersContainer = document.getElementById("ordersContainer");

    if (userOrders.length === 0) {
      container.innerHTML = `
      <div class = "info">
        <p>You Have No orders Yet!</p>
      </div>`
      return;
    }
    document.getElementById("info").style.display = "block";
    
    userOrders.forEach((order, index)=> {
      const orderCard = document.createElement("div");
      orderCard.classList.add("order-card");
      
      const productCards = order.products.map(p =>  
        `<div class="product-card">
            <img src="${p.image}" alt="${p.name}"/>
            <div>
              <p><strong>${p.name}</strong></p>
              <p>Quantity: ${p.quantity} items</p>
              <p>SubTotal: ${Number(p.price) * Number(p.quantity)} EGP</p>
              <p class = "${order.status}">Status: <strong><span>${order.status}</strong></span></p>
            </div>
        </div><br>
       `).join("");

      orderCard.innerHTML = `
        <div class = "order-card-head">
            <h3>Order ID:  #${order.id || Math.floor(Math.random() * 100000)}</h3>
            <a href = "#">Details</a>
        </div>
        ${productCards}
        `;
      
      ordersContainer.appendChild(orderCard);
    });


});
