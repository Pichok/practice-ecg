// Renderiza um caso na tela e controla o modal de zoom
(function (global) {
  "use strict";

  var Case = {};

  function escapar(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function formatarInterpretacao(texto) {
    if (!texto) return "";
    var linhas = texto
      .split(/\n+/)
      .map(function (l) { return l.trim(); })
      .filter(Boolean);
    var bullets = linhas.filter(function (l) { return /^[-*•]\s+/.test(l); });
    if (bullets.length >= 2 && bullets.length === linhas.length) {
      return (
        "<ul>" +
        linhas.map(function (l) {
          return "<li>" + escapar(l.replace(/^[-*•]\s+/, "")) + "</li>";
        }).join("") +
        "</ul>"
      );
    }
    return escapar(texto);
  }

  Case.render = function (caso) {
    $("#case-categoria").text(caso.categoria || "");
    $("#case-clinico").text(caso.caso_clinico || "");
    $("#case-imagem").attr("src", caso.imagem_ecg || "").attr(
      "alt",
      caso.diagnostico || "Eletrocardiograma"
    );
    $("#case-diagnostico").text(caso.diagnostico || "");
    $("#case-interpretacao").html(formatarInterpretacao(caso.interpretacao));

    $("#gabarito").hide();
    $("#reveal-wrap").show();
    $("#case-card").removeClass("hidden");
  };

  var zoomState = { scale: 1, tx: 0, ty: 0, dragging: false, startX: 0, startY: 0 };

  function applyTransform() {
    $("#zoom-img").css(
      "transform",
      "translate(" + zoomState.tx + "px, " + zoomState.ty + "px) scale(" + zoomState.scale + ")"
    );
  }

  function resetZoom() {
    zoomState.scale = 1;
    zoomState.tx = 0;
    zoomState.ty = 0;
    applyTransform();
  }

  Case.abrirZoom = function (src) {
    $("#zoom-img").attr("src", src);
    resetZoom();
    $("#zoom-modal").removeClass("hidden").css("display", "flex");
    $("body").css("overflow", "hidden");
  };

  Case.fecharZoom = function () {
    $("#zoom-modal").addClass("hidden").css("display", "");
    $("body").css("overflow", "");
  };

  Case.initZoom = function () {
    $(document).on("click", "#case-imagem", function () {
      Case.abrirZoom($(this).attr("src"));
    });
    $(document).on("click", "#zoom-close", Case.fecharZoom);
    $(document).on("click", "#zoom-modal", function (e) {
      if (e.target.id === "zoom-modal" || e.target.id === "zoom-viewport") Case.fecharZoom();
    });
    $(document).on("keydown", function (e) {
      if (e.key === "Escape") Case.fecharZoom();
    });

    $(document).on("click", "#zoom-in", function () {
      zoomState.scale = Math.min(6, zoomState.scale * 1.25);
      applyTransform();
    });
    $(document).on("click", "#zoom-out", function () {
      zoomState.scale = Math.max(0.5, zoomState.scale / 1.25);
      applyTransform();
    });
    $(document).on("click", "#zoom-reset", resetZoom);

    $(document).on("wheel", "#zoom-viewport", function (e) {
      e.preventDefault();
      var delta = e.originalEvent.deltaY;
      var factor = delta < 0 ? 1.15 : 1 / 1.15;
      zoomState.scale = Math.max(0.5, Math.min(6, zoomState.scale * factor));
      applyTransform();
    });

    $(document).on("mousedown", "#zoom-img", function (e) {
      e.preventDefault();
      zoomState.dragging = true;
      zoomState.startX = e.clientX - zoomState.tx;
      zoomState.startY = e.clientY - zoomState.ty;
      $(this).addClass("dragging");
    });
    $(document).on("mousemove", function (e) {
      if (!zoomState.dragging) return;
      zoomState.tx = e.clientX - zoomState.startX;
      zoomState.ty = e.clientY - zoomState.startY;
      applyTransform();
    });
    $(document).on("mouseup", function () {
      if (zoomState.dragging) {
        zoomState.dragging = false;
        $("#zoom-img").removeClass("dragging");
      }
    });

    var lastTouchDist = null;
    $(document).on("touchstart", "#zoom-viewport", function (e) {
      var t = e.originalEvent.touches;
      if (t.length === 1) {
        zoomState.dragging = true;
        zoomState.startX = t[0].clientX - zoomState.tx;
        zoomState.startY = t[0].clientY - zoomState.ty;
      } else if (t.length === 2) {
        lastTouchDist = Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
      }
    });
    $(document).on("touchmove", "#zoom-viewport", function (e) {
      var t = e.originalEvent.touches;
      if (t.length === 1 && zoomState.dragging) {
        e.preventDefault();
        zoomState.tx = t[0].clientX - zoomState.startX;
        zoomState.ty = t[0].clientY - zoomState.startY;
        applyTransform();
      } else if (t.length === 2 && lastTouchDist != null) {
        e.preventDefault();
        var d = Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
        zoomState.scale = Math.max(0.5, Math.min(6, zoomState.scale * (d / lastTouchDist)));
        lastTouchDist = d;
        applyTransform();
      }
    });
    $(document).on("touchend", "#zoom-viewport", function () {
      zoomState.dragging = false;
      lastTouchDist = null;
    });
  };

  global.ECG_CASE = Case;
})(window);
