// ==UserScript==
// @name        ovk
// @namespace   ovk
// @description ovk software
// @include     https://www.overkillsoftware.com/housewarmingkeys/*
// @include     https://www.overkillsoftware.com/kentokeys/*
// @include     https://www.overkillsoftware.com/fedorakeys/*
// @include     https://www.overkillsoftware.com/lockekeys/*
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @updateURL https://github.com/rusania/gm_scipts/raw/master/ovk.user.js
// @downloadURL https://github.com/rusania/gm_scipts/raw/master/ovk.user.js
// @version     2019.07.02.1
// @grant       unsafeWindow
// @connect     steamcommunity.com
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_setClipboard
// @run-at      document-end
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-family:simsun !important;}");

var f = $('form');
if (f.length > 0){
    f.before('<a href="javascript:void(0);" onclick="login();">LOGIN</a></div>');
} else {
    $('.logout').before('<table id="a"></table>');
    $('.logout').before('<div><a href="javascript:void(0);" onclick="ck();">CLICK</a></div>');
    $('.logout').before('<div><a href="javascript:void(0);" onclick="cp();">COPY</a></div>');
    $('#a').append('<tr><td><a href="javascript:void(0);" onclick="getkey(\'end1\');">PAYDAYCON 2015 Mask Pack</a></td><td id="end1"></td></tr>');
    $('#a').append('<tr><td><a href="javascript:void(0);" onclick="getkey(\'end2\');">PAYDAYCON 2016 Mask Pack</a></td><td id="end2"></td></tr>');
    $('#a').append('<tr><td><a href="javascript:void(0);" onclick="getkey(\'end3\');">Alienware Alpha Mask Pack</a></td><td id="end3"></td></tr>');
    $('#a').append('<tr><td><a href="javascript:void(0);" onclick="getkey(\'end4\');">Sydney Mega Mask Pack</a></td><td id="end4"></td></tr>');
    $('#a').append('<tr><td><a href="javascript:void(0);" onclick="getkey2(\'fedorakeys\');">Fedora Hat DLC</a></td><td id="fedorakeys"></td></tr>');
    $('#a').append('<tr><td><a href="javascript:void(0);" onclick="getkey2(\'kentokeys\');">Pen Melee Weapon DLC</a></td><td id="kentokeys"></td></tr>');
    $('#a').append('<tr><td><a href="javascript:void(0);" onclick="getkey2(\'lockekeys\');">Locke and Load Mask! DLC</a></td><td id="lockekeys"></td></tr>');
    $('#a').append('<tr><td><a href="javascript:void(0);" onclick="getkey2(\'housewarmingkeys\');">Party Hat DLC</a></td><td id="housewarmingkeys"></td></tr>');
}

unsafeWindow.getkey = function(id){
    var d = id;
    $('#'+d).empty();
    $.ajax({
        url: '/pdtextadventure/index.php',
        type: "POST",
        async: true,
        data: {
            'endingval': d
        },
        success: function( data, status, xhr ){
            $.ajax({
                url: '/pdtextadventure/index.php?claimkey=true',
                type: "GET",
                async: true,
                success: function( data, status, xhr ){
                    var m = /key=([A-Z0-9\-]+)/.exec(data);
                    if (m)
                        $('#'+d).append(m[1]);
                    else
                        $('#'+d).append('nomatch');
                },
                fail: function( data, status, xhr ){
                    $('#'+d).append(status);
                }
            });
        },
        fail: function( data, status, xhr ){
            $('#'+d).append(status);
        }
    });
}

unsafeWindow.login = function(){
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://www.overkillsoftware.com/fedorakeys/?login",
        onload: function(response) {
            var m = /OpenID_loggedInName/.exec(response.responseText);
            if (m){
                var params = '';
                m = /name="openidparams" value="([^"]+)/.exec(response.responseText);
                if (m)
                    params = m[1];
                var nonce = '';
                m = /name="nonce" value="([^"]+)/.exec(response.responseText);
                if (m)
                    nonce = m[1];
                if (params && nonce){
                    var d = new FormData();
                    d.append("action", "steam_openid_login");
                    d.append("openid.mode", "checkid_setup");
                    d.append("openidparams", params);
                    d.append("nonce", nonce);
                    GM_xmlhttpRequest({
                        method: "POST",
                        data: d,
                        url: "https://steamcommunity.com/openid/login",
                        onload: function(response) {
                            m = /logout.php/.exec(response.responseText);
                            if (m)
                                window.location.href = response.finalUrl;
                            else
                                alert("Auth Error");
                        },
                        onerror:  function(response) {
                            alert(response.statusText);
                        },
                        ontimeout:  function(response) {
                            alert(response.statusText);
                        },
                    });
                } else {
                    alert("Error OpenID Params");
                }
            } else {
                window.open("https://steamcommunity.com/openid/login", "_blank","", "");
            }
        },
        onerror:  function(response) {
            alert(response.statusText);
        },
        ontimeout:  function(response) {
            alert(response.statusText);
        },
    });
}



unsafeWindow.getkey2 = function(id){
    var d = id;
    $('#'+d).empty();
    $.ajax({
        url: `/${d}/index.php`,
        type: "GET",
        async: true,
        success: function( data, status, xhr ){
            var m = /steamcode">([^<>]+)</.exec(data);
            if (m)
                $('#'+d).append(m[1]);
            else
                $('#'+d).append('nomatch');
        },
        fail: function( data, status, xhr ){
            $('#'+d).append(status);
        }
    });
}

unsafeWindow.ck = function(){
    $('#a').find("a").each(function(i, j){
        setTimeout(function(){ $(j).click(); }, 3000 * i);
    });
}

unsafeWindow.cp = function(){
    var txt = '';
    $('#a tr').each(function(){
        $(this).children('td').each(function(){
            txt += $.trim($(this).text()) + '\t';
        });
        txt += '\n';
    });
    GM_setClipboard(txt);
}