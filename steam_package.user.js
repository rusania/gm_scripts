// ==UserScript==
// @name        steam_package
// @namespace    http://tampermonkey.net/
// @include     https://help.steampowered.com/en/wizard/HelpWithGameIssue/*appid=*
// @include     https://help.steampowered.com/en/wizard/HelpWithGame/*appid=*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/steam_package.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/steam_package.user.js
// @version     2020.04.28.1
// @run-at      doument-end
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @grant unsafeWindow
// ==/UserScript==

var m = /appid=(\d+)/.exec(document.URL);
var app = m[1];

setTimeout(function () {
    $('.help_purchase_detail_box').after('<div><a href="javascript:void(0);" onclick="addman();">ADD</a></div>');
    $('.help_purchase_detail_box').after('<div><a href="javascript:void(0);" onclick="rmman();">REMOVE</a></div>');
    $('.help_purchase_detail_box').after('<div><a href="javascript:void(0);" onclick="restoreman();">RESTORE</a></div>');
    var hp = $('#wizard_perf_data');
    if (hp.length > 0){
        $('.help_section_medium_header').after('<div id="a"></div>');
        $('.help_section_medium_header').after('<div id="b"></div>');
        $('.help_wizard_button').each(function(){
            var m = /chosenpackage=(\d+)/.exec($(this).attr('href'));
            if (m){
                var sub = m[1];
                $('#a').append(`<div><a id="a${sub}" href="javascript:void(0);" onclick="remove(${sub});">RMV:[${sub}]&nbsp;${$(this).text()}</a></div>`);
                $('#b').append(`<div><a id="b${sub}" href="javascript:void(0);" onclick="restore(${sub});">ADD:[${sub}]&nbsp;${$(this).text()}</a></div>`);
            }
        });
    }
}, 3000);

unsafeWindow.remove = function(a){
    $.ajax({
        url: '/en/wizard/AjaxDoPackageRemove',
        type: "POST",
        dataType : 'json',
        data: {
            packageid: a,
            appid: app,
            sessionid: g_sessionID,
            wizard_ajax: 1
        },
        success: function( data, status, xhr ){
            // {"success":false,"errorMsg":"There was an unexpected error removing this product from your account."}
            // {"success":true,"hash":"HelpPackageRemoved?appid=15700&packageid=88110"}
            if (data.success){
                $('#a'+a).after(data.hash);
            } else {
                $('#a'+a).after(data.errorMsg);
            }
        },
        fail: function( data, status, xhr ){
            alert(status);
        }
    });
}

unsafeWindow.restore = function(a){
    $.ajax({
        url: '/en/wizard/AjaxDoPackageRestore',
        type: "POST",
        dataType : 'json',
        data: {
            packageid: a,
            appid: app,
            sessionid: g_sessionID,
            wizard_ajax: 1
        },
        success: function( data, status, xhr ){
            // {"success":false,"errorMsg":"There was an unexpected error removing this product from your account."}
            // {"success":true,"hash":"HelpPackageRemoved?appid=15700&packageid=88110"}
            if (data.success){
                $('#b'+a).after(data.hash);
            } else {
                $('#b'+a).after(data.errorMsg);
            }
        },
        fail: function( data, status, xhr ){
            alert(status);
        }
    });
}

unsafeWindow.addman = function() {
    var sub = prompt( 'Enter Free subID to add to account:' );
    if ( sub !== null ) {
        $.ajax( {
            type: 'POST',
            dataType: 'text',
            url: '//store.steampowered.com/checkout/addfreelicense',
            data: {
                action: 'add_to_cart',
                sessionid: g_sessionID,
                subid: sub
            },
            success:function(result){
                var r = $(result).find('.add_free_content_success_area p:first,.error');
                if (r.length > 0)
                    alert($(r).text());
            },
            error:function(xhr,status,error){
                alert(status);
            }
        });
    };
};

unsafeWindow.rmman = function() {
    var sub = prompt( 'Enter subID that you want to remove:' );
    if ( sub !== null ) {
        $.ajax({
            url: '/en/wizard/AjaxDoPackageRemove',
            type: "POST",
            dataType : 'json',
            data: {
                packageid: sub,
                appid: app,
                sessionid: g_sessionID,
                wizard_ajax: 1
            },
            success: function( data, status, xhr ){
                // {"success":false,"errorMsg":"There was an unexpected error removing this product from your account."}
                // {"success":true,"hash":"HelpPackageRemoved?appid=15700&packageid=88110"}
                if (data.success){
                    alert(data.hash);
                } else {
                    alert(data.errorMsg);
                }
            },
            fail: function( data, status, xhr ){
                alert(status);
            }
        });
    };
};

unsafeWindow.restoreman = function() {
    var sub = prompt( 'Enter subID that you want to restore:' );
    if ( sub !== null ) {
        $.ajax({
            url: '/en/wizard/AjaxDoPackageRestore',
            type: "POST",
            dataType : 'json',
            data: {
                packageid: sub,
                appid: app,
                sessionid: g_sessionID,
                wizard_ajax: 1
            },
            success: function( data, status, xhr ){
                // {"success":false,"errorMsg":"There was an unexpected error removing this product from your account."}
                // {"success":true,"hash":"HelpPackageRemoved?appid=15700&packageid=88110"}
                if (data.success){
                    alert(data.hash);
                } else {
                    alert(data.errorMsg);
                }
            },
            fail: function( data, status, xhr ){
                alert(status);
            }
        });
    };
};