// ==UserScript==
// @name         cgame_list
// @namespace    http://tampermonkey.net/
// @version      2021.11.26.2
// @description  replace google cdn
// @author       jacky
// @match        https://www.c5game.com/dota.html*
// @match        https://www.c5game.com/csgo.html
// @match        https://www.c5game.com/csgo/default/result.html*
// @require      http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/cgame_list.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/cgame_list.user.js
// @connect      steamcommunity.com
// @connect      176.122.178.89
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("tr,td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");

var g = 'none';
var ma = /dota|csgo/.exec(document.URL);
if (ma)
    g = ma[0];
$('.tab-content').after('<table id="a"></table>');
$('#a').after('<iframe id="iframeForm" name="iframeForm" style="display:none;"></iframe>');
$('#a').after(`<form id="f" action="http://176.122.178.89/c5.php?g=${g}" method="post" target="iframeForm"></form>`);
$('#a').after(`<form id="f2" action="http://176.122.178.89/c5.php?g=${g}" method="post" target="iframeForm"></form>`);

var mg, app, ua, ub;
switch (g) {
    case 'dota':
        mg = /item_id=([0-9]+)/;
        ua = '/dota/item/index.html?item_id=';
        ub = '&type=S'
        app = 570;
        break;
    case 'csgo':
        mg = /csgo\/([0-9]+)/;
        ua = '/csgo/';
        ub = '/S.html';
        app = 730;
        break;
}
var k = 1, l = [], q = [];
$('.selling').each(function(){
    var c,d,e,f;
    var a = $(this).find("a:last");
    var b = a.text();
    var h = a.attr('href');
    var m = mg.exec(h);
    mg.lastIndex = 0;
    if (m)
        c = m[1];
    m = /[0-9.]+/.exec($(this).find(".price:first").text());
    if (m)
        d = m[0];
    m = /[0-9]+/.exec($(this).find(".num:first").text());
    if (m)
        e = m[0];
    l[`.${c}`] = {
        't': b,
        'p': d,
        'n': e,
        'l': ''
    };
    if (d > 3)
        q.push(c);
});

if (q.length > 0) {
    q = q.join();
    GM_xmlhttpRequest({
        method: 'GET',
        url: `http://176.122.178.89/c5.php?g=${g}&q=${q}`,
        onload: function (response) {
            var data = JSON.parse(response.responseText);
            var k = 1, z = 1, r = [];
            data['a'].forEach(function (v) {
                var i = v['i'];
                var j = l[`.${i}`];
                $('#a').append(`<tr id=${i}><td><a target=_blank href="${ua}${i}${ub}">${j['t']}</a><br><a target=_blank href="https://steamcommunity.com/market/listings/${app}/${v['l']}">${v['l']}</a></td><td>${j['p']}<br>${j['n']}</td></tr>`);
                if (!v['n'] || v['n'] == 0){
                    r.push(v);
                } else {
                    get_p(i, v['n'], j['p'], z++);
                }
            });
            var q = r.length;
            if (q > 0){
                var f = true;
                $('#f2').append('<input id="p2" type="submit" value="Submit" />');
                $('#f2').after('<table id="c"></table>');
                r.forEach(function (v) {
                    var i = v['i'];
                    var url = `https://steamcommunity.com/market/listings/${app}/${v['l']}`;
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: url,
                        onload: function (response) {
                            $('#p2').val(--q);
                            var y = 0;
                            var m = /Market_LoadOrderSpread\(\s*([0-9]+)/.exec(response.responseText);
                            if (m){
                                y = m[1];
                            } else {
                                m = /此物品不在货架上/.exec(response.responseText);
                                if (m) {
                                    y = -1;
                                }
                            }
                            if (y > 0)
                                get_p(i, y, l[`.${i}`]['p'], z++);
                            $('#f2').append(`<input type="hidden" name="${i}" value="${y}" />`);
                            //$('#c').append(`<tr><td>${i}</td><td>${y}</td></tr>`);
                            if (q==0){
                                $('#p2').click();
                            }
                        }
                    });
                });
            }
            var p = data['b'].length;
            if (p > 0){
                $('#f').append('<input id="p" type="submit" value="Submit" />');
                data['b'].forEach(function (v) {
                    var i = v;
                    var j = l[`.${i}`]['t'];
                    setTimeout(function () {
                        $.ajax({
                            url: `${ua}${i}${ub}`,
                            type: "GET",
                            success: function( data, status, xhr ){
                                var m = /itemDetail = ({[^;]+});/.exec(data);
                                var json;
                                if (m)
                                    json = JSON.parse(m[1]);
                                if (json){
                                    var k = json['marketHashName'];
                                    var y = 0;
                                    var url = `https://steamcommunity.com/market/listings/${json['appId']}/${k}`;
                                    console.log(url);
                                    GM_xmlhttpRequest({
                                        method: 'GET',
                                        url: url,
                                        onload: function (response) {
                                            $('#p').val(--p);
                                            var m = /Market_LoadOrderSpread\(\s*([0-9]+)/.exec(response.responseText);
                                            if (m){
                                                y = m[1];
                                            } else {
                                                m = /此物品不在货架上/.exec(response.responseText);
                                                if (m) {
                                                    y = -1;
                                                }
                                            }
                                            if (y > 0){
                                                $('#a').append(`<tr id=${i}><td><a target=_blank href="${ua}${i}${ub}">${l[`.${i}`]['t']}</a><br><a target=_blank href="https://steamcommunity.com/market/listings/${app}/${k}">${k}</a></td><td>${l[`.${i}`]['p']}<br>${l[`.${i}`]['n']}</td></tr>`);
                                                get_p(i, y, l[`.${i}`]['p'], z++);
                                            }
                                            //$('#f').after(`<div>${j}|${k}|${y}</div>`);
                                            $('#f').append(`<input type="hidden" name="${i}" value="${j}^${k}^${y}" />`);
                                            if (p==0){
                                                $('#p').click();
                                            }
                                        },
                                        fail: function( data, status, xhr ){
                                            $('#f').append(`<input type="hidden" name="${i}" value="${j}^${k}^${y}" />`);
                                            $('#p').val(--p);
                                            if (p==0){
                                                $('#p').click();
                                                /*
                                setTimeout(function () {
                                    location.reload();
                                },3000);
                                */
                                            }
                                        }
                                    });
                                } else {
                                    $('#p').val(--p);
                                    if (p==0){
                                        $('#p').click();
                                        /*
                                setTimeout(function () {
                                    location.reload();
                                },3000);
                                */
                                    }
                                }
                            },
                            fail: function( data, status, xhr ){
                                $('#p').val(--p);
                                if (p==0){
                                    $('#p').click();
                                    /*
                                setTimeout(function () {
                                    location.reload();
                                },3000);
                                */
                                }
                            }
                        });
                    },k++ * 1500);
                });
            }
        }
    });
}

function get_p(i, n, j ,z)
{
    setTimeout(function () {
        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://steamcommunity.com/market/itemordershistogram?country=CN&language=schinese&currency=23&item_nameid=${n}&two_factor=0`,
            onload: function (response) {
                var data = JSON.parse(response.responseText);
                if (data.success == 1){
                    var buy = 0,bp = 0, bq = 0, co = "white";
                    // data.buy_order_graph.length
                    if (data.highest_buy_order) {
                        buy = (data.highest_buy_order / 100).toFixed(2);
                        if (buy > j){
                            bp = (buy * 0.87).toFixed(2);
                            bq = (j / bp).toFixed(2);//0.87
                            if (bq < 0.8)
                                co = "green";
                        }
                    }
                    $(`#${i}`).append(`<td>${buy}<br>${bp}</td><td><span style="color: ${co};">${bq}</span></td>`);
                    var sell = 0, sp = 0, sq = 0;
                    // data.sell_order_graph.length
                    if (data.lowest_sell_order){
                        sell = (data.lowest_sell_order / 100).toFixed(2);
                        if (sell > j){
                            sp = (sell * 0.87).toFixed(2);
                            sq = (j / sp).toFixed(2);//0.87
                            if (sq < 0.8)
                                co = "green";
                        }
                    }
                    $(`#${i}`).append(`<td>${sell}<br>${sp}</td><td><span style="color: ${co};">${sq}</span></td>`);
                }
            },
            fail: function( data, status, xhr ){
                $(`#${i}`).append(`<td>${status}</td>`);
            }
        });
    },z * 1100);
}

function steam_url(id, t)
{
    $.ajax({
        url: `/${g}/item/index.html?item_id=${id}&type=${t}`,
        type: "GET",
        success: function( data, status, xhr ){
            var m = /market\/listings\/570[^\/]*\/([^"\/]+)/.exec(data);
            if (m)
                $(`#${id}`).append(m[1]);
        },
        fail: function( data, status, xhr ){
            alert(status);
        }
    });
}

function get_url(u){
    GM_xmlhttpRequest({
        method: 'GET',
        url: `http://176.122.178.89/c5.php?q=${u}`,
        onload: function (response) {
            var data = JSON.parse(response.responseText);
            $.each(data, function (v) {
                $(`#${v['i']}`).append(v['l']);
            });
        }
    });
}