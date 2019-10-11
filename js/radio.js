$(document).ready(function() {
    'use strict';

    var liveRadioListUrl = "https://cdn2.radio.garden/live.json";

    var places = {};
    var selectedStationList = [];
    var channels = [];
    var selectedCity = "";
    var previousBg = 1;
    var maxNumberofBg = 24;

    var trigger = $('.hamburger'),
        isClosed = false;

    // ========================================================================
    // Event Listeners
    // ========================================================================
    trigger.click(function() {
        hamburger_cross();
    });

    $('[data-toggle="offcanvas"]').click(function() {
        $('#wrapper').toggleClass('toggled');
    });

    $(document).on('click', '[data-city]', function() {
        trigger.click();
        renderStationList($(this).attr('data-city'));
    });

    $(document).on('click', '[data-id]', function() {
        playSelectedStation($(this).attr('data-id'));
    });

    $(document).on('click', '.volume-ctrl', function() {
        var muted = $("#audio-src").prop('muted');
        $("#audio-src").prop('muted', !muted);

        if(!muted) {
            $(this).addClass("play").removeClass("pause");
        } else {
            $(this).addClass("pause").removeClass("play");
        }
    });

    function hamburger_cross() {

        if (isClosed == true) {
            trigger.removeClass('is-open');
            trigger.addClass('is-closed');
            isClosed = false;
        } else {
            trigger.removeClass('is-closed');
            trigger.addClass('is-open');
            isClosed = true;
        }
    }

    // ========================================================================
    // Background Image change
    // ========================================================================
    $('.dummy-bg').css("opacity", "1");
    setTimeout(function () {
        changeBg();
        $('.dummy-bg').css("opacity", "");
    }, 1000);

    function changeBg() {
        var rand = getRandomInt(1, maxNumberofBg);
        if(rand == previousBg) {
            rand++;
        }
        if(rand > maxNumberofBg) {
            rand = 1;
        }
        var url = '.bg-img { background: url("img/' + rand + '.jpg") no-repeat center center fixed; }';
        $('#bg-image').text(url);
        previousBg = rand;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ========================================================================
    // Render City and Station list
    // ========================================================================

    function renderStationList(cityName) {
        var stationList = $(".stations");
        stationList.html("");
        var stations;

        for (const place of places) {
            if (place.name === cityName) {
                stations = place.channels;
                break;
            }
        }

        const stationData = stations.map((index) => channels[index]);

        for (const channel of stationData) {
            stationList.append('<li><a data-id="' + channel.id + '"><h3>' + channel.name + '</h3></a></li>');
        }
    }

    function renderCityList() {
        var cities = $(".city");
        var list = places || [];

        cities.html("");

        for (const city of places) {
            cities.append('<li><a data-city="' + city.name + '">' + city.name + '</a></li>');

            renderStationList(city.name);
        }
    }

    // ========================================================================
    // Play selected station
    // ========================================================================
    function playSelectedStation(stationId) {
        const station = channels.find((station) => station.id === stationId)
        var stream = station.src;

        $('.station-name').text(station.name);
        $('.station-site').attr("href", station.website);
        var video = document.getElementById('audio-src');
        video.innerHTML = '';
        video.pause();

        var source = document.createElement('source');
        source.setAttribute('src', stream);
        video.appendChild(source);
        video.load();

        video.onloadeddata = function (e) {
            try{
                video.play();
            } catch(e) {
                console.log(e)
            }
        };

        document.title = "Online Radio - " + station.name;

        changeBg();
    }

    // ========================================================================
    // Download Station List data
    // ========================================================================
    $.ajax({
        url : liveRadioListUrl
    }).done(function(res) {
        places = res.places;
        channels = res.channels;

        renderCityList();

        setTimeout(function () {
            playSelectedStation("berliner-rundfunk");
        }, 200);
    });
    // ========================================================================
});
