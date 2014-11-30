var TabPaneView = require('./tab_pane');
var dateUtils = require('../utils/dateutils');
var forecastShortTemplate = require('../templates/forecast_short.hbs');
var forecastShortTemplateMobile = require('../templates/mobile/forecast_short.hbs');

var ForecastShortView = TabPaneView.extend({

    tabName: 'short',

    initialize: function (options) {
        this.today = options.today;
        this.state = options.state;
        this.initializeTabs(this.state);
        this.collection.on('reset', this.render, this);
    },

    render: function() {
        var html = '',
            tomorrow = dateUtils.getTomorrow(),
            now      = dateUtils.getToday(),
            today    = this.today.toJSON(),
            template = forecastShortTemplate;

        if (this.state.get('mobile')) {
            template = forecastShortTemplateMobile;
        }

        this.collection.each(function (model) {
            var day, night,
                parts = model.get('parts_short'),
                date = model.get('date');

            if (template === forecastShortTemplateMobile) {
                if (date < now) {
                    return;
                }

                parts = model.get('parts');
                var morning, evening;
                for (var i = parts.length - 1; i >= 0; i--) {
                    switch (parts[i].type) {
                        case 'morning': morning = parts[i]; break;
                        case 'day': day = parts[i]; break;
                        case 'evening': evening = parts[i]; break;
                        case 'night': night = parts[i]; break;
                    }

                    if (day && night && morning && evening) {
                        break;
                    }
                }

                html += template({
                    date: {
                        'date': date,
                        'is_now': date.getDate() === now.getDate(),
                        'is_tomorrow': date.getDate() === tomorrow.getDate(),
                        'is_weekstart': date.getDay() === 1,
                        'is_weekend': model.get('is_weekend'),
                    },
                    today: today,
                    morning: morning,
                    day: day,
                    evening: evening,
                    night: night
                });
            } else {
                if (date < tomorrow) {
                    return;
                }
                for (var i = parts.length - 1; i >= 0; i--) {
                    switch (parts[i].type) {
                        case 'day_short': day = parts[i]; break;
                        case 'night_short': night = parts[i]; break;
                    }

                    if (day && night) {
                        break;
                    }
                }
                html += template({
                    date: {
                        'date': date,
                        'is_tomorrow': date.getDate() === tomorrow.getDate(),
                        'is_weekstart': date.getDay() === 1,
                        'is_weekend': model.get('is_weekend')
                    },
                    day: day,
                    night: night
                });
            }
        });

        this.$el.html(html);
    }
});

module.exports = ForecastShortView;
