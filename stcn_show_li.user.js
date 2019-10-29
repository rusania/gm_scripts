// ==UserScript==
// @name         stcn_show_li
// @namespace    http://tampermonkey.net/
// @version      2019.10.29.1
// @description  try to take over the world!
// @author       jacky
// @match        https://keylol.com/t*
// @connect     keylol.com
// @grant       unsafeWindow
// @grant       GM_xmlhttpRequest
// @run-at      document-end
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// ==/UserScript==

$('#threadindex').before('<a id="a">show</a>');
$('#threadindex').after('<div id="b"></div>');
$('#a').click(function(){
    $('#b').empty();
    var l = $('#threadindex .tindex ul li');
    if (l.length >0){
        var t = $(l[0]).attr('onclick');
        var m = /tid=(\d+)&viewpid=(\d+)/.exec($(l[0]).attr('onclick'));
        if (m){
            var u = `/forum.php?mod=viewthread&tid=${m[1]}&extra=page%3D1&mobile=2`;
            GM_xmlhttpRequest({
                method: "GET",
                url: u,
                headers: {
                    "User-Agent":" Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
                },
                onload: function(response) {
                    var s = $(response.responseText).find("#pid" + m[2] +" .pi .message");
                    if(s)
                        $('#b').append(s);
                },
                onerror:  function(response) {
                    $('#b').append(response.statusText);
                },
                ontimeout:  function(response) {
                    $('#b').append(response.statusText);
                },
            });
        }
    }
});