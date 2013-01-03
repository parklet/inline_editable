// Taken from the Rally Code Base

beforeEach(function() {
  this.addMatchers({
    toBeVisible: function () {
      return $(this.actual).is(":visible");
    },
    toBeHidden: function () {
      return $(this.actual).is(":hidden");
    },
    toBeHiddenByIndentation: function() {
      return $(this.actual).css('text-indent') === '-9999px';
    },
    toBeHiddenByZIndex: function() {
      return $(this.actual).css('z-index') === '-10';
    },
    toHaveClass: function (expected) {
      return $(this.actual).hasClass(expected);
    },
    toHaveBeenCalledInTheContextOf: function(object, params) {
      if (object === undefined) {
        return false;
      }

      var spy = this.actual;
      for (var i = 0; i < spy.calls.length; i++) {
        if (spy.calls[i].object[0] == object || spy.calls[i].object == object) {
          if (params == null || this.env.equals_(spy.calls[i].args, params)) {
            return true;
          }
        }
      }
      return false;
    },
    toHaveLive: function(eventType) {
      var hasLive, actual = this.actual;
      $.each($(document).data('events')['live'], function(i, item) {
        hasLive = ((item.selector == actual.selector) && (item.origType == eventType));
        if (hasLive) {
          return false;
        }
      });
      return hasLive;
    }
  });

  spyOn(jQuery.ajaxSettings, 'xhr').andCallFake(function() {
    var newXhr = new FakeXMLHttpRequest();
    newXhr = patchXhrMock(newXhr);
    ajaxRequests.push(newXhr);
    return newXhr;
  });

  SpecDOM().empty();
});

function SpecDOM(selector) {
  if (selector) {
    return $(selector, "#jasmine_content");
  } else {
    return $('#jasmine_content');
  }
}
