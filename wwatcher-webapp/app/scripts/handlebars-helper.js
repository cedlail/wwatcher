(function () {
    "use strict";

    /*******************************************
     **** Handlebar extensions
     *******************************************/

    Handlebars.registerHelper('list', function(items, options) {
        var out = "<ul>";
        for(var i=0, l=items.length; i<l; i++) {
            out = out + "<li>" + options.fn(items[i]) + "</li>";
        }
        return out + "</ul>";
    });

    Handlebars.registerHelper('select', function(items, options) {
        var i, l, out = "<select>", item, value, label, isSelected, selectedValue = options.fn(options.hash.selected);
        if (options.hash.id) {
            out = "<select id='" + options.hash.id + "'>";
        }
        for(i=0, l=items.length; i<l; i++) {
            item = items[i];
            value = item[options.hash.value];
            label = item[options.hash.label];
            isSelected = selectedValue !== undefined && selectedValue === value;
            out = out + "<option value='"+value+"'" + (isSelected ? " selected='selected' " : "" ) + ">" + label + "</option>";
        }
        out = out + "</select>";
        return out;
    });

    // Utilisés --------------------------------------------------------------

    Handlebars.registerHelper('option', function(items, options) {
        var i, l, out = "", item, value, label, isSelected;
        for(i=0, l=items.length; i<l; i++) {
            item = items[i];
            value = item[options.hash.value];
            label = item[options.hash.label];
            isSelected = options.hash.selected !== undefined && options.hash.selected === value;
            out = out + "<option value='"+value+"'" + (isSelected ? " selected='selected' " : "" ) + ">" + label + "</option>";
        }
        return out;
    });

    Handlebars.registerHelper('toDate', function(srcDate) {
        return require("utils").formatDate(srcDate);
    });
    Handlebars.registerHelper('toDateTime', function(srcDate) {
        return require("utils").formatDateTime(srcDate);
    });

}());