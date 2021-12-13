// ==UserScript==
// @name         steam_market_get_price
// @namespace    http://tampermonkey.net/
// @version      2021.12.13.1
// @description  steam market get price
// @author       jacky
// @match        https://steamcommunity.com/profiles/*/inventory/*
// @require      http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @updateURL 	 https://github.com/rusania/gm_scripts/raw/master/steam_market_get_price.user.js
// @downloadURL  https://github.com/rusania/gm_scripts/raw/master/steam_market_get_price.user.js
// @run-at       document-end
// @grant        unsafeWindow
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("tr,td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");
$('#tabcontent_inventory').after('<table id="a"></table>');

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
                // https://steamcommunity.com/inventory/76561198104311295/753/1?l=schinese&count=2000&start_assetid=49898240070468328
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
        console.log(`${b} / ${s}`);
        $('.item_market_actions').append(`<div style="min-height: 3em; margin-left: 1em;">求购价：${b}；出售价：${s}</div>`);
    }
}

function parse2(response){
    var data = JSON.parse(response);
    if (data && data.success==1){
        $('#a').empty();
        var a = [];
        $.each(data.descriptions, function(k, v){
            a[`.${v.classid}`] = v;
        });
        $.each(data.assets, function(k, v){
            var b = a[`.${v.classid}`];
            var text = '';
            if (b.owner_actions){
               text = JSON.stringify(b.owner_actions);
            }
            $('#a').append(`<tr><td>${k}</td><td>${v.assetid}</td><td>${v.classid}</td><td>${v.instanceid}</td><td>${v.amount}</td><td>${b.market_fee_app}</td><td>${b.type}</td><td>${b.market_hash_name}</td><td>${b.marketable}</td><td>${b.tradable}</td><td>${text}</td></tr>`);
        });
    }
}