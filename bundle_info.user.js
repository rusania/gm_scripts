// ==UserScript==
// @name        bundle_info
// @namespace   http://tampermonkey.net/
// @description bundle games info
// @include     http*://store.steampowered.com/sale/*
// @include     http*://directg.net/event/event.html
// @include     http*://directg.net/game/game_page.html?product_code=*
// @include     http*://*otakumaker.com/index.php/account/admin/deal/view/*
// @include     http*://www.indiegala.com/*
// @exclude     http*://www.indiegala.com/profile?user_id=*
// @exclude     http*://www.indiegala.com/ajaxsale?sale_id=*
// @exclude     http*://www.indiegala.com/gift?gift_id=*
// @exclude     http*://www.indiegala.com/successpay*
// @exclude     https://tryit-forfree.rhcloud.com/*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/bundle_info.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/bundle_info.user.js
// @version     2019.06.13.1
// @run-at      document-end
// @connect     free.currencyconverterapi.com
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @grant       GM_xmlhttpRequest
// @grant       GM_log
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

var colors = [
    '#32cd32',
    '#ff6a00',
    '#df0101',
    '#b200ff'
];
var mons = [
    'Month',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

//GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
//GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-size:16px !important;}");
var match = /store.steampowered.com\/sale/.exec(document.URL);
if (match) {
    $('.supernav_container').append('<a class="menuitem" id="btn">INFO</a>');
    $('.game_title_area').after('<table id="info"></table>');
    $('#btn').click(function () {
        $('#info').empty();
        $('#info').append('<tr><td>序号</td><td>游戏</td><td>优惠价</td><td>折扣</td><td>原价</td><td>集合</td></tr>');
        var i = 0;
        $('.sale_page_purchase_item').each(function () {
            var a = $(this).find('a') [1];
            var title = $(a).text();
            var link = $(a).attr('href').replace(/\?.*/, '');
            var discount = $(this).find('.discount_pct').text();
            var del = $(this).find('.discount_original_price').text(); //.replace(/￥/gm, '');
            var p = $(this).find('.discount_final_price').text(); //.replace(/￥/gm, '');
            var pak = '';
            match = /addToCart\((\d+)/.exec($(this).html());
            if (match != null) {
                pak = '<a href="http://steamdb.info/sub/' + match[1] + '/" target="_blank">' + match[1] + '</a>';
            }
            $('#info').append('<tr><td>' + ++i + '</td><td><a href="' + link + '" target="_blank">' + title + '</a></td><td>' + p + '</td><td>' + discount + '</td><td>' + del + '</td><td>' + pak + '</td></tr>');
        });
    });
} //steam sale

match = /directg.net\/event/.exec(document.URL);
if (match) {
    $('.navbar-nav').append('<li class="mega" data-level="1"><a itemprop="url" id="btn">INFO</a></li>');
    $('#system-message-container').append('<div>实时汇率：<span id="ratio">0</ratio></div>');
    $('#system-message-container').append('<a target="_blank" href="http://66.154.108.170/dg.php?v=0">TRY IT</a>');
    $('#system-message-container').append('<table id="info"></table>');
    $('#btn').click(function () {
        $('#info').empty();
        $('#info').append('<tr><td>序号</td><td>游戏</td><td>优惠价</td><td>人民币</td><td>折扣</td></tr>');
        var f = function () {
            var i = 0;
            var r = $('#ratio').text();
            $('.vmproduct').each(function () {
                var a = $(this).find('a') [0];
                var title = $(a).attr('title');
                var link = $(a).attr('href');
                var discount = $($(this).find('div.pull-left') [0]).text();
                var right = $(this).find('div.pull-right') [0];
                var p = $(right).text().replace(/,/gm, '').replace(/ 원/gm, '');
                var p2 = (p * r).toFixed(2);
                $(right).append('<br><span style="color:red; font-weight: bold;">&yen;' + p2 + '</span>');
                $('#info').append('<tr><td>' + ++i + '</td><td><a href="' + link + '" target="_blank">' + title + '</a></td><td>&#8361;' + p + '</td><td>&yen;' + p2 + '</td><td>-' + discount + '</td></tr>');
            });
        };
        getRatio('KRW', 'CNY', f);
    });
} //directgames event

match = /games.co.kr\/game\/game_page/.exec(document.URL);
if (match) {
    $('.navbar-nav').append('<li class="mega" data-level="1"><a itemprop="url" id="btn">INFO</a></li>');
    $('div.PricesalesPrice').append('<span style="color:red; font-weight: bold;" id="cny"></span>');
    $('#productPrice8').append('<div>实时汇率：<span id="ratio">0</ratio></div>');
    $('#btn').click(function () {
        var f = function () {
            $('#cny').empty();
            var r = $('#ratio').text();
            var p = $.trim($('span.PricesalesPrice').text().replace(/,/gm, ''));
            var q = (p * r).toFixed(2);
            $('#cny').append('&yen;' + q);
        };
        getRatio('KRWCNY', f);
    });
} //directgames game_page

match = /com\/superbundle_/.exec(document.URL);
if (match) {
    $('#DIG2TableGray').append('<div><a id="btn"><span style="color:white;">INFO</span></a></div>');
    $('#DIG2TableGray').append('<div class="info" style="color:#ffffff"></div>');
    $('#DIG2TableGray').append('<div class="info2" style="color:#ffffff"></div>');
    $('#btn').click(function () {
        $('.info').empty();
        $('.info2').empty();
        var title = $($('.DIG2-TitleOrange') [0]).text();
        var price = $('#price3').val();
        getGridHead('DailyIndieGame ' + title);
        match = /_seconds   = (\d+);/.exec($('body').html());
        if (match) {
            var now = new Date();
            var time = new Date(now.valueOf() + match[1] * 1000);
            $('#time').append('[' + (now.getMonth() + 1) + '.' + now.getDate() + '-' + (time.getMonth() + 1) + '.' + time.getDate() + ']');
        }
        $('#p').append(price);
        $('.info').append('<div>[quote]<span id="g3"></span>[/quote]</div>');
        $('.info').append('<div><span style="color:#32cd32;">[b][color=#32cd32]支付$' + price + '获得1份完整包[/color][/b]</span></div>');
        $('.info').append('<div><span style="color:#b200ff;">[b][color=#b200ff]支付超过均价获得2份完整包[/color][/b]</span></div>');
        var k = 0;
        $('#DIG2TableGray').find('.DIG-content').each(function () {
            var t = $($(this).find('div.DIG2-TitleOrange') [0]).text();
            var steam = $($(this).find('a') [0]).attr('href');
            match = /app\/(\d+)/.exec(steam);
            var id = '0';
            if (match) {
                id = match[1];
            }
            getGridContent(id, 'app', t, '#g3', ++k);
        });
        $('.g').append(k);
    });
} //dailyindiegame bundle

match = /admin\/deal\/view/.exec(document.URL);
if (match) {
    $('.em_DealInfoRight').append('<div><a id="btn"><span style="color:red;font-weight:bold;">INFO</span></a></div>');
    $('.em_DealInfoRight').append('<div class="info"></div>');
    $('.em_DealInfoRight').append('<div class="info2"></div>');
    $('#btn').click(function () {
        $('.info').empty();
        $('.info2').empty();
        var match = /(.*) (\d+) ([A-Za-z]+) to (\d+) ([A-Za-z]+)/.exec(document.title);
        if (match){
            var title = match[1];
            if (/OtakuMaker/.exec(title) == null)
                title = 'OtakuMaker ' + title;
            getGridHead(title);
            $('.info').append('<div>[quote]<span id="g3"></span>[/quote]</div>');
            $('#time').append('[' + mons.indexOf(match[3], 0) + '.' + match[2] + '-' + mons.indexOf(match[5], 0) + '.' + match[4] + ']');
        }
        else{
            match = /OtakuMaker.*#\d+/.exec(document.title);
            getGridHead(match[0]);
            $('.info').append('<div>[quote]<span id="g3"></span>[/quote]</div>');
        }
        var games = $('.gantry-width-33');
        $('.g').append(games.length);
        var k = 0;
        games.each(function () {
            var t = $(this).find('h3').text();
            var href = $(this).find('a').attr('href');
            match = /app\/(\d+)/.exec(href);
            var id = '0';
            if (match) {
                id = match[1];
            }
            getGridContent(id, 'app', t, '#g3', ++k);
        });
        var i = 0;
        var text = $('.em_DealInfoRight').text();
        match = /([0-9]+) Games Only : \$([0-9.]+)/.exec(text);
        if (match) {
            $('.info').append('<div><span style="color:' + colors[i] + ';">[b][color=' + colors[i++] + ']支付$' + match[2] + '获得1份完整包（' + match[1] + '个KEY）[/color][/b]</span></div>');
            $('#p').append(match[2]);
        }
        var regx = /([0-9]+) BUNDLES .* ([0-9]+) keys .* \$([0-9.]+)/g;
        match = regx.exec(text);
        while (match) {
            $('.info').append('<div><span style="color:' + colors[i] + ';">[b][color=' + colors[i++] + ']支付$' + match[3] + '获得' + match[1] + '份完整包（' + match[2] + '个KEY）[/color][/b]</span></div>');
            match = regx.exec(text);
        }
        $('.info').append('<div>[b]购买后24小时内发KEY至邮箱[/b]</div>');
    });
} //otakumaker deal

match = /indiegala.com/.exec(document.URL);
if (match) {
    $('.libd-box-social').prev().append('<li><a id="btn" class="libd-group-item libd-bounce libd-group-item-icon ">Info</a></li>');
    $('.bundle_header').before('<div class="info" style="color:#ffffff"></div>');
    $('.bundle_header').before('<div class="info2" style="color:#ffffff"></div>');
    $('#btn').click(function () {
        $('.info').empty();
        $('.info2').empty();
        var i = 0;
        var bundle = $(document).attr('title').replace(' of Steam games', '');
        getGridHead(bundle);
        var html = $('#frame-top').html();
        var rg = /Date.UTC\( \d+,(\d+)\-\d+,(\d+),\d+,\d+,\d+ \)/g;
        var d = new Array();
        match = rg.exec(html);
        while (match) {
            d.push(match);
            match = rg.exec(html);
        }
        if (d.length > 1) {
            var now = new Date(eval(d[0][0]).valueOf() + 86400000);
            $('#time').append('[' + (now.getMonth() + 1) + '.' + now.getDate() + '-' + d[1][1] + '.' + d[1][2] + ']');
            if (d.length > 2) {
                var flash = Math.ceil((new Date(eval(d[2][0]).valueOf()) - now) / 86400000) * 24;
                if (flash > 0)
                    $('#early').append('前' + flash + '小时');
            }
        }
        var tiers = $('.bundle_page').find('section');
        var k = 0;
        tiers.each(function () {
            var match = /\$\s*<\/span>\s*([0-9.]+)/.exec($(this).html());
            if (match) {
                $('#p').empty();
                $('#p').append(match[1]);
                $('.info').append('<div>[quote][b]支付<b>$' + match[1] + '</b><span id=ag' + ++i + '></span>获得以下游戏：[/b]<br><span id=' + i + '></span>[/quote]</div>');
                if (i > 1) {
                    $('#ag' + i).append('再');
                }
            }
            $(this).find('.bundle-single-game').each(function () {
                var title = $($(this).find('h1')[0]).text();
                var hr = $(this).find('.game-steam-url').attr('href');
                match = /(app|sub|bundle)\/(\d+)/.exec(hr);
                if (match){
                    getGridContent(match[2], match[1], title, '#' + i, ++k);
                    var n = $(this).find('img');
                    if(n.length > 0){
                        $(n[0]).attr('src', `https://media.st.dl.bscstorage.net/steam/${match[1]}s/${match[2]}/header.jpg`);
                    }

                }

            });
        });
        $('.g').append(k);
        var regx = /amnt > ([0-9.]+)/g;
        var text = $('#order-form-box').text();
        i = 0;
        var j = 1;
        if ($('.happy-hour-link-cont').length > 0)
            j = 4;
        $('.info').append('<div><span style="color:#fdd915;">[color=#fdd915]欢乐时光期间选择礼物方式买一送三[/color]</span></div>');
        match = regx.exec(text);
        while (match) {
            $('.info').append('<div><span style="color:' + colors[i] + ';">[color=' + colors[i++] + ']支付超过$' + match[1] + '获得' + (i + 1) * j + '份完整包（每份$' + (match[1] / (i + 1) / j).toFixed(2) + '）[/color]</span></div>');
            match = regx.exec(text);
        }
        var n = $('#bundle-logo');
        if (n.length > 0) {
            var src = $(n[0]).attr('src');
            $(n[0]).remove();
            n = $('.bundle-claim-phrase');
            if (n.length > 0){
                $(n[0]).empty();
                $(n[0]).append(`<img src="${src}">`);
            }
        }
    });
} //indiegala bundle

var getRatio = function (a, b, f) {
    var c = `${a}_${b}`;
    var url = `https://free.currencyconverterapi.com/api/v5/convert?compact=ultra&q=${c}`;
    GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: function (response) {
            if (response.responseText){
                var j = JSON.parse(response.responseText);
                var r = j[c];
            }
            $('#r').empty();
            $('#r').append(r);
            f();
        }
    });
}; //KRWCNY,RUBCNY


var getGridHead = function (title) {
    $('.info').append('<div><span id="time"></span>' + title + '上线，<span id="early"></span><span id="p"></span>刀可获完整内容<br>[b]购买地址：<br>' + document.URL + '<br><br>包含<span class="g"></span>款游戏：[/b]</div>');
    $('.info2').append('<div>&lt;FONT size=2 face=黑体&gt;&lt;P&gt;' + title + '&amp;nbsp;慈善包&lt;/P&gt;&lt;P&gt;&lt;FONT color=#ff0000&gt;发货方式为激活码/礼物链接/包含ASF格式&lt;/FONT&gt;&lt;/P&gt;&lt;P&gt;包含<span class="g"></span>款STEAM游戏：&lt;/P&gt;&lt;P&gt;<span class="tb"></span>&lt;/P&gt;&lt;P&gt;&lt;/P&gt;&lt;/FONT&gt;</div>');
}; // grid head
var getGridContent = function (id, addon, name, tier, i) {
    $(tier).append('<div id=' + id + '>[url=http://store.steampowered.com/' + addon + '/' + id + '/]<b>' + name + '</b>[/url]</div>');
    $('.tb').append('<div id=tb_' + id + '>' + i + '.&amp;nbsp;<b>' + name + '</b></div>');
    $('.tb').append('<div>&lt;BR&gt;&lt;FONT color=#0055ff&gt;&amp;nbsp;&amp;nbsp;http://store.steampowered.com/' + addon + '/' + id + '/&lt;/FONT&gt;&lt;BR&gt;</div>');
    //getGameName(id, addon);
    //getGameRate(id, addon);
}; // grid content
var getGameName = function (id, addon) {
    var url = 'http://steamdb.sinaapp.com/' + addon + '/' + id + '/data.js?v=34';
    GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: function (response) {
            var match = /({.*});/.exec(response.responseText);
            if (match) {
                var data = JSON.parse(match[1]);
                if (data.name_cn) {
                    $('#' + id).append(' (' + data.name_cn + ')');
                    $('#tb_' + id).append(' (' + data.name_cn + ')');
                }
                var i = data.price_history.bundles.count;
                if (i > 0)
                    $('#' + id).append('[color=#32cd32][b]<span style="color:#32cd32;"> 进包' + i + '次</span>[/b][/color]');
                else
                    $('#' + id).append('[color=#fdd915][b]<span style="color:#fdd915;"> 首次进包</span>[/b][/color]');
            }
        }
    });
}; //cn name
var getGameRate = function (id, addon) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: 'http://store.steampowered.com/' + addon + '/' + id + '/?l=chinese',
        onload: function (response) {
            var res = $(response.responseText).find('span.game_review_summary');
            if (res.length > 0) {
                var review = $(res[0]).text();
                $('#' + id).append('[color=DeepSkyBlue][b] <span style="color:#66c0f4;">' + review + '</span>[/b][/color]');
                if (/好评/.exec(review))
                    $('#tb_' + id).append('&lt;FONT color=#66c0f4&gt;&amp;nbsp;<span style="color:#66c0f4;">' + review + '</span>&lt;/FONT&gt;');
            }
            var match = /集换式卡牌/.exec($(response.responseText).find('#category_block').text());
            if (match) {
                $('#' + id).append('[color=Red][b] <span style="color:#ff0000;">有卡</span>[/b][/color]');
                $('#tb_' + id).append('&lt;FONT color=#ff0000&gt;&amp;nbsp;<span style="color:#ff0000;">有卡</span>&lt;/FONT&gt;');
            }
            match = /DLC/.exec($(response.responseText).find('#category_block').text());
            if (match) {
                $('#' + id).append('[color=#b200ff][b]<span style="color:#b200ff;">（需要基础游戏才能运行）</span>[/b][/color]');
                $('#tb_' + id).append('&lt;FONT color=#b200ff&gt;&amp;nbsp;<span style="color:#b200ff;">（需要基础游戏才能运行）</span>&lt;/FONT&gt;');
            }
        }
    });
}; // game rate
