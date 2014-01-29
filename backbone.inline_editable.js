// Backbone.InlineEdit v0.2.1
// https://github.com/parklet/inline_editable
// (c) 2013 Parklet Inc
// Distributed Under MIT License

(function ($, Backbone, undefined) {
  $("<style type='text/css'> " +
    ".inline-placeholder:after{ content: attr(data-inline-placeholder-text);} " +
    ".inline-placeholder {color: #222;} " +
    "</style>").prependTo("head");

  var isFirefox = typeof InstallTrigger !== 'undefined';

  Backbone.InlineEdit = function (el, model, attribute, options) {
    options = (typeof options === "undefined" ? {} : options);
    var $el = (el instanceof $) ? el : $(el),
      oldVal = $el.html(),
      oldFontStyle = $el.css("font-style"), oldMinWidth = $el.css("min-width"),
      oldDisplay = $el.css("display"), oldBackgroundColor = $el.css("background-color"),
      resetBackgroundColor = function () {$el.css({"background-color" : oldBackgroundColor});};

    var draggableAncestors;

    if (options.placeholder) {
      $el.attr("data-inline-placeholder-text", options.placeholder);
    }

    var hasPlaceholder = !!$el.data("inline-placeholder-text");

    $el.click(resetBackgroundColor);
    $el.click(function () {isFirefox && $el.focus()});
    $el.hover(function () {
      $el.css({"background-color" : (options.hoverColor || "#fcffbe")});
    }, resetBackgroundColor);

    $el.css({"min-width" : (options.minWidth || oldMinWidth)});
    $el.css({"display" : (options.display || oldDisplay)});

    if (options.date && typeof $.fn.daypicker !== "undefined") {
      var dateObj = model.get(attribute);
      oldVal = dateObj;
      $el.daypicker()
        .on("changeDate", function (e) {
          dateObj = e.date;
          dateObj.setHours((e.date.getTimezoneOffset() / 60) + dateObj.getHours());
          $el.blur().removeClass("inline-placeholder");
        });
    } else {
      $el.attr("contenteditable", true);
    }
    if (hasPlaceholder) {
      if (!$el.html()) {
        $el.css({"font-style" : "italic", "min-width" : (options.minWidth || "50px"), "display" : (options.display || "inline-block")});
        $el.addClass("inline-placeholder");
      }

      $el.mousedown(function () {
        draggableAncestors = $el.parents("[draggable=true]");
        draggableAncestors.attr("draggable", false);
        $el.focus();
      }).focusin(function () {
          if ($el.hasClass("inline-placeholder")) {
            $el.removeClass("inline-placeholder");
            $el.css({"font-style" : oldFontStyle});
            isFirefox && $el.html("&nbsp;");
          }
        }).focusout(function () {
          draggableAncestors && draggableAncestors.attr("draggable", true);
          if (hasPlaceholder && !$el.html()) {
            $el.addClass("inline-placeholder");
          }
        });
    }

    $el.keydown(function (e) {
      if (e.keyCode == "13") {
        if (e.shiftKey && options.allowLineBreaks) {
          pasteIntoInput(this, "\n");
        } else {
          e.preventDefault();
          $el.blur();
        }
      }
    });

    $el.on("paste", function (e) {
      e.preventDefault();

      var text;
      var clp = (e.originalEvent || e).clipboardData;
      if (clp === undefined || clp === null) {
        text = window.clipboardData.getData("text") || "";
        if (text !== "") {
          if (window.getSelection) {
            var newNode = document.createElement("span");
            newNode.innerHTML = text;
            window.getSelection().getRangeAt(0).insertNode(newNode);
          } else {
            document.selection.createRange().pasteHTML(text);
          }
        }
      } else {
        text = clp.getData('text/plain') || "";
        if (text !== "") {
          document.execCommand('insertText', false, text);
        }
      }
    });

    $el.blur(function () {
      var newVal;
      if (options.date) {
        newVal = dateObj;
      } else {
        newVal = $el.html();
        if (newVal.match(/(<div|<span|<p|<h)/)) {
          newVal = _.compact(_.reduce($(newVal), function (m, e) {
            if ($(e).is("span")) {
              m[m.length - 1] = m[m.length - 1] + $(e).text();
            } else {
              m.push($(e).text());
            }
            return m;
          }, [""])).join("<br>")
        }
        newVal = newVal.replace(/(<br>)+$/, "").replace(/&nbsp;|&amp;|&lt;|&gt;/g,function (entity) {
          var entities = {"&nbsp;" : " ", "&amp;" : "&", "&lt;" : "<", "&gt;" : ">"};
          return entities[entity];
        }).trim();
      }

      if (oldVal !== newVal) {
        model.save(attribute, newVal, { success : function (newModel) {
          oldVal = newVal;
          $el.css({"font-style" : oldFontStyle, "min-width" : oldMinWidth, "display" : oldDisplay});
          flashMark("check", function () {
            if (options.success) {
              options.success(newModel);
            }
          });
        }, error : function (x, response) {
          flashMark("times", function () {
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
      var $checkSpan = $("<span class='icon icon-" + type + (type === "check" ? " green" : " red") + "'/>");
      _.each(["background-color", "font-weight", "font-style", "text-transform"], function (cssProp) {
        $checkSpan.css(cssProp, $el.css(cssProp));
      });

      _.each(["font-size", "line-height"], function (cssProp) {
        $checkSpan.css(cssProp, "100%");
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

    function pasteIntoInput (el, text) {
      el.focus();
      if (typeof el.selectionStart == "number"
        && typeof el.selectionEnd == "number") {
        var val = el.value;
        var selStart = el.selectionStart;
        el.value = val.slice(0, selStart) + text + val.slice(el.selectionEnd);
        el.selectionEnd = el.selectionStart = selStart + text.length;
      } else if (typeof document.selection != "undefined") {
        var textRange = document.selection.createRange();
        textRange.text = text;
        textRange.collapse(false);
        textRange.select();
      }
    }
  };
})(jQuery, Backbone);
