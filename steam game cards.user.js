// ==UserScript==
// @name        steam game cards
// @namespace    http://tampermonkey.net/
// @description steam game cards prices
// @include     http*://steamcommunity.com/profiles/*/gamecards/*
// @include     http*://steamcommunity.com/profiles/*/badges/*
// @icon        http://steamcommunity.com/favicon.ico
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/steam_game_cards.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/steam_game_cards.user.js
// @version     2021.12.13.1
// @run-at      document-end
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @grant       GM_addStyle
// @grant       unsafeWindow
// ==/UserScript==

var i = 1;
var m = /badges/.exec(document.URL);
if (m){
    m = /p=/.exec(document.URL);
    if (m){
        GM_addStyle("table{border:solid 1px;border-collapse:collapse;font-size:16px !important;}");
        GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");

        $('.profile_xp_block').before('<table id="b"></table>');
        $('.badge_row').each(function(k, v){
            var a = $(this).find('.badge_row_overlay');
            var app = '';
            var url = '';
            if (a.length>0){
                url = $(a[0]).attr('href');
                m = /cards\/(\d+)/.exec(url);
                if (m)
                    app = m[1];
            }
            var text = $(this).find('.badge_progress_info:first').text();
            $('#b').append(`<tr><td>${i++}</td><td><a target=_blank href="${url}">${app}</a></td><td>${text}</td><td><a href="javascript:void(0);" onclick="getcards(${app}, '${url}');">check</a></td><td id="${app}"></td></tr>`);
        });
    } else {
        var lv = Math.floor($('.friendPlayerLevelNum').text() / 10) + 1;
        var xp = $('.profile_xp_block_xp').text().replace(/,/, '');
        m = /\d+/.exec(xp);
        if (m){
            xp = 0;
            for(i=1;i<=lv;i++)
                xp += i * 1000;
            xp -= m[0];
            $('.profile_small_header_text').append('Lvl:&nbsp;' + lv * 10);
            $('.profile_small_header_text').append('&nbsp;Exp:&nbsp;' + xp);
            var cd = Math.ceil(xp/100) - $('.badge_craft_button').length;
            $('.profile_small_header_text').append('&nbsp;Card:&nbsp;' + cd);

            $('.profile_xp_block').before('<table id="b"></table>');
            $('.badge_craft_button').each(function(k, v){
                m = /gamecards\/(\d+)/.exec($(v).attr('href'));
                $('#b').append(`<tr><td>${k}</td><td><a href="javascript:void(0);" onclick="craftcard(${m[1]});">${m[1]}</a></td><td id="${m[1]}"></td></tr>`);
            });
        }
    }
} else {
    var match = /sessionid=([a-z0-9]+);/.exec(document.cookie);
    match = /gamecards\/(\d+)/.exec(location.href);
    var id = match[1];
    var collect = $('.badge_cards_to_collect').html();
    i = 0;
    $('.badge_detail_tasks').before('<table id="bl"></table><br><a href="javascript:void(0);" onclick="buyall();">购买全部</a>');
    $('.badge_card_set_card.unowned').each(function () {
        var un = $(this).find('.badge_card_set_text.ellipsis') [0];
        var text = $.trim($(un).text());
        var hash = id + '-' + text;
        if (collect.indexOf(hash.replace(' ', '%20') + '%20%28Trading%20Card%29') > 0){
            hash += ' (Trading Card)';
            text += ' (Trading Card)';
        }
        if (collect.indexOf('%28Foil%29') > 0){
            hash += ' (Foil)';
            text += ' (Foil)';
        }
        // 1=usd,23=cny

        var url = `/market/priceoverview/?country=CN&currency=23&appid=753&market_hash_name=${hash}`;
        var lowest = '';
        $.getJSON(url, function (data) {
            if (data.success === true) {
                lowest = data.lowest_price;
                if (lowest){
                    var median = data.median_price;
                    i++;
                    match = /(\d+)\.(\d+)/.exec(lowest);
                    var p = parseInt(match[1], 10) * 100 + parseInt(match[2], 10);
                    $('#bl').append(`<tr><td><a target="_blank" href="/market/listings/753/${hash}">${text}</a></td><td><a class="bu" href="javascript:void(0);" onclick="createbuyorder('${hash}',${p},${i});">${lowest}</a></td><td id="c${i}"></td></tr>`);
                } else {
                    $('#bl').append(`<tr><td><a target="_blank" href="/market/listings/753/${hash}">${text}</a></td><td></td><td></td></tr>`);
                }

            }
        }).done(function () {
        }).fail(function (jqxhr) {
            alert(jqxhr);
        });
    });
}

unsafeWindow.buyall = function(){
    var j = 0;
    $('.bu').each(function(){
        var a = $(this);
        setTimeout(function(){a.click();}, j++ * 3000);
    });
}

unsafeWindow.getcards = function(id, url){
    var k = `${id}000`;
    id = `#${id}`;
    $(id).empty();
    $.ajax({
        url: url,
        type: 'GET',
        async: true,
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        }
    }).done(function (data) {
        var r = /market\/listings\/753\/([0-9]+)\-([^\/'"]+)/ig;
        var i = 0;
        while (m = r.exec(data)){
            var hash = `${m[1]}-${m[2]}`;
            var t = decodeURIComponent(m[2]);
            $(id).append(`<tr><td><a target=_blank href="/${m[0]}">${t}</a></td><td id="${k}"></td></tr>`);
            setTimeout(getcardprice, i++ * 2000, k++, hash);
        }
    }).fail(function (xhr) {
    });
}

function getcardprice(k, hash){
    var id = `#${k}`;
    var url = `/market/priceoverview/?country=CN&currency=23&appid=753&market_hash_name=${hash}`;
    var lowest = '';
    $.getJSON(url, function (data) {
        if (data.success === true) {
            var l = data.lowest_price;
            if (l){
                var m = /(\d+)\.(\d+)/.exec(l);
                var p = parseInt(m[1], 10) * 100 + parseInt(m[2], 10) + 5;
                hash = decodeURIComponent(hash);
                $(id).append(`<a href="javascript:void(0);" onclick="createbuyorder('${hash}',${p},${k});">${l}</a>`);
                $(id).after(`<td id="c${k}"></td>`);
            }
        }
    }).done(function () {
    }).fail(function (xhr) {
        $(id).append(xhr.statusText);
    });
}

unsafeWindow.createbuyorder = function(hash, p, id){
    var da = {
        sessionid: g_sessionID,
        currency: 23,
        appid: 753,
        market_hash_name: hash,
        price_total: p,
        quantity: 1
    };
    var w = '#c' + id;
    $(w).empty();
    $(w).append('正在购买 ...');
    $.ajax({
        url: '/market/createbuyorder/',
        type: 'POST',
        async: false,
        data: da,
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        }
    }).done(function (data) {
        $(w).empty();
        if (data.success === 1)
        {
            setTimeout(getbuyorderstatus, 3000, data.buy_orderid, w);
        }
        else
        {
            $(w).append(data.message);
        }
    }).fail(function (xhr) {
        alert(xhr);
    });
}

unsafeWindow.getbuyorderstatus = function(buy_orderid, w){
    $.ajax({
        url: '/market/getbuyorderstatus/',
        type: 'GET',
        async: false,
        data: {
            sessionid: g_sessionID,
            buy_orderid: buy_orderid
        }
    }).done(function (data) {
        $(w).empty();
        if (data.success === 1)
            $(w).append(buy_orderid);
        else
            $(w).append(data);
    }).fail(function (xhr) {
        alert(xhr);
    });
}

unsafeWindow.craftcard = function(id){
    var w = '#' + id;
    var da = {
        appid: id,
        series: 1,
        border_color: 0,
        sessionid: g_sessionID
    };
    $(w).empty();
    $.ajax({
        url: 'https://steamcommunity.com/profiles/76561198104311295/ajaxcraftbadge/',
        type: 'POST',
        data: da
    }).done(function (data) {
        if (data.success === 1)
        {
            var d = data.Badge.unlocked_time;
            $(w).append(`<div>${data.Badge.title} (${data.Badge.game})</div><div>${data.Badge.xp}</div><div><img src="${data.Badge.image}" /></div>`);
            $.each(data.rgDroppedItems, function (i, item) {
                if (item.level)
                    $(w).append(`<div><span style="color:green;">${item.level} (${item.type})</span></div>`);
                else
                    $(w).append(`<div>${item.title} (${item.label})</div>`);
            });
        }
        else
        {
            $(w).append(data.message);
        }
    }).fail(function (xhr) {
        $(w).append(xhr);
    });
}
