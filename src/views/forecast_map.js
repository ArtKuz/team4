var TabPaneView = require('./tab_pane'),
    forecastMapTemplate = require('../templates/forecast_map.hbs');

var ForecastHoursView = TabPaneView.extend({

    tabName: 'map',

    events: {
        'click a.forecast_map__baloon__popover_content_citylink': 'citylink'
    },

    initialize: function (options) {
        this.state = options.state;
        this.initializeTabs(this.state);
        this.collection.on('reset', this.render, this);
    },

    citylink: function (e) {
        this.state.set('tab', 'full');
        e.preventDefault();
    },

    render: function() {
        var locality       = this.state.toJSON().locality,
            currentPartDay = this.collection.models[0].get('parts').slice(current_day_part)[0],
            currentTemp    = currentPartDay.temp;

        if (currentTemp > 0) {
            currentTemp = '+' + currentTemp;
        }

        this.$el.html(forecastMapTemplate);

        ymaps.ready(init);

        function init () {
            var myMap = new ymaps.Map("forecast_map__container", {
                    center: [locality.lat, locality.lon],
                    zoom: locality.zoom
                }),

            MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
                '<div class="forecast_map__baloon__popover">' +
                '<a class="forecast_map__baloon__popover_close" href="">&times;</a>' +
                '<div class="forecast_map__baloon__popover_arrow"></div>' +
                '<div class="forecast_map__baloon__popover_inner">' +
                '$[[options.contentLayout observeSize minWidth=235 maxWidth=235 maxHeight=350]]' +
                '</div>' +
                '</div>', {
                    build: function () {
                        this.constructor.superclass.build.call(this);
                        this._$element = $('.forecast_map__baloon__popover', this.getParentElement());
                        this.applyElementOffset();
                        this._$element.find('.forecast_map__baloon__popover_close').on('click', $.proxy(this.onCloseClick, this));
                    },

                    clear: function () {
                        this._$element.find('.forecast_map__baloon__popover_close').off('click');
                        this.constructor.superclass.clear.call(this);
                    },

                    onSublayoutSizeChange: function () {
                        MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);
                        if (!this._isElement(this._$element)) {
                            return;
                        }

                        this.applyElementOffset();
                        this.events.fire('shapechange');
                    },

                    applyElementOffset: function () {
                        this._$element.css({
                            left: -(this._$element[0].offsetWidth / 2),
                            top: -(this._$element[0].offsetHeight + this._$element.find('.forecast_map__baloon__popover_arrow')[0].offsetHeight)
                        });
                    },

                    onCloseClick: function (e) {
                        e.preventDefault();
                        this.events.fire('userclose');
                    },


                    getShape: function () {
                        if(!this._isElement(this._$element)) {
                            return MyBalloonLayout.superclass.getShape.call(this);
                        }

                        var position = this._$element.position();

                        return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                            [position.left, position.top], [
                                position.left + this._$element[0].offsetWidth,
                                position.top + this._$element[0].offsetHeight + this._$element.find('.forecast_map__baloon__popover_arrow')[0].offsetHeight
                            ]
                        ]));
                    },

                    _isElement: function (element) {
                        return element && element[0] && element.find('.forecast_map__baloon__popover_arrow')[0];
                    }
                }),

                MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
                    '<h3 class="forecast_map__baloon__popover_title">$[properties.balloonHeader]</h3>' +
                    '<div class="forecast_map__baloon__popover_content">$[properties.balloonContent]</div>'
                ),

                placemark = new ymaps.Placemark([locality.lat, locality.lon], {
                    iconContent: '<img class="forecast_map__baloon_img" height="25" src="http://ekb.shri14.ru/icons/' + currentPartDay.weather_icon + '.svg" alt="' + currentPartDay.weather + '"> ' + '<span class="forecast_map__baloon_temp">' + currentTemp + '</span>',
                    hintContent: locality.name,
                    balloonHeader: locality.name,
                    balloonContent: '<img src="/assets/images/ajax-loader.gif">'
                }, {
                    balloonPanelMaxMapArea: 0,
                    balloonLayout: MyBalloonLayout,
                    balloonContentLayout: MyBalloonContentLayout,
                    iconLayout: 'default#imageWithContent',
                    iconImageHref: '/assets/images/map__icon.png', // картинка иконки
                    iconImageSize: [67, 41],
                    iconImageOffset: [-30, -45],
                    iconShape: {
                        type: 'Rectangle',
                        coordinates: [[-28, -50], [34, -12]]
                    },
                    openEmptyBalloon: true
                });

            if (typeof(currentPartDay) === 'object') {
                placemark.properties.set(
                    'balloonContent',
                    currentTemp + 'ºC,' +  currentPartDay.weather + ' <br/>' +
                    'Ветер: ' + currentPartDay.wind_speed + ' м/с ' + currentPartDay.wind + ' <br/>' +
                    'Влажность: ' + currentPartDay.humidity + ' <br/>'  +
                    'Давление: ' + currentPartDay.pressure + ' мм рт. ст. <br/>' +
                    '<a href="" class="forecast_map__baloon__popover_content_citylink">Подробнее</a>'
                );
            }

            myMap.geoObjects.add(placemark);
        }
    }
});

module.exports = ForecastHoursView;
