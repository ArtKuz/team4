var TabPaneView = require('./tab_pane');
var forecastHoursTemplate = require('../templates/forecast_hours.hbs');
var forecastHoursTemplateMobile = require('../templates/mobile/forecast_hours.hbs');
var d3 = require('d3-browserify');
var temp2color = require('../utils/temp2color');
var dateUtils = require('../utils/dateutils');
var datef = require('datef');
require('datef/lang/ru');
datef.lang('ru');

function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
}

function getMinOfArray(numArray) {
    return Math.min.apply(null, numArray);
}

function getPxArrOfTempArr(tempArr, height, divisionMargin) {
    var pxArr     = [],
        minTemp   = getMinOfArray(tempArr),
        maxTemp   = getMaxOfArray(tempArr),
        countTemp = maxTemp - minTemp,
        division  = Math.round(height / (countTemp + divisionMargin));

    tempArr.forEach(function (temp) {
        pxArr.push((temp - minTemp + divisionMargin) * division);
    });

    return pxArr;
}

var ForecastHoursView = TabPaneView.extend({

    tabName: 'hours',

    initialize: function (options) {
        this.today = options.today;
        this.state = options.state;
        this.initializeTabs(this.state);
        this.collection.on('reset', this.render, this);
    },

    render: function() {
        var date          = new Date(),
            nowDate       = date.getDate(),
            nowHour       = date.getHours(),
            tempArr       = [],
            dateArr       = [],
            weekendArr    = [],
            weatherArr    = [],
            tomorrowDate  = dateUtils.getTomorrow().getDate(),
            today         = this.today.toJSON(),
            self          = this;

        this.collection.forEach(function (model) {

            if (self.state.get('mobile')) {
                tempArr.push(model.get('parts_short')[0].temp);
                dateArr.push(model.get('date'));
                weekendArr.push(model.get('is_weekend'));
                weatherArr.push(model.get('parts_short')[0].weather_icon);
            } else {
                var modelDate = model.get('date').getDate(),
                    isTomorrow = tomorrowDate === modelDate,
                    isToday = nowDate === modelDate;

                if (isToday || isTomorrow) {
                    var hours = model.get('hours');

                    hours.forEach(function(hourData) {
                        var hour = parseInt(hourData.hour);
                        if ((isToday && hour >= nowHour) || (isTomorrow && hour < nowHour)) {
                            tempArr.push(hourData.temp);
                        }
                    });
                }
            }
        });

        var margin = {
                top:    20,
                right:  30,
                bottom: 30,
                left:   20
            },
            width = 960 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;

        if (self.state.get('mobile')) {
            width = $(window).width() - margin.left - margin.right;
            /*$(window).resize(function() {
                width = $(window).width() - margin.left - margin.right;
            });*/

        }

        var tempPxArr = getPxArrOfTempArr(tempArr, height, 2);

        if (this.state.get('mobile')) {
            this.$el.html(forecastHoursTemplateMobile({ today : today }));
        } else {
            this.$el.html(forecastHoursTemplate());
        }

        // преобразование числа в подобие времени
        var formatHours = function(d) {
            d = d + nowHour;

            if (d > 23) {
                d -= 24;
            }

            return d + ':00';
        };

        var x = d3.scale.linear()
            .domain([0, tempArr.length])
            .range([0, width]);

        var data = d3.layout.histogram()
            .bins(x.ticks(tempArr.length))
            (tempPxArr);

        if (!this.state.get('mobile')) {
            var xAxis = d3.svg.axis()
                .scale(x)
                .ticks(tempArr.length)
                .orient('bottom')
                .tickFormat(formatHours);
        }

        if (!this.state.get('mobile')) {
            var svg = d3.select('.forecast_hours__svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        } else {
            var svg = d3.select('.forecast_hours__svg')
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        }

        var bar = svg.selectAll('forecast_hours__svg_bar')
            .data(data)
            .enter().append('g')
            .attr('class', 'forecast_hours__svg_bar')
            .attr('transform', function(d, i) {
                    return 'translate(' + x(d.x) + ', '+ (height - tempPxArr[i]) +')';
            });

        bar.append('rect')
            .attr('x', 0)
            .attr('fill', function(d,i) {
                return '#' + temp2color(tempArr[i]);
            })
            .attr('width', x(data[0].dx) - 1)
            .data(tempPxArr)
            .attr('height', function(d) {
                return d;
            });

        if (this.state.get('mobile')) {
            bar.append('rect')
                .attr('x', 0)
                .attr('fill', function (d, i) {
                    return '#db953a';
                })
                .attr('width', x(data[0].dx) - 1)
                .data(tempPxArr)
                .attr('height', function () {
                    return 5;
                });

            bar.append('text')
                .attr('y', function (d, i) {
                    return tempPxArr[i] - 10;
                })
                .attr('x', x(data[0].dx) / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', function(d,i) {
                    if (weekendArr[i]) {
                        return 'red';
                    } else {
                        return '#000';
                    }
                })
                .text(function(d,i) {
                    var dateDay = dateArr[i];
                    return datef('D', dateDay);
                });

            bar.append('svg:image')
                .attr('xlink:href', function(d,i) {
                    return 'http://ekb.shri14.ru/icons/' + weatherArr[i] + '.svg';
                })
                .attr('x', x(data[0].dx) / 2 - 15)
                .attr('y', function (d, i) {
                    return tempPxArr[i] - 45;
                })
                .attr('width', '25')
                .attr('height', '25');
        }

        bar.append('text')
            .attr('dy', '-10px')
            .attr('y', 5)
            .attr('x', x(data[0].dx) / 2)
            .attr('text-anchor', 'middle')
            .text(function(d,i) {
                var tempNow = tempArr[i],
                    sign    = '';

                if (tempNow > 0) {
                    sign = '+';
                }

                return sign + tempNow;
            });

        if (!this.state.get('mobile')) {
            svg.append('g')
                .attr('class', 'x forecast_hours__svg_axis')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis);
        }
    }
});

module.exports = ForecastHoursView;
