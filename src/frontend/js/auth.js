const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

const setToken = (token) => {
  localStorage.setItem("eventflow_token", token);
};

const toggleTab = (tab) => {
  const showLogin = tab === "login";
  loginForm.hidden = !showLogin;
  registerForm.hidden = showLogin;
};

document.querySelectorAll("[data-tab]").forEach((btn) => {
  btn.addEventListener("click", () => toggleTab(btn.dataset.tab));
});

if (window.location.hash === "#register") {
  toggleTab("register");
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMessage.textContent = "";
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }
    setToken(data.token);
    window.location.href = "profile.html";
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  registerMessage.textContent = "";
  const formData = new FormData(registerForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }
    setToken(data.token);
    window.location.href = "profile.html";
  } catch (error) {
    registerMessage.textContent = error.message;
  }
});
