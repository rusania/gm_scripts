// ==UserScript==
// @name        ig_bundles_link
// @namespace    ig_bundles_link
// @description ig bundles new window links
// @include     https://www.indiegala.com/ajaxprofile_sale_tab?user_id=*
// @icon        http://www.indiegala.com/favicon.ico
// @updateURL 	https://github.com/rusania/gm_scripts/raw/master/ig_bundles_link.user.js
// @downloadURL https://github.com/rusania/gm_scripts/raw/master/ig_bundles_link.user.js
// @version     2019.11.18.1
// @run-at      document-end
// @require     http://libs.baidu.com/jquery/1.10.1/jquery.min.js
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// ==/UserScript==

GM_addStyle("table{border:solid 1px;border-collapse:collapse !important;}");
GM_addStyle("td{border:solid 1px;border-collapse:collapse;padding-left:5px;padding-right:5px;font-family:simsun !important;}");
GM_addStyle("div{font-family:simsun !important;}");

var uid = '';
var m = /user_id=([0-9a-f]+)/.exec(document.URL);
if (m)
    uid = m[1];

var tp = $('#title-p');
if (tp.length > 0){
    $('#title-p').after('<div><a id="ajax">AJAX</a></div>');
    // \"bundles-list\"
    m = /id=([0-9a-f]+)/.exec(document.URL);
    if (m)
        $('#title-p').after(`<div><a href="/ajaxprofile_sale_tab?user_id=${m[1]}" target="_blank">URL</a></div>`);
}
document.body.innerHTML = document.body.innerHTML.replace(/\\r|\\n|\\t/ig, '');
document.body.innerHTML = document.body.innerHTML.replace(/\\&quot;/ig, '');
$('#collapseGiveaway').empty();
var bl = $('#bundles-list');
var nv = $('#accordion2').find('.nav-toggle');
if (nv.length > 0){
    if (bl.length > 0){
        bl.before('<table id="bl"></table>');
        bl.before('<div><a id="ajax">AJAX</a></div>');
        bl.before('<div><a id="lib">LIB</a></div>');
        bl.before(`<form id="f" action="http://176.122.178.89/ig_sale.php?c=sale&u=${uid}" method="post" target="_blank"></form>`);
        nv.each(function () {
            var id = $(this).attr('id');
            text = $(this).text()
            $("#bl").append(`<tr id="${id}"><td>${id}</td><td><a href="/ajaxsale?sale_id=${id}" target="_blank">${text}</a></td</tr>`);
            $('#f').append(`<input type="hidden" name="${id}" value="${text}" />`);
        });
        $('#f').append('<input type="submit" value="Submit" />');
    }
}

$('#lib').click(function(){
    GM_xmlhttpRequest({
        method: 'GET',
        url: 'http://198.181.32.5/ig_sale.php?c=ss&p=pf&q=' + uid,
        onload: function (response) {
            var data = JSON.parse(response.responseText);
            $.each(data, function (i, g) {
                var tr = $('#' + g.id);
                tr.append(`<td>${g.dt}</td>`);
                tr.append(`<td>${g.gift}</td>`);
                tr.append(`<td>${g.lmt}</td>`);
            });
        }
    });
});

$('#ajax').click(function(){
    $('.nav-toggle').each(function () {
        var match = /#current_sale_(\d+)/.exec($(this).attr('href'));
        var text = $(this).text();
        var a = `<h4 class="panel-title"><a href="/ajaxsale?sale_id=${match[1]}" target="_blank"><font color="red">${text}</font></a></h4>`;
        $(a).insertAfter($(this).parent());
    });

});
