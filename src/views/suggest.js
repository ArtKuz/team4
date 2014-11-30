var Backbone = require('backbone');

function getCities(characters) {
    return $.ajax('http://ekb.shri14.ru/api/suggest?query=' + characters)
        .success(function (data) {});
}

var Suggest = Backbone.View.extend({
    initialize: function(options) {
        this.state = options.state;
        this.render();
    },

    events: {
        'keyup input':  'update',
        'click button': 'selectCity',
        'click .header__search-close': 'clear_search'
    },

    update: function(e) {
        self = this;

        if (this.state.get('mobile')) {
            $('.header__search-close').show();
        }

        $('input').autocomplete({
            source: function( request, response ) {
                $.ajax('http://ekb.shri14.ru/api/suggest?query=' + request.term)
                    .success(function (data) {
                        var cities = data.map(function(el) {
                            return el.name;
                        });
                        response (cities);
                    });
            },
            select: function(event, ui){
                self.selectCity(ui.item.value);
            }
        });

        if (e.keyCode === 13) {
            this.selectCity();
        }
    },

    selectCity: function(query) {
        query = typeof(query) === 'string' ? query : $.trim($('input').val());

        var state = this.state;

        getCities(query).then(function(data) {
            if (data.length > 0) {
                var geoId = data.map(function(el) {
                    return el.geoid;
                });

                state.set('geoid', geoId[0]);
            }
        });
    },

    clear_search: function(e) {
        e.preventDefault();
        $('.header__search-close').hide();
        $('input').val('');
    },

    render: function() {
        $('input').val('');
    }
});

module.exports = Suggest;
