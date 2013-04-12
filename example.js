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
  });

})(jQuery);
