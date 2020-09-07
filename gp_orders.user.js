// ==UserScript==
// @name        gp_orders
// @namespace   gp_orders
// @description gp_orders
// @include     https://*.gamesplanet.com/account/games
// @include     https://*.gamesplanet.com/account/games?page=*
// @updateURL   https://github.com/rusania/gm_scipts/raw/master/gp_orders.user.js
// @downloadURL https://github.com/rusania/gm_scipts/raw/master/gp_orders.user.js
// @version     2020.09.07.1
// @run-at      document-end
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @connect     steamdb.info
// @grant unsafeWindow
// @grant GM_xmlhttpRequest
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_addStyle
// ==/UserScript==

$('.nav-tabs').append('<li><a class="nav-link" id="k">Keys</a></li>');
$('.table').before('<table id="b"></table>');
//game('13505555-5C66A4B1DDD24-24647');

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
    m=/£([0-9.]+)|([0-9])+,([0-9]+)€/.exec($(d[3]).text());
    if (m){
        if (m[1])
            p = `${m[1]} GBP`;
        if (m[2])
            p = `${m[2]}.${m[3]} EUR`;
    }
    l.push(`<tr><td><input type="checkbox" value="${id}"></td><td><a href="/account/games/${id}" target=_blank>${n}</td><td id=${id}></td><td>${s}</td><td></td><td>${p}</td><td></td><td></td><td></td><td></td><td>${dt}</td></tr>`);
});
l.reverse();
$('#b').append(l.join());

$('#k').click(function(){
    $(":checkbox").each(function(){
        if ($(this).prop("checked")){
            var v = $(this).val();
            game(v);
        }
    });
});

function game(id){
    $.ajax( {
        type: 'GET',
        url: `/account/games/${id}`,
        success:function(result){
            var m = /Steam[^<>:]*:\s*<span[^<>]*>([^<>]+)/.exec(result);
            if (m) {
                $('#'+id).empty();
                $('#'+id).append(m[1]);
            }
        },
        error:function(xhr,status,error){
            $('#'+id).append(status);
        }
    });
}