
const LoginForm = this.document.getElementById("loginForm");

LoginForm.addEventListener("submit", function (e) {
    e.preventDefault();
  
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
  
    fetch(`http://localhost:3000/users?username=${username}&password=${password}`)
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
  























  
// const LoginForm = document.getElementById("loginForm");
// const loginEmail = document.getElementById("username");
// const loginPassword = document.getElementById("password");

// console.log(loginForm)
// console.log(loginEmail)
// console.log(loginPassword)
// loginForm.addEventListener("submit", (event) => {
//     event.preventDefault();
  
//     fetch("http://localhost:3000/users")
//       .then((response) => response.json())
//       .then((data) => {
//         const user = data.find(
//           (user) =>
//             user.username === loginEmail.value.trim() &&
//             user.password === loginPassword.value.trim()
//         );
//         if (user) {
//           console.log("✅ Login successful:", user);
//           loginForm.reset();
//           localStorage.setItem("user", JSON.stringify(user));
//           alert("OK");
//           window.location.href = "./../home/home.html";
//         } else {
//           alert("Invalid email or password.");
//         }
//       }).catch((error) => {
//         console.error("Error:", error);
//         alert("There was a problem with login");
//       });
// });