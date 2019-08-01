// ==UserScript==
// @name        gg_game_info
// @namespace   jacky
// @description gamersgate steam game info
// @include     https://*.gamersgate.com/internal-apis/site/product_list*
// @icon        http://steamcommunity.com/favicon.ico
// @version     2019.08.01.1
// @run-at      document-end
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @grant       GM_log
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-family:simsun !important;}");
GM_addStyle("div{font-family:simsun !important;}");

var cc = 'cn';
if (/₽/.exec(document.body.innerText))
    cc= 'ru';
$('.stdlist').before('<div id="g"></div>');
var i = 1;
$('#g').append('<form id="f" action="http://198.181.32.5/gg.php?q=list" method="post" target="_blank"></form>');
$('#g').append('<form id="v" action="http://198.181.32.5/gg.php?q=sale&cc=' + cc + '" method="post" target="_blank"></form>');
$('li').each(function(){
    var dv = $(this).find('div');
    var sale = -1;
    var m = /[0-9.,]+/.exec($(dv[1]).text().replace(/\s/, ''));
    if (m)
        sale = m[0];
    var price = -1;
    m = /[0-9.,]+/.exec($(dv[2]).text().replace(/\s/, ''));
    if (m)
        price = m[0];
    var ds = $(dv[3]).text();
    var a = $(this).find('a');
    var id = '';
    m = /\/(D[^\/]+)/.exec($(a[1]).attr('href'));
    if (m)
        id = m[1];
    var ti = $(a[1]).attr('title');
    $('#g').append('<tr><td>' + i++ + '</td><td>' + id + '</td><td>' + ti + '</td><td>' + price + '</td><td>' + sale + '</td><td>' + ds + '</td></tr>');
    $('#f').append('<input type="hidden" name="' + id + '" value="' + ti + '" />');
    $('#v').append('<input type="hidden" name="' + id + '" value="' + price + ',' + sale + '" />');
});
$('#f').append('<input type="submit" value="NAME" />');
$('#v').append('<input type="submit" value="SALE" />');