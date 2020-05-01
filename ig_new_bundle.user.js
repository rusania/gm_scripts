// ==UserScript==
// @name        ig_new_bundle
// @namespace   http://tampermonkey.net/
// @description ig_new_bundle
// @author      jacky
// @include     https://www.indiegala.com/library*
// @include     https://www.indiegala.com/gift-bundle*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/ig_new_bundle.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/ig_new_bundle.user.js
// @version     2020.05.01.1
// @run-at      document-end
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.cookie.js
// @grant       GM_addStyle
// @grant       GM_setClipboard
// @grant       unsafeWindow
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-family:simsun;font-size: 16px; !important;}");
GM_addStyle("div{font-family:simsun;font-size: 16px; !important;}");

$('.profile-private-page-library-menu').before('<div id="d"></div><div id="k"></div><div id="m"></div><div id="n"></div><div id="n2"></div>');
var b = $("a[href*='/library/bundle/']:last");
var m;
if (b.length > 0){
    m = /\d+/.exec(b.attr('href'));
    if (m){
        var n = m[0];
        for(var i=1;i<=n;i++){
            $('#d').append(`<a href="javascript:void(0);" onclick="page(${i});">${i}</a>&emsp;`);
        }
    }
} else {
    b = $('.profile-private-page-library-gift-main-subtitle:first');
    if(b.length > 0){
        var txt = $('.profile-private-page-library-title:first').text();
        if (txt){
            $('#n2').append(`<p><b>${txt}</b></p>`);
            txt = $('.profile-private-page-library-gift-main-subtitle:first').text();
            $('#n2').append(`<p>${txt}</p>`);
            txt = $('.profile-private-page-library-date:first').text();
            $('#n2').append(`<p>${txt}</p>`);
            getExtra();
            getGift($('.profile-private-page-library-subitem'), 'key2');
        } else {
            b = $('.profile-private-page-library-gift-password-form:first');
            if (b.length > 0){
                m = /l=([0-9a-f]+)/.exec(document.URL);
                var id= '';
                if (m){
                    id= m[1];
                }
                m = /p=([0-9A-Z]+)/.exec(document.URL);
                var p= '';
                if (m){
                    p = m[1];
                }
                b.find('input:first').val(p);
                b.before(`<div><input id="id" type=text size=32 value="${id}" />&emsp;<input id="p" type=text size=6 value="${p}" />&emsp;<button onclick="verify('${id}', '${p}');">Claim</button></div>`);
                b.before('<div id="n2"></div>');
            }
        }
    }else {
        $('#m').append('<span style="color:red;">Not found</span>');
    }
}

function getExtra(){
    $('#n2').append('<p><b>Gift keys:</b></p>');
    $('#n2').append('<a title="Batch claim keys" href="javascript:void(0);" onclick="getKey3(&#39;ka2&#39;);">Batch</a>&emsp;');
    $('#n2').append('<a title="Copy keys to grid" href="javascript:void(0);" onclick="cpGrid(&#39;key2&#39;);">Grid</a>&emsp;');
    $('#n2').append('<a title="Copy keys to agiso" href="javascript:void(0);" onclick="cpAgi(&#39;key2&#39;);">Agiso</a>&emsp;');
    $('#n2').append('<a title="Copy keys to asf" href="javascript:void(0);" onclick="cpAsf(&#39;key2&#39;);">Asf</a><br>');
    $('#n2').append('<table id="key2"></table>');
}

function getGift(item, k){
    item.each(function(i, v){
        var m;
        var img = $(this).find('img:first');
        var title = $.trim($(this).find('.profile-private-page-library-title div:first').text());
        var key = $(this).find('.profile-private-page-library-key-serial:first').val();
        if (img.length > 0){
            m = /(\d+).jpg/.exec(img.attr('data-src'));
            if (m){
                title = `<a target=_blank href="https://store.steampowered.com/app/${m[1]}/">${title}</a>`;
            }
        }
        if (!key) {
            var btn = $(this).find('button.profile-private-page-library-get-serial-btn:first');
            if (btn.length > 0){
                m = /getSerialKey\('([0-9A-F]+)', '([0-9]+)'/.exec(btn.attr('onclick'));
                if (m){
                    key = `<span style="color:green;" id="${m[2]}"><a class="ka2" href="javascript:void(0);" onclick="getKey('${m[2]}','${m[1]}', '');">Claim</a></span>`;
                }
            } else {
                key = $(this).find('.profile-private-page-library-title div:last').text();
                key = `<span style="color:red;" >${key}</span>`;
            }
        }
        $(`#${k}`).append(`<tr><td>${i+1}</td><td>${title}</td><td>${key}</td></tr>`);
    });
}

unsafeWindow.verify = function(a, b){
    $('#n2').empty();
    var d = {
        bundle_id: a,
        password: b,
    };
    $.ajax({
        url: '/gift-bundle/verify',
        type: "POST",
        data: JSON.stringify(d),
        dataType:'json',
        contentType:'application/json;charset=UTF-8',
        success: function(data){
            switch (data.status){
                case 'ok':
                    $('#n2').append(`<p><b>${data.bundle_name}</b></p>`);
                    $('#n2').append(`<p>${data.bundle_date}</p>`);
                    $('#n2').append(`<p>${data.bundle_version}</p>`);
                    $('#n2').append(`<p>Generated by ${data.from_user} and gifted to ${data.to_user}</p>`);
                    var li = $(data.html).find('.profile-private-page-library-key-cont').parents('li');
                    if (li.length > 0){
                        getExtra();
                        getGift(li, 'key2');
                    }
                    break;

                default:
                    $('#n2').append(`<p>${data.status}</p>`);
                    break;
            }
        },
        error: function(data){
            $('#n2').append('<p><span style="color:red;">Error 5</span></p>');
        }
    });
}


unsafeWindow.getGiftPage = function(a, b){
    $('#n2').empty();
    $.ajax({
        url: `/gift-bundle/${a}`,
        type: "GET",
        success: function(data){
            var t = $(data).find('.profile-private-page-library-gift-main-subtitle:first');
            if(t.length > 0){
                var txt = $(data).find('.profile-private-page-library-title:first').text();
                $('#n2').append(`<p><b>Link:</b>&emsp;<a target=_blank href="/gift-bundle/${a}?l=${a}&p=${b}">${txt}</a></p>`);
                $('#n2').append(`<p><b>Id:</b>&emsp;${a}</p>`);
                $('#n2').append(`<p><b>Pass:</b>&emsp;${b}</p>`);
                txt = t.text();
                $('#n2').append(`<p>${txt}</p>`);
                txt = $(data).find('.profile-private-page-library-date:first').text();
                $('#n2').append(`<p>${txt}</p>`);
                getExtra();
                getGift($(data).find('.profile-private-page-library-subitem'), 'key2');
            } else {
                $('#n2').append('<span style="color:red;">Not found</span>');
            }
        },
        error: function(data){
            $('#n2').append('<p><span style="color:red;">Error 4</span></p>');
        }
    });
}

unsafeWindow.page = function(n){
    $('#m').empty();
    $('#n').empty();
    var u = `/library/bundle/${n}`;
    $('#m').append(`<p><b>Page:</b>&emsp;<a target=_blank href="/library/bundle/${n}"><span style="color:red;font-weight:bold;">${n}</span></a></p>`);
    $.ajax({
        url: u,
        type: "GET",
        success: function(data){
            $('#m').append('<table id="b"></table>')
            $(data).find('.profile-private-page-library-item').each(function(i, v){
                var a = $(this).children(".fit-click:first");
                if (a){
                    var m = /bundle(\d+)/.exec(a.attr('onclick'));
                    if(m){
                        var id = `<a href="javascript:void(0);" onclick="bundle(${m[1]});">${m[1]}</a>`;
                        var title = $.trim($(this).find('.profile-private-page-library-title:first').text());
                        var date = $.trim($(this).find('.profile-private-page-library-date:first').text());
                        var gift = $.trim($(this).find('.profile-private-page-library-gift:first').text());
                        $('#b').append(`<tr><td>${i+1}</td><td>${id}</td><td>${title}</td><td>${date}</td><td>${gift}</td></tr>`);
                    }
                }
            });
        },
        error: function(data){
            $('#m').append('<p><span style="color:red;">Error 1</span></p>');
        }
    });
}

unsafeWindow.bundle = function(n){
    $('#n').empty();
    $('#n2').empty();
    var d = { version: n };
    $.ajax({
        url: '/library/get-bundle-contents',
        type: "POST",
        data: JSON.stringify(d),
        dataType:'json',
        contentType:'application/json;charset=UTF-8',
        success: function(data){
            switch (data.status){
                case 'ok':
                    var li = $(data.html).find('.profile-private-page-library-key-cont').parents('li');
                    if (li.length > 0){
                        $('#n').append('<p><b>Keys:</b></p>');
                        $('#n').append('<a title="Batch claim keys" href="javascript:void(0);" onclick="getKey3(&#39;ka&#39;);">Batch</a>&emsp;');
                        $('#n').append('<a title="Copy keys to grid" href="javascript:void(0);" onclick="cpGrid(&#39;key&#39;);">Grid</a>&emsp;');
                        $('#n').append('<a title="Copy keys to agiso" href="javascript:void(0);" onclick="cpAgi(&#39;key&#39;);">Agiso</a>&emsp;');
                        $('#n').append('<a title="Copy keys to asf" href="javascript:void(0);" onclick="cpAsf(&#39;key&#39;);">Asf</a><br>');
                        $('#n').append('<table id="key"></table>');
                        getGift(li, 'key');
                    }
                    var r = [];
                    li = $(data.html).find('.profile-private-page-library-gift-item');
                    if (li.length > 0){
                        $('#n').append('<p><b>Gifts:</b></p>');
                        $('#n').append('<p><a title="Copy gift links" href="javascript:void(0);" onclick="cpGift(&#39;gift&#39;);">Gift</a></p>');
                        $('#n').append('<table id="gift"></table>');
                        li.each(function(i, v){
                            var link = $(this).find('a:first').attr('href');
                            var m = /bundle\/([0-9a-f]+)/.exec(link);
                            var id= '';
                            if (m){
                                id= m[1];
                            }
                            var send = $(this).find('.profile-private-page-library-gift-send strong:first').text();
                            var pwd = $(this).find('span:last').text();
                            r.push(`<td><a href="javascript:void(0);" onclick="getGiftPage('${id}', '${pwd}');">https://www.indiegala.com${link}</a></td><td>${pwd}</td><td>${send}</td>`);
                        });
                        r.sort();
                        $.each(r, function(i, v){
                            $('#gift').append(`<tr><td>${i+1}</td>${v}</tr>`);
                        });
                    }
                    break;

                default:
                    $('#n').append(`<p>${data.status}</p>`);
                    break;
            }
        },
        error: function(data){
            $('#n').append('<p><span style="color:red;">Error 2</span></p>');
        }
    });
}

unsafeWindow.getKey = function(a, b, c){
    var n = `#${a}`;
    $(n).empty();
    var d = {
        app_id: a,
        code: b,
        passcode: c
    };
    $.ajax({
        url: '/library/get-serial-key',
        type: "POST",
        data: JSON.stringify(d),
        dataType:'json',
        contentType:'application/json;charset=UTF-8',
        success: function(data){
            switch (data.status){
                case 'ok':
                    $(n).css('color', '');
                    $(n).append(data.serial_key);
                    break;

                case 'passcheck_needed':
                    $(n).append('<input type=text id="c${a}" size=8 />');
                    $(n).css('color', 'blue');
                    $(n).append(`<a href="javascript:void(0);" onclick="getKey2(${a},'${b}');">Claim</a>`);
                    break;

                default:
                    $(n).css('color', 'red');
                    $(n).append(data.status);
                    break;
            }
        },
        error: function(data){
            $(n).css('color', 'red');
            $(n).append('Error 3');
        }
    });
}

unsafeWindow.getKey2 = function(a, b){
    getKey(a, b, $(`#c${a}`).val());
}

unsafeWindow.getKey3 = function(n){
    $(`.${n}`).each(function(i, v){
        var a = v;
        setTimeout(function () {
            $(a).click();
        }, i * 1000);
    });

}

unsafeWindow.cpGrid = function(n){
    var txt = '';
    $(`#${n} tr`).each(function(){
        $(this).children('td').each(function(){
            txt += $.trim($(this).text()) + '\t';
        });
        txt += '\n';
    });
    GM_setClipboard(txt);
}

unsafeWindow.cpAgi = function(n){
    var keys = [];
    var txt = '';
    $(`#${n} tr`).each(function(i, v){
        var d = $(this).children('td');
        var game = $(d[1]).text()
        var key = $(d[2]).text();
        keys.push(key);
        txt += `${i+1} | ${game} | ${key}\n`;
    });
    txt += `********************{r}ASF格式:{r}{r}!redeem ${keys.join(',')}`;;
    GM_setClipboard(txt);
}

unsafeWindow.cpAsf = function(n){
    var keys = [];
    var txt = '';
    $(`#${n} tr`).each(function(i, v){
        var d = $(this).children('td');
        var game = $(d[1]).text()
        var key = $(d[2]).text();
        keys.push(key);
        txt += `${i+1} | ${game} | ${key}\n`;
    });
    txt += `\nASF格式:\n!redeem ${keys.join(',')}`;
    GM_setClipboard(txt);
}

unsafeWindow.cpGift = function(n){
    var txt = '';
    $(`#${n} tr`).each(function(){
        $(this).children('td').each(function(){
            txt += $.trim($(this).text()) + '\t';
        });
        txt += '\n';
    });
    GM_setClipboard(txt);
}