//window.addEventListener('load',()=>{

    ////////////delete role//////////////////////////////
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      window.location.href = "index.html";
    }

    let table = document.querySelector("#usersTable tbody");

    function loadUsers() {
      fetch("http://localhost:3000/users")
        .then(res => res.json())
        .then(users => {
          table.innerHTML = "";
          users.forEach(u => {
            let row = document.createElement("tr");
            
            let td1 = document.createElement("td");
            td1.innerText=u.id
            let td2 = document.createElement("td");
            td2.innerText=u.username
            let td3= document.createElement("td");
            td3.innerText=u.role
            let td4=document.createElement('td')
            td4.innerHTML=`
             <button onclick="editUser(${u.id}, '${u.username}', '${u.password}', '${u.role}')">Edit</button>
            <button onclick="deleteUser(${u.id})">Delete</button> `

            row.appendChild(td1)
            row.appendChild(td2)
            row.appendChild(td3)
            row.appendChild(td4)

            table.appendChild(row);
          });
        });
       
    }

    loadUsers();
///////////////////add role///////////////////////////////////////////////
let form= document.getElementById("addUserForm");
   form.addEventListener("submit", function (e) {
        e.preventDefault();
      
        let username = document.getElementById("newUsername").value.trim();
        let password = document.getElementById("newPassword").value.trim();
        let role = document.getElementById("newRole").value;
        let id=document.getElementById("newUserid").value.trim();;
      
        if (!username || !password || !role) {
          alert("Please fill in all fields.");
          return;
        }
      
        fetch("http://localhost:3000/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id,username, password, role })
        })
        .then(res => res.json())
        .then(data => {
          //alert("User added successfully!");
          document.getElementById("addUserForm").reset();
          loadUsers();
        })
        .catch(err => {
          console.error("Error adding user:", err);
          alert("Error adding user. Try again.");
        });
      });
      
//})
function deleteUser(id) {
  if (confirm("Are you sure you want to delete this user?")) {
    fetch(`http://localhost:3000/users/${id}`, { method: "DELETE" })
      .then(() => loadUsers());
  }
}

/////////////////edit user//////////////////////
function editUser(id, username, password, role) {
  document.getElementById("editUserId").value = id;
  document.getElementById("editUsername").value = username;
  document.getElementById("editPassword").value = password;
  document.getElementById("editRole").value = role;
  document.getElementById("editUserForm").style.display = "block";
}
document.getElementById("editUserForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("editUserId").value;
  const username = document.getElementById("editUsername").value.trim();
  const password = document.getElementById("editPassword").value.trim();
  const role = document.getElementById("editRole").value;

  fetch(`http://localhost:3000/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({id, username, password, role })
  })
  .then(res => res.json())
  .then(() => {
    alert("User updated successfully!");
    document.getElementById("editUserForm").reset();
    document.getElementById("editUserForm").style.display = "none";
    loadUsers();
  });
});

function cancelEdit() {
  document.getElementById("editUserForm").reset();
  document.getElementById("editUserForm").style.display = "none";
}
///////////////////load Produts///////////////////
function loadProducts() {
  fetch("http://localhost:3000/products")
    .then(res => res.json())
    .then(products => {
      const tableBody = document.querySelector("#productsTable tbody");
      tableBody.innerHTML = "";
      products.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${p.id}</td>
          <td>${p.name}</td>
          <td>${p.description}</td>
          <td>$${p.price}</td>
          <td>${p.status}</td>
          <td>
            ${p.status === "pending" ? `
              <button onclick="approveProduct(${p.id})">Approve</button>
              <button onclick="rejectProduct(${p.id})">Reject</button>
            ` : ""}
            <button onclick="deleteProduct(${p.id})">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    });
}

function approveProduct(id) {
  updateProductStatus(id, "approved");
}

function rejectProduct(id) {
  updateProductStatus(id, "rejected");
}

function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    fetch(`http://localhost:3000/products/${id}`, {
      method: "DELETE"
    }).then(() => loadProducts());
  }
}

function updateProductStatus(id, status) {
  fetch(`http://localhost:3000/products/${id}`)
    .then(res => res.json())
    .then(product => {
      product.status = status;
      return fetch(`http://localhost:3000/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });
    })
    .then(() => loadProducts());
}
loadProducts();


