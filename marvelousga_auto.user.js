// ==UserScript==
// @name        marvelousga_auto
// @namespace   http://tampermonkey.net/
// @version     2018.08.31.1
// @description marvelousga auto
// @author      jacky
// @match       https://marvelousga.com/giveaway/*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/marvelousga_auto.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/marvelousga_auto.user.js
// @run-at      document-end
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @connect     store.steampowered.com
// @connect     steamcommunity.com
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// @grant       GM_log
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");
var game = $('#giveawaySlug').val();
var csrf = '';
var m = /csrf-token" content="([0-9A-Za-z]+)"/.exec(document.head.innerHTML);
if (m)
    csrf = m[1];

$('.adsbygoogle').remove();
$('#get_key_container').show();
$('#get_key_container').after('<div id="a"><table id="b"></table></div>');
$('#get_key_container').after(`<div><a href="javascript:void(0);" onclick="getkey();">KEY</a>&#9;<span id="key"></span>&#9;<span id="msg"></span></div>`);


var a = [];
var b = [];
$('.container_task').each(function(i, v){
    var title = $.trim($(v).find('.card-text').html());
    var icon = 0;
    var d = $(v).find('h5');
    if (d)
        icon = $(d[0]).html();
    var id = 0;
    var vf = '';
    d = $(v).find('.btn-dark');
    var action = '<td></td><td></td>';
    if (d){
        var ar = $(d[0]).attr('id').split('_');
        id = ar[3];
        var f = $(d[0]).attr('data-disabled') != 1 ? true : false;
        if (f) {
            if (ar[2]=='visit')
                a.push(id);
            var act = `${ar[1]},${ar[2]},${id}`;
            b.push(act);
            action = `<td><a href="javascript:void(0);" onclick="verify(\'${act}\');">${ar[2]}</a></td><td id="m_${id}"></td>`;
        }
    }
    $('#b').append(`<tr><td>${id}</td><td>${icon}&nbsp;${title}</td>${action}</tr>`);
});

if (a.length > 0){
    $('#get_key_container').after('<div><a id="c">LINKS</a></div>');
    $('#c').click(function(){
        $.each(a, function(i,v){
            verify(`webpage,clickedLink,${v}`);
        });
    });
}

if (b.length > 0){
    $('#get_key_container').after('<div><a id="d">VERIFY</a></div>');
    $('#d').click(function(){
        $.each(b, function(i,v){
            verify(v);
        });
    });
}

unsafeWindow.getkey = function(){
    $('#msg').empty();
    $.ajax({
        url: '/ajax/keys/get/key',
        type: 'POST',
        data: { giveaway_slug: game },
        headers: {
            'X-CSRF-TOKEN': csrf,
        },
    }).done(function (data) {
        if (!data.status)
            $('#msg').append(data.message);
        else
            $('#key').append(`<a target=_blank href="https://store.steampowered.com/account/registerkey?key=${data.key}">${data.key}</a>`);
    }).fail(function (jqxhr) {
        $('#msg').append('error');
    });
}

unsafeWindow.verify = function(c){
    a = c.split(',');
    var da = {
        giveaway_slug: game,
        giveaway_task_id: a[2]
    };
    var id = `#m_${a[2]}`;
    var url = `/ajax/verifyTasks/${a[0]}/${a[1]}`;
    $(id).empty();
    $.ajax({
        url: url,
        type: 'POST',
        data: da,
        headers: {
            'X-CSRF-TOKEN': csrf,
        },
    }).done(function (data) {
        if (!data.status)
            $(id).append(`${a[1]}&nbsp;${data.message}`);
        else
            $(id).append(`${a[1]}&nbsp;done`);
    }).fail(function (jqxhr) {
        $(id).append(`${a[1]}&nbsp;error`);
    });
}

unsafeWindow.wish = function(id, sid){
    var data = `appid=${id}&sessionid=${sid}`;
    GM_xmlhttpRequest({
        method: "POST",
        url: "https://store.steampowered.com/api/addtowishlist",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: data,
        onload: function(response) {
            if (/true/.exec(response.responseText))
                $("#a"+id).wrapInner("<s></s>");
        },
        onerror:  function(response) {
            alert(response.statusText);
        },
        ontimeout:  function(response) {
            alert(response.statusText);
        },
    });
}

unsafeWindow.follow = function(id, sid){
    var data = `appid=${id}&sessionid=${sid}`;
    GM_xmlhttpRequest({
        method: "POST",
        url: "https://store.steampowered.com/explore/followgame/",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: data,
        onload: function(response) {
            if (/true/.exec(response.responseText))
                $("#a"+id).wrapInner("<s></s>");
        },
        onerror:  function(response) {
            alert(response.statusText);
        },
        ontimeout:  function(response) {
            alert(response.statusText);
        },
    });
}

unsafeWindow.clan = function(id, sid){
    var data = `clanid=${id}&sessionid=${sid}&follow=1`;
    GM_xmlhttpRequest({
        method: "POST",
        url: "https://store.steampowered.com/curators/ajaxfollow",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: data,
        onload: function(response) {
            if (/success":1/.exec(response.responseText))
                $('#'+id).append('curators done');
        },
        onerror:  function(response) {
            alert(response.statusText);
        },
        ontimeout:  function(response) {
            alert(response.statusText);
        },
    });
}

unsafeWindow.group = function(id, sid){
    var data = `action=join&sessionID=${sid}`;
    GM_xmlhttpRequest({
        method: "POST",
        url: "https://steamcommunity.com/groups/" + id,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: data,
        onload: function(response) {
            if (/'true'/.exec(response.responseText))
                $('#'+id).append('follow done');
        },
        onerror:  function(response) {
            alert(response.statusText);
        },
        ontimeout:  function(response) {
            alert(response.statusText);
        },
    });
}

unsafeWindow.youtube = function(html){
    var m = /channel\/([^"\/]+)/.exec(html);
    var channel = m[1];
    m = /csn":"([^"]+)/.exec(html);
    var csn = m[1];
    m = /XSRF_TOKEN":"([^"]+)/.exec(html);
    var token = m[1];

    var data = {
        sej: {
            clickTrackingParams : '',
            commandMetadata:{
                webCommandMetadata:{
                    url: "/service_ajax",
                    sendPost: true
                },
            },
            subscribeEndpoint:{
                channelIds: [channel],
                params: "EgIIAg%3D%3D"
            }
        },
        csn: csn,
        session_token: token
    };

    var da = `sej=${JSON.stringify(data.sej)}&csn=${csn}&session_token=${token}`;
    GM_xmlhttpRequest({
        method: "POST",
        url: "https://www.youtube.com/service_ajax?name=signalServiceEndpoint",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: da,
        onload: function(response) {
            if (/'code":"SUCCESS'/.exec(response.responseText))
                $('#'+id).append('youtube done');
            else
                $('#'+id).append(response.responseText);
        },
        onerror:  function(response) {
            alert(response.statusText);
        },
        ontimeout:  function(response) {
            alert(response.statusText);
        },
    });
}

unsafeWindow.unkown = function(id, i){
    $('#'+id).empty();
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://giveaway.su/action/redirect/" + id,
        onload: function(response) {
            var m = /g_sessionID = "([0-9a-f]+)"/.exec(response.responseText);
            var sid = m[1];
            var id = '';
            if (i < 4){
                m = /app\/(\d+)/.exec(response.responseText);
                id= m[1];
                if (i==1){
                    follow(id, sid);
                }
                if (i==2){
                    wish(id, sid);
                }
                if (i==3){
                    wish(id, sid);
                    follow(id, sid);
                }
            }
            if (i==4){
                if (/'join_group_form'/.exec(response.responseText)){
                    m = /groups\/([^\/#"]+)/.exec(response.responseText);
                    group(m[1], sid);
                }
            }
            if (i==5){
                m = /clanid":(\d+)/.exec(response.responseText);
                clan(m[1], sid);
            }
            if (i==6){
                var param = '';
                var channel = '';
                m = /csn":"([^"]+)/.exec(response.responseText);
                var csn = m[1];
                m = /XSRF_TOKEN":"([^"]+)/.exec(response.responseText);
                var token = m[1];
                var data = `sej={"clickTrackingParams":"${param}","commandMetadata":{"webCommandMetadata":{"url":"/service_ajax","sendPost":true}},"subscribeEndpoint":{"channelIds":["${channel}"],"params":"EgIIAg%3D%3D"}}&csn=${cns}&session_token=${token}`;
                youtube(data);
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