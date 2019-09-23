// ==UserScript==
// @name         wows code redeem
// @namespace    http://tampermonkey.net/
// @version      2019.09.18.1
// @description  wows code auto redeem
// @author       jacky
// @match        https://asia.wargaming.net/shop/redeem/
// @require     http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @grant        none
// ==/UserScript==

$('.form-row').after('<div><textarea id="a" style="margin: 0px; width: 100%; height: 100px;" maxlength="1080"></textarea><input type="button" id="b" value="REDEEM"></div><div id="d"></div>');

$('#b').click(function(){
    $('#d').empty();
    var m = /wgnps_shop_csrftoken=([^=;]+);/.exec(document.cookie);
    if (m){
        var text = $.trim($('#a').val());
        $.each(text.split('\n'), function (k, v) {
            var code = v;
            setTimeout(function () {
                $.ajax({
                    url: '/shop/redeem/',
                    type: "POST",
                    data: {
                        bonus_code: code,
                        csrfmiddlewaretoken: m[1]
                    },
                    success: function( data, status, xhr ){
                        var j = JSON.parse(data);
                        // {"status": "processing", "status_url": "/shop/external/status/1add9312047aaa1240a30c217ba766fa/"}
                        var url = j.status_url;
                        if (url){
                            setTimeout(function () {
                                $.ajax({
                                    url: url,
                                    type: "GET",
                                    success: function( data, status, xhr ){
                                        j = JSON.parse(data);
                                        // {"status": "ok", "data": {"message": "Success", "error_code": 0}}
                                        // {"status": "ok", "data": {"message": "Invalid bonus code", "error_code": 3}}
                                        if (j.status == "ok")
                                            $('#d').append(`<p>${code} : ${j.data.message}</p>`);
                                    },
                                    fail: function( data, status, xhr ){
                                        $('#d').append(`<p>${code} : ${status}</p>`);
                                    }
                                });
                            },3000);
                        } else {
                            $('#d').append(`<p>${code} : error</p>`);
                        }
                    },
                    fail: function( data, status, xhr ){
                        $('#d').append(`<p>${code} : ${status}</p>`);
                    }
                });
            }, 3000 * k);
        });
    } else {
        alert('cookie error');
    }
});