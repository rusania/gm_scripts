// ==UserScript==
// @name        bsapi
// @namespace   bsapi
// @description bs api
// @include     https://www.fanatical.com/en/orders/*
// @icon        https://www.fanatical.com/favicon.ico
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @updateURL   https://github.com/rusania/gm_scipts/raw/master/bsapi.user.js
// @downloadURL https://github.com/rusania/gm_scipts/raw/master/bsapi.user.js
// @version     2021.07.04.1
// @connect     store.steampowered.com
// @grant       unsafeWindow
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @grant       GM_addStyle
// @run-at      document-start
// ==/UserScript==

window.addEventListener ("DOMContentLoaded", DOM_ContentReady);
window.addEventListener ("load", pageFullyLoaded);

function DOM_ContentReady () {
    // This is the equivalent of @run-at document-end
    $("body").on('click', '#fetch', function(){
        $('hr.mb-4').nextAll('div').each(function(){
            $(this).find('.btn.btn-primary.btn-block').click();
        });
    });

    $("body").on('click', '#copy', function(){
        var txt = '';
        $('#list tr').each(function(){
            $(this).children('td').each(function(){
                txt += $(this).text() + '\t';
            });
            txt += '\n';
        });
        GM_setClipboard(txt);
    });

    $("body").on('click', '#redeem', function(){
        $('#list').empty();
        var od = $('.order-number .column-cell').text();
        var dt = $('.order-date .column-cell').text();
        var pr = $('.order-type .column-cell').text();
        var hr = $('hr.mb-4').nextAll('div').each(function(){
            var text = $(this).children('h5.my-4').text();
            $('#list').append(`<tr><td>-</td><td>${text}</td><td>${od}</td><td>'${dt}</td><td>'${pr}</td></tr>`);
            $(this).find('.new-order-item').each(function (i, v) {
                var title = $(v).find('.game-name').text();
                var k = $(v).find('input');
                var key = '';
                if (k.length > 0)
                    key = k.val();
                //var f = `<tr><td>${i+1}</td><td>${title}</td><td>${key}</td><td>【${title.replace(',', ' ')}】 ${key}</td></tr>`;
                var f = `<tr><td>${i+1}</td><td>${title}</td><td>${key}</td><td></td><td></td></tr>`;
                $('#list').append(f);
            });
        });
    });
}

function pageFullyLoaded () {
    GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
    GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-size:16px !important;}");
    $('h3.mt-2').after('<div id="d"></div>');
    $('hr.mb-4').after('<table id="list"></table>');
    $('#d').before('<input type="button" id="fetch" value="Fetch" />&emsp;');
    $('#d').before('<input type="button" id="redeem" value="Grid" />&emsp;');
    $('#d').before('<input type="button" id="copy" value="Copy" />');
}
