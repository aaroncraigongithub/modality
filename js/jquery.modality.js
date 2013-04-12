(function($) {
  "use strict";

  var modality = 'modality';

  var methods = {

    /*****************************************
     *
     * Initializer
     *
     */
    init: function(cfg) {
      var config = $.extend({}, {
        title:          '',
        content:        '',
        source:         '',
        el:             '',
        wait_message:   'Fetching content...',
        close_button:   'OK',
        close_x:        true,
        onClose:        null,
        onBeforeClose:  null,
        onOpen:         null,
        autoShow:       true,
        class:          '',
        id:             'modality-' + $('.modality-instance').length
      }, cfg);

      // ensure our wrapper is set up
      if ($('#modality-wrapper').length == 0) {
        $('body').append('<div id="modality-wrapper"><div id="modality-content" />');

        $('#modality-wrapper').data('instances', []);
        $('#modality-wrapper').click(function(e) {
          if ($(e.target).is($(this))) {
            $.modality('close_all', 'click', true);
          }
        });

        $(document).keypress(function(e) {
          if ($('#modality-wrapper').hasClass('visible') && e.keyCode == 27) {
            $.modality('close_all', 'esc', true);
          }
        });
      }

      var els = this;
      if (typeof this == 'function') {
        // calling method is $.modality(config)
        var modal = $.modality('append_instance', config);
        if (config.autoShow) {
          $(modal.html).modality('show');
        }
      }
      else {
        // calling method is $(selector).modality()
        // update config so that el: this and send to append
        els = els.each(function() {
          var $this = $(this);
          var copy  = $.extend(true, {}, config);

          copy.el      = $this;
          copy.source  =  '';
          copy.content = '';

          var modal = $.modality('append_instance', copy);
          if (copy.autoShow) {
            $(modal.html).modality('show');
          }
        });
      }

      return els;
    },

    /*****************************************
     *
     * Get a single instance based on it's config value
     *
     */
    get_instance: function(config) {
      var instances = $('#modality-wrapper').data('instances');
      for (var i = 0; i < instances.length; i++) {
        var test = $.extend(true, {}, instances[i].config);

        // will never match if the id was auto-generated
        if (test.id.match(/^modality-/)) {
          test.id = config.id;
        }

        if (JSON.stringify(test) == JSON.stringify(config)) {
          return instances[i];
        }
      }

      return null;
    },

    /*****************************************
     *
     * Get a single instance from it's id value passed in config
     *
     */
    get_instance_from_id: function(id) {
      var instances = $('#modality-wrapper').data('instances');
      for (var i = 0; i < instances.length; i++) {
        if (instances[i].config.id == id) {
          return instances[i];
        }
      }

      return null;
    },

    /*****************************************
     *
     * Append a single modal instance to the wrapper and return is as a jQuery object
     *
     */
    append_instance: function(config) {
      var existing = $.modality('get_instance', config);
      if (existing) {
        return existing;
      }

      var template =
        "<div class='modality-instance {class}' id='{id}'>" +
          "<div class='message-close-x'>x</div>" +
          "<h1 class='message-title'></h1>" +
          "<div class='message-wrapper'>" +
            "<div class='message-content'></div>" +
            "<div class='message-close-button'></div>" +
          "</div>" +
        "</div>";

      var content = template
        .replace('{id}', config.id)
        .replace('{class}', config.class);

      var message_div = {
        html:   $($(content)[0]),
        loaded: false,
        config: config
      };

      var instances = $('#modality-wrapper').data('instances');
      instances.push(message_div);
      $('#modality-wrapper').data('instances', instances);

      message_div.html.hide();
      $('#modality-wrapper #modality-content').append(message_div.html);

      message_div.html.data('modality-instance', message_div);

      message_div.html.find('.message-close-x').click(function(e) {
        message_div.html.modality('close', 'x', true);
      });
      message_div.html.find('.message-close-button').click(function() {
        message_div.html.modality('close', 'button', true);
      });

      return message_div;
    },

    /*****************************************
     *
     * Hide the given modal
     *
     */
    close: function(source, hide_wrapper) {
      var $this = $(this);
      var instance = $this.data('modality-instance');

      if (instance.config.onBeforeClose) {
        var ret = instance.config.onBeforeClose(source);

        if (ret === false) {
          return;
        }

        if (ret !== true) {
          var next = $.modality('get_instance_from_id', ret);
          if (next) {
            next.html.modality('show');
            return;
          }
        }
      }

      if (instance) {
        instance.html.find('.message-close-x').removeClass('visible');

        // make sure the container doesn't disappear
        $('#modality-content').css('min-height', instance.html.outerHeight());

        instance.html.hide('slide', function() {
          instance.html.removeClass('visible');

          if (instance.config.onClose) {
            instance.config.onClose(source);
          }

          if (hide_wrapper) {
            $.modality('hide_wrapper');
          }
        });
      }
      else {
        if (hide_wrapper) {
          $.modality('hide_wrapper');
        }
      }
    },

    /*****************************************
     *
     * Hide the wrapper if no other modals are showing
     *
     */
    hide_wrapper: function() {
      var instances = $('#modality-wrapper').data('instances');
      for (var i = 0; i < instances.length; i++) {
        if (instances[i].html.hasClass('visible')) {
          return;
        }
      }

      $.modality('hide_modal', function() {
        $('#modality-wrapper').removeClass('visible');
        $('body > *:not(#modality-wrapper)').removeClass('modality-blurred');
      });
    },

    /*****************************************
     *
     * Show the given modal
     *
     */
    show: function() {
      var $this = $(this);
      var instance = $this.data('modality-instance');

      // set the new content, if necessary
      if (!instance.loaded) {
        // show the content
        $this.modality('set_title', instance.config.title);
        $this.modality('set_close_button', instance.config.close_button);

        if (instance.config.content || instance.config.el) {
          var content = (instance.config.content)? instance.config.content : instance.config.el.html();

          $this.modality('set_content', content);

          instance.loaded = true;
          if (instance.config.onLoad) {
            instance.config.onLoad(instance.html, content);
          }
        }
        else if (instance.config.source) {
          $this.modality('set_content', instance.config.wait_message);
          instance.html.addClass('spinner');

          $.getJSON(instance.config.source, function(data) {
            instance.html.removeClass('spinner');
            if (data.status == 'OK') {
              $this.modality('set_content', data.content);
              instance.loaded = true;
              if (instance.config.onLoad) {
                instance.config.onLoad(instance.html, data);
              }
            }
            else {
              $this.modality('set_title', data.status);
              $this.modality('set_content', data.error);
            }
          });
        }
      }


      // if we're visible, just position, slide current content away and replace
      if ($('#modality-wrapper').hasClass('visible')) {
        // hide any currently displayed modals
        $.modality('close_all', 'replace', false);
      }

      // position the window
      $.modality('position_modal', instance.config);

      // ensure the wrapper is visible
      $('#modality-wrapper').addClass('visible');
      $('body > *:not(#modality-wrapper)').addClass('modality-blurred');

      // position the window for new content
      $.modality('show_modal', function() {
        instance.html.show('slide', function() {
          $(this).addClass('visible');

          if (instance.config.onOpen) {
            instance.config.onOpen();
          }

          if (instance.config.close_x) {
            instance.html.find('.message-close-x').addClass('visible');
          }
        });
      });
    },

    /*****************************************
     *
     * Close all modal windows
     *
     */
    close_all: function(source, hide_wrapper) {
      var instances = $('#modality-wrapper').data('instances');
      for (var i = 0; i < instances.length; i++) {
        if (instances[i].html.hasClass('visible')) {
          instances[i].html.modality('close', source, hide_wrapper);
        }
      }
    },

    /*****************************************
     *
     * Set the modal title
     *
     */
    set_title: function(title) {
      var $this = $(this);
      var instance = $this.data('modality-instance');

      if (title) {
        instance.html.find('.message-title').html(title);
      }
      else {
        instance.html.find('.message-title').css('display', 'none');
      }
    },

    /*****************************************
     *
     * Set the modal close button
     *
     */
    set_close_button: function(text) {
      var $this = $(this);
      var instance = $this.data('modality-instance');

      if (text) {
        instance.html.find('.message-close-button').html(text);
      }
      else {
        instance.html.find('.message-close-button').css('display', 'none');
      }
    },

    /*****************************************
     *
     * Set the modal content
     *
     */
    set_content: function(message) {
      var $this = $(this);
      var instance = $this.data('modality-instance');

      instance.html.find('.message-content').html(message);
    },

    /*****************************************
     *
     * Position the modal container
     *
     */
    position_modal: function(config) {
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

      var top = $(window).height() * .1;
      if (top < 5) {
        top = 5;
      }

      var pos = {
        width:      div_w,
        left:       $(window).width() / 2 - (div_w / 2),
        top:        top
      };

      if ($('#modality-wrapper').hasClass('visible')) {
        // visible, so do a cool animation
        $('#modality-content').animate(pos, 'slow');
      }
      else {
        // hidden, we can just position
        $('#modality-content').css(pos);
      }
    },

    show_modal: function(callback) {
      $('#modality-content').show('clip', callback);
    },

    hide_modal: function(callback) {
      $('#modality-content').hide('clip', callback);
      $('#modality-content').css('min-height', 0);
    }
  };

  $.fn[modality] = $[modality] = function (method) {
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.modality' );
      return null;
    }
  };
})(jQuery);
