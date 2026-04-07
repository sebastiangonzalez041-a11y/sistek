function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (name === "" || email === "" || password === "") {
    alert("Todos los campos son obligatorios");
    return;
  }

  // Obtener usuarios guardados
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Verificar si ya existe
  const existe = users.find(user => user.email === email);

  if (existe) {
    alert("Este correo ya está registrado");
    return;
  }

  // Guardar nuevo usuario
 users.push({ name, email, password, role: "usuario" });

  localStorage.setItem("users", JSON.stringify(users));

  alert("Registro exitoso");

  // Redirigir al login
  window.location.href = "login.html";
}