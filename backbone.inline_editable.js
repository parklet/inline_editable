// Backbone.InlineEdit v0.2
// https://github.com/parklet/inline_editable
// (c) 2013 Parklet Inc
// Distributed Under MIT License

(function ($, Backbone, undefined) {
  $("<style type='text/css'> " +
    ".inline-placeholder:after{ content: attr(data-inline-placeholder-text);} " +
    ".inline-placeholder {color: #6666FF;} " +
    "</style>").prependTo("head");

  Backbone.InlineEdit = function (el, model, attribute, options) {
    options = (typeof options === "undefined" ? {} : options);
    var $el = (el instanceof $) ? el : $(el),
      oldVal = $el.text(),
      oldFontStyle = $el.css("font-style"), oldMinWidth = $el.css("min-width"),
      oldDisplay = $el.css("display"), oldBackgroundColor = $el.css("background-color"),
      resetBackgroundColor = function () {$el.css({"background-color" : oldBackgroundColor});};

    if (options.placeholder) {
      $el.attr("data-inline-placeholder-text", options.placeholder);
    }

    var hasPlaceholder = !!$el.data("inline-placeholder-text");

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
    if (hasPlaceholder) {
      if (!$el.text()) {
        $el.css({"font-style" : "italic", "min-width" : (options.minWidth || "50px"), "display" : (options.display || "inline-block")});
        $el.addClass("inline-placeholder");
      }

      $el.focusin(function () {
        if ($el.hasClass("inline-placeholder")) {
          $el.removeClass("inline-placeholder");
          $el.css({"font-style" : oldFontStyle});
        }
      }).focusout(function () {
        if (hasPlaceholder && !$el.text()) {
          $el.addClass("inline-placeholder");
        }
      });
    }

    $el.keydown(function (e) {
      if (e.keyCode == "13") {
        e.preventDefault();
        $el.blur();
      }
    });

    $el.blur(function () {
      var newVal = options.date ? dateObj : $el.text().trim();

      if (oldVal !== newVal && newVal !== "") {
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
        if (hasPlaceholder && newVal === "") {
          $el.addClass("inline-placeholder");
          $el.css({"font-style" : "italic"});
        }
        if (options.onBlur) {
          options.onBlur();
        }
      }
    });

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