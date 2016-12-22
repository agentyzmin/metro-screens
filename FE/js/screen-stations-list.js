(function() {
    "use strict";

    var DISPLAY_STATIONS = 6;
    var TIME_UNIT = {
        ua: 'хв',
        en: 'min'
    };
    var INTERMEDIATE = {
        ua: ['%count станція', '%count станції', '%count станцій'],
        en: ['%count station', '%count stations', '%count stations']
    };

    var $window, $body, $header, $stationDetails, $stationsList,
        inlineStationTmpl, headerTmpl, inlineIntermediateStationsTmpl;

    if (!window.app) {
        window.app = {};
    }

    if (!app.screens) {
        app.screens = {};
    }

    jQuery(function($) {
        $window = $(window);
        $body = $('body');
        $header = $('.b-header');
        $stationDetails = $('.b-station-details');
        $stationsList = $('.b-stations-list');
        inlineStationTmpl = doT.template($('#tmpl-inline-station').html());
        headerTmpl = doT.template($('#tmpl-header').html());
        inlineIntermediateStationsTmpl = doT.template($('#tmpl-inline-intermediate-stations').html());

        app.screens.StationsList = Screen;
    });

    function Screen(data) {
        var lang,
            that = this,
            intervals = [],
            timeouts = [];

        this.name = 'stations-list';
        this.stop = stop;
        init();

        function init() {
            var i,
                previousScreen = app.screens.current;

            if (previousScreen) {
                previousScreen.stop();
            }

            app.screens.current = that;
            $body.addClass('b-screen_stations-list');

            // Header
            $header.html(headerTmpl());
            updateClock();
            addInterval(updateClock, 60000);

            // Content
            $stationsList.show().empty();
            for (i = 0; i < DISPLAY_STATIONS; ++i) {
                (function(i) {
                    var $transferOptions,
                        station = (data.length > DISPLAY_STATIONS && i === DISPLAY_STATIONS - 1)
                            ? data[data.length - 1]
                            : data[i],
                        $html = $('<div class="b-stations-list__line"></div>');

                    if (data.length > DISPLAY_STATIONS && i === DISPLAY_STATIONS - 2) {
                        $html.html(inlineIntermediateStationsTmpl());
                    }
                    else if (station) {
                        $html.html(inlineStationTmpl(station));
                        $transferOptions = $html.find('.b-transfer-options');

                        $html.css({ top: 0, height: '100%' });
                        $transferOptions.css('margin-top', '-150px');

                        addTimeout(function() {
                            $html.css({ top: '', height: '' });
                            $transferOptions.css('margin-top', '');
                        }, 1);
                    }

                    $stationsList.append($html);
                    setNextStationWidth($html);
                } (i));
            }

            updateTexts();
            addInterval(function() {
                // Travel time decrease
                data.forEach(function(station) {
                    if (station) {
                        station.travelTime -= 5;
                    }
                });

                updateTexts();
            }, 5000);
        }

        function updateTexts() {
            var $line, name, time, station, i, count, text,
                $lines = $('.b-stations-list__line');

            lang = (lang === 'ua' ? 'en' : 'ua');

            // Content
            for (i = 0; i < DISPLAY_STATIONS; ++i) {
                station = (data.length > DISPLAY_STATIONS && i === DISPLAY_STATIONS - 1)
                    ? data[data.length - 1]
                    : data[i];

                if (data.length > DISPLAY_STATIONS && i === DISPLAY_STATIONS - 2) {
                    $line = $($lines.get(i));
                    count = data.length - DISPLAY_STATIONS;

                    if (count === 1) {
                        text = INTERMEDIATE[lang][0].replace('%count', count);
                    } else if (count > 1 && count < 5) {
                        text = INTERMEDIATE[lang][1].replace('%count', count);
                    } else {
                        text = INTERMEDIATE[lang][2].replace('%count', count);
                    }

                    $line
                        .find('.b-intermediate-stations__count')
                        .scrollText(text);
                }
                else if (station) {
                    time = station.travelTime > 60 ? Math.ceil(station.travelTime / 60) : 1;
                    name = station.name[lang];
                    $line = $($lines.get(i));

                    // TODO: Отображать точку если на таймере <60 секунд

                    $line
                        .find('.b-inline-station__name')
                        .scrollText(name);

                    $line
                        .find('.b-inline-station__time-left')
                        .scrollText(time + ' ' + TIME_UNIT[lang]);
                }
            }
        }

        function setNextStationWidth($row) {
            var $stationName = $row.find('.b-inline-station__name'),
                $transferOptions = $row.find('.b-transfer-options'),
                result = $row.width();

            result -= $transferOptions.width();
            result -= parseInt($transferOptions.css('right'));

            $stationName.css('max-width', result);
        }

        function updateClock() {
            var $clock = $('.b-clock'),
                val = '',
                ts = new Date();

            val += ts.getHours() < 10 ? '0' + ts.getHours() : ts.getHours();
            val += ':';
            val += ts.getMinutes() < 10 ? '0' + ts.getMinutes() : ts.getMinutes();

            $clock.text(val);
        }

        function stop() {
            intervals.forEach(clearInterval);
            timeouts.forEach(clearTimeout);

            intervals = [];
            timeouts = [];

            $body.removeClass('b-screen_stations-list');
        }

        function addTimeout(f, t) {
            timeouts.push(setTimeout(f, t));
        }

        function addInterval(f, t) {
            intervals.push(setInterval(f, t));
        }
    }
}());