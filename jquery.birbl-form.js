(function($) {
  "use strict";

  var birbl_form = 'birbl_form';

  var methods = {
    init: function(config) {
      return this.each(function() {
        var $this = $(this);
        $this.data('birbl-form', $this);

        /**
         * Hide labels and put instruction text in text[area] elements
         */
        $this.hide_labels = function() {
          $this.find('input, textarea').each(function() {
            var $this = $(this);
            if ($this.attr('data-default') == undefined) {
              return;
            }

            // hide the label, unless told otherwise
            if (!$this.attr('data-keep-label')) {
              var label = $("label[for='" + $this.attr('id') + "']");
              label.css('display', 'none');
            }

            if ($this.attr('data-default') == '') {
              $this.attr('data-default', label.html());
            }

            $this.data('default_value', function() {
              var def = $this.attr('data-default');
              var val = {};
              if (/^\{/.exec(def)) {
                val = JSON.parse(def);
              }
              else {
                val.all = def;
              }

              var breakpoints = [320, 480, 600, 768, 800, 960];
              for (var i = breakpoints.length - 1; i > -1; i--) {
                if ($(window).width() > breakpoints[i] && val[breakpoints[i]]) {
                  return val[breakpoints[i]];
                }
              }

              return (val.all)? val.all : '';
            });

            $this.focus(function() {
              if ($this.val() == $this.data('default_value')()) {
                $this.val('');
              }
              else {
                $this.select();
              }
            });

            $this.blur(function() {
              if ($this.val() == '') {
                $this.val($this.data('default_value')());
              }
            });

            if (!$this.hasClass('prompt-disabled')) {
              $this.reminder_tmr     = null;
              $this.reminder_visible = false;
              $this.reminder_prompt  = $('<div class="reminder-prompt"><div class="content">' + $this.data('default_value')() + '</div></div>');

              $this.reminder_prompt.css({
                position: 'absolute',
                width:    $this.outerWidth()
              });

              $this.reminder_prompt.hide();
              $('body').append($this.reminder_prompt);

              $this.hide_reminder = function() {
                if ($this.reminder_tmr) {
                  window.clearTimeout($this.reminder_tmr);
                  $this.reminder_tmr = null;
                }

                $this.reminder_prompt.hide('fade');
                $this.reminder_visible = false;
              };

              $this.reminder_countdown = function() {
                if ($this.reminder_visible) {
                  return;
                }

                if ($this.reminder_tmr) {
                  window.clearTimeout($this.reminder_tmr);
                  $this.reminder_tmr = null;
                }

                $this.reminder_tmr = window.setTimeout(function() {
                  $this.reminder_prompt.css({
                    top:      $this.offset()['top'] + $this.outerHeight(),
                    left:     $this.offset()['left']
                  });
                  $this.reminder_prompt.show('fade');
                  $this.reminder_visible = true;
                }, 1000);
              };

              $this.blur(function() {
                $this.hide_reminder();
              });

              $this.focus(function() {
                $this.reminder_countdown();
              });

              $this.keypress(function() {
                $this.reminder_countdown();
              });
            }

            $this.blur();
          });

          $this.find('input[type=submit]').click(function() {
            $('input, textarea').each(function() {
              var $this = $(this);
              if ($this.attr('data-default') == undefined) {
                return;
              }

              if ($this.val() == $this.data('default_value')()) {
                $this.val('');
              }
            });
          });
        };

        /**
         * Password strength checker
         */
        $this.find('#user_password').after("<div id='password-strength'><span id='password-strength-message'></span><span id='password-strength-meter'></span></div>");

        $this.find('#user_password').keyup(function() {
          var v = $(this).val();
          var l = v.length;
          var min_length = 8;

          // simple password strength checking.  Add points for good practices, remove for bad
          if (l < min_length) {
            $('#password-strength-meter').css({width: 0});
            $('#password-strength-message').html('Must be at least 8 characters.');
            return;
          }

          var points  = 0;
          var message = '';

          points += Math.ceil(l / 8); // one point for every 8 characters of length

          var match = v.match(/([0-9])/g);
          if (match) {
            points += (match.length < 3) ? match.length : 3;
          }
          else {
            message = 'Add some numbers';
          }

          match = v.match(/([^\w_])/);
          if (match) {
            points += ((match.length < 3) ? match.length : 3) * 1.5;
          }
          else {
            message = 'Add some symbols, like "$" or "@"';
          }

          if (v.match(/(.)\1/)) {
            message = "Try not to repeat characters";
            points -= 1;
          }

          var final    = (points > 10)? 10 : points;
          var strength = ((final > 6) ? 'strong' :
              ((final > 3) ? "medium" : "weak"));

          $('#password-strength-meter')
            .removeClass('strong medium weak')
            .addClass(strength)
            .css({width: (points * 10) + '%'});
          $('#password-strength-message')
            .removeClass('strong medium weak')
            .addClass(strength)
            .html(strength + (message ? ' (' + message + ')' : ''));
        });

        $('#password_confirmation').after("<div id='password-confirmation-message'></div>");

        $('#password_confirmation').keyup(function() {
          var p = $('#user_password').val();
          var c = $(this).val();

          if (!p || !c) {
            return;
          }

          var m = (p == c) ? 'Ok! Passwords match.' : 'Passwords do not match.';
          $('#password-confirmation-message')
            .removeClass('match nomatch')
            .addClass(p == c ? 'match' : 'nomatch')
            .html(m);
        });

        /**
         * Check for required fields and disable submit buttons when clicked.
         *
         * For AJAX forms, the form is responsible for resetting the form and spinner by calling
         * the form's reset() function.  This is usually done like:
         * $('#my-form').birbl_form('reset_submit');
         */
        $this.monitor_submit = function() {
          if ($this.find('.spinner').length == 0) {
            $this.find('input:submit').wrap('<div class="submit-spinner-group"/>');
            $this.find('input:submit').after('<div class="spinner inert textual"></div>');
          }

          $this.find('input[type=submit]').bind('click', function(e) {
            // don't submit twice
            if ($(this).hasClass('disabled')) {
              e.preventDefault();
              return;
            }

            // validate form elements
            var valid = true;
            $(this).find('.missing').removeClass('missing');

            if ($(this).find('input.error, select.error, textarea.error').length > 0) {
              valid = false;
            }

            // all required field should be filled in
            $(this).find('.required').filter('input, textarea, select').each(function() {
              if ($(this).val() == '') {
                $(this).addClass('missing');
                valid = false;
              }
            });

            if (!valid) {
              // invalid, so refuse to submit
              e.preventDefault();

              var pop = new $.birbl_message({
                title:   "Form incomplete!",
                message: "Please fill in all required fields."
              });

              $(this).birbl_form('reset_submit');
              $(this).birbl_form('hide_labels');
            }
            else {
              // valid, send it off
              if ($(this).attr('data-save-message') != '') {
                $this.find('.spinner').html($(this).attr('data-save-message'));
              }

              $this.find('.spinner').css({display: 'inline'});

              $(this).addClass('disabled');
            }
          });
        };

        $this.reset_submit = function() {
          $this.find('input:submit').removeClass('disabled');
          $this.find('.spinner')
            .removeClass('spinner')
            .addClass('inert');
        };

        $this.monitor_submit();
        $this.hide_labels();
      });
    },
    reset_submit: function() {
      return this.each(function() {
        var $this = $(this).data('birbl-form');

        $this.reset_submit();
      });
    },
    hide_labels: function() {
      return this.each(function() {
        var $this = $(this).data('birbl-form');

        $this.hide_labels();
      });
    }
  };

  $.fn[birbl_form] = $[birbl_form] = function (method) {
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.birbl-form' );
      return null;
    }
  };
})(jQuery);
