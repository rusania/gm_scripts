// ==UserScript==
// @name        free_dplayer
// @namespace   free_dplayer
// @description free_dplayer
// @include     https://free38.com/voddetail/*
// @updateURL   https://github.com/rusania/gm_scipts/raw/master/free_dplayer.user.js
// @downloadURL https://github.com/rusania/gm_scipts/raw/master/free_dplayer.user.js
// @version     2020.09.15.1
// @run-at      document-end
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @connect     steamdb.info
// @grant unsafeWindow
// @grant GM_xmlhttpRequest
// @grant GM_setClipboard
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_addStyle
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse;font-family:simsun !important;}");
GM_addStyle("tr,td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");

$('.media').before('<table id="a"></table>');
$('.media-info dt a').each(function(i, v){
    var u = $(v).attr('href');
    $('#a').append(`<tr id="${i}"><td>${i}</td><td><a href="javascript:void(0);" onclick="getKey('${u}', '${i}');">${u}</a></td></tr>`);
});

unsafeWindow.getKey =function(u, i){
    var k = i;
    $.ajax({
        type: 'GET',
        url: u,
        dataType:'html',
        success:function(data){
            var m = /url\\":\\"([^"]+)\\",\\"url_next/.exec(data);
            if (m){
                var r = m[1].replace(/\\/ig, '');
                $(`#${k}`).append(`<td><a target=_blank href="https://www.baiduiqiyi20206666.com/dpm3u8.html?v=${r}">Play</a></td>`);
                $(`#${k}`).append(`<td><a href="javascript:void(0);" onclick="setClip('${r}');">${r}</a></td>`);
            }
        },
        error:function(xhr,status,error){
            alert(error);
        }
    });
}

unsafeWindow.setClip =function(r){
    GM_setClipboard(r);
}

