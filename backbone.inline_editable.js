// Backbone.InlineEdit v0.2
// https://github.com/parklet/inline_editable
// (c) 2013 Parklet Inc
// Distributed Under MIT License

(function ($, Backbone, undefined) {
  Backbone.InlineEdit = function (el, model, attribute, options) {
    var options = (typeof options === "undefined" ? {} : options);
    var $el = (el instanceof $) ? el : $(el),
      oldVal = $el.text(),
      oldFontStyle = $el.css("font-style"), oldMinWidth = $el.css("min-width"),
      oldDisplay = $el.css("display"), oldBackgroundColor = $el.css("background-color"),
      resetBackgroundColor = function () {$el.css({"background-color" : oldBackgroundColor});};

    $el.click(resetBackgroundColor);
    $el.hover(function () {
      $el.css({"background-color" : (options.hoverColor || "#fcffbe")});
    }, resetBackgroundColor);

    $el.css({"min-width" : (options.minWidth || oldMinWidth)});
    $el.css({"display" : (options.display || oldDisplay)});

    if (options.date && typeof $.fn.datepicker !== "undefined") {
      var dateObj = model.get(attribute);
      oldVal = dateObj;
      $el.datepicker({autoclose : true, format : "yyyy/mm/dd"})
        .on("changeDate", function (e) {
          dateObj = e.date;
          dateObj.setHours((e.date.getTimezoneOffset() / 60) + dateObj.getHours());
          $el.text($el.data("date"))
            .blur()
            .data("datepicker").hide();
        });
    } else {
      $el.attr("contenteditable", true);
    }
    if (options.placeholder && !$el.text()) {
      $el.text(options.placeholder);
      $el.css({"font-style" : "italic", "min-width" : (options.minWidth || "50px"), "display" : (options.display || "inline-block")});

      $el.focus(function () {
        if (options.placeholder === $el.text()) {
          //TODO this doesn't actually work right if the user clicks on the placeholder text (rather than empty space).
          $el.empty();
          $el.css({"font-style" : oldFontStyle});
        }
      });
    }

    if (options.autocomplete && !options.date) {
      options.autocomplete = options.autocomplete instanceof Backbone.Collection ? _.uniq(options.autocomplete.pluck(attribute)) : options.autocomplete;
      var $autoBox = $("<ul class='autocomplete' id='" + ["autocomplete", model.cid, attribute].join("-") + "'/>"),
        $autocompleteLis = _.map(options.autocomplete, function (autoValue) {
          var $li = $("<li>" + autoValue + "</li>").on("click", function (e) {
            $autoBox.hide();
            $el.text($(this).text()).blur();
          });
          $autoBox.append($li);
          return $li
        });
      $autoBox.css({"list-style" : "none", "position" : "absolute", "z-index" : "1000", "display" : "inline-block", "padding-left" : "0"});
      $autoBox.hide().appendTo($("body"));
      var regexBuilder = function (str) {
        return new RegExp("^" + str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), "g");
      };
    }

    $el.keydown(function (e) {
      if (e.keyCode == "13") {
        e.preventDefault();
        $el.blur();
      }
    });
    $el.keyup(function (e) {
      if (options.autocomplete && !options.date) {
        $autoBox.show();
        _.each($autocompleteLis, function ($li) {
          if ($li.text().match(regexBuilder($el.text()))) {
            $li.show();
          } else {
            $li.hide();
          }
        });
      }
    });

    var blurHandler = function (e) {
      var newVal = options.date ? dateObj : $el.text().trim();
      var notPlaceholder = (!options.placeholder || newVal !== options.placeholder);
      if (oldVal !== newVal && notPlaceholder) {
        model.save(attribute, newVal, { success : function (newModel) {
          oldVal = newVal;
          $el.css({"font-style" : oldFontStyle, "min-width" : oldMinWidth, "display" : oldDisplay});
          flashMark("ok", function () {
            if (options.success) {
              options.success(newModel);
            }
          });
        }, error : function (x, response) {
          flashMark("remove", function () {
            if (options.error) {
              options.error(x, response);
            }
          });
        }});
      } else {
        if (options.placeholder && newVal === "") {
          $el.text(options.placeholder);
          $el.css({"font-style" : "italic"});
        }
        if (options.onBlur) {
          options.onBlur();
        }
      }
    };

    $el.blur(blurHandler);

    function flashMark (type, callback) {
      var $checkSpan = $("<span class='icon icon-" + type + (type === "ok" ? " green" : " red") + "'/>");
      _.each(["background-color", "font-size", "font-weight", "font-style", "line-height", "text-transform"], function (cssProp) {
        $checkSpan.css(cssProp, $el.css(cssProp));
      });
      $checkSpan.css({ "padding-left" : "10px", "display" : "none" });
      $checkSpan.appendTo($el);
      $checkSpan.fadeIn(200);
      setTimeout(function () {
        $checkSpan.fadeOut(200, function () {
          $checkSpan.remove();
          if (callback) {
            callback();
          }
        });
      }, 600);
    }
  };
})(jQuery, Backbone);