this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["compiled"] = this["Handlebars"]["compiled"] || {};

this["Handlebars"]["compiled"]["view/folder"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <div id=\"url_";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"urlItem no-select\">\n                ";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " (";
  if (stack1 = helpers.unreadCount) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.unreadCount; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + ")\n                <div class=\"actionBar\">\n                    <div class=\"update\"></div>\n                    <div class=\"edit\"></div>\n                    <div class=\"enable\"></div>\n                    <div class=\"remove\"></div>\n                </div>\n            </div>\n        ";
  return buffer;
  }

  buffer += "<div class=\"inline pagePart folder\">\n    <div class=\"container\">\n        <div id=\"btnUpdateAll\" class=\"folderUpdate button icone24 green\">Rafraichir</div><br/>\n        <b>Etat</b>\n        <select id=\"filterState\">\n            <option value=\"N\">Nouveau</option>\n            <option value=\"N,V\">Tous</option>\n            <option value=\"F\">A suivre</option>\n            <option value=\"A\">Archivé</option>\n        </select>\n        <br/><br/>\n        ";
  stack1 = helpers.each.call(depth0, depth0.urls, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </div>\n</div>\n<div class=\"inline vsep sepFolder\"></div>\n<div class=\"inline pagePart list\">\n    <div class=\"container\">\n    </div>\n</div>\n<div class=\"inline vsep sepList\"></div>\n<div class=\"inline pagePart document\">\n    <div class=\"selectable container\">\n    </div>\n</div>";
  return buffer;
  });

this["Handlebars"]["compiled"]["view/layout"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<header>\n    <a href=\"#!search\"><div id=\"mmenuSearch\" class=\"inline button icone32\">Recherche</div></a>\n    <a href=\"#!folder\"><div id=\"mmenuWatch\" class=\"inline button icone32\">Surveillance</div></a>\n    <!--<a href=\"#!history\"><div id=\"mmenuLog\" class=\"inline button icone32\">Historique</div></a>-->\n\n    <div class=\"stateNav\">\n        <div class=\"stateBack\"></div>\n        <div class=\"stateNext\"></div>\n    </div>\n\n    <a href=\"#\"><div id=\"mmenuQuit\" class=\"inline button icone32 rightButton\" style=\"display: none;\">Quitter</div></a>\n    <a href=\"#!setting\"><div id=\"mmenuSetting\" class=\"inline button icone32 rightButton\">Paramètres</div></a>\n</header>\n<section id=\"page\" class=\"initState\">\n</section>\n<footer>\n    <span id=\"footer-main\">\n        ";
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
    + "\n    </span>\n</footer>";
  return buffer;
  });

this["Handlebars"]["compiled"]["view/saveSearch"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"saveSearch\" data-rel=\"dialog\" title=\"Suivre cette recherche\" style=\"display: none; padding-top: 20px;\">\n\n    <div class=\"labelForm\"><label>Libellé : </label></div><input type=\"text\" id=\"searchLabel\" value=\"";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"inputForm\" size=\"40\" /><br/>\n\n    <div class=\"labelForm\"><label>Url : </label></div><input type=\"text\" id=\"searchUrl\" value=\"";
  if (stack1 = helpers.url) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.url; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"inputForm\" size=\"50\"/><br/>\n\n    <div class=\"errorContainer\" style=\"display: none;\">\n        <label class=\"errorTitle\">Erreurs :</label><br/>\n        <label class=\"errorMessage\">Message d'erreur...</label>\n    </div>\n\n    <div class=\"ui-dialog-buttonpane ui-widget-content ui-helper-clearfix\" style=\"text-align: right; margin-top: 20px\">\n        <div id=\"btnValidate\" class=\"button vert\">Valider</div>\n        <div id=\"btnCancel\" class=\"button vert\">Annuler</div>\n    </div>\n</div>";
  return buffer;
  });

this["Handlebars"]["compiled"]["view/search"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                    <option value=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</option>\n                ";
  return buffer;
  }

  buffer += "<section class=\"search-criteria\">\n    <div class=\"selectable container\" style=\"display:none;\">\n        <div class=\"container-wrapper\">\n            <!-- Parser select -->\n            <label for=\"selectParser\">Parser : </label>\n            <select id=\"selectParser\">\n                <option value=\"\">Sélectionnez un parser</option>\n                ";
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data};
  if (stack1 = helpers.parsers) { stack1 = stack1.call(depth0, options); }
  else { stack1 = depth0.parsers; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if (!helpers.parsers) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </select><!-- Restaure selected item --><script>$(\"#selectParser\").val(\"";
  if (stack1 = helpers.parser) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.parser; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\");</script>\n            <!-- Parser Search Form -->\n            <form id=\"parserSearchForm\" class=\"parserSearchForm\" style=\"display:none;\">\n            </form>\n            <div class=\"searchButton\">\n                <div id=\"search-start\" class=\"parserSearchForm button green\" style=\"display:none;\">\n                    Lancer\n                </div>\n            </div>\n        </div>\n    </div>\n</section>\n<div class=\"hsep sepFolder sepFixed\" style=\"display: none;\"></div>\n<section class=\"search-result-container container\" style=\"display: none;\" >\n    <div id=\"search-save\" class=\"button green\" style=\"display:none;\">Suivre</div>\n    <!-- Parser search result -->\n    <div class=\"search-result selectable container-wrapper\">\n    </div>\n</section>";
  return buffer;
  });