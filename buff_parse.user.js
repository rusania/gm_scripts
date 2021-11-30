// ==UserScript==
// @name         buff_parse
// @namespace    http://tampermonkey.net/
// @version      2021.11.30.1
// @description  try to take over the world!
// @author       jacky
// @match        https://buff.163.com/market/dota2
// @icon         https://www.google.com/s2/favicons?domain=buff.163.com
// @require      http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/buff_parse.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/buff_parse.user.js
// @run-at      document-body
// @connect      steamcommunity.com
// @connect      176.122.178.89
// @grant        GM_xmlhttpRequest
// @grant       unsafeWindow
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("tr,td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");
$('#j_market_card').after('<table id="a"></table>');
$('#a').after('<iframe id="iframeForm" name="iframeForm" style="display:none;"></iframe>');

var g = 'none';
var ma = /dota|csgo/.exec(document.URL);
if (ma)
    g = ma[0];

var app;
switch (g) {
    case 'dota':
        app = 570;
        break;
    case 'csgo':
        app = 730;
        break;
}

$('#a').after(`<form id="f" action="http://176.122.178.89/buff.php?g=${g}" method="post" target="iframeForm"></form>`);
$('#a').after(`<form id="f2" action="http://176.122.178.89/buff.php?g=${g}" method="post" target="iframeForm"></form>`);

(function(open) {
    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
        this.addEventListener("load", function() {
            if (/api\/market\/goods/.exec(this.responseURL)){
                parse(this.responseText);
            }
        }, false);
        open.call(this, method, url, async, user, pass);
    };
})(XMLHttpRequest.prototype.open);

function parse(html){
    var data = JSON.parse(html);
    if (data && data.code=="OK"){
        console.log(data.data.total_count);
        console.log(data.data.total_page);
        $('#a').empty();
        $('#f').empty();
        $('#f2').empty();
        var k = 1, l = [], q = [];
        $.each(data.data.items, function(k, v){
            //$('#a').append(`<tr><td>${v.id}</td><td><a target=_blank href="/goods/${v.id}?from=market#tab=selling">${v.name}</a><br><a target=_blank href="${v.steam_market_url}">${v.market_hash_name}</a></td><td>${v.sell_min_price}<br>${v.sell_num}</td><td>${v.goods_info.steam_price_cny}</td></tr>`);
            l[`.${v.id}`] = {
                't': v.name,
                'p': v.sell_min_price,
                'n': v.sell_num,
                'l': v.market_hash_name
            };
            if (v.sell_min_price > 3)
                q.push(v.id);
        });

        if (q.length > 0) {
            q = q.join();
            GM_xmlhttpRequest({
                method: 'GET',
                url: `http://176.122.178.89/buff.php?g=${g}&q=${q}`,
                onload: function (response) {
                    var data = JSON.parse(response.responseText);
                    var k = 1, z = 1, r = [];
                    data['a'].forEach(function (v) {
                        var i = v['i'];
                        var j = l[`.${i}`];
                        $('#a').append(`<tr id=${i}><td><a target=_blank href="/goods/${i}?from=market#tab=selling">${j['t']}</a><br><a target=_blank href="https://steamcommunity.com/market/listings/${app}/${v['l']}">${v['l']}</a></td><td>${j['p']}<br>${j['n']}</td></tr>`);
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
                            var k = l[`.${i}`]['l'];
                            var y = 0;
                            var url = `https://steamcommunity.com/market/listings/${app}/${k}`;
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
                                        $('#a').append(`<tr id=${i}><td><a target=_blank href="/goods/${i}?from=market#tab=selling">${j}</a><br><a target=_blank href="https://steamcommunity.com/market/listings/${app}/${k}">${k}</a></td><td>${l[`.${i}`]['p']}<br>${l[`.${i}`]['n']}</td></tr>`);
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


                        });
                    }
                }
            });
        }

    }
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
                    var buy = 0,bp = 0, bq = 0, co = "black";
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