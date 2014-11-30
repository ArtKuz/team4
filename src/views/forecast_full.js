var TabPaneView = require('./tab_pane');
var dateUtils = require('../utils/dateutils');
var forecastFullTemplate = require('../templates/forecast_full.hbs');
var forecastFullDayTemplate = require('../templates/forecast_full_day.hbs');
var forecastFullTemplateMobile = require('../templates/mobile/forecast_full.hbs');

var ForecastFullView = TabPaneView.extend({

    tabName: 'full',

    initialize: function (options) {
        this.state = options.state;
        this.today = options.today;
        this.initializeTabs(this.state);
        this.collection.on('reset', this.render, this);
    },

    render: function() {
        var daysHtml = [],
            html = '',
            morning, evening, day, night,
            today    = this.today.toJSON(),
            tomorrow = dateUtils.getTomorrow(),
            now      = dateUtils.getToday();

        if (this.state.get('mobile')) {
            this.collection.forEach(function (model) {
                var date = model.get('date'),
                    parts = model.get('parts');

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

                html += forecastFullTemplateMobile({
                    date: {
                        'date': date,
                        'is_now': date.getDate() === now.getDate(),
                        'is_tomorrow': date.getDate() === tomorrow.getDate(),
                        'is_weekstart': date.getDay() === 1,
                        'is_weekend': model.get('is_weekend')
                    },
                    today: today,
                    morning: morning,
                    day: day,
                    evening: evening,
                    night: night
                });
            });

            this.$el.html(html);
        } else {
            this.collection.forEach(function (model) {
                daysHtml.push(forecastFullDayTemplate(model.toJSON()));
            });

            this.$el.html(forecastFullTemplate({
                days: daysHtml
            }));
        }


        this.trigger('rendered');
    }
});

module.exports = ForecastFullView;
