// Dark mode manager
(function (global) {
  "use strict";
  var KEY = "ecg-theme";
  var Theme = {};

  Theme.get = function () {
    try {
      return localStorage.getItem(KEY) || "light";
    } catch (e) {
      return "light";
    }
  };

  Theme.apply = function (t) {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    $(".theme-icon").text(t === "dark" ? "☀️" : "🌙");
  };

  Theme.set = function (t) {
    try {
      localStorage.setItem(KEY, t);
    } catch (e) {}
    Theme.apply(t);
  };

  Theme.toggle = function () {
    Theme.set(Theme.get() === "dark" ? "light" : "dark");
  };

  // Apply immediately (before DOM ready to avoid flash)
  Theme.apply(Theme.get());

  $(function () {
    Theme.apply(Theme.get());
    $(document).on("click", ".btn-theme", Theme.toggle);
  });

  global.ECG_THEME = Theme;
})(window);
