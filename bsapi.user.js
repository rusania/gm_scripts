// ==UserScript==
// @name        bsapi
// @namespace   bsapi
// @description bs api
// @include     https://www.fanatical.com/en/orders/*
// @icon        https://www.fanatical.com/favicon.ico
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @updateURL https://github.com/rusania/gm_scipts/raw/master/bsapi.user.js
// @downloadURL https://github.com/rusania/gm_scipts/raw/master/bsapi.user.js
// @version     2019.05.31.1
// @grant       GM_addStyle
// @grant       GM_setClipboard
// ==/UserScript==

$('#root').before('<li><a id ="fetch" href="#"><span style="color:green;font-weight:bold;">FETCH</span></a></li>');
$('#root').before('<li><a id ="redeem" href="#"><span style="color:yellow;font-weight:bold;">REDEEM</span></a></li>');
$('#root').before('<li><a id ="copy" href="#"><span style="color:blue;font-weight:bold;">COPY</span></a></li>');

$('#fetch').click(function () {
    $('.btn.btn-secondary.btn-block').click();
});

$('#copy').click(function () {
    var txt = '';
    $('#list tr').each(function(){
        $(this).children('td').each(function(){
            txt += $(this).text() + '\t';
        });
        txt += '\n';
    });
    GM_setClipboard(txt);
});

$('#redeem').click(function () {
    if ($('#list').length > 0) {
        $('#list').remove();
    }
    $('h3.mt-4').after('<table id="list"></table>');
    var c = $('.p-md-3');
    var od = '';
    var dt = '';
    var pr = '';
    if (c.length > 0){
        od = $(c[1]).text();
        dt = $(c[3]).text();
        pr = $(c[7]).text();
    }

    var hr = $('h3.mt-4').nextAll('div').each(function(){
        var text = $(this).children('h5').text();
        $('#list').append(`<tr><td>-</td><td>${text}</td><td>${od}</td><td>'${dt}</td><td>'${pr}</td></tr>`);
        $(this).find('.order-item').each(function (i, v) {
            var title = $(v).find('.game-name').text();
            var k = $(v).find('input');
            var key = '';
            if (k)
                key = k.val();
            //var f = `<tr><td>${i+1}</td><td>${title}</td><td>${key}</td><td>【${title.replace(',', ' ')}】 ${key}</td></tr>`;
            var f = `<tr><td>${i+1}</td><td>${title}</td><td>${key}</td><td></td></tr>`;
            $('#list').append(f);
        });
    });
});
