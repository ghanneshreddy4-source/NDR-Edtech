// admin/js/admin-auth.js

// ===============================
// ADMIN AUTH HELPERS
// ===============================

// Get stored user
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("ndr_user"));
  } catch {
    return null;
  }
}

// Get stored token
function getToken() {
  return localStorage.getItem("ndr_token");
}

// Save user + token after login
function saveUserAndToken(user, token) {
  localStorage.setItem("ndr_user", JSON.stringify(user));
  localStorage.setItem("ndr_token", token);
}

// Require admin access
function requireAuthAdmin() {
  const user = getUser();
  const token = getToken();

  if (!user || !token || user.role !== "admin") {
    window.location.href = "admin-login.html";
    return null;
  }

  return user;
}

// ===============================
// ADMIN LAYOUT RENDER
// ===============================

function renderAdminLayout(pageTitle) {
  const user = getUser();

  const layoutHtml = `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <div class="sidebar-logo-pill">N</div>
            <div class="sidebar-logo-text">
              <span class="logo-main">NDR</span>
              <span class="logo-sub">Admin Console</span>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="sidebar-section-label">Overview</div>
          <a href="admin-dashboard.html" class="sidebar-link" id="admin-nav-dashboard">
            <span class="icon-bullet">●</span>
            <span>Dashboard</span>
          </a>

          <div class="sidebar-section-label">Content</div>
          <a href="add-course.html" class="sidebar-link" id="admin-nav-course">
            <span class="icon-bullet">●</span>
            <span>Courses</span>
          </a>
          <a href="add-topic.html" class="sidebar-link" id="admin-nav-topic">
            <span class="icon-bullet">●</span>
            <span>Topics</span>
          </a>
          <a href="add-test.html" class="sidebar-link" id="admin-nav-test">
            <span class="icon-bullet">●</span>
            <span>Topic Tests</span>
          </a>
          <a href="add-major-test.html" class="sidebar-link" id="admin-nav-major">
            <span class="icon-bullet">●</span>
            <span>Major Tests</span>
          </a>

          <div class="sidebar-section-label">Students</div>
          <a href="approve-users.html" class="sidebar-link" id="admin-nav-users">
            <span class="icon-bullet">●</span>
            <span>Approve Users</span>
          </a>
          <a href="announcements.html" class="sidebar-link" id="admin-nav-ann">
            <span class="icon-bullet">●</span>
            <span>Announcements</span>
          </a>
          <a href="queries.html" class="sidebar-link" id="admin-nav-queries">
            <span class="icon-bullet">●</span>
            <span>Student Queries</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a href="../logout.html" class="sidebar-link sidebar-link-logout">
            <span>Logout</span>
          </a>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div class="topbar-left">
            <div class="topbar-title">${pageTitle || "Admin Panel"}</div>
            <div class="topbar-breadcrumb">NDR Web • Admin</div>
          </div>
          <div class="topbar-right">
            <div class="topbar-user-chip">
              <div class="user-avatar">${user && user.name ? user.name[0].toUpperCase() : "A"}</div>
              <div class="user-meta">
                <div class="user-name">${user?.name || "Admin"}</div>
                <div class="user-email">${user?.email || ""}</div>
              </div>
            </div>
          </div>
        </header>

        <section class="content" id="adminPageContent"></section>
      </main>
    </div>
  `;

  document.body.innerHTML = layoutHtml;
}

function setAdminNavActive(id) {
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.classList.toggle("active", link.id === id);
  });
}

// ===============================
// ADMIN LOGIN LOGIC
// ===============================

const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("adminLoginEmail").value.trim();
    const password = document.getElementById("adminLoginPassword").value.trim();
    const errorEl = document.getElementById("adminLoginError");

    errorEl.textContent = "";

    try {
      const data = await apiRequest("/auth/login", "POST", { email, password });

      // Verify admin role
      if (!data.user || data.user.role !== "admin") {
        throw new Error("Invalid admin account");
      }

      // Save session
      saveUserAndToken(data.user, data.token);

      // Redirect to admin dashboard
      window.location.href = "admin-dashboard.html";
    } catch (err) {
      errorEl.textContent = err.message || "Login failed";
    }
  });
}
