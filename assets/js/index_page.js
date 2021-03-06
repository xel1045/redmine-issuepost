if (in_node_webkit) {
	var tray = new gui.Tray({ icon: 'assets/images/tray_icon.png' });

	tray.on('click', function() {
		gui.Window.get().show();
	});
}

var configuration_window = null;

$(document).ready(function() {
	$('#subject').focus();

	var application = new Application();

	application.fetch_projects();

	$('#main-form').submit(function(event) {
		event.preventDefault();

		var project = application.find_project_from_name($('#project').val());
		var tracker = application.find_tracker_from_name($('#tracker').val());
		var subject = $('#subject').val();
		var description = $('#description').val();
		application.submit_issue(project, tracker, subject, description);
	});

	$('#project').blur(function() {
		var $this = $(this);

		var project = application.find_project_from_name($this.val());

		if (project !== null) {
			application.fetch_project_tracker(project.identifier);
		}
	});

	$('#config').click(function() {
		if (in_node_webkit) {
			if (configuration_window === null) {
				console.log('Opening configuration window');
				configuration_window = gui.Window.open('configuration.html', {
					width: 500,
					height: 100,
					resizable: false,
					toolbar: false,
					frame: false,
				});

				configuration_window.on('closed', function() {
					console.log('Closing configuration window');
					configuration_window = null;
					application.refresh_config();
					application.fetch_projects();
				})
			} else {
				configuration_window.focus();
			}
		}
	});

	// cmd + enter = submit
	$('form').keydown(function(event) {
		var windowsCommand = event.keyCode === 13 && event.ctrlKey;
		var macCommand = event.keyCode === 13 && event.metaKey;
		if (windowsCommand || macCommand) {
			$(this).submit();
			return false;
		}
	});

	// esc
	$(window).keydown(function(event) {
		if (event.keyCode === 27 && in_node_webkit) {
			gui.Window.get().hide();
		}
	});

	// Autogrow textarea
	$('textarea').autogrow({
		update: function() {
			if (in_node_webkit) {
				gui.Window.get().height = $('body').height() + $('footer').outerHeight() + 10;
			}
		}
	});

	// Blur
	/*if (in_node_webkit) {
		gui.Window.get().on('blur', function() {
			this.hide();
		});
	}*/
});

//==============================================================================

(function($)
{
	/**
	 * Auto-growing textareas; technique ripped from Facebook
	 *
	 * http://github.com/jaz303/jquery-grab-bag/tree/master/javascripts/jquery.autogrow-textarea.js
	 */
	$.fn.autogrow = function(options)
	{
		return this.filter('textarea').each(function() {
			var self         = this;
			var $self        = $(self);
			var minHeight    = $self.height();
			var noFlickerPad = $self.hasClass('autogrow-short') ? 0 : parseInt($self.css('lineHeight')) || 0;
			var onUpdate     = options['update'] || (function() {});

			var shadow = $('<div></div>').css({
				position:    'absolute',
				top:         -10000,
				left:        -10000,
				width:       $self.width(),
				fontSize:    $self.css('fontSize'),
				fontFamily:  $self.css('fontFamily'),
				fontWeight:  $self.css('fontWeight'),
				lineHeight:  $self.css('lineHeight'),
				resize:      'none',
				'word-wrap': 'break-word'
			}).appendTo(document.body);

			var update = function(event)
			{
				var times = function(string, number)
				{
					for (var i=0, r=''; i<number; i++) r += string;
					return r;
				};

				var val = self.value.replace(/</g, '&lt;')
									.replace(/>/g, '&gt;')
									.replace(/&/g, '&amp;')
									.replace(/\n$/, '<br/>&nbsp;')
									.replace(/\n/g, '<br/>')
									.replace(/ {2,}/g, function(space){ return times('&nbsp;', space.length - 1) + ' ' });

				// Did enter get pressed?  Resize in this keydown event so that the flicker doesn't occur.
				if (event && event.data && event.data.event === 'keydown' && event.keyCode === 13) {
					val += '<br />';
				}

				shadow.css('width', $self.width());
				shadow.html(val + (noFlickerPad === 0 ? '...' : '')); // Append '...' to resize pre-emptively.
				$self.height(Math.max(shadow.height() + noFlickerPad, minHeight));

				onUpdate();
			}

			$self.change(update).keyup(update).keydown({event:'keydown'},update);
			$(window).resize(update);

			update();
		});
	};
})(jQuery);