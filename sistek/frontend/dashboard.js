const user = JSON.parse(localStorage.getItem("currentUser"));

if (!user) {
  window.location.href = "login.html";
}

// 👇 AQUÍ VA LO DEL ROL
document.getElementById("userName").innerText = 
  "Usuario: " + user.name + " | Rol: " + user.role;

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}