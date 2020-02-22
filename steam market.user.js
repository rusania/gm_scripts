// ==UserScript==
// @name         steam market
// @namespace    http://tampermonkey.net/
// @version      2020.02.22.1
// @description  steam market
// @author       jacky
// @include      https://steamcommunity.com/market/*
// @run-at       document-end
// @require      http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @grant        GM_addStyle
// @grant       unsafeWindow
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-size:14px !important;}");
$('#myMarketTabs').before('<a href="javascript:void(0);" onclick="list2();">List</a>');
$('#myMarketTabs').before('&emsp;<a href="javascript:void(0);" onclick="list(100, 7885115950, 1150080);">Azur Lane: Crosswave</a>');
$('#myMarketTabs').before('&emsp;<a href="javascript:void(0);" onclick="list(100, 7100821814, 1144400);">Senren＊Banka</a>');
$('#myMarketTabs').before('&emsp;<a href="javascript:void(0);" onclick="list(100, 3641673529, 1146630);">Yokai&#39;s Secret</a>');
$('#myMarketTabs').before('&emsp;<a href="javascript:void(0);" onclick="chkall();">Check All</a>');
$('#myMarketTabs').before('&emsp;<a href="javascript:void(0);" onclick="sellall();">Sell All</a>');
$('#myMarketTabs').before('<table><tr><td>Asset:</td><td>Cnt:</td><td>Filter:</td></tr><tr><td><input type=text id="v" value="" /></td><td><input type=text id="n" value="5000" /></td><td><input type=text id="f" value="" /></td></tr></table>');
$('#myMarketTabs').before('<div><span id="m"></span></div>');
$('#myMarketTabs').before('<table id="a"></table>');
$('#myMarketTabs').before('<table id="b"></table>');
var more = 1;
var total = 0;

unsafeWindow.chkall = function(){
    var j = 0;
    $('.bu').each(function(){
        var a = $(this);
        j++;
        setTimeout(function () {
            a.click();
        }, j * 3000);
    });
}

unsafeWindow.sellall = function(){
    var j = 0;
    $('.cu').each(function(){
        var a = $(this);
        j++;
        setTimeout(function () {
            a.click();
        }, j * 3000);
    });
}

unsafeWindow.list2 = function() {
    var n = $('#n').val();
    var asset = $('#v').val();
    var l = $('#f').val();
    list(n, asset, l);
}

unsafeWindow.list = function(n, asset, l) {
    $('#b').empty();
    $('#b').append(`<tr><td>Index</td><td>Game</td><td>Class</td><td>Asset</td><td>Hash</td><td>Border</td><td>Type</td><td>Amount</td><td>Price</td><td></td><td></td><td></td></tr>`);
    $('#m').empty();
    var url = `/inventory/76561198104311295/753/6?l=english&count=${n}`;
    if (asset > 0)
        url = `${url}&start_assetid=${asset}`;
    $.ajax({
        url: url,
        method: 'GET',
        success: function (data) {
            if (data.success){
                $('#v').val(data.last_assetid);
                more = data.more_items;
                total = data.total_inventory_count;
                var arr = [];
                var a = [];
                $.each(data.descriptions, function(i, v){
                    if(l > 0 && v.market_fee_app != l)
                        return true;
                    var y = {
                        app : v.market_fee_app,
                        class : v.classid,
                        asset : 0,
                        amount : 0,
                        price : 0,
                        instance : v.instanceid,
                        hash : v.market_hash_name,
                        trade : v.tradable,
                        market : v.marketable,
                        comm : v.commodity,
                        Game : '',
                        item_class : '',
                        cardborder : '',
                        droprate : ''
                    };
                    $.each(v.tags, function(j, w){
                        y[w.category] = w.localized_tag_name
                    });
                    arr[v.classid] = y;
                    a.push(v.classid);
                });
                $.each(data.assets, function(i, v){
                    if($.inArray(v.classid, a) < 0)
                        return true;
                    var y = arr[v.classid];
                    y.asset = v.assetid;
                    y.amount = v.amount;
                    $('#b').append(`<tr><td>${i}</td><td><a target=_blank href="/my/gamecards/${y.app}/">${y.Game}</a></td><td>${y.class}</td><td>${y.asset}</td><td><a target=_blank href="/market/listings/753/${y.hash}">${y.hash}</a></td><td>${y.cardborder}</td><td>${y.item_class}</td><td>${y.amount}</td><td id="${y.asset}">${y.price}</td><td><a class="bu" href="javascript:void(0);" onclick="getcardprice(${y.asset}, '${y.hash}');">Chk</a></td><td><a class="cu" href="javascript:void(0);" onclick="sell(${y.asset}, 1);">Sell</a></td><td id="m${y.asset}"></td></tr>`);
                });
                $('#m').append('done');
            } else {
                $('#m').append('error-2');
            }
        },
        error: function () {
            $('#m').append('error-1');
        }
    });
}

unsafeWindow.getcardprice = function(k, hash){
    var id = `#${k}`;
    $(id).empty();
    hash =encodeURIComponent(hash);
    var url = `/market/priceoverview/?country=CN&currency=23&appid=753&market_hash_name=${hash}`;
    $.getJSON(url, function (data) {
        if (data.success === true) {
            var m = /[0-9.,]+/.exec(data.lowest_price);
            if(m){
                var p = Math.floor(parseFloat(m[0]) * 100);
                $(id).append(p);
                $(id).attr('title', data.volume);
            }
        }
    }).done(function () {
    }).fail(function (xhr) {
        $(id).append(xhr.statusText);
    });
}

unsafeWindow.sell = function(a, n) {
    var id = `#${a}`;
    var m = `#m${a}`;
    $(m).empty();
    var p = $(id).text();
    p = Math.ceil(p / 1.15);
    $.ajax({
        url: '/market/sellitem/',
        method: 'POST',
        data : {
            sessionid: g_sessionID,
            appid: 753,
            contextid: 6,
            assetid: a,
            amount: n,
            price: p,
        },
        success: function (data) {
            if (data.success === true) {
                if (data.requires_confirmation)
                    $(m).append('requires_confirmation');
                else
                     $(m).append(p);
            } else {
                 $(m).append(data.message);
            }
        },
        error: function () {
             $(m).append('err-1');
        }
    });
}

/*
$('.my_market_header').append('<a id="a">REMOVE</a>');
$('#a').click(function(){
    $('.item_market_action_button').each(function(){
        var h = $(this).attr('href');
        var m = /'mylisting', '(\d+)'/.exec(h);
        if (m){
            var id = m[1];
            var url = `https://steamcommunity.com/market/removelisting/${id}`;
            $.ajax({
                url: url,
                type: 'POST',
                data: {sessionid: g_sessionID},
            }).done(function (data) {
            }).fail(function (xhr) {
            });
        }
    });
});
*/