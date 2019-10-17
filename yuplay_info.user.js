// ==UserScript==
// @name        yuplay_info
// @namespace   http://tampermonkey.net/
// @description yuplay gamazavr games info
// @include     http*://yuplay.ru/news/*
// @include     http*://yuplay.ru/product/*
// @include     http*://yuplay.ru/orders/*
// @include     http*://gamazavr.ru/news/*
// @include     http*://gamazavr.ru/product/*
// @include     http*://gamazavr.ru/orders/*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/yuplay_info.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/yuplay_info.user.js
// @version     2019.10.17.1
// @run-at      document-end
// @connect     data.fixer.io
// @connect     198.181.32.5
// @connect     45.78.74.83
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @grant       GM_xmlhttpRequest
// @grant       GM_log
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_setClipboard
// ==/UserScript==

//GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
//GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-size:16px !important;}");

var r = GM_getValue("r", 0.0);
var dt = GM_getValue("dt", 0);
var host = '45.78.74.83';

var match = /ru\/news\/(\d+)/.exec(document.URL);
if (match) {
    $($('.navi').children() [0]).append('<li><a id="btn">INFO</a></li>');
    $('.section-main').append('<div>实时汇率：<span id="r"></ratio></div>');
    $('.section-main').append(`<a target="_blank" href="http://${host}/yuplay.php?o=html&cc=cn&n=${match[1]}">TRY IT</a>`);
    $('.section-main').append('<table id="info"></table>');
    $('#btn').click(function () {
        $('#info').empty();
        $('#info').append('<tr><td>序号</td><td>游戏</td><td>原价</td><td>优惠价</td><td>人民币</td><td>折扣</td></tr>');
        var f = function () {
            var i = 0;
            $('.section-main').find('li').each(function () {
                var m = $(this).children();
                var title = $(m[0]).text();
                var link = $(m[0]).attr('href');
                var del = $(m[1]).text();
                var p = /(\d+) руб/.exec($(this).text()) [1];
                var p2 = (p * r).toFixed(2);
                var discount = Math.round(((1 - p / del).toFixed(2)) * 100);
                $('#info').append(`<tr><td>${(++i)}</td><td><a href="${link}" target="_blank">${title}</a></td><td>&#8381;${del}</td><td>&#8381;${p}</td><td>&yen;${p2}</td><td>-${discount}%</td></tr>`);
            });
        };
        getRatio('RUB', 'CNY', f);
    });
} //yuplay news

match = /ru\/product\/(\d+)/.exec(document.URL);
if (match) {
    var id = match[1];
    $($('.navi').children() [0]).append('<li><a id="btn">INFO</a></li>');
    $($('.navi').children() [0]).append('<li><a id="ru">RU</a></li>');
    $('.good-title').append('<div>实时汇率：<span id="r">0</span></div>');
    $('#btn').click(function () {
        var f = function () {
            $('.ru').remove();
            $('.price').each(function () {
                var pr = (/(\d+)\s*руб/.exec($(this).text())) [1];
                var q = (pr * r).toFixed(2);
                $(this).append(`<span class="ru" style="color:red; font-weight: bold;">&yen;${q}</span>`);
            });
            var p = $(":contains('SUB_ID') > span");
            if (p.length > 0) {
                p.after('<div id="db"></div>');
                getLow(id);
            }
        };
        getRatio('RUB', 'CNY', f);
    });
} //yuplay product

$('#ru').click(function(){
    var csrf = $( "input[name^='csrfmiddlewaretoken']" ).val();
    $.ajax({
        url: document.URL,
        type: "POST",
        data: {
            csrfmiddlewaretoken: csrf,
            action: "cart_add"
        },
        headers: {
            "X-Forwarded-For":"84.52.99.227",
            "CLIENT-IP":"84.52.99.227"
        },
        success: function( data, status, xhr ){
            if (/form-cart/.exec(data))
                alert('Done');
            else
                alert('Failed');
        },
        fail: function( data, status, xhr ){
        }
    });
});

match = /orders/.exec(document.URL);
if (match) {
    $('div.orders_id').after('<table id="t"></table>');
    $('div.orders_id').after('<div id="c"></div>');
    $('div.orders_id').after('<div id="b"></div>');
    $('div.orders_id').after('<a id="key">KEY</a>&#09;<a id="grid">GRID</a>');
    var total = $.trim($('td.total').text()).replace('pуб', 'RUB');
    var date = $('.number small').text();
    var d = new Date(`${date} GMT+0300`).toLocaleString();
    var j = $('.number b').text();
    $('#b').append(`<p>${total}<br>${date}<br>${d}<br>${j}</p>`);
    $('.product-info').each(function(i, v){
        var t = $.trim($(v).find('.name').text());
        var k = $(v).next('.keys').find('input').val();
        $('#t').append(`<tr><td>${i}</td><td>${t}</td><td>${k}</td><td>#${j}</td><td>${total}</td></tr>`);
        $('#c').append(`<p>${t}<br>${k}</p>`);
    });

    $('div.orders_id').children('.gameHead').each(function(i, v){
        var t = $.trim($(v).text().replace(/–\s1\sшт./, ''));
        var k = $(v).next('.messageContent').find('input').val();
        $('#t').append(`<tr><td>${i}</td><td>${t}</td><td>${k}</td><td>#${id}</td><td>${total}</td></tr>`);
        $('#c').append(`<p>${t}<br>${k}</p>`);
    });
}

$('#key').click(function () {
    var txt = '';
    $('#c p').each(function(){
        txt += $(this).html().replace('<br>', '\n') + '\n';
    });
    GM_setClipboard(txt);
});

$('#grid').click(function () {
    var txt = '';
    $('#t tr').each(function(){
        $(this).children('td').each(function(){
            txt += $(this).text() + '\t';
        });
        txt += '\n';
    });
    GM_setClipboard(txt);
});

var getLow = function (p) {
    $('#db').empty();
    var url = `http://${host}/yuplay.php?p=${p}`;
    $('#db').append(`<p><a target="_blank" href="http://${host}/yuplay.php?p=${p}">API</a></p>`);
    GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: function (response) {
            if (response.responseText){
                var j = JSON.parse(response.responseText);
                $("#db").append(`<p>Low: ${j.low}</p>`);
                if (j.drm == "Steam") {
                    $('#db').append(`<p><a target="_blank" href="http://steamdb.info/sub/${j.db.sub}/">${j.db.region}</a></p>`);
                    if (j.extra.price.cn.l > 0)
                        $("#db").append(`<p>CNY: ${j.extra.price.cn.l} / ${j.extra.price.cn.p}</p>`);
                    if (j.extra.price.us.l > 0)
                        $("#db").append(`<p>USD: ${j.extra.price.us.l} / ${j.extra.price.us.p}</p>`);
                    if (j.extra.info.deal)
                        $("#db").append(`<p><a target="_blank" href="https://isthereanydeal.com/game${j.extra.info.deal}/">${j.extra.info.bundle}</a></p>`);
                }
            }
        }
    });
};

var getRatio = function (a, b, f) {
    if (Date.now() - dt > 60 * 6 * 60000 || r === 0.0 || r === "undefined")
    {
        var url = `http://data.fixer.io/api/latest?access_key=93bba107d8e24746fe6220b043df2695&symbols=${a},${b}`;
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (response) {
                if (response.responseText){
                    var j = JSON.parse(response.responseText);
                    if (j["success"]){
                        r = (j.rates[b] / j.rates[a]).toFixed(4);
                        GM_setValue("r", r);
                        GM_setValue("dt", Date.now());
                    }
                }
                $('#r').empty();
                $('#r').append(r);
                f();
            }
        });
    } else {
        $('#r').empty();
        $('#r').append(r);
        f();
    }

}; //KRWCNY,RUBCNY