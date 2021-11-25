// ==UserScript==
// @name        steam_package
// @namespace    http://tampermonkey.net/
// @include     https://help.steampowered.com/en/wizard/HelpWithGameIssue/*appid=*
// @include     https://help.steampowered.com/en/wizard/HelpWithGame/*appid=*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/steam_package.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/steam_package.user.js
// @version     2021.09.27.1
// @run-at      doument-end
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @connect     store.steampowered.com
// @grant       unsafeWindow
// @grant       GM_xmlhttpRequest
// ==/UserScript==

var m = /appid=(\d+)/.exec(document.URL);
var app = m[1];

$('.help_purchase_detail_box:last').after('<div id="a"></div>');
$('.help_purchase_detail_box:last').after('<div id="b"></div>');
$('.help_purchase_detail_box:last').after('<div id="c"></div><br>');
$('.help_purchase_detail_box:last').after('<div><a href="javascript:void(0);" onclick="addman();">ADDMAN</a></div>');
$('.help_purchase_detail_box:last').after('<div><a href="javascript:void(0);" onclick="rmman();">REMOVE</a></div>');
$('.help_purchase_detail_box:last').after('<div><a href="javascript:void(0);" onclick="reman();">RESTORE</a></div>');;

var r = $("a[href*='chosenpackage']");
if (r.length > 0) {
    r.each(function(){
        m = /chosenpackage=(\d+)/.exec($(this).attr('href'));
        if (m){
            var sub = m[1];
            $('#a').append(`<p><a href="javascript:void(0);" onclick="remove(${sub}, &#39;&#35;a${sub}&#39;);">RMV:[${sub}]&nbsp;${$(this).text()}</a></p>`);
            $('#a').append(`<p><span id="a${sub}"></span></p>`);
            $('#b').append(`<p><a href="javascript:void(0);" onclick="restore(${sub}, &#39;&#35;b${sub}&#39;);">ADD:[${sub}]&nbsp;${$(this).text()}</a></p>`);
            $('#b').append(`<p><span id="b${sub}"></span></p>`);
        }
    });
} else {
    $('#submit_remove_package_form #packageid').each(function(){
        var sub = $(this).val();
        $('#a').append(`<p><a href="javascript:void(0);" onclick="remove(${sub}, &#39;&#35;a${sub}&#39;);">RMV:[${sub}]</a></p>`);
        $('#a').append(`<p><span id="a${sub}"></span></p>`);
        $('#b').append(`<p><a href="javascript:void(0);" onclick="restore(${sub}, &#39;&#35;b${sub}&#39;);">ADD:[${sub}]</a></p>`);
        $('#b').append(`<p><span id="b${sub}"></span></p>`);
    });
}


unsafeWindow.remove = function(a, b){
    $(b).empty();
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
            if (data.success){
                $(b).append(data.hash);
            } else {
                $(b).append(data.errorMsg);
            }
        },
        fail: function( data, status, xhr ){
            $(b).append(status);
        }
    });
}

unsafeWindow.restore = function(a, b){
    $(b).empty();
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
            if (data.success){
                $(b).append(data.hash);
            } else {
                $(b).append(data.errorMsg);
            }
        },
        fail: function( data, status, xhr ){
            $(b).append(status);
        }
    });
}

unsafeWindow.addman = function() {
    $('#c').empty();
    var sub = prompt( 'Enter Free subID to add to account:' );
    if ( sub !== null ) {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://store.steampowered.com/account/?l=english",
            onload: function(response) {
                var m = /g_sessionID = "([0-9a-f]+)";/.exec(response.responseText);
                if (m){
                    GM_xmlhttpRequest({
                        method: "POST",
                        url: "https://store.steampowered.com/checkout/addfreelicense",
                        headers: {
                            "X-Requested-With": "XMLHttpRequest",
                            "Origin": "https://store.steampowered.com",
                            "Sec-Fetch-Site": "same-origin",
                            "Accept": "text/plain, */*",
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                        },
                        data: `action=add_to_cart&sessionid=${m[1]}&subid=${sub}`,
                        onload: function(response) {
                            var r = $(response.responseText).find('.add_free_content_success_area p:first,.error');
                            if (r.length > 0)
                                $('#c').append($(r).text());
                        },
                        onerror:  function(response) {
                            $('#c').append(response.statusText);
                        },
                        ontimeout:  function(response) {
                            $('#c').append(response.statusText);
                        },
                    });
                }
                else {
                    $('#c').append("no match id");
                }
            },
            onerror:  function(response) {
                $('#c').append(response.statusText);
            },
            ontimeout:  function(response) {
                $('#c').append(response.statusText);
            },
        });
    }
}

unsafeWindow.rmman = function() {
    var sub = prompt( 'Enter subID that you want to remove:' );
    if ( sub !== null ) {
        remove(sub, '#c');
    }
}

unsafeWindow.reman = function() {
    var sub = prompt( 'Enter subID that you want to restore:' );
    if ( sub !== null ) {
        restore(sub, '#c');
    }
}