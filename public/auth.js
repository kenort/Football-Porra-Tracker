const setupBlock = document.getElementById("setup-block");
const loginBlock = document.getElementById("login-block");
const forgotBlock = document.getElementById("forgot-block");
const bootSplash = document.getElementById("boot-splash");
const setupForm = document.getElementById("setup-form");
const loginForm = document.getElementById("login-form");
const forgotForm = document.getElementById("forgot-form");
const setupStatus = document.getElementById("setup-status");
const loginStatus = document.getElementById("login-status");
const forgotStatus = document.getElementById("forgot-status");
const forgotPasswordTrigger = document.getElementById("forgot-password-trigger");
const forgotBack = document.getElementById("forgot-back");
const loginAboutTrigger = document.getElementById("login-about-trigger");
const loginAboutModal = document.getElementById("login-about-modal");
const loginAboutClose = document.getElementById("login-about-close");

const setupName = document.getElementById("setup-name");
const setupEmail = document.getElementById("setup-email");
const setupPassword = document.getElementById("setup-password");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const forgotEmail = document.getElementById("forgot-email");

initialize();
bindPasswordToggles();

setupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();

  try {
    await postJson("/api/setup/superadmin", {
      displayName: setupName.value.trim(),
      email: setupEmail.value.trim(),
      password: setupPassword.value,
    });
    window.location.replace("/dashboard");
  } catch (error) {
    setupStatus.textContent = error.message;
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();

  try {
    await postJson("/api/auth/login", {
      email: loginEmail.value.trim(),
      password: loginPassword.value,
    });
    window.location.replace("/dashboard");
  } catch (error) {
    loginStatus.textContent = error.message;
  }
});

forgotForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();

  try {
    const payload = await postJson("/api/auth/forgot-password", {
      email: forgotEmail.value.trim(),
    });
    forgotStatus.textContent = payload.message;
    forgotForm.reset();
  } catch (error) {
    forgotStatus.textContent = error.message;
  }
});

forgotPasswordTrigger.addEventListener("click", () => {
  clearMessages();
  loginBlock.hidden = true;
  forgotBlock.hidden = false;
});

forgotBack.addEventListener("click", () => {
  clearMessages();
  forgotBlock.hidden = true;
  loginBlock.hidden = false;
});

loginAboutTrigger?.addEventListener("click", () => {
  if (!loginAboutModal) return;
  loginAboutModal.hidden = false;
});

loginAboutClose?.addEventListener("click", closeLoginAbout);

loginAboutModal?.addEventListener("click", (event) => {
  if (event.target === loginAboutModal) closeLoginAbout();
});

async function initialize() {
  try {
    const bootstrap = await getJson("/api/bootstrap");
    if (bootstrap.authenticated) {
      window.location.replace("/dashboard");
      return;
    }

    setupBlock.hidden = !bootstrap.setupRequired;
    loginBlock.hidden = Boolean(bootstrap.setupRequired);
    forgotBlock.hidden = true;
  } catch (error) {
    loginBlock.hidden = false;
    setupBlock.hidden = true;
    forgotBlock.hidden = true;
    loginStatus.textContent = error.message;
  } finally {
    hideBootSplash();
  }
}

async function getJson(url) {
  const response = await fetch(url, { credentials: "same-origin" });
  return handleResponse(response);
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "same-origin",
  });
  return handleResponse(response);
}

async function handleResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Ocurrió un error.");
  }

  return payload;
}

function clearMessages() {
  setupStatus.textContent = "";
  loginStatus.textContent = "";
  forgotStatus.textContent = "";
}

function bindPasswordToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.togglePassword || "");
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "Ocultar" : "Ver";
    });
  });
}

function hideBootSplash() {
  if (!bootSplash) return;
  bootSplash.hidden = true;
}

function closeLoginAbout() {
  if (!loginAboutModal) return;
  loginAboutModal.hidden = true;
}
