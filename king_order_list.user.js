// ==UserScript==
// @name        king_order_list
// @namespace   http://tampermonkey.net/
// @description king_order_list
// @include     https://www.kinguin.net/customer/operation/index/dir/desc/order/payout_availability/*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/king_order_list.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/king_order_list.user.js
// @version     2019.08.01.1
// @run-at      document-end
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @grant       GM_addStyle
// ==/UserScript==

$('#my-operations-table').before(`<form id="f" action="http://198.181.32.5/kod.php" method="post" target="_blank"></form>`);
$('#my-operations-table').before('<table id="a"></table><table id="b"></table>');
var i = 1;

$('#my-operations-table tbody tr').each(function(){
    var t= $(this).children('td');
    var oid = $.trim($(t[1]).text());
    var p = $(t[2]).find('.price');
    var p1 = $(p[0]).attr('data-no-tax-price');
    var p2 = '';
    if (p.length > 1)
        p2 = $(p[1]).attr('data-no-tax-price');
    var op = $.trim($(t[4]).text());
    var dt = $.trim($(t[5]).text());
    var info = $.trim($(t[7]).text());
    var iv = '';
    var a = $(t[7]).find('a')[0];
    var id = 0;
    var m = /order_id\/(\d+)/.exec($(t[7]).html());
    if (m)
        id = m[1];
    m = /Invoice\s*#(S[0-9A-Z]+)\s*for\s*#(S[0-9A-Z]+)\s*for\s*(.*)/.exec(info);
    if (m)
        $('#f').append(`<input type="hidden" name="${id}" value="${m[3]}|${p1}|${p2}|${m[1]}|${m[2]}|${dt}" />`);
});
$('#f').append('<input type="submit" value="Submit" />');