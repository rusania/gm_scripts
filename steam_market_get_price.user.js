// ==UserScript==
// @name         steam_market_get_price
// @namespace    http://tampermonkey.net/
// @version      2022.01.17.1
// @description  steam market get price
// @author       jacky
// @match        https://steamcommunity.com/profiles/*/inventory/*
// @require      http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @updateURL 	 https://github.com/rusania/gm_scripts/raw/master/steam_market_get_price.user.js
// @downloadURL  https://github.com/rusania/gm_scripts/raw/master/steam_market_get_price.user.js
// @run-at       document-body
// @connect      176.122.178.89
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("tr,td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");
$('#tabcontent_inventory').after('<table id="a"></table>');
$('#tabcontent_inventory').after('<table id="k"></table>');
$('#tabcontent_inventory').append('&nbsp;<a href="javascript:void(0);" onclick="fff();">FFF</a>');
$('#tabcontent_inventory').after('<a class="c" data-p="0" data-c="5000">LIST</a>');
// 12236791045
// 4835558033
$('#tabcontent_inventory').after('<a class="c" data-p="12236791045" data-c="75">LIST2</a>&nbsp;');
$('#tabcontent_inventory').after('<iframe id="iframeForm" name="iframeForm" style="display:none;"></iframe>');
$('#tabcontent_inventory').after(`<form id="f" action="http://176.122.178.89/goo.php" method="post" target=_blank></form>`);

(function(open) {
    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
        this.addEventListener("load", function() {
            // https://steamcommunity.com/market/priceoverview/?country=CN&currency=23&appid=570&market_hash_name=Frozen%20Touch
            // {success: true, lowest_price: "¥ 0.99", volume: "4", median_price: "¥ 0.88"}
            // https://steamcommunity.com/market/itemordershistogram?language=english&country=CN&currency=23&item_nameid=2006775
            // https://steamcommunity.com/market/pricehistory/?appid=570&market_hash_name=LGD%27s%20Golden%20Skipper
            if (/itemordershistogram/.exec(this.responseURL)){
                parse(this.response);
            } else if (/\/\d+\?/.exec(this.responseURL)){
                parse2(this.response);
            }
        }, false);
        open.call(this, method, url, async, user, pass);
    };
})(XMLHttpRequest.prototype.open);

function parse(data){
    if (data && data.success==1){
        var b = (data.highest_buy_order / 100).toFixed(2);
        var s = (data.lowest_sell_order / 100).toFixed(2);
        if (b > 0)
            b = `${b}(${data.buy_order_graph[0][1]})`;
        if (s > 0)
            s = `${s}(${data.sell_order_graph[0][1]})`;
        $('.item_market_actions').append(`<div style="min-height: 3em; margin-left: 1em;">求购价：${b}；出售价：${s}</div>`);
    }
}

var r3 = [];
var r2 = [];
unsafeWindow.fff = function()
{
    if (r2.length > 0 && r2.length < 76) {
        var q = r2.join();
        GM_xmlhttpRequest({
            method: 'GET',
            url: `http://176.122.178.89/goo.php?q=${q}`,
            onload: function (response) {
                var data = JSON.parse(response.responseText);
                data['a'].forEach(function (v) {
                    var id = v['i'];
                    var hash = v['h'];
                    var app = v['a'];
                    var type = v['t'];
                    var color = v['c'];
                    var mark = v['m'];
                    var val = v['v'];
                    var h = hash.replace(/&#039;/g, '^');
                    console.log(hash);
                    $('#k').append(`<tr><td>${id}</td><td>${hash}</td><td>${app}</td><td>${type}</td><td>${color}</td><td>${mark}</td><td>${val}</td><td><a href="javascript:void(0);" onclick="getPrice(${id}, '${h}');">p</a></td><td id="${id}"></td></tr>`);
                });
                var q = data['b'].length;
                if (q > 0){
                    var f = true;
                    $('#f').append('<input id="p" type="submit" value="Submit" />');
                    data['b'].forEach(function (k) {
                        var id = k;
                        var u = r3[`.${k}`];
                        var s = u.split('^');
                        var url = encodeURIComponent(s[0]);
                        var y = 0;
                        $('#p').val(--q);
                        $.ajax({
                            url: `/market/listings/753/${url}`,
                            async : false,
                            type: "GET",
                            success: function( data){
                                var m = /Market_LoadOrderSpread\(\s*([0-9]+)/.exec(data);
                                if (m){
                                    y = m[1];
                                } else {
                                    m = /此物品不在货架上/.exec(response.responseText);
                                    if (m) {
                                        y = -1;
                                    }
                                }
                            },
                            fail: function( data, status, xhr ){
                            }
                        });
                        var g = -1;
                        $.ajax({
                            url: `/auction/ajaxgetgoovalueforitemtype/?appid=${s[1]}&item_type=${s[2]}&border_color=${s[3]}`,
                            async: false,
                            type: "GET",
                            success: function( data, status, xhr ){
                                if (data.success == 1){
                                    g = data.goo_value;
                                }
                            },
                            fail: function( data, status, xhr ){
                            }
                        });
                        if (y != 0 && g > -1)
                        {
                            u = u.replace(/"/g, '&amp;quot;');
                            $('#f').append(`<input type="hidden" name="${k}" value="${u}^${y}^${g}" />`);
                        }
                        else {
                            $('#f').append(`<tr><td>${k}</td><td>${u}</td></tr>`);
                        }
                    });
                }
            },
            fail: function( data, status, xhr ){
            }

        });
    }
}

function parse2(response){
    r2 = [], r3 = [];
    var data = JSON.parse(response);
    if (data && data.success==1){
        $('#a').empty();
        $('#k').empty();
        $('#f').empty();
        var a = [];
        $.each(data.descriptions, function(k, v){
            a[`.${v.classid}`] = v;
            var json = JSON.stringify(v.owner_actions);
            var m = /GetGooValue\( '%contextid%', '%assetid%', (\d+), (\d+), (\d+)/.exec(json);
            if (m){
                r2.push(v.classid);
                r3[`.${v.classid}`] =`${v.market_hash_name}^${v.market_fee_app}^${m[2]}^${m[3]}`;
            }
        });
        $.each(data.assets, function(k, v){
            var b = a[`.${v.classid}`];
            var text = '';
            if (b.owner_actions){
                var json = JSON.stringify(b.owner_actions);
                if (/OpenBooster/.exec(json)){
                    text = `<span id="${b.market_fee_app}"><a href="javascript:void(0);" onclick="unpack(${b.market_fee_app}, ${v.assetid});">OpenBooster</a></span>`;
                }else if(/gamecards/.exec(json)){
                    text = `<div><a target=_blank href="/my/gamecards/${b.market_fee_app}/">Ba</a>&nbsp;<a target=_blank href="https://www.steamcardexchange.net/index.php?gamepage-appid-${b.market_fee_app}/"><img width="16px" height="16px" src="https://www.steamcardexchange.net/include/design/img/favicon_blue_small.png" /></a></div>`;
                }
                var m = /GetGooValue\( '%contextid%', '%assetid%', (\d+), (\d+), (\d+)/.exec(json);
                if (m){
                    text += `<div><a href="javascript:void(0);" onclick="goo(${m[1]}, ${m[2]}, ${m[3]}, ${v.assetid});">Goo</a></span><span id="${v.assetid}"></span></div>`;
                }
                var url = encodeURIComponent(b.market_hash_name);
                text += `&nbsp;<a target=_blank href="/market/listings/${b.appid}/${url}">Ma</a>`;
                text += `&nbsp;<a target=_blank href="#${v.appid}_${v.contextid}_${v.assetid}">In</a>`;
            }
            // v.instanceid
            $('#a').append(`<tr><td>${k}</td><td>${v.assetid}</td><td>${v.classid}</td><td>${v.amount}</td><td>${b.market_fee_app}</td><td><div>${b.market_hash_name}</div><div>${b.type}</div></td><td>${b.marketable}</td><td>${b.tradable}</td><td>${text}</td></tr>`);
        });
    }
}

$("body").on('click', '.c', function(){
    var d = $(this);
    var a = d.data("p");
    var b = d.data("c");
    if (start > 0)
        a = start;
    var url = `/inventory/${g_steamID}/753/6?l=schinese&count=${b}&start_assetid=${a}`;
    $.ajax({
        url: url,
        type: "GET",
        success: function( data, status, xhr ){
            if (data.success == 1){
                if (data.more_items)
                    d.data("p", data.last_assetid);
                else
                    d.data("p", d.attr("data-p"));
            }
        },
        fail: function( data, status, xhr ){
            alert(status);
        }
    });
});

var start = 0;
function list(a, b)
{
    if (start > 0)
        a = start;
    var url = `/inventory/${g_steamID}/753/6?l=schinese&count=${b}&start_assetid=${a}`;
    $.ajax({
        url: url,
        type: "GET",
        success: function( data, status, xhr ){
            if (data.success == 1){
                if (data.more_items)
                    start = data.last_assetid;
                else
                    start = 0;
            }
        },
        fail: function( data, status, xhr ){
            alert(status);
        }
    });
}

unsafeWindow.getPrice = function(id ,hash)
{
    $(`#${id}`).empty();
    hash = hash.replace(/\^/g, "'");
    hash = encodeURIComponent(hash);
    var url = `/market/priceoverview/?country=CN&currency=23&appid=753&market_hash_name=${hash}`;
    $.getJSON(url, function (data) {
        var v = -1;
        if (data.success === true) {
            var l = data.lowest_price;
            if (l){
                v = l;
            } else {
                v = 0;
            }
        }
        $(`#${id}`).append(`<a target=_blank href="/market/listings/753/${hash}">${v}</a>`);
    }).done(function () {
    }).fail(function( xhr, status, text ){
        $(`#${id}`).append(text);//xhr.statusText
    });
}

unsafeWindow.goo = function(a, b, c, d)
{
    $(`#${d}`).empty();
    var url = `/auction/ajaxgetgoovalueforitemtype/?appid=${a}&item_type=${b}&border_color=${c}`;
    $.ajax({
        url: url,
        type: "GET",
        success: function( data, status, xhr ){
            if (data.success == 1){
                $(`#${d}`).append(data.goo_value);
            }
        },
        fail: function( data, status, xhr ){
            alert(status);
        }
    });
}

unsafeWindow.grind = function(a, b, c, d)
{

    $.ajax({
        url: `/profiles/${g_steamID}/ajaxgetgoovalue/?sessionid=7f460d9c653a1adcffe666d3&appid=${a}&assetid=${b}&contextid=${c}`,
        type: "GET",
        data : {
            sessionid : g_sessionID,
            appid : a,
            assetid : b,
            contextid : c,
            goo_value_expected : d
        },
        success: function( data, status, xhr ){
            if (data.success == 1){
                $(`#${d}`).append(data.goo_value);
            }
        },
        fail: function( data, status, xhr ){
            alert(status);
        }
    });
    /*
    goo_value: "200"
    item_appid: 1797760
    item_type: 5
    strHTML: "<div>爱的付出 价值 200 个宝石。您要将该物品转化成宝石吗？此操作无法取消。</div>"
    strTitle: "将 爱的付出 转换为宝石吗？"

    "goo_value_received ": "200"
    goo_value_total: "10562"
    strHTML: "<div>恭喜！您多了 200 个宝石，总计 10,562 个宝石。</div>"
    success: 1
    */

    $(`#${d}`).empty();
    var url = `/profiles/${g_steamID}/ajaxgrindintogoo/`;
    $.ajax({
        url: url,
        type: "POST",
        data : {
            sessionid : g_sessionID,
            appid : a,
            assetid : b,
            contextid : c,
            goo_value_expected : d
        },
        success: function( data, status, xhr ){
            if (data.success == 1){
                $(`#${d}`).append(data.goo_value);
            }
        },
        fail: function( data, status, xhr ){
            alert(status);
        }
    });
}

unsafeWindow.unpack = function(app, item)
{
    $(`#${app}`).empty();
    $.ajax({
        statusCode: {
            500: function() {
                alert("500");
            }
        },
        url: `/profiles/${g_steamID}/ajaxunpackbooster/`,
        type: "POST",
        data: {
            appid: app,
            communityitemid: item,
            sessionid: g_sessionID
        },
        success: function( data, status, xhr ){
            if (data.success == 1){
                $.each(data.rgItems, function(i, v){
                    var c = v.foil ?  '[Foil]' : '';
                    $(`#${app}`).append(`<div>${c}${v.name}</div>`);
                });
            } else {
                $(`#${app}`).append(data.success);
            }
        },
        fail: function( data, status, xhr ){
            $(`#${app}`).append(status);
        }
    });
}