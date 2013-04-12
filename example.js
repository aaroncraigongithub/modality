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

        onLoad: function(el) {
          el.find('#another-modal').click(function(e) {
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
        title:        "The title",
        content:      "Content with <a href='#' id='another-modal'>another modal</a>",
        close_button: "Close me",
        close_x:      false,
        height:       500,
        width:        500,
        id:           'first-dialog',

        onLoad: function(el) {
          el.find('#another-modal').click(function(e) {
            $.modality({
              title:        "Another modal!",
              content:      "This is so cool!",
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
      content:      "Content with <a href='#' id='another-modal'>another modal</a>",
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
