// ==UserScript==
// @name        hb_subs_info
// @namespace   http://tampermonkey.net/
// @description hb subscription info
// @include     http*://www.humblebundle.com/subscription/*
// @include     http*://www.humblebundle.com/membership/*
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/hb_subs_info.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/hb_subs_info.user.js
// @connect     steamdb.info
// @grant       unsafeWindow
// @version     2022.02.08.1
// @run-at      document-body
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_setClipboard
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse;font-size:16px !important;}");
GM_addStyle("tr,td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px !important;}");
GM_addStyle(".d{font-size:16px;color:white !important;}");

window.addEventListener ("DOMContentLoaded", DOM_ContentReady);
window.addEventListener ("load", pageFullyLoaded);

// https://www.humblebundle.com/api/v1/subscriptions/humble_monthly/subscription_products_with_gamekeys/
// https://www.humblebundle.com/api/v1/subscriptions/humble_monthly/subscription_products_with_gamekeys/${cursor}

var j = $("#webpack-subscriber-hub-data,#webpack-monthly-product-data");
var m = /csrf_cookie=([^;]+);/.exec(document.cookie);
var csrf, txt;
if (m)
    csrf = m[1];

function DOM_ContentReady () {
    $("body").on('click', '#p', function(){
        GM_setClipboard(txt);
    });

    var d;
    $('.base-main-wrapper').before('<div style="background-color:#494f5c;" class="d" id="a1"></div>');
    if (j){
        txt = j.text();
        $('#a1').append('<p><a id="p">JSON</a></p>');
        j = JSON.parse(txt);
        if (j && j.contentChoiceOptions) {

            d = new Date(`${new Date(j['subscriptionJoinDate|datetime'])}+00:00`).toLocaleString();
            $('#a1').append(`<p>${d}</p>`);
            d = new Date(`${new Date(j['subscriptionExpires|datetime'])}+00:00`).toLocaleString();
            $('#a1').append(`<p>${d}</p>`);
            $('#a1').append(`<p>${j.userSubscriptionPlan.human_name}</p>`);

            if(j.payEarlyOptions){
                d = new Date(`${new Date(j.payEarlyOptions['activeContentStart|datetime'])} UTC`).toLocaleString();
                $('#a1').append(`<p>${d}</p>`);
                $('#a1').append(`<p>${j.payEarlyOptions.productMachineName}</p>`);
            }
            $('#a1').append(`<p><a target=_blank href="/membership/${j.contentChoiceOptions.productUrlPath}">${j.contentChoiceOptions.title}</a></p>`);
            var f = j.contentChoiceOptions.gamekey ? true : false;
            var gamekey, made=[];
            if (f){
                gamekey = j.contentChoiceOptions.gamekey;
                if (j.contentChoiceOptions.contentChoicesMade)
                    made = j.contentChoiceOptions.contentChoicesMade.initial.choices_made;
                $('#a1').append(`<p><a target=_blank href="/?key=${gamekey}">${gamekey}</a></p>`);
            }
            var g, order;
            if (j.contentChoiceOptions.usesChoices) {
                $('#a1').append(`<p>${j.contentChoiceOptions.contentChoiceData.initial.total_choices}</p>`);;
                g = j.contentChoiceOptions.contentChoiceData.initial.content_choices;
                order = j.contentChoiceOptions.contentChoiceData.initial.display_order;

            } else {
                g = j.contentChoiceOptions.contentChoiceData.game_data;
                order = j.contentChoiceOptions.contentChoiceData.display_order;
            }
            $('#a1').append('<table id="b"></table>');
            $('#a1').append(`<p>Key:</p>`);
            $('#a1').append('<table id="c"></table>');
            var n = 1;
            $.each(order, function (i, e) {
                $('#b').append(`<tr id="${e}"></tr>`);
                var claim = '';
                if (f && $.inArray(e, made) > -1)
                    $(`#${e}`).css("background-color", "blue");
                else
                    claim = `<a href="javascript:void(0);" onclick="choice('${gamekey}', '${e}');">Claim</a>`;
                $(`#${e}`).append(`<td>${(i+1)}</td><td>${g[e].title}<br>${e}</td><td>${g[e]['msrp|money'].amount}</td><td>${g[e].delivery_methods.join()}</td><td>${claim}</td>`);
                if (g[e].tpkds){
                    $.each(g[e].tpkds, function (k, item) {
                        var app = '';
                        var id = item.steam_app_id;
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
                $('#b').append(`<tr><td>${(i+1)}</td><td>${e.human_name}<br>${e.machine_name}</td><td></td><td>${e.types.join()}</td><td></td><td></td></tr>`);
            });
        }
    }
}

function pageFullyLoaded () {

}

unsafeWindow.choice = function(a, b){
    /*
    https://www.humblebundle.com/api/v1/analytics/content-choice/content-tile/click/march_2021_choice/control
    POST
    https://www.humblebundle.com/humbler/choosecontent
    POST  gamekey=BRHPBYPurSBeEhfP&parent_identifier=initial&chosen_identifiers%5B%5D=control
    POST  gamekey=BRHPBYPurSBeEhfP&parent_identifier=control&chosen_identifiers%5B%5D=control_steam
    */
    $.ajax({
        url: '/humbler/choosecontent',
        type: "POST",
        data : {
            gamekey : a,
            parent_identifier : 'initial',
            'chosen_identifiers[]' : b
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("csrf-prevention-token", csrf);
        },
        dataType:'json',
        success: function(data){
            // {force_refresh: true, success: true}
            // {errors: {_all: ["Invalid request."]}, success: false}
            // {"errors": {"dummy": ["You have no choices remaining. Please refresh this page to see your choices."]}, "success": false}
            if (data.success)
                $(`#${b}`).css("background-color","blue");
            else{
                $(`#${b}`).attr('title', JSON.stringify(data.errors));
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