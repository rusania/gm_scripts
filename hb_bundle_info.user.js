// ==UserScript==
// @name        hb_bundle_info
// @namespace   http://tampermonkey.net/
// @description hb bundle info
// @include     http*://www.humblebundle.com/games/*
// @include     http*://www.humblebundle.com/software/*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/hb_bundle_info.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/hb_bundle_info.user.js
// @connect     steamdb.info
// @grant       unsafeWindow
// @version     2021.11.12.1
// @run-at      document-body
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_setClipboard
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse;font-size:16px !important;}");
GM_addStyle("tr,td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");
GM_addStyle(".d{background-color:#282c34;font-size:16px;color:white !important;}");

window.addEventListener ("DOMContentLoaded", DOM_ContentReady);
window.addEventListener ("load", pageFullyLoaded);

var m, txt;
var j = $('#webpack-bundle-page-data');

function DOM_ContentReady () {
    $("body").on('click', '#p', function(){
        GM_setClipboard(txt);
    });

    if (j){
        txt = j.text();
        j = JSON.parse(txt);
        $('.base-main-wrapper').before('<div class="d" id="a1"></div>');
        $('#a1').append('<p><a id="p">JSON</a></p>');
        if (j && j.bundleData) {
            var r = [];
            $.each(j.exchangeRates, function (i, e) {
                var k = i.split('|')[0];
                r[k] = e;
            });
            j = j.bundleData;
            $('#a1').append(`<p>${j.basic_data.human_name}</p>`);
            $('#a1').append(`<p>${j.machine_name}</p>`);
            //$('#a1').append(`<p>${j.hero_tile.tile_stamp}</p>`);
            //$('#a1').append(`<p>${j.hero_tile.hover_highlights}</p>`);
            //if (j.hero_tile.exclusive_countries)
            //    $('#a1').append(`<p>Inc: ${j.hero_tile.exclusive_countries}</p>`);
            //if (j.hero_tile.disallowed_countries)
            //    $('#a1').append(`<p><span style="color:red;">Exc: ${j.hero_tile.disallowed_countries}</span></p>`);
            //var d = new Date(`${new Date(j.hero_tile['start_date|datetime'])} UTC`).toLocaleString();
            //$('#a1').append(`<p>Start: ${d}</p>`);
            var d = new Date(`${j.basic_data['end_time|datetime']}+00:00`).toLocaleString();
            $('#a1').append(`<p>End: ${d}</p>`);

            m = [];
            $.each(j.tier_pricing_data, function (i, e) {
                m[e.identifier] = e['price|money'];
            });
            $('#a1').append('<table class="d" id="b"></table><br>');
            $('#a1').append('<table class="d" id="c"></table><br>');
            $('#a1').append('<table class="d" id="d"></table>');
            /*
            $.each(j.hero_tile.cached_content_events, function(i, e){
                var id = e.identifier;
                if (m[id])
                    $('#b').append(`<tr><th colspan="9">${id} <span style="color:green;">${m[id].currency} ${m[id].amount}</span></th></tr>`);
                else
                    $('#b').append(`<tr><th colspan="9">${id}</th></tr>`);
                if (e.price){
                    var a, b, c;
                    $.each(e.price, function(j, f){
                        a += `<td>${f[0]}</td>`;
                        b += `<td>${f[1]}</td>`;
                        var v = (f[0] / r[f[1]] * r['CNY']).toFixed(2);
                        c += `<td>${v}</td>`;
                    });
                    $('#b').append(`<tr>${a}</tr><tr>${b}</tr>tr>${c}</tr>`);
                }
            });
            */

            var n = [];
            var q = 1;
            $.each(j.tier_order.reverse(), function (o, v){
                var t = j.tier_pricing_data[v]['price|money'];
                var c = (t.amount / r[t.currency] * r['CNY']).toFixed(2);
                $('#c').append(`<tr><th colspan="6">${j.tier_display_data[v].header}<br>${t.amount}&nbsp;${t.currency}&nbsp;/&nbsp;${c}&nbsp;CNY</th><tr>`);
                j.tier_display_data[v].tier_item_machine_names.forEach(function (i){
                    var g = j.tier_item_data[i];

                    if ($.inArray(g.machine_name, n) < 0){
                        n.push(g.machine_name);
                        var h = [];
                        if (g.availability_icons){
                            g.availability_icons.delivery_icons.forEach(function (v) {
                                h.push(v.replace('hb-', ''));
                            });
                        }
                        var exc = '<td>-</td>';
                        var dis = '<td>-</td>';
                        var d = g.exclusive_countries;
                        if (d && d.length)
                            exc = `<td title="${d}">List</td>`;
                        d = g.disallowed_countries;
                        if (d && d.length)
                            dis = `<td title="${d}">List</td>`;
                        var p = '-';
                        if (g['msrp_price|money']){
                            p = `${g['msrp_price|money'].amount} ${g['msrp_price|money'].currency}`;
                        }
                        $('#c').append(`<tr><td>${q++}</td><td>${g.human_name}<br>${g.machine_name}<br>${g.item_content_type}</td><td>${p}</td>${exc}${dis}<td>${h.join()}</td><tr>`);
                    }
                });
            });

            /*
            r = j.hero_tile.hero_tile_grid_info.displayitem_image_info;
            n = [];
            $.each(j.bonus_data, function (o, e) {
                n.push(e.display_item_machine_name);
                $('#d').append(`<tr><td>${o}</td><td>${e.human_name}<br>${e.display_item_machine_name}</td><td>${e.section_identifier}</td><td>${e.type}</td></tr>`);
            });
            m = [];
            var i = 1;
            $.each(j.slideout_data.display_items, function (o, e) {
                if ($.inArray(o, n) < 0) {
                    var g = [];
                    if (e.availability_icons){
                        e.availability_icons.delivery_icons.forEach(function (v) {
                            g.push(v.replace('hb-', ''));
                        });
                    }
                    var exc = '<td>-</td>';
                    var dis = '<td>-</td>';
                    if (r[o]) {
                        var d = r[o].exclusive_countries;
                        if (d && d.length)
                            exc = `<td title="${d}">List</td>`;
                        d = r[o].disallowed_countries;
                        if (d && d.length)
                            dis = `<td title="${d}">List</td>`;
                    }
                    m[o] = `<td>${e.human_name}<br>${o}</td>${exc}${dis}<td>${g.join()}</td>`;
                }
            });

            $('.dd-game-row').each(function(){
                var t = $(this).find('h2:first').text();
                $('#c').append(`<tr><th colspan="6">${t}</th></tr>`);
                $(this).find('.dd-image-box-figure').each(function(k, v){
                    var o = $(v).attr('data-slideout');
                    $('#c').append(`<tr><td>${i++}</td>${m[o]}</tr>`);
                });
            });
            */
        }
    }
}

function pageFullyLoaded () {
}