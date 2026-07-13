// Carrega e filtra o database conforme o idioma
(function (global) {
  "use strict";

  var DB = {
    all: [],
    filtered: [],
    categorias: [],
  };

  function embaralhar(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  DB.carregar = function (file) {
    file = file || (global.ECG_I18N ? global.ECG_I18N.currentFile() : "./database-pt-br.json");
    return $.getJSON(file).then(function (dados) {
      DB.all = Array.isArray(dados) ? dados : [];
      var set = {};
      DB.all.forEach(function (c) {
        if (c && c.categoria) set[c.categoria] = true;
      });
      DB.categorias = Object.keys(set).sort();
      return DB.all;
    });
  };

  DB.aplicarFiltro = function (categoria) {
    if (!categoria || categoria === "todas") {
      DB.filtered = embaralhar(DB.all);
    } else {
      DB.filtered = embaralhar(
        DB.all.filter(function (c) {
          return c.categoria === categoria;
        })
      );
    }
    return DB.filtered;
  };

  DB.porId = function (id) {
    id = String(id);
    for (var i = 0; i < DB.all.length; i++) {
      if (String(DB.all[i].id) === id) return DB.all[i];
    }
    return null;
  };

  DB.porCategoria = function () {
    var map = {};
    DB.all.forEach(function (c) {
      if (!c || !c.categoria) return;
      (map[c.categoria] = map[c.categoria] || []).push(c);
    });
    return map;
  };

  global.ECG_DB = DB;
})(window);
