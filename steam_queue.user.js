// ==UserScript==
// @name        steam_queue
// @namespace   http://tampermonkey.net/
// @include     http*://store.steampowered.com/app/*
// @include		http*://store.steampowered.com/agecheck/app/*
// @include		http*://store.steampowered.com/explore*
// @include		http*://store.steampowered.com/wishlist/*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/steam_queue.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/steam_queue.user.js
// @version     2022.02.10.1
// @connect     steamdb.info
// @grant       unsafeWindow
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @run-at      document-end
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-size:16px !important;}");

var m, id;

function info(id){
    var url = `https://steamdb.info/app/${id}/subs/`;
    GM_xmlhttpRequest({
        method: "GET",
        url: url,
        onload: function(response) {
            if (response.status == 503)
                alert('Just a moment');
            else {
                var c = [];
                $(response.responseText).find("#subs h2").each(function(){
                    var m = /Bundles that include/.exec($(this).text());
                    if (m){
                        $(this).next('div').find('tbody tr').each(function(){
                            var d = $(this).children('td');
                            var sub = $(d[0]).text();
                            var name = $(d[1]).text();
                            var cut = $(d[2]).text();
                            var to =  $(d[3]).text();
                            var t = $(d[4]).attr('data-sort');
                            t = tm(t * 1000);
                            c.push(sub);
                            $('#b').append(`<tr><td>${sub}</td><td><a target=_blank href="https://steamdb.info/bundle/${sub}/">${name}</a></td><td>${cut} ${to}</td><td>${t}</td></tr>`);
                        });
                    }
                });
                var b = [];
                $(response.responseText).find('.package').each(function(){
                    var d = $(this).children('td');
                    var sub = $(d[0]).text();
                    var name = $(d[1]).text();
                    if ($(d[1]).children('a').length > 0){
                        name =  `<a target=_blank href="https://steamdb.info/sub/${sub}/">${name}</a>`;
                        b.push(sub);
                    }
                    var tp = $(d[2]).text();
                    var t = $(d[3]).attr('data-sort');
                    t = tm(t * 1000);
                    $('#b').append(`<tr><td>${sub}</td><td>${name}</td><td>${tp}</td><td>${t}</td></tr>`);
                });
            }
        },
        onerror:  function(response) {
            //alert(response.statusText);
        },
        ontimeout:  function(response) {
            //alert(response.statusText);
        },
    });
}

function tm(dt) {
    dt = new Date(dt);
    var y = dt.getFullYear();
    var m = dt.getMonth() +1;
    m = m > 9 ? m : '0' + m;
    var d = dt.getDate();
    d = d > 9 ? d : '0' + d;
    var h = dt.getHours();
    h = h > 9 ? h : '0' + h;
    var i = dt.getMinutes();
    i = i > 9 ? i : '0' + i;
    var s = dt.getSeconds();
    s = s > 9 ? s : '0' + s;
    return `${y}-${m}-${d} ${h}:${i}:${s}`;
}

unsafeWindow.list = function() {
    var m = /app\/(\d+)/.exec(document.URL);
    if (m){
        var id = m[1];
        if ($('#b').length > 0){
            $('#b').empty();
        }
        else{
            $('.apphub_AppName').after('<table id="b"></table>');
        }
        info(id);
    }
}

unsafeWindow.follow = function(id) {
    var f = /none/.exec($('#f').css('text-decoration'));
    var d = {
        appid: id,
        sessionid: g_sessionID,
    };
    if (!f)
        d['unfollow'] = 1;
    $.ajax({
        url: '/explore/followgame',
        type: 'POST',
        data: d,
        complete: function( data, status, xhr ){
            if (/true|false/.exec(data.responseText))
                $('#f').css('text-decoration', f ? 'line-through' : 'none');
        }
    });
}

unsafeWindow.ignore = function(id) {
    var f = /none/.exec($('#g').css('text-decoration'));
    var d = {
        appid: id,
        sessionid: g_sessionID,
    };
    if (f)
        d['ignore_reason'] = 0;
    else
        d['remove'] = 1;
    $.ajax({
        url: '/recommended/ignorerecommendation/',
        type: 'POST',
        data: d,
        success: function( data, status, xhr ){
            $('#g').css('text-decoration', f ? 'line-through' : 'none');
        },
        fail: function( data, status, xhr ){
        }
    });
}

unsafeWindow.wish = function(id) {
    var f = /none/.exec($('#w').css('text-decoration'));
    var url = f ? '/api/addtowishlist' : '/api/removefromwishlist';
    $.ajax({
        url: url,
        type: 'POST',
        dataType : 'json',
        data: {
            appid: id,
            sessionid: g_sessionID,
        },
        success: function( data, status, xhr ){
            $('#w').css('text-decoration', f ? 'line-through' : 'none');
        },
        fail: function( data, status, xhr ){
        }
    });
}

var ap = $('.apphub_OtherSiteInfo');
if (ap.length > 0){
    ap.append('<a class="btnv6_blue_hoverfade btn_medium" href="javascript:void(0);" onclick="list();"><span>I</span></a>');
    m = /\d+/.exec(location.href);
    if (m){
        id = m[0];
        ap.append(`&nbsp;<a class="btnv6_blue_hoverfade btn_medium" href="https://barter.vg/steam/app/${id}/#bundles" target=_blank><span>B</span></a>`);
        ap.append(`&nbsp;<a class="btnv6_blue_hoverfade btn_medium" href="javascript:void(0);" onclick="wish(${id});"><span id="w">W</span></a>`);
        ap.append(`&nbsp;<a class="btnv6_blue_hoverfade btn_medium" href="javascript:void(0);" onclick="follow(${id});"><span id="f">F</span></a>`);
        ap.append(`&nbsp;<a class="btnv6_blue_hoverfade btn_medium" href="javascript:void(0);" onclick="ignore(${id});"><span id="g">G</span></a>`);
        ap.append(`&nbsp;<a class="btnv6_blue_hoverfade btn_medium" target=_blank href="//help.steampowered.com/wizard/HelpWithGame/?appid=${id}"><span>H</span></a>`);
    }
}

/*
m = /back tomorrow to earn more/.exec(document.body.innerHTML);
if (m){

} else {
    m = /agecheck/.exec(location.href);
    if (m) {
        $('#ageYear').val('1988');
        $('#agecheck_form').submit();
        $('.btn_next_in_queue').click();
    }
    else {
        m = /explore/.exec(location.href);
        if (m) {
            $('#refresh_queue_btn').click();
        }
        else {
            $('#next_in_queue_form').submit();
        }
    }

    m = /Site Error|站点错误/.exec(document.title);
    if (m) {
        document.cookie="wants_mature_content=1";
        document.cookie="birthtime=22503171";
        m = /\d+/.exec(location.href);
        id = m[0];
        var url = `/app/${id}`;
        $('#error_box').after(`&nbsp;<a class="btnv6_blue_hoverfade btn_medium" href="javascript:void(0);" onclick="wish(${id});"><span id="w">W</span></a>`);
        $('#error_box').after(`&nbsp;<a class="btnv6_blue_hoverfade btn_medium" href="javascript:void(0);" onclick="follow(${id});"><span id="f">F</span></a>`);
        $('#error_box').after(`&nbsp;<a class="btnv6_blue_hoverfade btn_medium" href="javascript:void(0);" onclick="ignore(${id});"><span id="g">G</span></a>`);
        $('#error_box').after(`&nbsp;<a class="btnv6_blue_hoverfade btn_medium" target=_blank href="https://steamdb.info/app/${id}/"><span>D</span></a>`);
        $.ajax({
            url: url,
            type: "POST",
            dataType : 'json',
            data: {
                snr: '',
                appid_to_clear_from_queue: m[0],
                sessionid: g_sessionID,
            },
            success: function( data, status, xhr ){
            },
            fail: function( data, status, xhr ){
                alert(status);
            }
        });
    }
}
*/

