Mixture.Models.Player = Mixture.Model.extend({
	sound: null,
	mix: null,

	initialize: function() {
		_.bindAll(this,
			'_whileloading',
			'_whileplaying',
			'_onload',
			'_onstop',
			'_onplay',
			'_onpause',
			'_onfinish',
			'_onresume'
		);

		defaultOptions = {
			autoLoad: true,
			autoPlay: true,
			onload: this._onload,
			onstop: this._onstop,
			onplay: this._onplay,
			onpause: this._onpause,
			whileloading: this._whileloading,
			whileplaying: this._whileplaying,
			onfinish: this._onfinish,
			onpause: this._onpause,
			onresume: this._onresume
		};

		 // interferes with the music im listening to
		if (window.DEBUG) defaultOptions.volume = 20;
	},

	queue: function(model) {
		model.streamUrl(_.bind(function(url) {
			if (!url) return;

			if (this.mix) {
				this.mix.dequeued();
			}

			this.mix = model;
			this.mix.queued()

			if (this.sound) {
				this.sound.destruct();
			}

			var options = _.extend(defaultOptions, {
				id: 'sound-' + this.mix.audio.id,
				url: url
			});

			this.trigger('sound:beforequeue', this);
			
			if (soundManager.ok()) {
				this.sound = soundManager.createSound(options);
				this.trigger('sound:queue', this);
			} else {
				soundManager.onready(_.bind(function() {
					this.sound = soundManager.createSound(options);
					this.trigger('sound:queue', this);
				}, this));
			}

		}, this));
	},

	percentLoaded: function() {
		var durationLoaded = (this.sound.duration / 1000);
		var percentLoaded = (durationLoaded / this.mix.audio.get('duration')).toFixed(2);
		return (percentLoaded * 100).toFixed(2);
	},

	percentPlayed: function() {
		var duration = this.mix.audio.get('duration');
		var position = (this.sound.position / 1000);
		
		//if the mix is loaded use the duration from sound manager
		if (this.sound.loaded) {
			var duration = (this.sound.duration / 1000).toFixed(0);
		}
		return ((position / duration) * 100).toFixed(2);
	},

	position: function() {
		return (this.sound.position / 1000).toFixed(0);
	},

	duration: function() {
		if (this.sound.loaded) {
			return (this.sound.duration / 1000).toFixed(0);
		} else {
			return this.mix.audio.get('duration');
		}
	},

	togglePause: function(model) {
		if (this.sound && this.sound.playState === 1 && this.sound.position > 1) {
			this.sound.togglePause();
		} else if (this.sound && this.sound.playState === 0) {
			this.sound.play();
		}
	},

	_whileloading: function() {
		this.trigger('sound:whileloading', this);
	},

	_whileplaying: function() {
		// log('position:', this.sound.position(), 'duration:', this.sound.duration());
		if (this.percentPlayed() >= 15) {
			this.mix.played();
		};
		this.trigger('sound:whileplaying', this);
	},

	_onload: function(success) {
		log('onload');
		this.trigger('sound:load', this, success);
	},

	_onplay: function() {
		log('onplay');
		this.trigger('sound:play', this);
	},

	_onpause: function() {
		log('onpause');
		this.trigger('sound:pause', this);
	},

	_onstop: function() {
		log('onstop');
		this.trigger('sound:stop', this);
	},

	_onfinish: function() {
		log('onfinish');
		this.trigger('sound:finish', this);
	},

	_onpause: function() {
		log('onpause');
		this.trigger('sound:pause', this);
	},

	_onresume: function() {
		log('onresume');
		this.trigger('sound:resume', this);
	}
});