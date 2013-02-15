var TestModel = Backbone.Model.extend({
  url : "/test_model"
});

describe("InlineEdit", function () {
  var $el,
    model = new TestModel(),
    attr = "name",
    options = {};
  beforeEach(function () {
    SpecDOM().html("<span id='foo'></span>");
    $el = $("#foo");
  });

  it("should save the model if the value has changed", function () {
    spyOn(model, "save").andCallFake(function (attr, val, callbacks) {
      callbacks.success(model);
    });
    Backbone.InlineEdit($el, model, attr, options);
    $el.text("foobar");
    $el.blur();
    expect(model.save).toHaveBeenCalled();
  });

  it("should not save the model if the value has not changed", function () {
    spyOn(model, "save");
    $el.text("foobar");
    Backbone.InlineEdit($el, model, attr, options);
    $el.blur();
    expect(model.save).not.toHaveBeenCalled();
  });

  describe("options hash", function () {
    describe("defaults", function () {
      beforeEach(function () {
        Backbone.InlineEdit($el, model, attr);
      });

      it("should use #fcffbe as the default hover color", function () {
        $el.mouseenter();
        expect($el.css("background-color")).toEqual("rgb(252, 255, 190)");
      });

      it("should not have a placeholder", function () {
        expect($el.text()).toEqual("");
      });

      it("should not have a min width", function () {
        expect($el.css("min-width")).toEqual("0px");
      });
    });

    describe("minWidth", function () {
      beforeEach(function () {
        options["minWidth"] = "100px";
        Backbone.InlineEdit($el, model, attr, options);
      });

      it("should accept a minimum width option", function () {
        expect($el.css("min-width")).toEqual("100px");
      });

      it("should reset the minimum width on blur", function () {
        spyOn(model, "save").andCallFake(function (attr, val, callbacks) {
          callbacks.success(model);
        });
        $el.text("foobar");
        $el.blur();
        expect($el.css("min-width")).toEqual("0px");
      });
    });

    describe("hoverColor", function () {
      beforeEach(function () {
        options["hoverColor"] = "red";
        Backbone.InlineEdit($el, model, attr, options);
      });

      it("should accept a hover color option", function () {
        $el.mouseenter();
        expect($el.css("background-color")).toEqual("rgb(255, 0, 0)");
      });

      it("should reset the hover color on mouseleave", function () {
        $el.mouseenter();
        expect($el.css("background-color")).toEqual("rgb(255, 0, 0)");
        $el.mouseleave();
        var expectation = ($el.css("background-color") == "transparent" || $el.css("background-color") == "rgba(0, 0, 0, 0)");
        expect(expectation).toBeTruthy();
      });
    });

    describe("display", function () {
      beforeEach(function () {
        options["display"] = "inline-block";
        Backbone.InlineEdit($el, model, attr, options);
      });

      it("should accept a display option", function () {
        expect($el.css("display")).toEqual("inline-block");
      });

      it("should reset the display on blur", function () {
        spyOn(model, "save").andCallFake(function (attr, val, callbacks) {
          callbacks.success(model);
        });
        $el.text("foobar");
        $el.blur();
        expect($el.css("display")).toEqual("inline");
      });
    });

    describe("success and error callbacks", function () {
      var successCalled, errorCalled;
      beforeEach(function () { // Mock fadeout so callbacks are called
        spyOn($.prototype, "fadeOut").andCallFake(function (time, callback) {
          callback();
          return this;
        });
        jasmine.Clock.useMock();
        successCalled = false;
        errorCalled = false;
        options["success"] = function () { successCalled = true; };
        options["error"] = function () { errorCalled = true; };
        Backbone.InlineEdit($el, model, attr, options);
      });

      it("should call the success callback if the save succeeds", function () {
        spyOn(model, "save").andCallFake(function (attr, val, callbacks) {
          callbacks.success(model);
        });
        $el.text("foobar");
        $el.blur();
        jasmine.Clock.tick(1000);
        expect(successCalled).toBeTruthy();
        expect(errorCalled).toBeFalsy();
      });

      it("should call the error callback if the save fails", function () {
        spyOn(model, "save").andCallFake(function (attr, val, callbacks) {
          callbacks.error(model);
        });
        $el.text("foobar");
        $el.blur();
        jasmine.Clock.tick(1000);
        expect(errorCalled).toBeTruthy();
        expect(successCalled).toBeFalsy();
      });
    });

    it("should call the onBlur function if no save is performed", function () {
      var blurCalled = false;
      options["onBlur"] = function () { blurCalled = true; };
      Backbone.InlineEdit($el, model, attr, options);
      $el.blur();
      expect(blurCalled).toBeTruthy();
    });

    it("should not call the onBlur function if save is performed", function () {
      var blurCalled = false;
      options["onBlur"] = function () { blurCalled = true; };
      Backbone.InlineEdit($el, model, attr, options);
      $el.text("foobar");
      $el.blur();
      expect(blurCalled).toBeFalsy();
    });

    describe("autocomplete", function () {
      afterEach(function () {
        $("ul.autocomplete").remove();
      });
      
      it("should accept a list of autocomplete values", function () {
        options["autocomplete"] = ["foo", "bar", "baz", "bing"];
        Backbone.InlineEdit($el, model, attr, options);
        expect($("ul.autocomplete li").length).toEqual(4);
      });

      it("on click it should set the text for the element to the li's text", function () {
        options["autocomplete"] = ["foo", "bar", "baz", "bing"];
        Backbone.InlineEdit($el, model, attr, options);
        $("ul.autocomplete li:first").click();
        expect($el.text()).toEqual("foo");
      });

      it("should work with a collection", function () {
        options["autocomplete"] = new Backbone.Collection([
          {name : "foo"},
          {name : "bar"}
        ]);
        Backbone.InlineEdit($el, model, attr, options);
        $("ul.autocomplete li:first").click();
        expect($el.text()).toEqual("foo");
      });
    });
  });

  describe("date fields", function () {
    beforeEach(function () {
      spyOn($.fn, "datepicker").andReturn($el);
    });

    it("should not make date fields contenteditable", function () {
      Backbone.InlineEdit($el, model, attr, {date : true});
      expect($el.attr("contenteditable")).toBeFalsy();
    });

    it("should setup a datepicker", function () {
      Backbone.InlineEdit($el, model, attr, {date : true});
      expect($.fn.datepicker).toHaveBeenCalledInTheContextOf($el[0], [
        {autoclose : true, format : "yyyy/mm/dd"}
      ]);
    });

    it("should bind to the changeDate event", function () {
      spyOn($.fn, "on").andCallThrough();
      Backbone.InlineEdit($el, model, attr, {date : true});
      expect($.fn.on).toHaveBeenCalledInTheContextOf($el[0], ["changeDate", jasmine.any(Function)]);
    });
  });
});