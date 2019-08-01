// ==UserScript==
// @name         stdb_free
// @namespace    http://tampermonkey.net/
// @description  try to take over the world!
// @author       jacky
// @match        http*://steamdb.info/freepackages*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/stdb_free.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/stdb_free.user.js
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @version     2019.08.01.1
// @connect     store.steampowered.com
// @grant       unsafeWindow
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-end
// ==/UserScript==

var demo = [];
var free = [];

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-size:16px !important;}");
$('#freepackages').before('<div id="b"></div>');
$('#freepackages').before('<div id="c"></div>');
$('#freepackages').before('<table id="d"></table>');
$('h1').after('<input id="a1" type="button" value="Add" />');
$('h1').after('<input id="f1" type="button" value="Filter" />');

function addfreelicense(id, g) {
    GM_xmlhttpRequest({
        method: "POST",
        url: "https://store.steampowered.com/checkout/addfreelicense",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "Origin": "https://store.steampowered.com",
            "Sec-Fetch-Site": "same-origin",
            "Accept": "text/plain, */*",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        data: `action=add_to_cart&sessionid=${g}&subid=${id}`,
        onload: function(response) {
            var r = $(response.responseText).find('.add_free_content_success_area p:first,.error');
            if (r.length > 0)
                $('#'+id).append($(r).text());
        },
        onerror:  function(response) {
            $('#'+id).append(response.statusText);
        },
        ontimeout:  function(response) {
            $('#'+id).append(response.statusText);
        },
    });
}

$("body").on('click', '#a1', function(){
    $('#d').empty();
    var n = Date.now();
    var d = GM_getValue("last_upd", 0) + 61 * 60 * 1000;
    var q = GM_getValue("last_add", 0);
    if (n < d){
        if (q > 49){
            alert(new Date(d));
            return;
        }
    } else {
        q = 0;
        GM_setValue("last_add", 0);
    }

    GM_xmlhttpRequest({
        method: "GET",
        url: "https://store.steampowered.com/account/licenses/",
        onload: function(response) {
            var m = /g_sessionID = "([a-z0-9]+)";/.exec(response.responseText);
            if (m){
                var g = m[1];
                $.each(free, function(k, v){
                    var id = v;
                    GM_setValue("last_add", q++);
                    if (k > 49 || q > 50)
                        return false;
                    $('#d').append(`<tr><td>${k}</td><td>${v}</td><td id="${v}"></td></tr>`);
                    addfreelicense(id, g);
                });
                $.each(demo, function(k, v){
                    var id = v;
                    GM_setValue("last_add", q++);
                    if (k > 49 || q > 50)
                        return false;
                    $('#d').append(`<tr><td>${k}</td><td>${v}</td><td id="${v}"></td></tr>`);
                    addfreelicense(id, g);
                });
            }
        },
        onerror:  function(response) {
            alert(response.statusText);
        },
        ontimeout:  function(response) {
            alert(response.statusText);
        },
    });
});

$("body").on('click', '#f1', function(){
    $('#b').empty();
    $('#c').empty();
    $('#d').empty();
    $('#f').remove();
    demo = [];
    free = [];
    var ip = [];
    $('.package').each(function(){
        var sub = $(this).attr('data-subid');
        var app = $(this).attr('data-appid');
        var parent = $(this).attr('data-parent');
        ip.push(`${sub},${app},${parent}`);
        if (/Trailer|Demo|Trial/ig.exec($(this).html())){
            $('#c').append(sub+',');
            demo.push(sub);
        } else {
            //$('#d').append(`<tr><td>${sub}</td><td>${app}</td><td>${parent}</td><td>${$(this).text()}</td></tr>`);
            $('#b').append(sub+',');
            free.push(sub)
        }
    });
    $('h1').after('<form id="f" action="http://198.181.32.5/dbfree.php" method="post" target="_blank"></form>');
    $('#f').append(`<input type="hidden" name="ip" value="${ip.join(';')}" />`);
    $('#f').append('<input type="submit" value="Submit" />');
});