const themeBtn = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("fp_theme");

if (savedTheme === "light") {
  document.body.classList.add("light-mode");
}

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("fp_theme", document.body.classList.contains("light-mode") ? "light" : "dark");
  });
}
