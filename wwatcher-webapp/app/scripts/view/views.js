this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["compiled"] = this["Handlebars"]["compiled"] || {};

this["Handlebars"]["compiled"]["view/folder"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n            <div id=\"url_";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"urlItem no-select\">\r\n                ";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " (";
  if (stack1 = helpers.unreadCount) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.unreadCount; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + ")\r\n                <div class=\"actionBar\">\r\n                    <div class=\"update\"></div>\r\n                    <div class=\"edit\"></div>\r\n                    <div class=\"enable\"></div>\r\n                    <div class=\"remove\"></div>\r\n                </div>\r\n            </div>\r\n        ";
  return buffer;
  }

  buffer += "<div class=\"inline pagePart folder\">\r\n    <div class=\"container\">\r\n        <div id=\"btnUpdateAll\" class=\"folderUpdate button icone24 green\">Rafraichir</div><br/>\r\n        <b>Etat</b>\r\n        <select id=\"filterState\">\r\n            <option value=\"N\">Nouveau</option>\r\n            <option value=\"N,V\">Tous</option>\r\n            <option value=\"F\">A suivre</option>\r\n            <option value=\"A\">Archivé</option>\r\n        </select>\r\n        <br/><br/>\r\n        ";
  stack1 = helpers.each.call(depth0, depth0.urls, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div>\r\n</div>\r\n<div class=\"inline vsep sepFolder\"></div>\r\n<div class=\"inline pagePart list\">\r\n    <div class=\"container\">\r\n    </div>\r\n</div>\r\n<div class=\"inline vsep sepList\"></div>\r\n<div class=\"inline pagePart document\">\r\n    <div class=\"selectable container\">\r\n    </div>\r\n</div>";
  return buffer;
  });

this["Handlebars"]["compiled"]["view/layout"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<header>\r\n    <a href=\"#!search\"><div id=\"mmenuSearch\" class=\"inline button icone32\">Recherche</div></a>\r\n    <a href=\"#!folder\"><div id=\"mmenuWatch\" class=\"inline button icone32\">Surveillance</div></a>\r\n    <!--<a href=\"#!history\"><div id=\"mmenuLog\" class=\"inline button icone32\">Historique</div></a>-->\r\n\r\n    <div class=\"stateNav\">\r\n        <div class=\"stateBack\"></div>\r\n        <div class=\"stateNext\"></div>\r\n    </div>\r\n\r\n    <a href=\"#\"><div id=\"mmenuQuit\" class=\"inline button icone32 rightButton\" style=\"display: none;\">Quitter</div></a>\r\n    <a href=\"#!setting\"><div id=\"mmenuSetting\" class=\"inline button icone32 rightButton\">Paramètres</div></a>\r\n</header>\r\n<section id=\"page\" class=\"initState\">\r\n</section>\r\n<footer>\r\n    <span id=\"footer-main\">\r\n        ";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " - ";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " ";
  if (stack1 = helpers.versionLabel) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.versionLabel; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\r\n    </span>\r\n</footer>";
  return buffer;
  });

this["Handlebars"]["compiled"]["view/saveSearch"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"saveSearch\" data-rel=\"dialog\" title=\"Suivre cette recherche\" style=\"display: none; padding-top: 20px;\">\r\n\r\n    <div class=\"labelForm\"><label>Libellé : </label></div><input type=\"text\" id=\"searchLabel\" value=\"";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"inputForm\" size=\"40\" /><br/>\r\n\r\n    <div class=\"labelForm\"><label>Url : </label></div><input type=\"text\" id=\"searchUrl\" value=\"";
  if (stack1 = helpers.url) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.url; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"inputForm\" size=\"50\"/><br/>\r\n\r\n    <div class=\"errorContainer\" style=\"display: none;\">\r\n        <label class=\"errorTitle\">Erreurs :</label><br/>\r\n        <label class=\"errorMessage\">Message d'erreur...</label>\r\n    </div>\r\n\r\n    <div class=\"ui-dialog-buttonpane ui-widget-content ui-helper-clearfix\" style=\"text-align: right; margin-top: 20px\">\r\n        <div id=\"btnValidate\" class=\"button vert\">Valider</div>\r\n        <div id=\"btnCancel\" class=\"button vert\">Annuler</div>\r\n    </div>\r\n</div>";
  return buffer;
  });

this["Handlebars"]["compiled"]["view/search"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n                    <option value=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</option>\r\n                ";
  return buffer;
  }

  buffer += "<section class=\"search-criteria\">\r\n    <div class=\"selectable container\" style=\"display:none;\">\r\n        <div class=\"container-wrapper\">\r\n            <!-- Parser select -->\r\n            <label for=\"selectParser\">Parser : </label>\r\n            <select id=\"selectParser\">\r\n                <option value=\"\">Sélectionnez un parser</option>\r\n                ";
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data};
  if (stack1 = helpers.parsers) { stack1 = stack1.call(depth0, options); }
  else { stack1 = depth0.parsers; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if (!helpers.parsers) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n            </select><!-- Restaure selected item --><script>$(\"#selectParser\").val(\"";
  if (stack1 = helpers.parser) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.parser; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\");</script>\r\n            <!-- Parser Search Form -->\r\n            <form id=\"parserSearchForm\" class=\"parserSearchForm\" style=\"display:none;\">\r\n            </form>\r\n            <div class=\"searchButton\">\r\n                <div id=\"search-start\" class=\"parserSearchForm button green\" style=\"display:none;\">\r\n                    Lancer\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</section>\r\n<div class=\"hsep sepFolder sepFixed\" style=\"display: none;\"></div>\r\n<section class=\"search-result-container container\" style=\"display: none;\" >\r\n    <div id=\"search-save\" class=\"button green\" style=\"display:none;\">Suivre</div>\r\n    <!-- Parser search result -->\r\n    <div class=\"search-result selectable container-wrapper\">\r\n    </div>\r\n</section>";
  return buffer;
  });