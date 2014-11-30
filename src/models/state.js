var Backbone = require('backbone');

var StateModel = Backbone.Model.extend({
    defaults: {
        tab: 'short',
        geoid: null,
        locality: null,
        recent: [],
        mobile: false
    },

    initialize: function () {
        this.on('change:locality', this.addRecent, this);
    },

    addRecent: function (state) {
        var recent = this.get('recent');
        var locality = state.get('locality');

        if (locality) {
            for (var i = recent.length - 1; i >= 0; i--) {
                if (recent[i].geoid === locality.geoid) {
                    return;
                }
            }

            recent.unshift(locality);

            if (recent.length > 3) {
                recent = recent.slice(0, 3);
            }

            this.set({recent: recent});

            // @todo this.set don't trigger events =\
            this.trigger('change', this);
            this.trigger('change:recent', this);
        }
    }
});

module.exports = StateModel;
