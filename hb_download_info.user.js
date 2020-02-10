// ==UserScript==
// @name        hb_download_info
// @namespace   http://tampermonkey.net/
// @description hb download info
// @include     http*://www.humblebundle.com/*
// @include     http*://www.humblebundle.com/subscription/*
// @include     http*://www.humblebundle.com/games/*
// @include     http*://www.humblebundle.com/software/*
// @include     http*://www.humblebundle.com/*?key=*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/hb_download_info.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/hb_download_info.user.js
// @connect     steamdb.info
// @grant       unsafeWindow
// @version     2020.02.10.2
// @run-at      document-end
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_setClipboard
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse;font-size:16px !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");
GM_addStyle(".d{font-size:16px;color:white !important;}");

var m = /country_code: "([^"]+)/.exec(document.head.innerHTML);
if (m) {
    $('.tabs-navbar-item').append('<div class="navbar-item button-title">' + m[1] + '</div>');
    $('.tabs-navbar-item').append('<a class="navbar-item not-dropdown button-title" href="javascript:void(0);" onclick="tax();">TAX</a><span class="navbar-item not-dropdown button-title" id="tax"></span>');
}

unsafeWindow.tax = function(a){
    $('#tax').empty();
    $.ajax({
        url: '/api/v1/tax_rate',
        type: "GET",
        dataType : 'json',
        success: function( data, status, xhr ){
            if (data.tax_rate){
                $('#tax').after(data.tax_rate);
            } else {
                $('#tax').after("0");
            }
        },
        fail: function( data, status, xhr ){
            alert(status);
        }
    });
}

m = /downloads/.exec(document.URL);
if (m){
    $('.js-cross-promo-whitebox-holder').hide();
    $('.download-mosaic').hide();
    $('.site-footer').hide();
    $('#spiel').hide();
    $('.papers-content').append('<div id="zo"></div>');
    $('#zo').append('<table id="reg"></table>');
    $('#zo').append('<table id="reg2"></table>');
    $('#zo').append('<table id="reg3"></table>');
    $('#zo').append('<div id="info2" class="d"></div>');
    $('#zo').append('<div><a id="r">LOCK</a></div>');
    $('#zo').append('<div><a id="btn">INFO</a></div>');
    $('#zo').append('<div><a id="key">KEYS</a></div>');
    $('#zo').append('<div><a id="gift">GIFT</a></div>');
    $('#zo').append('<table id="info"></table>');
    $('#zo').append('<div id="info3" class="d"></div>');
    $('#zo').append('<div><a id="p">COPY</a></div>');
    $('#zo').append('<div><a id="region">REGION</a></div>');

    m = /key=([0-9A-Z]+)/i.exec(document.URL);
    var id = m[1];
    var url = `https://www.humblebundle.com/api/v1/order/${id}?wallet_data=true&all_tpkds=true`;
    $('#info2').append(`<a target=_blank href="${url}">JSON</a><br>`);

    $('#r').click(function () {
        $('#reg').empty();
        $('#reg2').empty();
        $('#info2').empty();
        $('#reg').append('<tr><td>App</td><td>machineName</td><td>app</td><td>sub</td><td>exclusive</td><td>disallowed</td><td>store</td></tr>');

        $.ajax({
            url: url,
            type: "GET",
            success: function(data){
                $('#info2').append(data.amount_spent + '<br>');
                $('#info2').append(data.gamekey + '<br>');
                $('#info2').append(data.uid + '<br>');
                $('#info2').append(data.created + '<br>');
                $('#info2').append(`<a target=_blank href="${url}">JSON</a><br>`);
                $.each(data.tpkd_dict.all_tpks, function (i, item) {
                    var app = '';
                    id = item.steam_app_id;
                    if (id)
                        app = `<a target=_blank href="https://steamdb.info/app/${id}/">${id}</a>`;
                    var sub = '';
                    var region = item.key_type;
                    id = item.steam_package_id;
                    if (item.steam_package_id){
                        sub = `<a target=_blank href="https://steamdb.info/sub/${id}/info">${id}</a>`;
                        region = 'WW,';
                    }
                    var exc = '<td>-</td>';
                    if (item.exclusive_countries.length){
                        id = item.exclusive_countries;
                        exc = `<td title="${id}">List</td>`;
                        region += '+,';
                    }
                    var dis = '<td>-</td>';
                    if (item.disallowed_countries.length){
                        id = item.disallowed_countries;
                        dis = `<td title="${id}">List</td>`;
                        region += '-,';
                    }
                    var j = ++i;
                    id = item.machine_name;
                    var king = item.human_name.replace(/ /g, '+').replace(/[^a-z0-9+]/ig, '');
                    $('#reg').append(`<tr><td>${j}</td><td>${id}</td><td>${app}</td><td>${sub}</td>${exc}${dis}<td><a target=_blank href="http://176.122.178.89/king.php?q=${king}">KING</a></td></tr>`);
                    var key = item.redeemed_key_val ? item.redeemed_key_val : '';
                    var human = item.human_name;
                    sub = '';
                    if (item.steam_package_id)
                        sub = `<td class="db" id="${item.steam_package_id}">${region}${item.steam_package_id}</td>`;
                    else
                        sub = '<td></td>';
                    $('#reg2').append(`<tr><td>${i}</td><td>${human}</td><td>${key}</td><td></td><td></td>${sub}</tr>`);
                });
            },
            error: function(data){
                alert('error-key');
            }
        });
    });

    $('#p').click(function(){
        var txt = '';
        $('#reg2 tr').each(function(){
            $(this).children('td').each(function(){
                txt += $(this).text() + '\t';
            });
            txt += '\n';
        });
        GM_setClipboard(txt);
    });

    $('#btn').click(function () {
        $('#info').empty();
        $('#info3').empty();
        var i = 0;
        $('.key-redeemer').each(function () {
            var title = $.trim($(this).find('h4').text().replace('In your Steam library.', ''));
            var key = $.trim($(this).find('.keyfield-value').text().replace('Reveal your Steam key', ''));
            var j = ++i;
            $('#info').append(`<tr><td>${j}</td><td>${title}</td><td>${key}</td></tr>`);
            $('#info3').append(`<p>${title}<br>${key}</p>`);
        });
    });
    $('#key').click(function () {
        $('.keyfield').click();
    });
    $('#gift').click(function () {
        $('.giftfield').click();
    });
}

$('#region').click(function () {
    $('#reg3').empty();
    $('.db').each(function(){
        var id = $(this).attr("id");
        var url = `https://steamdb.info/sub/${id}/`;
        $(`#${id}`).empty();
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: function(response) {
                if (response.status == 503)
                    alert('Just a moment');
                else {
                    var h = $(response.responseText).find('.package-title')[0];
                    $(h).children().first().remove();
                    var t = $.trim($(h).text());
                    var d = {};
                    var apps = '';
                    $.each($(response.responseText).find('.app'), function(j,item){
                        var td = $(item).children('td');
                        var ap = $(td[0]).text();
                        var mark = $(item).attr('class');
                        var tp = $.trim($(td[1]).text());
                        var name = $.trim($(td[2]).text()).replace('(', '<br>(');
                        var store = $(td[2]).children('a').length > 0 ? `<a class="pull-right" target=_blank href="https://store.steampowered.com/app/${id}/"><span class="octicon octicon-globe"></span></a>` : '';
                        var price = $(td[3]).text();
                        var time = $(td[4]).text();
                        d[ap] = {'mark':mark,'type':tp,'name':name,'store':store,'price':price,'time':time};
                        apps += `<div>${name} [${tp}]</div>`;
                    });
                    var cl = '';
                    var s = $(response.responseText).find('.countries-list');
                    if (s.length > 0){
                        cl += $(s[0]).text();
                        if (s.length > 1)
                            cl += ' +';
                    }
                    if (cl){
                        if ((/is only purchasable in specified/.exec(response.responseText)))
                            cl = `<span style="color:red">${cl}</span>`;
                        if ((/can NOT be purchased in specified/.exec(response.responseText)))
                            cl = `<span style="color:red">- ${cl}</span>`;
                    } else {
                        cl = 'WW';
                    }
                    $(`#${id}`).append(`${cl},${id}`);
                    $('#reg3').append(`<tr><td>${id}</td><td>${cl}</td><td>${t}</td><td>${apps}</td></tr>`);
                }
            },
            onerror:  function(response) {
                //alert(response.statusText);
            },
            ontimeout:  function(response) {
                //alert(response.statusText);
            },
        });
    });
});

m = /games|mobile|software/.exec(document.URL);
if (m){
    $('.base-main-wrapper').before('<div class="d" id="a1"></div>');
    $.ajax({
        url: document.URL,
        type: "GET",
        success: function(data){
            m = /<script id="webpack-bundle-data" type="application\/json">([^<>]+)</.exec(data);
            if (m){
                var j = JSON.parse(m[1]);
                if (j && j.bundleVars) {
                    j = j.bundleVars;
                    $('#a1').append(`<p>${j.product_human_name}</p>`);
                    $('#a1').append(`<p>${j.hero_tile.machine_name}</p>`);
                    $('#a1').append(`<p>${j.hero_tile.tile_stamp}</p>`);
                    $('#a1').append(`<p>${j.order_form.product_json.start}</p>`);
                    $('#a1').append(`<p>${j.order_form.product_json.end}</p>`);
                    var f = j.order_form.checkout_tiers;
                    f.forEach(function (e) {
                        // is_bta
                        // is_initial_tier
                        // is_fixed
                        // is_free
                        // top_header_text
                        $('#a1').append(`<p>${e.price}</p>`);
                    });
                    f = j.slideout_data.display_items;
                    $('#a1').append('<table id="b"></table>');
                    var i = 1;
                    for (var k in f)
                    {
                        var g = [];
                        if (f[k].availability_icons){
                            f[k].availability_icons.delivery_icons.forEach(function (v) {
                                g.push(v.replace('hb-', ''));
                            });
                        }
                        $('#b').append(`<tr><td>${(i++)}</td><td>${f[k].machine_name}</td><td>${f[k].human_name}</td><td>${g.join()}</td></tr>`);
                    }
                }
            }
        },
        error: function(data){
            alert('error-key');
        }
    });
}

m = /home\/keys/.exec(document.URL);
if (m){
    $('.tabs-navbar-item').append('<div class="navbar-item button-title"><a id="k">KEY</A></div>');
    $('#k').click(function(){
        var l = $('#b').length;
        if (l)
            $('#b').remove();
        $('.container').after('<table id="b"></table>');
        $('.unredeemed-keys-table tbody').find('tr').each(function(){
            var d = $(this).find('td');
            var game = $(d[1]).find('h4').text();
            var a = $(d[1]).find('a');
            var bundle = $(a).text();
            var ke = '';
            m = /key=([A-Za-z0-9]{16})/.exec($(a).attr('href'));
            if (m)
                ke = m[1];
            var serial = $(d[2]).find('.keyfield-value').text().replace('Reveal your Steam key', '');
            $('#b').append(`<tr><td>${game}</td><td>${serial}</td><td>${bundle}</td><td>${ke}</td></tr>`);
        });
    });
}

m = /subscription/.exec(document.URL);
if (m){
    $('.tabs-navbar-item').append('<a class="navbar-item not-dropdown button-title" href="javascript:void(0);" onclick="show();">INFO</a>');
    $('.content-choices-wrapper').before('<div class="d" id="a1"></div>');

    unsafeWindow.show = function(){
        $('#a1').empty();
        $.ajax({
            url: document.URL,
            type: "GET",
            success: function(data){
                m = /<script id="(webpack-subscriber-hub-data|webpack-monthly-product-data)" type="application\/json">([^<>]+)</.exec(data);
                if (m){
                    var j = JSON.parse(m[2]);
                    if (j && j.contentChoiceOptions) {
                        if (j.monthlyJoinDate)
                            $('#a1').append(`<p>${j.monthlyJoinDate}</p>`);
                        if (j.nextBilledPlanProductHumanName)
                            $('#a1').append(`<p>${j.nextBilledPlanProductHumanName}</p>`);
                        if(j.payEarlyOptions){
                            $('#a1').append(`<p>${j.payEarlyOptions.activeContentStart}</p>`);
                            $('#a1').append(`<p>${j.payEarlyOptions.productMachineName}</p>`);
                        }
                        $('#a1').append(`<p><a target=_blank href="/subscription/${j.contentChoiceOptions.productUrlPath}">${j.contentChoiceOptions.title}</a></p>`);
                        var f = j.contentChoiceOptions.gamekey ? true : false;
                        var gamekey, made;
                        if (f){
                            gamekey = j.contentChoiceOptions.gamekey;
                            made = j.contentChoiceOptions.contentChoicesMade.initial.choices_made;
                            $('#a1').append(`<p><a target=_blank href="/?key=${gamekey}">${gamekey}</a></p>`);
                        }
                        $('#a1').append(`<p>${j.contentChoiceOptions.contentChoiceData.initial.total_choices}</p>`);;
                        var g = j.contentChoiceOptions.contentChoiceData.initial.content_choices;
                        $('#a1').append('<table id="b"></table>');
                        $('#a1').append(`<p>Key:</p>`);
                        $('#a1').append('<table id="c"></table>');
                        var n = 1;
                        $.each(j.contentChoiceOptions.contentChoiceData.initial.display_order, function (i, e) {
                            $('#b').append(`<tr id="${e}"></tr>`);
                            var claim = '';
                            if (f) {
                                if ($.inArray(e, made)<0)
                                    claim = `<a href="javascript:void(0);" onclick="choice('${gamekey}', '${e}');">Claim</a>`;
                                else
                                    $(`#${e}`).css("background-color", "blue");
                            }
                            $(`#${e}`).append(`<td>${(i+1)}</td><td>${e}</td><td>${g[e].title}</td><td>${g[e]['msrp|money'].amount}</td><td>${g[e].delivery_methods.join()}</td><td>${claim}</td>`);
                            if (g[e].tpkds){
                                $.each(g[e].tpkds, function (k, item) {
                                    var app = '';
                                    id = item.steam_app_id;
                                    if (id)
                                        app = `<a target=_blank href="https://steamdb.info/app/${id}/">${id}</a>`;
                                    var region = item.key_type;
                                    var exc = '<td>-</td>';
                                    if (item.exclusive_countries.length){
                                        exc = `<td title="${item.exclusive_countries}">List</td>`;
                                        region += '+,';
                                    }
                                    var dis = '<td>-</td>';
                                    if (item.disallowed_countries.length){
                                        dis = `<td title="${item.disallowed_countries}">List</td>`;
                                        region += '-,';
                                    }
                                    var key = '';
                                    var redeem = '';
                                    if (item.redeemed_key_val)
                                        key = item.redeemed_key_val;
                                    else
                                        redeem = `<a href="javascript:void(0);" onclick="redeem('${item.machine_name}', '${item.gamekey}', ${k}, '${id}');">Redeem</a>`;
                                    $('#c').append(`<tr><td>${(n++)}</td><td>${item.machine_name}</td><td>${item.human_name}</td><td id="${id}">${key}</td><td>${app}</td>${exc}${dis}</td><td>${redeem}</td></tr>`);
                                });
                            }
                        });
                        $.each(j.contentChoiceOptions.contentChoiceData.extras, function (i, e) {
                            $('#b').append(`<tr><td>${(i+1)}</td><td>${e.machine_name}</td><td>${e.human_name}</td><td></td><td>${e.types.join()}</td><td></td></tr>`);
                        });
                    }
                }
            },
            error: function(data){
                alert('error-key');
            }
        });
    }

    unsafeWindow.choice = function(a, b){
        $.ajax({
            url: `/humbler/choosecontent?gamekey=${a}&parent_identifier=initial&chosen_identifier=${b}`,
            type: "GET",
            dataType:'json',
            success: function(data){
                // {"errors": {"dummy": ["You have no choices remaining. Please refresh this page to see your choices."]}, "success": false}
                if (data.success)
                    $(`#${b}`).css("background-color","blue");
                else{
                    $(`#${b}`).attr('title', data.errors.dummy);
                    $(`#${b}`).css("background-color","red");
                }
            },
            error: function(data){
                $(`#${b}`).css("background-color","yellow");
            }
        });
    }

    unsafeWindow.redeem = function(a, b, c, d){
        $.ajax({
            url: `/humbler/redeemkey`,
            type: "POST",
            data: {
                keytype: a,
                key: b,
                keyindex: c
            },
            dataType:'json',
            success: function(data){
                if (data.success)
                    $(`#${d}`).append(data.key);
                else{
                    $(`#${d}`).append(data.error_msg);
                    $(`#${d}`).css("background-color","red");
                }
            },
            error: function(data){
                $(`#${d}`).append('err2');
            }
        });
    }
}

