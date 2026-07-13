// Language manager
(function (global) {
  "use strict";
  var KEY = "ecg-lang";

  var LANGS = [
    { code: "pt-BR", label: "Português (BR)", file: "./database-pt-br.json" },
    { code: "en", label: "English", file: "./database-en.json" },
  ];

  var STRINGS = {
    "pt-BR": {
      app_title: "Praticar ECG",
      app_subtitle: "Treinamento de leitura de eletrocardiogramas",
      nav_train: "Treinar",
      nav_library: "Biblioteca",
      label_category: "Categoria:",
      label_language: "Idioma:",
      opt_all: "Todas",
      stat_correct: "Acertos",
      stat_wrong: "Erros",
      stat_rate: "Taxa de acerto",
      stat_progress: "Progresso",
      loading: "Carregando casos clínicos...",
      empty_category: "Nenhum caso encontrado para esta categoria.",
      case_clinical: "Caso clínico",
      click_zoom: "Clique na imagem para ampliar",
      btn_reveal: "Ver Diagnóstico",
      diagnosis: "Diagnóstico",
      interpretation: "Interpretação",
      btn_correct: "✓ Acertei",
      btn_wrong: "✗ Errei",
      btn_reset: "Reiniciar progresso",
      btn_next: "Próximo ECG →",
      confirm_reset: "Reiniciar todo o progresso (acertos e erros)?",
      footer: "Casos e imagens: ecglibrary.com · Uso educacional.",
      library_title: "Biblioteca de Casos",
      search_placeholder: "Buscar por diagnóstico ou caso clínico...",
      cases_count: "casos",
      no_results: "Nenhum caso encontrado.",
      back_to_library: "← Voltar à biblioteca",
      train_this: "Treinar esta categoria",
      case_not_found: "Caso não encontrado.",
      close: "✕ Fechar",
    },
    en: {
      app_title: "Practice ECG",
      app_subtitle: "Electrocardiogram reading training",
      nav_train: "Train",
      nav_library: "Library",
      label_category: "Category:",
      label_language: "Language:",
      opt_all: "All",
      stat_correct: "Correct",
      stat_wrong: "Wrong",
      stat_rate: "Accuracy",
      stat_progress: "Progress",
      loading: "Loading cases...",
      empty_category: "No cases found for this category.",
      case_clinical: "Clinical case",
      click_zoom: "Click the image to zoom",
      btn_reveal: "Show Diagnosis",
      diagnosis: "Diagnosis",
      interpretation: "Interpretation",
      btn_correct: "✓ Correct",
      btn_wrong: "✗ Wrong",
      btn_reset: "Reset progress",
      btn_next: "Next ECG →",
      confirm_reset: "Reset all progress (correct and wrong)?",
      footer: "Cases and images: ecglibrary.com · Educational use.",
      library_title: "Case Library",
      search_placeholder: "Search by diagnosis or clinical case...",
      cases_count: "cases",
      no_results: "No cases found.",
      back_to_library: "← Back to library",
      train_this: "Train this category",
      case_not_found: "Case not found.",
      close: "✕ Close",
    },
  };

  var I18n = {
    langs: LANGS,
    onChange: null,
  };

  I18n.get = function () {
    try {
      var v = localStorage.getItem(KEY);
      if (v && STRINGS[v]) return v;
    } catch (e) {}
    return "pt-BR";
  };

  I18n.set = function (code) {
    try {
      localStorage.setItem(KEY, code);
    } catch (e) {}
    I18n.applyDOM();
    if (typeof I18n.onChange === "function") I18n.onChange(code);
  };

  I18n.t = function (key) {
    var s = STRINGS[I18n.get()] || STRINGS["pt-BR"];
    return s[key] != null ? s[key] : key;
  };

  I18n.fileForLang = function (code) {
    var found = LANGS.filter(function (l) { return l.code === code; })[0];
    return found ? found.file : LANGS[0].file;
  };

  I18n.currentFile = function () {
    return I18n.fileForLang(I18n.get());
  };

  I18n.applyDOM = function () {
    $("[data-i18n]").each(function () {
      $(this).text(I18n.t($(this).data("i18n")));
    });
    $("[data-i18n-placeholder]").each(function () {
      $(this).attr("placeholder", I18n.t($(this).data("i18n-placeholder")));
    });
    $("[data-i18n-html]").each(function () {
      $(this).html(I18n.t($(this).data("i18n-html")));
    });
    // update <html lang>
    document.documentElement.setAttribute("lang", I18n.get());
  };

  I18n.mountSelect = function ($sel) {
    $sel.empty();
    LANGS.forEach(function (l) {
      $sel.append($("<option>").val(l.code).text(l.label));
    });
    $sel.val(I18n.get());
    $sel.on("change", function () {
      I18n.set($(this).val());
    });
  };

  $(function () {
    I18n.applyDOM();
  });

  global.ECG_I18N = I18n;
})(window);
