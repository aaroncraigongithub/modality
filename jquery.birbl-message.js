/**
 * The BirblMessage singleton allows for easy messaging
 * from Javascript, typically to give feedback during AJAX
 * interactions, etc.
 */
(function($) {
  "use strict";

  var birbl_message = 'birbl_message';

  $.fn[birbl_message] = $[birbl_message] = function (cfg) {
    var $this  = this;
    var config = $.extend({}, {
      title:      '',
      message:    '',
      close:      'OK',
      onClose:    null,
      onOpen:     null,
      autoShow:   true,
      hideOthers: false,
      class:      '',
      id:         'message-popup-' + $('.birbl-message-instance').length
    }, cfg);
    $this.initialized = false;

    var template =
      "<div class='birbl-message-instance' id='{id}'>" +
        "<h1 class='message-title'></h1>" +
        "<div class='message-wrapper'>" +
          "<div class='message-content'>" +
          "</div>" +
          "<div class='message-close'>" +
          "</div>" +
        "</div>" +
      "</div>";

    $this.message_div = $($(template.replace('{id}', config.id))[0]);
    $this.message_div.hide();
    $('body').prepend($this.message_div);

    var classes = config.class.split(' ');
    for (var i = 0; i < classes.length; i++) {
      $this.message_div.addClass(classes[i]);
    }

    $this.message_wrapper = $($('<div class="birbl-message-wrapper"></div>')[0]);
    $('body').prepend($this.message_wrapper);

    $this.message_div.find('.message-close').click(function() {
      $this.close('button');
    });

    $this.message_wrapper.bind('click', function() {
      $this.close('window');
    });

    $this.close = function(source) {
      $this.message_div
        .hide('clip')
        .removeClass('visible');

      $this.message_wrapper.removeClass('visible');

      if (config.onClose) {
        config.onClose(source);
      }
    };

    $this.hide = function() {
      $this.close('hide');
    };

    $this.set_message = function(message) {
      $this.message_div.find('.message-content').children().remove();
      $this.message_div.find('.message-content').html(message);
    };

    $this.current_message = function() {
      return $($this.message_div.find('.message-content').children());
    };

    $this.set_title = function(title) {
      var title_el = $this.message_div.find('.message-title');
      title_el.children().remove();

      if (title) {
        title_el.html(title);
        title_el.css({display: 'block'});
      }
      else {
        title_el.css({display: 'none'});
      }
    };

    $this.set_close_text = function(text) {
      if (text) {
        $this.message_div.find('.message-close').html(text);
        $this.message_div.find('.message-close').removeClass('hidden');
      }
      else {
        $this.message_div.find('.message-close').addClass('hidden');
      }
    };

    $this.spinner = function(on) {
      if (on) {
        $this.message_div.find('.message-content').addClass('spinner');
      }
      else {
        $this.message_div.find('.message-content').removeClass('spinner');
      }
    };

    $this.position = function() {
      var window_w = $(window).width();

      var div_w = 0;
      if (config.width) {
        div_w = config.width;
      }
      else {
        div_w = window_w / 4; // 25%
        if (div_w > 500) {
          div_w = 500;
        }

        // responsive, though
        if (window_w < 600) {
          div_w = window_w / 3 * 2; // 66%
        }
        if (window_w < 480) {
          div_w = window_w; // 100%
        }

        // but not TOO responsive
        if (div_w < 300) {
          div_w = 300;
        }
      }

      var top = $(window).scrollTop() + $(window).height() * .1;
      if (top < 5) {
        top = 5;
      }

      $this.message_div.css({
        position:   'absolute',
        width:      div_w,
        left:       $(window).width() / 2 - (div_w / 2),
        top:        top
      });
    };

    $this.show = function() {
      if (config.hideOthers) {
        $('.birbl-message-wrapper').removeClass('visible');
        $('.birbl-message-instance').hide();
      }

      $this.position();

      $this.message_wrapper.addClass('visible');

      $this.message_div
        .addClass('visible')
        .show('clip', function() {
          if (config.onOpen) {
            config.onOpen();
          }
        });
    };

    $this.set_close_text(config.close);
    $this.set_title(config.title);

    if (config.message) {
      $this.set_message(config.message);
    }

    if (config.autoShow) {
      $this.show();
    }

    return $this;
  };

})(jQuery);
