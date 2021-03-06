var Backbone = require('backbone');
var State = require('../models/state');
var citySelectTemplate = require('../templates/city_select.hbs');

var CitySelectView = Backbone.View.extend({

    model: State,

    events: {
        'click .city-select__city-other': 'toggleDropdown',
        'click .city-select__recent-list-link': 'changeLocality'
    },

    initialize: function () {
        this.model.on('change', this.render, this);
        this.render();
    },

    toggleDropdown: function (e) {
        var self = this;

        this.$el.find('.city-select__city-dropdown').toggle();

        $('body').one('click', function () {
            self.hideDropdown();
        });

        e.stopPropagation();
        e.preventDefault();
    },

    hideDropdown: function (e) {
        this.$el.find('.city-select__city-dropdown').hide();
    },

    changeLocality: function (e) {
        this.model.set({geoid: $(e.currentTarget).data('geoid')});
        e.preventDefault();
    },

    render: function() {
        this.$el.html(citySelectTemplate(this.model.toJSON()));
    }
});

module.exports = CitySelectView;
