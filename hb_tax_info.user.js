// ==UserScript==
// @name        hb_tax_info
// @namespace   http://tampermonkey.net/
// @description hb tax info
// @include     http*://www.humblebundle.com/*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/hb_tax_info.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/hb_tax_info.user.js
// @grant       unsafeWindow
// @version     2021.11.01.1
// @run-at      document-end
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// ==/UserScript==

var m = /country_code: "([^"]+)/.exec(document.head.innerHTML);
if (m) {
    $('.tabs-navbar-item').append(`<div class="navbar-item button-title">${m[1]}</div>`);
    $('.tabs-navbar-item').append('<a class="navbar-item not-dropdown button-title" href="javascript:void(0);" onclick="tax();">TAX</a><span class="navbar-item not-dropdown button-title" id="tax"></span>');
}

unsafeWindow.tax = function(a){
    $('#tax').empty();
    $.ajax({
        url: '/api/v1/tax_rate',
        type: "GET",
        dataType : 'json',
        success: function( data, status, xhr ){
            if (data.tax_rate){
                $('#tax').after(data.tax_rate);
            } else {
                $('#tax').after("0");
            }
        },
        fail: function( data, status, xhr ){
            alert(status);
        }
    });
}