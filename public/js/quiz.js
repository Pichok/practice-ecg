// Estado do quiz, contadores, progresso e persistência em localStorage
(function (global) {
  "use strict";

  var KEY = "ecg-quiz-progress";
  var Quiz = {
    state: {
      acertos: 0,
      erros: 0,
      indice: 0,
      categoria: "todas",
      respondidoNoAtual: false,
    },
    lista: [],
  };

  function carregarLS() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        Quiz.state.acertos = s.acertos || 0;
        Quiz.state.erros = s.erros || 0;
        Quiz.state.categoria = s.categoria || "todas";
      }
    } catch (e) {}
  }

  function salvarLS() {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          acertos: Quiz.state.acertos,
          erros: Quiz.state.erros,
          categoria: Quiz.state.categoria,
        })
      );
    } catch (e) {}
  }

  Quiz.atualizarStats = function () {
    var total = Quiz.lista.length;
    var atual = total > 0 ? Quiz.state.indice + 1 : 0;
    var respondidas = Quiz.state.acertos + Quiz.state.erros;
    $("#stat-acertos").text(Quiz.state.acertos);
    $("#stat-erros").text(Quiz.state.erros);
    $("#stat-taxa").text(
      respondidas > 0 ? Math.round((Quiz.state.acertos / respondidas) * 100) + "%" : "—"
    );
    $("#stat-progresso").text(atual + "/" + total);
    var pct = total > 0 ? (atual / total) * 100 : 0;
    $("#progress-bar").css("width", pct + "%");
  };

  Quiz.iniciar = function (lista, categoria) {
    Quiz.lista = lista;
    Quiz.state.indice = 0;
    Quiz.state.respondidoNoAtual = false;
    Quiz.state.categoria = categoria;
    salvarLS();
    Quiz.mostrarAtual();
  };

  Quiz.mostrarAtual = function () {
    if (Quiz.lista.length === 0) return;
    Quiz.state.respondidoNoAtual = false;
    var caso = Quiz.lista[Quiz.state.indice];
    global.ECG_CASE.render(caso);
    Quiz.atualizarStats();
    $("#case-card")[0].scrollIntoView({ behavior: "smooth", block: "start" });
  };

  Quiz.proximo = function () {
    if (Quiz.state.indice < Quiz.lista.length - 1) {
      Quiz.state.indice++;
    } else {
      Quiz.state.indice = 0; // recomeça
    }
    Quiz.mostrarAtual();
  };

  Quiz.registrarAcerto = function () {
    if (Quiz.state.respondidoNoAtual) return;
    Quiz.state.respondidoNoAtual = true;
    Quiz.state.acertos++;
    salvarLS();
    Quiz.atualizarStats();
  };

  Quiz.registrarErro = function () {
    if (Quiz.state.respondidoNoAtual) return;
    Quiz.state.respondidoNoAtual = true;
    Quiz.state.erros++;
    salvarLS();
    Quiz.atualizarStats();
  };

  Quiz.resetar = function () {
    Quiz.state.acertos = 0;
    Quiz.state.erros = 0;
    Quiz.state.indice = 0;
    Quiz.state.respondidoNoAtual = false;
    salvarLS();
    Quiz.atualizarStats();
    if (Quiz.lista.length > 0) Quiz.mostrarAtual();
  };

  Quiz.getCategoriaSalva = function () {
    carregarLS();
    return Quiz.state.categoria;
  };

  carregarLS();
  global.ECG_QUIZ = Quiz;
})(window);
