// require https://apis.google.com/js/api.js

(function($) {
    var apiReadyEventName = 'youtube-api-loaded';
    var ytReadyEventName = 'youtube-player-loaded';
    var apiReady = false;
    $.fn.ytPlaylist = function(options) {
        var defaults = {
            apiKey: '',
            query: {
                part: 'snippet',
                chart: 'mostPopular'
            },
            playerHeight: 360,
            thumbWidth: "25%"
        };
        var control= this;
        var uniqueId =  Math.floor(Math.random() * 26) + Date.now();
        var settings = $.extend({}, defaults, options);

        function _init(data) {
            control.items = data.items;
            control.index = 0;
            if (control.items.length > 0) {
                control.attr('role', 'video-control');
                if(YT){
                    _initScreen();
                }else {
                    $(document).on(ytReadyEventName,_initScreen)
                }

                _initPlaylist();
                _bindEvents();
            }
        }

        function _initScreen() {
            control.screen = $('<div>', {
                role: 'screen',
                id: uniqueId++
            }).appendTo(control);

            control.screen.player = new YT.Player(control.screen.attr('id'), {
                width:'100%',
                height: settings.playerHeight,
                videoId: control.items[control.index].id
            });

        }
        function _initPlaylist() {
            if (control.items.length > 1) {
                control.playlist = $('<div>', {
                    role: 'playlist'
                }).appendTo(control);
                control.playlist.btnPrev = $('<span>', {role: 'nav-prev'}).appendTo(control.playlist);
                control.playlist.btnNext = $('<span>', {role: 'nav-next'}).appendTo(control.playlist);
                control.playlist.items = $('<div>').appendTo(control.playlist);
                $(control.items).each(function(i, e) {
                    $('<img>', {
                        src: e.snippet.thumbnails.medium.url,
                        title: e.snippet.title,
                        class: control.index == i ? "active" : "",
                        "data-index": i
                    }).css('width', settings.thumbWidth).appendTo(control.playlist.items);
                });
                _updatePlaylist();
            }
        }
        function _updatePlaylist(){
            var offset=control.playlist.items.position().left;
            var thumb = $('img',control.playlist.items);
            control.playlist.btnPrev[(offset < 0)?'show':'hide']();
            control.playlist.btnNext[(offset+(thumb.outerWidth())*thumb.length > control.playlist.items.innerWidth()+thumb.length )?'show':'hide']();
        }
        function _bindEvents() {
            control.playlist.on('click', "[role=nav-next],[role=nav-prev]", navigate);
            control.playlist.on('click', "img", selectVideo);
        }

        function navigate(e) {
            var offset=control.playlist.items.position().left;
            var width = $('img',control.playlist.items).outerWidth();
            if ($(e.target).is('[role=nav-prev]')){
                offset+=width;
            }else{
                offset-=width;
            }
            control.playlist.items.css('left',offset+"px");
            _updatePlaylist();
        }

        function selectVideo(e) {
            $("img.active", control.playlist).removeClass('active');
            $(e.target).addClass('active');
            control.index=$(e.target).data('index');
            control.screen.player.loadVideoById(control.items[control.index].id);
        }
        if (apiReady) {
            init();
        }else {
            $(document).on(apiReadyEventName,init)
        }
        function init() {
            gapi.client.init({
                apiKey: settings.apiKey
            });
            gapi.client.youtube.videos.list(settings.query).execute(_init);
        }
        return this;
    };
    $.getScript('https://apis.google.com/js/api.js', function(){
        gapi.load('client',function () {
            gapi.client.load('youtube', 'v3', function() {
                apiReady=true;
                $(document).trigger($.Event(apiReadyEventName));
            });
        });
    });
    if( typeof YT === 'undefined' ){
        window.onYouTubeIframeAPIReady=function(){
            $(document).trigger($.Event(ytReadyEventName));
        };
        $.getScript('https://www.youtube.com/iframe_api');
    }
})(jQuery);
