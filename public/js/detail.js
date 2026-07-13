// Página de detalhe do caso (?id=)
$(function () {
  var DB = window.ECG_DB;
  var CASE = window.ECG_CASE;
  var I18N = window.ECG_I18N;

  I18N.mountSelect($("#idioma"));
  CASE.initZoom();

  function getId() {
    var m = window.location.search.match(/[?&]id=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function render() {
    var id = getId();
    var caso = id ? DB.porId(id) : null;
    if (!caso) {
      $("#case-card").addClass("hidden");
      $("#error-msg").text(I18N.t("case_not_found"));
      $("#error").removeClass("hidden");
      return;
    }
    $("#error").addClass("hidden");
    CASE.render(caso);
    // reveal gabarito by default
    $("#reveal-wrap").hide();
    $("#gabarito").removeClass("hidden").show();
    $("#btn-train-cat").attr(
      "href",
      "./../index.html?categoria=" + encodeURIComponent(caso.categoria || "todas")
    );
  }

  function bootstrap() {
    $("#loading").show();
    $("#case-card").addClass("hidden");
    DB.carregar(I18N.currentFile())
      .done(function () {
        $("#loading").hide();
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

  bootstrap();
});
