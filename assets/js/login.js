
const LoginForm = this.document.getElementById("loginForm");

LoginForm.addEventListener("submit", function (e) {
    e.preventDefault();
  
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
  
    fetch(`http://localhost:3000/users?email=${email}&password=${password}`)
      .then(res => res.json())
      .then(data => {
        // console.log(data)
        if (data.length === 1) {
          const user = data[0];
          localStorage.setItem("user", JSON.stringify(user));
         // alert(`Welcome ${user.username}!`);

          switch (user.role) {
            case "admin":
              window.location.href = "./../admin/admin.html";
              break;
            case "seller":
              window.location.href = "./../seller/seller.html";
              break;
            case "customer":
              window.location.href = "./../home/home.html";
              break;
            default:
              alert("Unknown role. Please contact support.");
          }
  
        } else {
          document.getElementById("loginError").textContent = "Invalid Email or Password";
        }
      })
      .catch(err => {
        console.error("Login error:", err);
        document.getElementById("loginError").textContent = "Server error. Try again later.";
      });
  });
  







































