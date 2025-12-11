// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const errorEl = document.getElementById("loginError");

    errorEl.textContent = "";

    try {
      const data = await apiRequest("/auth/login", "POST", { email, password });
      saveUserAndToken(data.user, data.token);

      if (data.user.role === "admin") {
        window.location.href = "admin/admin-dashboard.html";
      } else {
        window.location.href = "home.html";
      }
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

// REGISTER
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    const errorEl = document.getElementById("regError");
    const successEl = document.getElementById("regSuccess");

    errorEl.textContent = "";
    successEl.textContent = "";

    try {
      const data = await apiRequest("/auth/register", "POST", {
        name,
        email,
        password,
      });

      successEl.textContent = data.message;
      registerForm.reset();
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}
