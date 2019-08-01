// ==UserScript==
// @name         stdb_more_info
// @namespace    http://tampermonkey.net/
// @description  try to take over the world!
// @author       jacky
// @match        http*://steamdb.info/app/*
// @match        http*://steamdb.info/sub/*
// @match        http*://steamdb.info/search/*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/stdb_more_info.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/stdb_more_info.user.js
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @version     2019.08.01.1
// @connect     store.steampowered.com
// @grant       unsafeWindow
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-end
// ==/UserScript==

var rgWishlist = GM_getValue("rgWishlist", "[]");
var rgOwnedPackages = GM_getValue("rgOwnedPackages", "[]");
var rgOwnedApps = GM_getValue("rgOwnedApps", "[]");

var m = /(sub|app)\/(\d+)/.exec(document.URL);
var p = $('.package');
if (p.length > 0){
    $('.app-links').append('<a id="cmp">Cmp</a>');
    $('.app-links').append(`<a id="pkg" target="_target" href="http://198.181.32.5/package.php?id=${m[2]}">Pkg</a>`);
    $('.app-links').append(`<a id="help" target="_target" href="https://help.steampowered.com/en/wizard/HelpWithGame/?appid=${m[2]}">Help</a>`);
    p.each(function(){
        var id = $(this).attr('data-subid');
        $(this).append('<td><input type="checkbox" value="' + id + '">sub/' + id + '</td>');
    });
    $('.tab-content').after('<table class="table table-bordered" id="g"></table>');
    $('.tab-content').after('<table class="table table-bordered" id="b"></table>');
    $('.tab-content').after('<table class="table table-bordered" id="p"></table>');
    $('.tab-content').after('<div id="l"></div>');
}

$('.app').each(function(){
    var id = $(this).attr('data-appid');
    $(this).append('<td>app/' + id + '</td>');
});


$('#cmp').click(function(){
    var a = [];
    $(":checkbox").each(function(){
        if ($(this).prop("checked"))
            a.push($(this).val());
    });
    if (a.length > 0){
        comp(a);
    }
});

unsafeWindow.comp = function(a) {
    $('#b').empty();
    $('#g').empty();
    $('#p').empty();
    $('#l').empty();
    $('#l').append(`<a target=_blank href="http://198.181.32.5/sub.php?cc=cn&o=1&q=${a.join(',')}">cmp</a>`);
    var d = {};
    var f = [];
    var g = {};
    $('#b').append('<tr id="c"><td>Id</td><td>Type</td><td>Name</td><td>Price</td></tr>');
    $('#g').append('<tr id="h"><td>Id</td><td>Name</td><td>Update</td></tr>');
    $('#p').append('<tr><td>Id</td><td>Name</td><td>Price</td><td>Low</td><td>Cut</td><td>Time</td></tr>');

    $.each(a, function(i, v){
        var c = v;
        f.push(c);
        $('#c').append(`<td>${c}</td>`);
        $('#h').append(`<td>${c}</td>`);
        $.ajax({
            url: `/sub/${c}/`,
            type: 'GET',
            async: false,
        }).done(function (data) {
            var h = $(data).find('.package-title')[0];
            $(h).children().first().remove();
            var t = $.trim($(h).text());

            var p = $(data).find("td.price-line[data-cc*='cn']");
            var np = '';
            if (p.length > 0){
                np = $(p[0]).next('td').text();
            }
            var l = sublow(c, 'sub');
            var n = '';
            $.each(l.n, function(j, item){
                n += '<div>' + tm(item) + '</div>';
            });

            var cl = '';
            var s = $(data).find('.countries-list');
            if (s.length > 0){
                cl += $(s[0]).text();
                if (s.length > 1)
                    cl += ' +';
            }
            if (cl){
                if ((/is only purchasable in specified/.exec(data)))
                    cl = `<br><span style="color:red">${cl}</span>`;
                if ((/can NOT be purchased in specified/.exec(data)))
                    cl = `<br><span style="color:red"><s>${cl}</s></span>`;
            }
            p = $('<tr></tr>');
            if ($.inArray(c*1, rgOwnedPackages) > -1)
                p.addClass('package owned');
            p.append(`<td>${c}</td><td><a target=_blank href="/sub/${c}/">${t}</a>${cl}</td><td>${np}</td><td>${l.l}</td><td>-${l.c}%</td><td>${n}</td>`);
            $('#p').append(p);
            var apps = $(data).find('.app');
            $.each(apps, function(j,item){
                var td = $(item).children('td');
                var id = $(td[0]).text();
                var mark = $(item).attr('class');
                if (d.hasOwnProperty(id)){
                    d[id]['sub'].push(c);
                }
                else {
                    var tp = $.trim($(td[1]).text());
                    var name = $.trim($(td[2]).text()).replace('(', '<br>(');
                    var store = $(td[2]).children('a').length > 0 ? `<a class="pull-right" target=_blank href="https://store.steampowered.com/app/${id}/"><span class="octicon octicon-globe"></span></a>` : '';
                    var price = $(td[3]).text();
                    var time = $(td[4]).text();
                    var sub = '';
                    d[id] = {'mark':mark,'type':tp,'name':name,'store':store,'price':price,'time':time,'sub':[c]};
                }
            });

            var depots = $(data).find('tr[data-depotid]');
            $.each(depots, function(j,item){
                var td = $(item).children('td');
                var id = $(td[0]).text();
                if (g.hasOwnProperty(id)){
                    g[id]['sub'].push(c);
                }
                else {
                    var name = $.trim($(td[1]).text());
                    var time = $(td[2]).text();
                    var sub = '';
                    g[id] = {'name':name,'time':time,'sub':[c]};
                }
            });

        }).fail(function (xhr) {
        });
    });

    $.each(d, function(i, v){
        var cp ='';
        $.each(f, function(j, item){
            if ($.inArray(item, v['sub']) > -1){
                cp += '<td>&#10004;</td>';
            } else
                cp += '<td></td>';
        });
        var p = $(`<tr id="${i}"></tr>`);
        if ($.inArray(i*1, rgOwnedApps) > -1)
            p.addClass('app owned');
        else if ($.inArray(i*1, rgWishlist) > -1)
            p.addClass('app wished');
        else
            p.addClass(v.mark);
        p.append(`<td>${i}</td><td>${v.type}</td><td><a target=_blank href="/app/${i}/">${v.name}</a>${v.store}</td><td>${v.price}</td>`);
        p.append(cp);
        $('#b').append(p);
    });

    $.each(g, function(i, v){
        var cp ='';
        $.each(f, function(j, item){
            if ($.inArray(item, v['sub']) > -1){
                cp += '<td>&#10004;</td>';
            } else
                cp += '<td></td>';
        });
        $('#g').append(`<tr><td>${i}</td><td><a target=_blank href="/depot/${i}/">${v.name}</a></td><td>${v.time}</td>${cp}</tr>`);
    });
}

unsafeWindow.tm = function(dt) {
    dt = new Date(dt);
    var y = dt.getFullYear();
    var m = dt.getMonth() +1;
    m = m > 9 ? m : '0' + m;
    var d = dt.getDate();
    d = d > 9 ? d : '0' + d;
    var h = dt.getHours();
    h = h > 9 ? h : '0' + h;
    var i = dt.getMinutes();
    i = i > 9 ? i : '0' + i;
    var s = dt.getSeconds();
    s = s > 9 ? s : '0' + s;
    return `${y}-${m}-${d} ${h}:${i}:${s}`;
}

unsafeWindow.sublow = function(id, tp) {
    var r = {'l':-1,'c':0,'n':[]};
    $.ajax({
        url: `/api/GetPriceHistory/?${tp}id=${id}&cc=cn`,
        type: 'GET',
        async: false,
    }).done(function (data) {
        var id = `#${id}`;
        if (data.success){
            var a = {};
            if (data.data.final.length > 0){
                $.each(data.data.final, function(i, v){
                    if (a.hasOwnProperty(v[1])){
                        a[v[1]].push(v[0]);
                    } else {
                        a[v[1]] = [v[0]];
                    }
                });
                var c = Object.getOwnPropertyNames(a);
                var l = c[0];
                if (l == 0)
                    l = c[1];
                var d = a[l];
                d.reverse();
                r.n = d;
                if (data.data.formatted.hasOwnProperty(d[0]))
                {
                    d = data.data.formatted[d[0]];
                    r.c = d.discount;
                    r.l = l;
                }
            }
        }
    }).fail(function (xhr) {
    });
    return r;
}
