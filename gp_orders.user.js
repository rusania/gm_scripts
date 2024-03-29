// ==UserScript==
// @name        gp_orders
// @namespace   gp_orders
// @description gp_orders
// @include     https://*.gamesplanet.com/account/games
// @include     https://*.gamesplanet.com/account/games?page=*
// @updateURL   https://github.com/rusania/gm_scipts/raw/master/gp_orders.user.js
// @downloadURL https://github.com/rusania/gm_scipts/raw/master/gp_orders.user.js
// @version     2022.02.10.1
// @run-at      document-body
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @grant unsafeWindow
// @grant GM_xmlhttpRequest
// @grant GM_setClipboard
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_addStyle
// ==/UserScript==

window.addEventListener ("DOMContentLoaded", DOM_ContentReady);
window.addEventListener ("load", pageFullyLoaded);

function DOM_ContentReady () {
    $("body").on('click', '#k', function(){
        $(":checkbox").each(function(){
            if ($(this).prop("checked")){
                var v = $(this).val();
                game(v);
            }
        });
    });

    $("body").on('click', '#c', function(){
        var txt = '';
        $(":checkbox").each(function(){
            if ($(this).prop("checked")){
                $(this).parent().nextAll().each(function(){
                    txt += $.trim($(this).text()) + '\t';
                });
                txt += '\n';
            }
        });
        GM_setClipboard(txt);
    });
}

function pageFullyLoaded () {
    $('.nav-tabs').append('<li><a class="nav-link" id="k">Keys</a></li>');
    $('.nav-tabs').append('<li><a class="nav-link" id="c">Copy</a></li>');
    $('.table').before('<table id="b"></table>');
    var l = [];
    $('table tbody tr').each(function(){
        var d = $(this).children('td');
        var id = '';
        var m = /[0-9]+\-[0-9A-F]+\-[0-9]+/.exec($(d[0]).html());
        if (m)
            id = m[0];
        var n = $(d[0]).text();
        var s = $(d[2]).text();
        var dt = '';
        m = /(\d{2}).(\d{2}).(\d{4}) \(([A-F0-9]+)/.exec(s);
        if (m){
            dt = `'${m[3]}-${m[2]}-${m[1]}`;
            s = `#${m[4]}`;
        }
        var p = '';
        m=/£([0-9.]+)|([0-9])+,([0-9]+)€|\$([0-9.]+)/.exec($(d[3]).text());
        if (m){
            if (m[1])
                p = `${m[1]} GBP`;
            if (m[2])
                p = `${m[2]}.${m[3]} EUR`;
            if (m[4])
                p = `${m[4]} USD`;
        }
        l.push(`<tr><td><input type="checkbox" value="${id}"></td><td><a href="/account/games/${id}" target=_blank>${n}</td><td id=${id}></td><td>${s}</td><td></td><td>${p}</td><td></td><td></td><td></td><td></td><td>${dt}</td></tr>`);
    });
    l.reverse();
    $('#b').append(l.join());
}

function game(id){
    $.ajax( {
        type: 'GET',
        url: `/account/games/${id}`,
        success:function(result){
            var m = /(Steam|Activation)[^<>]*:\s*<span[^<>]*>([^<>]+)/.exec(result);
            if (m) {
                $('#'+id).empty();
                $('#'+id).append(m[2]);
            }
        },
        error:function(xhr,status,error){
            $('#'+id).append(status);
        }
    });
}