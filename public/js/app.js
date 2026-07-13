// Bootstrap da aplicação de treino
$(function () {
  var DB = window.ECG_DB;
  var CASE = window.ECG_CASE;
  var QUIZ = window.ECG_QUIZ;
  var I18N = window.ECG_I18N;

  I18N.mountSelect($("#idioma"));

  function getParamCategoria() {
    var m = window.location.search.match(/[?&]categoria=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function popularCategorias() {
    var $sel = $("#categoria");
    $sel.empty();
    $sel.append($("<option>").val("todas").text(I18N.t("opt_all")));
    DB.categorias.forEach(function (cat) {
      $sel.append($("<option>").val(cat).text(cat));
    });
    var url = getParamCategoria();
    var salvo = QUIZ.getCategoriaSalva();
    var target = url && (url === "todas" || DB.categorias.indexOf(url) !== -1) ? url
      : (salvo && (salvo === "todas" || DB.categorias.indexOf(salvo) !== -1) ? salvo : "todas");
    $sel.val(target);
  }

  function iniciarComCategoria(cat) {
    var lista = DB.aplicarFiltro(cat);
    if (lista.length === 0) {
      $("#case-card").addClass("hidden");
      $("#error-msg").text(I18N.t("empty_category"));
      $("#error").removeClass("hidden");
      return;
    }
    $("#error").addClass("hidden");
    QUIZ.iniciar(lista, cat);
  }

  function bootstrap() {
    $("#loading").show();
    $("#case-card").addClass("hidden");
    $("#error").addClass("hidden");
    DB.carregar(I18N.currentFile())
      .done(function () {
        $("#loading").hide();
        if (DB.all.length === 0) {
          $("#error-msg").text("database vazio.");
          $("#error").removeClass("hidden");
          return;
        }
        popularCategorias();
        iniciarComCategoria($("#categoria").val());
      })
      .fail(function () {
        $("#loading").hide();
        $("#error-msg").text("Não foi possível carregar o database.");
        $("#error").removeClass("hidden");
      });
  }

  CASE.initZoom();

  I18N.onChange = function () {
    I18N.applyDOM();
    bootstrap();
  };

  $("#categoria").on("change", function () {
    iniciarComCategoria($(this).val());
  });

  $("#btn-revelar").on("click", function () {
    $("#reveal-wrap").hide();
    $("#gabarito").hide().removeClass("hidden").fadeIn(200);
  });

  $("#btn-acertei").on("click", function () {
    QUIZ.registrarAcerto();
    $(this).addClass("ring-2 ring-emerald-300");
    setTimeout(QUIZ.proximo, 400);
  });

  $("#btn-errei").on("click", function () {
    QUIZ.registrarErro();
    $(this).addClass("ring-2 ring-rose-300");
    setTimeout(QUIZ.proximo, 400);
  });

  $("#btn-proximo").on("click", function () {
    QUIZ.proximo();
  });

  $("#btn-reset").on("click", function () {
    if (confirm(I18N.t("confirm_reset"))) {
      QUIZ.resetar();
    }
  });

  QUIZ.atualizarStats();
  bootstrap();
});
