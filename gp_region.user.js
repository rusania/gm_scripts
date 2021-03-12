// ==UserScript==
// @name        gp_region
// @namespace   http://tampermonkey.net/
// @description gp_region
// @include     https://*.gamesplanet.com/game/*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/gp_region.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/gp_region.user.js
// @version     2020.11.23.1
// @run-at      document-end
// @connect     us.gamesplanet.com
// @connect     uk.gamesplanet.com
// @connect     de.gamesplanet.com
// @connect     fr.gamesplanet.com
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       unsafeWindow
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse;font-size:16px !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");
GM_addStyle(".d{font-size:16px;color:white !important;}");

var r = {"EUR":1,"CNY":7.809963,"USD":1.189987,"GBP":0.890842};
$('.row-page-ctn').before('<table id="a"></table>');
$('.row-page-ctn').before('<a href="javascript:void(0);" onclick="api();"><span style="color:green;font-weight:bold;">CMP</span></a>');

var m =/(us|uk|de|fr).gamesplanet/.exec(document.URL);
var d = {'us':'USD','uk':'GBP','de':'EUR','fr':'EUR'};
if (m){
    $.each(d, function(i, j){
        $('#a').append(`<tr id="${i}"><td><a href="javascript:void(0);" onclick="api('${i}');">${i}</a></td><td>${j}</td><td></td></tr>`);
    });
}

// <a href="javascript:void(0);" onclick="api();"><span style="color:green;font-weight:bold;">API</span></a>
unsafeWindow.api = function(i){
    var k = `#${i}`;
    var n = d[i];
    var c = r['CNY'];
    n = r[n];
    var u = document.URL.replace(/(us|uk|de|fr).gamesplanet/, `${i}.gamesplanet`);
    GM_xmlhttpRequest({
        method: "GET",
        url: u,
        onload: function(response) {
            var m = /data-piwik-ec-price="([^"]+)"/.exec(response.responseText);
            if (m) {
                var a = m[1];
                var b = (m[1] / n * c).toFixed(2);;
                $(k).append(`<td>${a}</td><td>${b}</td>`);
            }
        },
        onerror:  function(response) {
            $(k).append('<td></td><td>err</td>');
        },
        ontimeout:  function(response) {
            $(k).append('<td></td><td>time</td>');
        },
    });
}


// https://uk.gamesplanet.com/game/contra-rogue-corps-steam-key--4142-1
function getKey(i, j){
    var k = `#${i}`;
    var n = d[i];
    n = r[n];
    GM_xmlhttpRequest({
        method: "GET",
        url: j,
        onload: function(response) {
            var m = /data-piwik-ec-price="([^"]+)"/.exec(response.responseText);
            if (m) {
                var a = m[1];
                var b = m[1] * n;
                $(k).append(`<td>${a}</td><td>${b}</td>`);
            }
        },
        onerror:  function(response) {
            $(k).append('err');
        },
        ontimeout:  function(response) {
            $(k).append('time');
        },
    });
}
/*
var ratio = function(){
    var a = {"EUR":1,"CNY":7.809963,"USD":1.189987,"GBP":0.890842};
    $.ajax({
        url: 'http://data.fixer.io/api/latest?access_key=93bba107d8e24746fe6220b043df2695&symbols=CNY,USD,GBP',
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
*/