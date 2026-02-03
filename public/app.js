const tg = window.Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe.user;

if (!user) {
  alert("Открой через Telegram");
}

// Создаём пользователя в базе
fetch(`/api/user?id=${user.id}&username=${user.username || ""}`)
  .then(() => {
    console.log("User synced");
  });

// Навигация
const pages = {
  cases: document.getElementById("page-cases"),
  upgrade: document.getElementById("page-upgrade"),
  craft: document.getElementById("page-craft"),
  profile: document.getElementById("page-profile"),
  settings: document.getElementById("page-settings"),
  admin: document.getElementById("page-admin"),
};

function showPage(name) {
  Object.values(pages).forEach(p => p.style.display = "none");
  pages[name].style.display = "block";
}

// по умолчанию
showPage("cases");
