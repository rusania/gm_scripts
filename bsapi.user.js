// ==UserScript==
// @name        bsapi
// @namespace   bsapi
// @description bs api
// @include     https://www.fanatical.com/en/orders*
// @icon        https://www.fanatical.com/favicon.ico
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @updateURL   https://github.com/rusania/gm_scipts/raw/master/bsapi.user.js
// @downloadURL https://github.com/rusania/gm_scipts/raw/master/bsapi.user.js
// @version     2022.02.14.1
// @connect     store.steampowered.com
// @grant       unsafeWindow
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @grant       GM_addStyle
// @run-at      document-body
// ==/UserScript==

window.addEventListener ("DOMContentLoaded", DOM_ContentReady);
window.addEventListener ("load", pageFullyLoaded);

function DOM_ContentReady () {
    $("body").on('click', '#fetch', function(){
        $('.key-container .btn.btn-primary.btn-block').each(function(){
            $(this).click();
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
        var l = $('#list').length;
        if (l==0){
            $('.order-table-container:first').after('<table id="list"></table>');
            $('.order-table-container:first').after('<div id="d"></div>');
        }
        $('#list').empty();
        var od = $('.order-number .column-cell').text();
        var dt = $('.order-date .column-cell').text();
        var pr = $('.order-type .column-cell').text();
        var hr = $('.order-status .column-cell').text();
        var li = $('.title-download-button-container').nextAll('section');
        li.each(function(){
            var name = $(this).find('.bundle-name:first');
            if (name)
                name = name.text();
            var tier = $(this).find('.bundle-tier:first');
            if (tier){
                tier = tier.text();
                name = `${name} ${tier}`;
            }
            $('#list').append(`<tr><td>-</td><td>${name}</td><td>${od}</td><td>'${dt}</td><td>'${pr}</td></tr>`);
            $(this).find('.new-order-item').each(function (i, v) {
                var title = $(v).find('.game-name:first').text();
                var k = $(v).find('input');
                var key = '';
                if (k.length > 0)
                    key = k.val();
                var f = `<tr><td>${i+1}</td><td>${title}</td><td>${key}</td><td></td><td></td></tr>`;
                $('#list').append(f);
            });
        });

        li = $('.title-download-button-container').nextAll('.new-order-item');
        if (li.length >0){
            $('#list').append(`<tr><td>-</td><td>-</td><td>${od}</td><td>'${dt}</td><td>'${pr}</td></tr>`);
            li.each(function(i, v){
                var title = $(v).find('.game-name:first').text();
                var k = $(v).find('input');
                var key = '';
                if (k.length > 0)
                    key = k.val();
                var f = `<tr><td>${i+1}</td><td>${title}</td><td>${key}</td><td></td><td></td></tr>`;
                $('#list').append(f);
            });
        }

    });
}

function pageFullyLoaded () {
    GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
    GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-size:16px !important;}");
    $('.left-links-container').append('<a class="secondary-nav-link" id="fetch" title="Fetch">F</a>');
    $('.left-links-container').append('<a class="secondary-nav-link" id="redeem" title="Redeem">R</a>');
    $('.left-links-container').append('<a class="secondary-nav-link" id="copy" title="Copy">C</a>');
}
