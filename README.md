Inline Edit
===============

JavaScript Library for editing Backbone.Model attribute backed HTML elements inline using the HTML `contenteditable` attribute.

### Dependencies:

* Backbone.js >= v0.9
* jQuery.js >= v1.7
* Bootstrap.datepicker.js (optional for datepicker usage)
* Font Awesome v3.0.0 (or custom css for .icon-ok and .icon-remove icon classes)

### Available options:

```javascript
// Edit Backbone.Model attributes inline on any HTML element
// using the HTML `contenteditable` attribute.
// Parameters:
// element - HTML element to edit
// model - Instance of a Backbone.Model
// attribute - String of model's attribute name
// options - Optional hash of available options
Backbone.InlineEdit(element, model, attribute, options);
```

* `success` : Callback on successful save
* `error` : Callback on failed save
* `onBlur` : Callback onBlur when a save is NOT performed because the value did not change
* `placeholder` : Placeholder text for elements that are empty
* `date` : Make editable element use a date picker (Requires datepicker dependency)
* `hoverColor` : Color for editable element hover state
* `minWidth` : Minimum width of editable element
* `display` : CSS display property value for editable elements

### Placeholders

Optionally, you can set the data-inline-placeholder-text property on the HTML node instead of passing a value into the `InlineEditable` function.

Examples

```html
<div>
  This is text and here is the part
    <span id="foo" data-inline-placeholder-text="{edit me}" contenteditable="true"></span>
  for editing.
</div>
```

Furthermore, the color of the placeholder can be styled from the default color to a differing color in your css.

```css
#foo.inline-placeholder {
    color: orange;
}
```

### Example Usage:

Basic usage look would look like this:
```javascript
var TestModel = Backbone.Model.extend({
  url : "/test_model"
});
var TestView = Backbone.View.extend({
  model : TestModel,
  render : function () {
    this.$el.html(this.template(this.model.toJSON()));
    Backbone.InlineEdit(this.$(".name"), this.model, "name"); // Setup inline editing
    return this;
  }
});
```

Date picker usage:
```javascript
var TestModel = Backbone.Model.extend({
  url : "/test_model"
});
var TestView = Backbone.View.extend({
  model : TestModel,
  render : function () {
    this.$el.html(this.template(this.model.toJSON()));
    Backbone.InlineEdit(this.$(".dob"), this.model, "dateOfBirth", { date : true });
    return this;
  }
});
```
