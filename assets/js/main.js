const form = document.querySelector(".register-container");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const user = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value
    };

    // Check if email exists first
    fetch(`http://localhost:3000/users`)
        .then(res => res.json())
        .then(existingUsers => {
            const emailExists = existingUsers.some(existingUser => existingUser.email === user.email);
            if (emailExists) {
                alert("This email is already registered.");
                return; // Stop the registration process
            }

            // If email doesn't exist, proceed with registration
            fetch("http://localhost:3000/users", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(user)
            }).then(async res => {
                console.log("Response status:", res.status);
                const data = await res.json();
                console.log("User created:", data);
                console.log("Registered successfully!");
                console.log("Redirecting now...");
                window.location.href = "login.html";
            }).catch(e => console.error("Registration failed:", e));
        })
        .catch(e => console.error("Error checking email:", e));
});



// userNameTxt.addEventListener("blur", function()  {
//     if(!isEmailValid(this.value)){
//         userNameError.style.visibility = "visible";
//     } else {
//         userNameError.style.visibility = "hidden";
//     }
// })
// passwordTxt.addEventListener("blur", function(e) {
//     if (!isPassValid(this.value)){
//         passwordError.style.visibility = "visible";
//     } else {
//         passwordError.style.visibility = "hidden"; 
//     }

// })