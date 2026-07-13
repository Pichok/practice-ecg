// Bootstrap da aplicação
$(function () {
  var DB = window.ECG_DB;
  var CASE = window.ECG_CASE;
  var QUIZ = window.ECG_QUIZ;

  function popularCategorias() {
    var $sel = $("#categoria");
    DB.categorias.forEach(function (cat) {
      $sel.append($("<option>").val(cat).text(cat));
    });
    var salvo = QUIZ.getCategoriaSalva();
    if (salvo && (salvo === "todas" || DB.categorias.indexOf(salvo) !== -1)) {
      $sel.val(salvo);
    }
  }

  function iniciarComCategoria(cat) {
    var lista = DB.aplicarFiltro(cat);
    if (lista.length === 0) {
      $("#case-card").addClass("hidden");
      $("#error-msg").text("Nenhum caso encontrado para esta categoria.");
      $("#error").removeClass("hidden");
      return;
    }
    $("#error").addClass("hidden");
    QUIZ.iniciar(lista, cat);
  }

  DB.carregar()
    .done(function () {
      $("#loading").hide();
      if (DB.all.length === 0) {
        $("#error-msg").text(
          "database.json está vazio. Rode: npm run scrape"
        );
        $("#error").removeClass("hidden");
        return;
      }
      popularCategorias();
      CASE.initZoom();
      iniciarComCategoria($("#categoria").val());
    })
    .fail(function () {
      $("#loading").hide();
      $("#error-msg").text(
        "Não foi possível carregar database.json. Verifique se o arquivo existe em /database.json."
      );
      $("#error").removeClass("hidden");
    });

  // Eventos
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
    if (confirm("Reiniciar todo o progresso (acertos e erros)?")) {
      QUIZ.resetar();
    }
  });

  QUIZ.atualizarStats();
});
