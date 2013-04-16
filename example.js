(function($) {
  "use strict";

  $(document).ready(function() {
    $('#simple-modal').click(function() {
      $.modality({
        title:        "The title",
        content:      "The content",
        close_button: "Close me"
      });
    });

    $('#configured-modal').click(function() {
      $.modality({
        title:        "The title",
        content:      "The content",
        close_button: "Close me",
        close_x:      false,
        height:       500,
        width:        500
      });
    });

    $('#navigation-modal').click(function() {
      $.modality({
        title:        "first",
        content:      "This is the first.",
        height:       500,
        width:        500,
        autoShow:     false,
        id:           'navigation-1',
        close_button: 'close'
      });
      $.modality({
        title:        "second",
        content:      "This is the second",
        height:       500,
        width:        500,
        autoShow:     false,
        close_button: 'back',
        id:           'navigation-2',
        onBeforeClose: function(source) {
          if (source == 'button') {
            return 'prev';
          }

          return null;
        }
      });
      $.modality({
        title:        "third",
        content:      "This is the third",
        height:       500,
        width:        500,
        autoShow:     false,
        close_button: 'back',
        id:           'navigation-3',
        onBeforeClose: function(source) {
          if (source == 'button') {
            return 'prev';
          }

          return null;
        }
      });
      $.modality({
        title:        "fourth",
        content:      "This is the fourth",
        height:       500,
        width:        500,
        autoShow:     false,
        close_button: 'back',
        id:           'navigation-4',
        onBeforeClose: function(source) {
          if (source == 'button') {
            return 'prev';
          }

          return null;
        }
      });

      $.modality('show', 'navigation-1');

      window.setTimeout(function() {
        $.modality('show', 'navigation-2');

        window.setTimeout(function() {
          $.modality('show', 'navigation-3');

          window.setTimeout(function() {
            $.modality('show', 'navigation-4');
          }, 1500);
        }, 1500);
      }, 1500);
    });

    $('#before-load-modal').click(function() {
      $.modality({
        title:        "The title",
        content:      "This content will be altered before it's displayed",
        height:       500,
        width:        500,
        onBeforeLoad: function(content) {
          return "<p>" + content + "</p><p>This text has been added</p>";
        }
      });
    });

    $('#code-close-modal').click(function() {
      $.modality({
        title:        "The title",
        content:      "This will close from code when you <a id='click-this' href='#'>click here</a>.",
        close_x:      false,
        close_button: false,
        height:       500,
        width:        500,
        id:           'code-close-dialog',
        onBeforeClose: function(source) {
          return source == 'code';
        },
        onLoad: function(el, content) {
          el.find('a#click-this').click(function(e) {
            e.preventDefault();

            $.modality('hide', 'code-close-dialog');
          });
        }
      });
    });

    $('#global-modal').click(function() {
      $.modality('global', {
        onClose: function(source) {
          console.log("global close called from " + source);
        }
      });

      $.modality({
        title:        "The title",
        content:      "The content",
        close_button: "Close me",
        close_x:      false,
        height:       500,
        width:        500
      });
    });

    $('#multiple-modal').click(function() {
      $.modality({
        title:        "The title",
        content:      "Content with <a href='#' id='another-modal'>another modal</a>",
        close_button: "Close me",
        close_x:      false,
        height:       500,
        width:        500,

        onLoad: function(el, content) {
          el.find('#another-modal').click(function(e) {
            e.preventDefault();

            $.modality({
              title:        "Another modal!",
              content:      "This is so cool!",
              close_button: "Back",
              close_x:      false,
              height:       800,
              width:        800,
            });
          });
        }
      });
    });

    $('#navigate-modal').click(function() {
      $.modality({
        title:        "The first one",
        content:      "Content with <a href='#' id='nav-modal'>another modal</a>",
        close_button: "Close me",
        close_x:      false,
        height:       500,
        width:        500,
        id:           'first-dialog',

        onLoad: function(el) {
          el.find('#nav-modal').click(function(e) {
            $.modality({
              title:        "A new modal!",
              content:      "This is righteous!",
              close_button: "Back",
              close_x:      false,
              height:       800,
              width:        800,

              onBeforeClose: function(source) {
                if (source == 'button') {
                  return 'first-dialog';
                }

                // forbid closing on 'esc'
                if (source == 'esc') {
                  return false;
                }

                // otherwise, close normally
                return true;
              }
            });
          });
        }
      });
    });

    $.modality({
      title:        "The title",
      content:      "This was created on $(document).ready and shown when you clicked the button",
      close_button: "Close me",
      close_x:      false,
      height:       500,
      width:        500,
      id:           'delayed-dialog',
      autoShow:     false
    });

    $('#delayed-modal').click(function() {
      $.modality('show', 'delayed-dialog');
    });
  });

})(jQuery);
