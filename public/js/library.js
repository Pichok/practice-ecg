// Página Biblioteca — lista todos os casos agrupados por categoria
$(function () {
  var DB = window.ECG_DB;
  var I18N = window.ECG_I18N;

  I18N.mountSelect($("#idioma"));

  function escapar(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function render() {
    var q = ($("#busca").val() || "").trim().toLowerCase();
    var cat = $("#categoria").val();
    var $out = $("#library").empty();
    var groups = DB.porCategoria();
    var cats = Object.keys(groups).sort();
    var totalMatch = 0;

    cats.forEach(function (c) {
      if (cat !== "todas" && c !== cat) return;
      var itens = groups[c].filter(function (item) {
        if (!q) return true;
        var hay = ((item.diagnostico || "") + " " + (item.caso_clinico || "")).toLowerCase();
        return hay.indexOf(q) !== -1;
      });
      if (itens.length === 0) return;
      totalMatch += itens.length;

      var $sec = $(
        '<section class="mb-8">' +
          '<h2 class="mb-3 flex items-baseline gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">' +
          '<span>' + escapar(c) + '</span>' +
          '<span class="text-sm font-normal text-slate-500 dark:text-slate-400">(' +
          itens.length + " " + I18N.t("cases_count") + ")</span>" +
          "</h2>" +
          '<div class="grid grid-cols-1 gap-3 sm:grid-cols-2"></div>' +
          "</section>"
      );
      var $grid = $sec.find(".grid");
      itens.forEach(function (item) {
        var href = "./../caso.html?id=" + encodeURIComponent(item.id);
        var $card = $(
          '<a href="' + href + '" class="block rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-400 hover:shadow dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500">' +
            '<div class="font-semibold text-slate-900 dark:text-slate-100">' + escapar(item.diagnostico || "—") + "</div>" +
            '<div class="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">' + escapar(item.caso_clinico || "") + "</div>" +
            "</a>"
        );
        $grid.append($card);
      });
      $out.append($sec);
    });

    if (totalMatch === 0) {
      $out.append('<p class="text-center text-slate-500 dark:text-slate-400">' + I18N.t("no_results") + "</p>");
    }
  }

  function popularCategorias() {
    var $sel = $("#categoria");
    $sel.empty();
    $sel.append($("<option>").val("todas").text(I18N.t("opt_all")));
    DB.categorias.forEach(function (c) {
      $sel.append($("<option>").val(c).text(c));
    });
  }

  function bootstrap() {
    $("#loading").show();
    $("#library").hide();
    DB.carregar(I18N.currentFile())
      .done(function () {
        $("#loading").hide();
        $("#library").show();
        popularCategorias();
        render();
      })
      .fail(function () {
        $("#loading").hide();
        $("#error").removeClass("hidden");
      });
  }

  I18N.onChange = function () {
    I18N.applyDOM();
    bootstrap();
  };

  $("#categoria").on("change", render);
  $("#busca").on("input", render);

  bootstrap();
});
