document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
  
    fetch(`http://localhost:3000/users?username=${username}&password=${password}`)
      .then(res => res.json())
      .then(data => {
        if (data.length === 1) {
          const user = data[0];
          localStorage.setItem("user", JSON.stringify(user));
         // alert(`Welcome ${user.username}!`);

          switch (user.role) {
            case "admin":
              window.location.href = "admin/admin.html";
              break;
            case "seller":
              window.location.href = "seller/seller.html";
              break;
            case "customer":
              window.location.href = "customer/customer.html";
              break;
            default:
              alert("Unknown role. Please contact support.");
          }
  
        } else {
          document.getElementById("loginError").textContent = "Invalid credentials";
        }
      })
      .catch(err => {
        console.error("Login error:", err);
        document.getElementById("loginError").textContent = "Server error. Try again later.";
      });
  });
  