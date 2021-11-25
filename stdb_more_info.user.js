// ==UserScript==
// @name         stdb_more_info
// @namespace    http://tampermonkey.net/
// @description  try to take over the world!
// @author       jacky
// @match        http*://steamdb.info/app/*
// @match        http*://steamdb.info/sub/*
// @match        http*://steamdb.info/search/*
// @match        http*://steamdb.info/freepackages/*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/stdb_more_info.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/stdb_more_info.user.js
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @version     2021.11.25.1
// @connect     store.steampowered.com
// @grant       unsafeWindow
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-start
// ==/UserScript==

const userRefreshInterval = 60 * 24; // Number of minutes to wait to refesh cached userdata. 0 = always stay up-to-date.

var txt = GM_getValue("steam_info", "{}");
var dt = GM_getValue("last_upd", 0);
var r = JSON.parse(txt);
//r.rgIgnoredApps;
var demo = [];
var free = [];

if (Date.now() - dt > userRefreshInterval * 60000 || r.rgOwnedApps===undefined)
    update();

unsafeWindow.cmp = function() {
    var a=[], b=[];
    $(".bi").each(function(){
        if ($(this).prop("checked"))
            a.push($(this).val());
    });
    $(".si").each(function(){
        if ($(this).prop("checked"))
            b.push($(this).val());
    });
    if (a.length > 0 || b.length > 0 ){
        comp(a, b);
    }
}

function comp(a, b) {
    $('#b').empty();
    $('#g').empty();
    $('#p').empty();
    $('#l').empty();
    //$('#l').append(`<a target=_blank href="http://${host}/sub.php?cc=cn&o=1&q=${a.join(',')}">cmp</a>`);
    var d = {};
    var f = [];
    var g = {};
    $('#b').append('<tr id="c"><td>Id</td><td>Type</td><td>Name</td><td>Price</td></tr>');
    $('#g').append('<tr id="h"><td>Id</td><td>Name</td><td>Update</td></tr>');
    $('#p').append('<tr><td>Id</td><td>Name</td><td>Price</td><td>Low</td><td>Cut</td><td>Time</td></tr>');

    $.each(b, function(i, v){
        var c = v;
        f.push(c);
        $('#c').append(`<td>${c}</td>`);
        $('#h').append(`<td>${c}</td>`);
        $.ajax({
            url: `/sub/${c}/`,
            type: 'GET',
            async: false,
        }).done(function (data) {
            //var h = $(data).find('.css-truncate')[0];
            var h = $(data).find('h1')[0];
            $(h).children().first().remove();
            var t = $.trim($(h).text());

            var p = $(data).find("td.price-line[data-cc*='cn']");
            var np = '';
            if (p.length > 0){
                np = $(p[0]).next('td').text();
            }
            var l = {'l':-1,'c':0,'n':[]};
            //l = sublow(c, 'sub');
            var n = '';
            $.each(l.n, function(j, item){
                n += '<div>' + tm(item) + '</div>';
            });

            var cl = '';
            var s = $(data).find('.hr-country-list');
            if (s.length > 0){
                cl = s.parent().prop("firstChild").nodeValue;
            }
            if (cl){
                if ((/is only purchasable in specified/.exec(data)))
                    cl = `<br><span style="color:red">${cl}</span>`;
                if ((/can NOT be purchased in specified/.exec(data)))
                    cl = `<br><span style="color:red"><s>${cl}</s></span>`;
            }
            p = $('<tr></tr>');
            if ($.inArray(c*1, r.rgOwnedPackages) > -1)
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

    $.each(a, function(i, v){
        var c = v;
        f.push(c);
        $('#c').append(`<td>${c}</td>`);
        $('#h').append(`<td>${c}</td>`);
        $.ajax({
            url: `/bundle/${c}/`,
            type: 'GET',
            async: false,
        }).done(function (data) {
            //var h = $(data).find('.css-truncate')[0];
            var h = $(data).find('h1')[0];
            $(h).children().first().remove();
            var t = $.trim($(h).text());

            var l = 0;
            var np = 0;
            $(data).find('.price-initial').each(function(){
                var m = /[0-9.]+/.exec($(this).text());
                if (m)
                    l += parseFloat(m[0]);
                var n = $(this).parent().attr('data-sort');
                np += Math.round(n / 100);
            });
            var x = Math.round((1 - (np / l)) * 100);
            var n = $(data).find('.panel-error div').text();
            var p = $('<tr></tr>');
            p.append(`<td>${c}</td><td><a target=_blank href="/bundle/${c}/">${t}</a></td><td>${np}</td><td></td><td>-${x}%</td><td>${n}</td>`);
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
                    var price = '';
                    var time = $(td[3]).text();
                    var sub = '';
                    d[id] = {'mark':mark,'type':tp,'name':name,'store':store,'price':price,'time':time,'sub':[c]};
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
        if ($.inArray(i*1, r.rgOwnedApps) > -1)
            p.addClass('app owned');
        else if ($.inArray(i*1, r.rgWishlist) > -1)
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
            var b = [];
            if (data.data.history.length > 0){
                $.each(data.data.history, function(i, v){
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

function addfreelicense(id, g) {
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
        data: `action=add_to_cart&sessionid=${g}&subid=${id}`,
        onload: function(response) {
            var r = $(response.responseText).find('.add_free_content_success_area p:first,.error');
            if (r.length > 0)
                $('#'+id).append($(r).text());
        },
        onerror:  function(response) {
            $('#'+id).append(response.statusText);
        },
        ontimeout:  function(response) {
            $('#'+id).append(response.statusText);
        },
    });
}

function update(){
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://store.steampowered.com/dynamicstore/userdata/?l=english",
        onload: function(response) {
            if (response.responseText.length > 1000 && /rgWishlist/.exec(response.responseText)){
                GM_setValue("steam_info", response.responseText);
                GM_setValue("last_upd", Date.now());
                r = JSON.parse(response.responseText);
                //alert("complete");
            }
        },
        onerror:  function(response) {
            //alert(response.statusText);
        },
        ontimeout:  function(response) {
            //alert(response.statusText);
        },
    });
}

window.addEventListener ("DOMContentLoaded", DOM_ContentReady);
window.addEventListener ("load", pageFullyLoaded);

function DOM_ContentReady () {
    // This is the equivalent of @run-at document-end
    $("body").on('click', '#a1', function(){
        $('#d').empty();
        var n = Date.now();
        var d = GM_getValue("last_upd", 0) + 61 * 60 * 1000;
        var q = GM_getValue("last_add", 0);
        if (n < d){
            if (q > 49){
                alert(new Date(d));
                return;
            }
        } else {
            q = 0;
            GM_setValue("last_add", 0);
        }

        GM_xmlhttpRequest({
            method: "GET",
            url: "https://store.steampowered.com/account/licenses/",
            onload: function(response) {
                var m = /g_sessionID = "([a-z0-9]+)";/.exec(response.responseText);
                if (m){
                    var g = m[1];
                    $.each(free, function(k, v){
                        var id = v;
                        GM_setValue("last_add", q++);
                        if (k > 49 || q > 50)
                            return false;
                        $('#d').append(`<tr><td>${k}</td><td>${v}</td><td id="${v}"></td></tr>`);
                        addfreelicense(id, g);
                    });
                    $.each(demo, function(k, v){
                        var id = v;
                        GM_setValue("last_add", q++);
                        if (k > 49 || q > 50)
                            return false;
                        $('#d').append(`<tr><td>${k}</td><td>${v}</td><td id="${v}"></td></tr>`);
                        addfreelicense(id, g);
                    });
                }
            },
            onerror:  function(response) {
                alert(response.statusText);
            },
            ontimeout:  function(response) {
                alert(response.statusText);
            },
        });
    });

    $("body").on('click', '#f1', function(){
        $('#b').empty();
        $('#c').empty();
        $('#d').empty();
        $('#f').remove();
        demo = [];
        free = [];
        var ip = [];
        $('.package').each(function(){
            var sub = $(this).attr('data-subid');
            var app = $(this).attr('data-appid');
            var parent = $(this).attr('data-parent');
            ip.push(`${sub},${app},${parent}`);
            if (/Trailer|Demo|Trial/ig.exec($(this).html())){
                $('#c').append(sub+',');
                demo.push(sub);
            } else {
                //$('#d').append(`<tr><td>${sub}</td><td>${app}</td><td>${parent}</td><td>${$(this).text()}</td></tr>`);
                $('#b').append(sub+',');
                free.push(sub)
            }
        });
    });

    $("body").on('click', '#cmp', function(){
        cmp();
    });
}

function pageFullyLoaded () {
    var m = /freepackages/.exec(document.URL);
    if (m) {
        GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
        GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-size:16px !important;}");
        $('#freepackages').before('<div id="b"></div>');
        $('#freepackages').before('<div id="c"></div>');
        $('#freepackages').before('<table id="d"></table>');
        $('h1').after('<input id="a1" type="button" value="Add" />&emsp;');
        $('h1').after('<input id="f1" type="button" value="Filter" />');
    }

    m = /(sub|app)\/(\d+)/.exec(document.URL);
    if (m) {
        var p = $('#subs div table tbody .package');
        $('#subs div table tbody tr:not(.package)').each(function(){
            var id = $(this).find('a').text().trim();
            $(this).append(`<td><input class="bi" type="checkbox" value="${id}">bundle/${id}</td>`);
        });

        if (p.length > 0){
            $('.app-links').append('<a id="cmp">Cmp</a>');
            $('.app-links').append(`<a id="help" target="_target" href="https://help.steampowered.com/en/wizard/HelpWithGame/?appid=${m[2]}">Help</a>`);
            p.each(function(){
                var id = $(this).attr('data-subid');
                $(this).append(`<td><input class="si" type="checkbox" value="${id}">sub/${id}</td>`);
                if ($.inArray(id, r.rgOwnedPackages) > -1){
                    $(this).addClass("owned");
                }
                if ($.inArray(id, r.rgPackagesInCart) > -1){
                    $(this).addClass("incart");
                }
            });

            $('.tab-content').append('<div id="l"></div>');
            $('.tab-content').append('<table class="table table-bordered" id="p"></table>');
            $('.tab-content').append('<table class="table table-bordered" id="b"></table>');
            $('.tab-content').append('<table class="table table-bordered" id="g"></table>');
        }

        $('.app').each(function(){
            var id = $(this).attr('data-appid');
            $(this).append('<td>app/' + id + '</td>');
            if ($.inArray(id, r.rgOwnedApps) > -1){
                $(this).addClass("owned");
            } else if ($.inArray(id, r.rgWishlist) > -1){
                $(this).addClass("wished");
            }
            if ($.inArray(id, r.rgAppsInCart) > -1){
                $(this).addClass("incart");
            }
        });
    }

}