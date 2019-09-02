// ==UserScript==
// @name        bs_games_info
// @namespace   http://tampermonkey.net/
// @description bs_games_info
// @include     https://www.fanatical.com/en/game/*
// @include     https://www.fanatical.com/en/bundle/*
//@include      https://www.fanatical.com/en/pick-and-mix/*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/bs_games_info.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/bs_games_info.user.js
// @version     2019.08.28.1
// @run-at      document-end
// @connect     free.currencyconverterapi.com
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       unsafeWindow
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

var txt = GM_getValue("ratio", "{}");
var dt = GM_getValue("update", 0);
var r = JSON.parse(txt);

GM_addStyle("table{border:solid 1px;border-collapse:collapse;font-size:16px !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");
GM_addStyle(".d{font-size:16px;color:white !important;}");

$('#root').before('<li><a <a href="javascript:void(0);" onclick="api();"><span style="color:green;font-weight:bold;">API</span></a></li>');

unsafeWindow.api = function(){
    var m = /game\/([^\/]+)/.exec(document.URL);
    if (m) {
        if ($('#info').length > 0)
            $('#info').empty();
        else{
            if ($('.stardeal-product-info-container').length > 0){
                $('.stardeal-product-info-container').append('<div class="col-12 col-md-6 col-lg-12"><div id="info" class="p-3 pl-md-1 pl-lg-3 card-body"></div></div>');
                $.ajax({
                    url: '/api/star-deal',
                    type: "GET",
                    success: function(data){
                        var inc = '';
                        var c = [];
                        if (data.product) {
                            if (data.product.regions_included.length){
                                c = [];
                                $.each(data.product.regions_included, function(k, v) {
                                    c.push(v.code);
                                });
                                inc = c.join(',');
                            }
                            $('#info').append(`<div style="word-wrap:break-word;">允许：${inc}</div>`);
                            var exc = '';
                            if (data.product.regions_excluded.length){
                                c = [];
                                $.each(data.product.regions_excluded, function(k, v) {
                                    c.push(v.code);
                                });
                                exc = c.join(',');
                            }
                            $('#info').append(`<div style="word-wrap:break-word;">禁止：${exc}</div>`);
                        }
                        if (data.promoDiscountPercent) {
                            var d = (1 - data.promoDiscountPercent).toFixed(2);
                            var t = (new Date(data.endDate)).toLocaleString();
                            $('#info').append(`<div>折扣：${d}</div>`);
                            $('#info').append(`<div>截止：${t}</div>`);
                        }
                        if (data.promoPrice){
                            $('#info').append('<table id="c" style="text-align:right"><tr><td>货币</td><td>原价</td><td>现价</td><td>折算</td></tr></table>');
                            $.each(data.promoPrice, function(k, v) {
                                var s = v / 100;
                                var p = data.originalPrice[k] / 100;
                                var l = ratio(k, 'CNY');
                                l = (s * l).toFixed(2);
                                $('#c').append(`<tr><td>${k}</td><td>${p}</td><td>${s}</td><td>${l}</td></tr>`);
                            });
                        }
                    },
                    error: function(data){
                    }
                });
            }
            else{
                $('.product-commerce-container').append('<div class="col-12 col-md-6 col-lg-12"><div id="info" class="p-3 pl-md-1 pl-lg-3 card-body"></div></div>');
                $.ajax({
                    url: `/api/products/${m[1]}`,
                    type: "GET",
                    success: function(data){
                        var a = [];
                        var inc = '';
                        var c = [];
                        if (data.regions_included.length){
                            c = [];
                            $.each(data.regions_included, function(k, v) {
                                c.push(v.code);
                            });
                            inc = c.join(',');
                        }
                        $('#info').append(`<div style="word-wrap:break-word;">允许：${inc}</div>`);
                        var exc = '';
                        if (data.regions_excluded.length){
                            c = [];
                            $.each(data.regions_excluded, function(k, v) {
                                c.push(v.code);
                            });
                            exc = c.join(',');
                        }
                        $('#info').append(`<div style="word-wrap:break-word;">禁止：${exc}</div>`);
                        if (data.steam) {
                            var sub = data.steam.sub ? 'sub' : 'app';
                            var id = data.steam.id;
                            $('#info').append(`<div">信息：<a target=_blank href="https://steamdb.info/${sub}/${id}/">${id}</a></div>`);
                        }
                        if (data.current_discount) {
                            var d = (1 - data.current_discount.percent).toFixed(2);
                            var t = (new Date(data.current_discount.until)).toLocaleString();
                            $('#info').append(`<div>折扣：${d}</div>`);
                            $('#info').append(`<div>截止：${t}</div>`);
                        }
                        if (data.currentPrice){
                            $('#info').append('<table id="c" style="text-align:right"><tr><td>货币</td><td>原价</td><td>现价</td><td>折算</td></tr></table>');
                            $.each(data.currentPrice, function(k, v) {
                                var s = v / 100;
                                var p = data.price[k] / 100;
                                var b = {
                                    's': s,
                                    'p': p
                                };
                                a[k] = b;
                                var l = ratio(k, 'CNY');
                                l = (s * l).toFixed(2);
                                $('#c').append(`<tr><td>${k}</td><td>${p}</td><td>${s}</td><td>${l}</td></tr>`);
                            });
                        }
                    },
                    error: function(data){
                    }
                });
            }
        }
    }

    m = /bundle\/([^\/]+)/.exec(document.URL);
    if (m) {
        if ($('#info').length > 0)
            $('#info').empty();
        else{
            var d = $('.bundle-games-container');
            if (d.length == 0)
                d = $('.product-commerce-container');
            $(d[0]).append('<div class="col-12 col-md-6 col-lg-12"><div id="info" class="p-3 pl-md-1 pl-lg-3 card-body"></div></div>');
        }
        // https://www.fanatical.com/api/products/fanatical-anthology-mega-bundle/en
        $.ajax({
            url: `/api/products/${m[1]}/en`,
            type: "GET",
            success: function(data){
                var a = [];
                if (data.availability) {
                    var t = (new Date(data.availability.valid_from)).toLocaleString();
                    $('#info').append(`<div>起始：${t}</div>`);
                    t = (new Date(data.availability.valid_until)).toLocaleString();
                    $('#info').append(`<div>截止：${t}</div>`);
                }

                if (data.bundles) {
                    $.each(data.bundles, function(key, val) {
                        $('#info').append(`<div>Tier&nbsp;${key+1}</div>`);
                        $.each(val.games, function(k, v) {
                            if (v.steam){
                                var sub = v.steam.sub ? 'sub' : 'app';
                                var id = v.steam.id;
                                $('#info').append(`<div>${k+1}.&nbsp;<a target=_blank href="https://steamdb.info/${sub}/${id}/">${v.name}</a>&nbsp;<a target=_blank href="https://steamdb.info/${sub}/${id}/">i</a></div>`);
                            } else
                                $('#info').append(`<div>${k+1}.&nbsp;${v.name}</div>`);
                        });
                        $('#info').append(`<table id="c${key}" style="text-align:right"><tr><td>货币</td><td>现价</td><td>折算</td></tr></table>`);
                        $.each(val.price, function(k, v) {
                            var s = v / 100;
                            var l = ratio(k, 'CNY');
                            l = (s * l).toFixed(2);
                            $('#c'+key).append(`<tr><td>${k}</td><td>${s}</td><td>${l}</td></tr>`);
                        });
                    });
                }
            },
            error: function(data){
            }
        });
    }

    m = /pick-and-mix\/([^\/]+)/.exec(document.URL);
    if (m) {
        if ($('#b').length > 0)
            $('#b').empty();
        else{
            d = $('.pnm-details-container');
            if (d.length == 0)
                d = $('.product-commerce-container');
            $(d[0]).append('<div class="col-12 col-md-6 col-lg-12"><div class="p-3 pl-md-1 pl-lg-3 card-body"><table><tr id="b"></tr></table></div></div>');
        }
        $.ajax({
            url: `/api/promotions/${m[1]}`,
            type: "GET",
            success: function(data){
                $.each(data, function(key, val) {
                    $('#b').append(`<td id="${key}"></td>`);
                    var kv = `#${key}`;
                    var t = (new Date(val.valid_from)).toLocaleString();
                    $(kv).append(`<div>起始：${t}</div>`);
                    t = (new Date(val.valid_until)).toLocaleString();
                    $(kv).append(`<div>截止：${t}</div>`);

                    $.each(val.products, function(k, v) {
                        if (v.steam){
                            var sub = v.steam.sub ? 'sub' : 'app';
                            var id = v.steam.id;
                            $(kv).append(`<div>${k+1}.&nbsp;<a target=_blank href="https://steamdb.info/${sub}/${id}/">${v.name}</a>&nbsp;<a target=_blank href="https://steamdb.info/${sub}/${id}/">i</a></div>`);
                        } else
                            $(kv).append(`<div>${k+1}.&nbsp;${v.name}</div>`);
                    });
                    $(kv).append(`<table id="c${key}" style="text-align:right"><tr><td>货币</td><td>现价</td><td>折算</td></tr></table>`);
                    $.each(val.price, function(k, v) {
                        var s = v / 100;
                        var l = ratio(k, 'CNY');
                        l = (s * l).toFixed(2);
                        $('#c'+key).append(`<tr><td>${k}</td><td>${s}</td><td>${l}</td></tr>`);
                    });
                });
            },
            error: function(data){
            }
        });
    }
}

var ratio = function(a, b){
    var s = `${a}_${b}`;
    if (r.hasOwnProperty(s) && Date.now() - dt < 60 * 24 * 60000)
        return r[s];
    dt = Date.now();
    GM_setValue("update", dt);
    $.ajax({
        url: `https://free.currencyconverterapi.com/api/v5/convert?compact=ultra&q=${s}`,
        type: "GET",
        async: false,
        success: function(data){
            if (data.hasOwnProperty(s)){
                r[s] = data[s];
                GM_setValue("ratio", JSON.stringify(r));
                return data[s];
            }
        },
        error: function(data){
        }
    });
    return 0;
}