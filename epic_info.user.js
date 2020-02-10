// ==UserScript==
// @name        epic_info
// @namespace   http://tampermonkey.net/
// @description epic info
// @include     https://accounts.epicgames.com/login*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/epic_info.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/epic_info.user.js
// @connect     steamdb.info
// @version     2020.01.22.1
// @run-at      document-end
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @require     https://raw.githubusercontent.com/rusania/gm_scripts/master/loadChallenge.js
// @require     https://raw.githubusercontent.com/rusania/gm_scripts/master/funcaptcha_api.js
// @grant       unsafeWindow
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_setClipboard
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse;font-size:16px !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");
GM_addStyle(".d{font-size:16px;color:white !important;}");

setTimeout(function () {
    $('body').append('<a href="javascript:void(0);" onclick="login();">LOGIN</a>');
},3000);

unsafeWindow.login = function(){
    var t = '';
    var m = /TOKEN=([a-f0-9]+)/.exec(document.cookie);
    if (m)
        t = m[1];
    $.ajax({
        url: '/login/doLogin',
        type: "POST",
        dataType : 'json',
        headers: {
            "X-XSRF-TOKEN": t,
        },
        data: {
            fromForm: 'yes',
            authType: '',
            linkExtAuth: '',
            client_id: '875a3b57d3a640a6b7f9b4e883463ab4',
            redirectUrl: '',
            epic_username: 'rusania@gmail.com',
            password: '11111122a',
            rememberMe: 'YES'
        },
        success: function( data, status, xhr ){
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
