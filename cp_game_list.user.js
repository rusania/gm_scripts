// ==UserScript==
// @name        cp_game_list
// @namespace   http://tampermonkey.net/
// @description cp_game_list
// @include     https://chinaplay.store/personal/settings/*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/cp_game_list.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/cp_game_list.user.js
// @version     2021.05.15.1
// @run-at      document-end
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.cookie.js
// @grant       GM_addStyle
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse;font-family:simsun !important;}");
GM_addStyle("tr,td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");

$('.popup_header').append('<a class="catalog-active" href="javascript:void(0);" onclick="list();">List</a>');
$('.js-items-holder').before('<table id="a"></table>');

unsafeWindow.list = function(a){
    $('#a').empty();
    $('.gift-line').each(function(){
        var t = $(this).find('.gift-header:first').text();
        $(this).find('.key-list li div .key').each(function(i, v){
            var k = $(v).text();
            $('#a').append(`<tr><td>${(i+1)}</td><td>${t}</td><td>${k}</td></tr>`);
        });
    });
}