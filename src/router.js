var Backbone = require('backbone');
var geolocator = require('./utils/geolocator');

var Router = Backbone.Router.extend({
    state: null,

    routes: {
        '': 'autoDetect',
        ':geoid': 'index',
        ':geoid/:tab': 'index',
        ':mobile/:geoid/:tab': 'index'
    },

    initialize: function (options) {
        this.state = options.state;
        this.state.on('change', function (state) {
            var geoid = state.get('geoid'),
                tab = state.get('tab'),
                mobile = state.get('mobile');

            if (geoid !== undefined && tab !== undefined) {
                Backbone.history.navigate(
                    geoid + '/' + tab,
                    { trigger: true }
                );
            }
        });
    },

    autoDetect: function () {
        var self = this;

        geolocator()
            .then(function (data) {
                self.state.set('geoid', data.geoid);
            }, function () {
                self.state.set('geoid', 213);
            });
    },

    index: function (geoid, tab) {
        if (geoid === 'mobile.html') {
            this.state.set('mobile', true);
            this.autoDetect();
        } else {
            this.state.set({
                geoid: geoid,
                tab: tab || 'short'
            });
        }
    }
});

module.exports = Router;
