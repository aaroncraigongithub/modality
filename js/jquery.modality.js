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
      $.modality('create_wrapper');

      var global_config = $('#modality-wrapper').data('global-config');

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
        onLoad:         null,
        onBeforeLoad:   null,
        autoShow:       true,
        class:          '',
        id:             'modality-' + $('.modality-instance').length
      }, global_config, cfg);


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

    create_wrapper: function() {
      if ($('#modality-wrapper').length == 0) {
        $('body').append('<div id="modality-wrapper"><div id="modality-content" /></div>');

        $('#modality-wrapper').data('instances', []);
        $('#modality-wrapper').click(function(e) {
          if ($(e.target).is($(this))) {
            $.modality('close_all', 'click', true);
          }
        });

        $('#modality-wrapper').data('stack', []);
        $('#modality-wrapper').data('current', -1);

        $(document).keypress(function(e) {
          if ($('#modality-wrapper').hasClass('visible') && e.keyCode == 27) {
            $.modality('close_all', 'esc', true);
          }
        });

        $(window).scroll(function(e) {
          $('#modality-wrapper').css('height', $(window).height() + $(window).scrollTop());
        });
      }
    },

    call: function(event, instance) {
      var ret = null;
      if (instance.config[event]) {
        ret = instance.config[event].apply(instance.html, Array.prototype.slice.call(arguments, 2));

        if (ret !== null) {
          return ret;
        }
      }

      var global_callback = $.modality('global', event);
      if (global_callback) {
        return global_callback.apply(instance.html, Array.prototype.slice.call(arguments, 2));
      }

      return null;
    },

    /*****************************************
     *
     * Set/get global configuration
     *
     */
    global: function(key, value) {
      $.modality('create_wrapper');

      if (typeof key == 'object') {
        $('#modality-wrapper').data('global-config', key);
      }
      if (typeof key == 'string') {
        var existing = $('#modality-wrapper').data('global-config');
        if (!existing) {
          return null;
        }

        if (typeof value != 'undefined') {
          existing[key] = value;
          $('#modality-wrapper').data('global-config', existing);
          return value;
        }
        else {
          return existing[key];
        }
      }

      return key;
    },

    /*****************************************
     *
     * Get a single instance based on it's config value
     *
     */
    get_instance: function(config) {
      var instances = $('#modality-wrapper').data('instances');
      for (var i = 0; i < instances.length; i++) {
        var test_a = $.extend(true, {}, instances[i].config);
        var test_b = $.extend(true, {}, config);

        // first just check by id
        if (test_a.id == test_b.id) {
          return instances[i];
        }

        // if content is an object and equal, these are the same
        if (typeof(test_a.content) == 'object' && typeof(test_b.content) == 'object') {
          // assume jQuery objects
          if (test_a.is && test_a.is(test_b)) {
            // just in case two different configurations point to the same element
            test_a.content = test_b.content = 'x';
          }
        }

        // el is necessarily a jQuery object or selector
        if (test_a.el && test_b.el) {
          if ($(test_a).is($(test_b))) {
            test_a.content = test_b.content = 'x';
          }
        }

        // if we've gotten this far, it's possible the id was auto-generated, so equalize
        if (test_a.id.match(/^modality-/)) {
          test_a.id = test_b.id;
        }

        // any properties that could be objects would have matched by now, so
        // remove them so that we don't get circular structure errors when we stringify
        if (typeof test_a.content == 'object') { test_a.content = 'a' }
        if (typeof test_b.content == 'object') { test_a.content = 'b' }
        if (typeof test_a.el == 'object') { test_a.el = 'a' }
        if (typeof test_b.el == 'object') { test_b.el = 'b' }

        if (JSON.stringify(test_a) == JSON.stringify(test_b)) {
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
     * Get the stack index for this instance
     *
     */
    get_stack_index_from_id: function(id) {
      var stack = $('#modality-wrapper').data('stack');
      for (var i = 0; i < stack.length; i++) {
        if (stack[i] == id) {
          return i;
        }
      }

      return -1;
    },

    /*****************************************
     *
     * Add an instance to the stack
     *
     */
    add_to_stack: function(id) {
      if ($.modality('get_stack_index_from_id', id) > -1) {
        return;
      }

      var stack = $('#modality-wrapper').data('stack');
      stack.push(id);
      $('#modality-wrapper').data('stack', stack);
    },

    /*****************************************
     *
     * Get the id of the next instance in the stack relative to the given index
     *
     */
    get_stack_position: function(index, direction) {
      var stack = $('#modality-wrapper').data('stack');
      if (stack.length == 0) {
        return null;
      }

      if (direction == 'first') {
        return stack[0];
      }
      if (direction == 'last') {
        return stack[stack.length - 1];
      }
      if (direction == 'prev') {
        var next = index - 1;
        return (next < stack.length)? stack[next] : null;
      }
      if (direction == 'next') {
        var next = index + 1;
        return (next < stack.length)? stack[next] : null;
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
    hide: function(id, source) {
      var $this    = null
      var instance = null;
      if (typeof id != 'undefined') {
        instance = $.modality('get_instance_from_id', id);
        $this = instance.html;
      }
      else {
        $this = $(this);
        instance = $this.data('modality-instance');
      }

      if (typeof source == 'undefined') {
        source = 'code';
      }

      instance.html.modality('close', source, true);
    },

    close: function(source, hide_wrapper, id) {
      var $this    = null
      var instance = null;
      if (typeof id != 'undefined') {
        instance = $.modality('get_instance_from_id', id);
        $this = instance.html;
      }
      else {
        $this = $(this);
        instance = $this.data('modality-instance');
      }

      if (instance) {
        var ret = $.modality('call', 'onBeforeClose', instance, source);
        if (ret === false) {
          return;
        }

        if (ret !== true) {
          var next_id = ret;
          if (ret == 'prev' || ret == 'next' || ret == 'first' || ret == 'last') {
            var index  = $.modality('get_stack_index_from_id', instance.config.id);
            next_id    = $.modality('get_stack_position', index, ret);
          }

          var next = $.modality('get_instance_from_id', next_id);
          if (next) {
            next.html.modality('show');
            return;
          }
        }

        instance.html.find('.message-close-x').removeClass('visible');

        // make sure the container doesn't disappear
        $('#modality-content').css('min-height', instance.html.outerHeight());

        instance.html.hide('slide', function() {
          instance.html.removeClass('visible');

          if (hide_wrapper) {
            $.modality('hide_wrapper', source);
          }
        });
      }
      else {
        if (hide_wrapper) {
          $.modality('hide_wrapper', source);
        }
      }
    },

    /*****************************************
     *
     * Go to the previously shown modal, relative to the given modal.
     * If id is omitted, shows previous to the last shown
     */
    prev: function(id) {
      if (typeof id == 'undefined') {
        id = $('#modality-wrapper').data('current');
      }

      var this_index  = $.modality('get_stack_index_from_id', id);
      var next_id     = $.modality('get_stack_position', this_index, 'prev');

      if (next_id) {
        $.modality('show', next_id);
      }
      else {
        $.modality('close_all', 'code', true);
      }
    },

    /*****************************************
     *
     * Hide the wrapper if no other modals are showing
     *
     */
    hide_wrapper: function(source) {
      var instances = $('#modality-wrapper').data('instances');
      for (var i = 0; i < instances.length; i++) {
        if (instances[i].html.hasClass('visible')) {
          return;
        }
      }


      // nothing left open, so close
      for (var i = 0; i < instances.length; i++) {
        $.modality('call', 'onClose', instances[i], source);
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
    show: function(id) {
      var $this    = null
      var instance = null;
      if (typeof id != 'undefined') {
        instance = $.modality('get_instance_from_id', id);
        $this = instance.html;
      }
      else {
        $this = $(this);
        instance = $this.data('modality-instance');
      }

      // set the new content, if necessary
      if (!instance.loaded) {
        // show the content
        $this.modality('set_title', instance.config.title);
        $this.modality('set_close_button', instance.config.close_button);

        if (instance.config.content || instance.config.el) {
          var content = (instance.config.content)? instance.config.content : instance.config.el.html();

          var changed = $.modality('call', 'onBeforeLoad', instance, content);
          $this.modality('set_content', (changed)? changed : content);

          instance.loaded = true;
          $.modality('call', 'onLoad', instance, instance.html, (changed)? changed : content);
        }
        else if (instance.config.source) {
          $this.modality('set_content', instance.config.wait_message);
          instance.html.addClass('spinner');

          $.getJSON(instance.config.source, function(data) {
            instance.html.removeClass('spinner');
            if (data.status == 'OK') {
              var changed = $.modality('call', 'onBeforeLoad', instance, data.content);
              $this.modality('set_content', (changed)? changed : data.content);
              instance.loaded = true;
              $.modality('call', 'onLoad', instance, instance.html, (changed)? changed : data.content);
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

      $.modality('add_to_stack', instance.config.id);
      $('#modality-wrapper').data('current', instance.config.id);

      // position the window for new content
      $.modality('show_modal', function() {
        instance.html.show('slide', function() {
          $(this).addClass('visible');

          $.modality('call', 'onOpen', instance);

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
      if (source == 'button' || source == 'esc' || source == 'x') {
        $('#modality-wrapper').data('stack', []);
        $('#modality-wrapper').data('current', -1);
      }

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
    set_title: function(title, id) {
      var $this    = null
      var instance = null;
      if (typeof id != 'undefined') {
        instance = $.modality('get_instance_from_id', id);
        $this = instance.html;
      }
      else {
        $this = $(this);
        instance = $this.data('modality-instance');
      }

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
    set_close_button: function(text, id) {
      var $this    = null
      var instance = null;
      if (typeof id != 'undefined') {
        instance = $.modality('get_instance_from_id', id);
        $this = instance.html;
      }
      else {
        $this = $(this);
        instance = $this.data('modality-instance');
      }

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
    set_content: function(message, id) {
      var $this    = null
      var instance = null;
      if (typeof id != 'undefined') {
        instance = $.modality('get_instance_from_id', id);
        $this = instance.html;
      }
      else {
        $this = $(this);
        instance = $this.data('modality-instance');
      }

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

      var top = $(window).scrollTop() + 50;
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
