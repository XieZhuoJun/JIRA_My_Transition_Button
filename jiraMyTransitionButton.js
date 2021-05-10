// ==UserScript==
// @name         JIRA My Transition Button
// @version      1.0
// @description  Add transition buttons for JIRA
// @license MIT
// @author       zhuojun
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_xmlhttpRequest
// @match        https://*/secure/RapidBoard.*
// ==/UserScript==
var issueUrl = document.location.origin + "/rest/api/latest/issue/"

waitForKeyElements(
  ".ghx-swimlane-header",
  addButtons
)

function addButtons(jNode) {
  console.log("Test")
  var issuekey = jNode[0].getAttribute("data-issue-key")
  GM_xmlhttpRequest({
    method: 'GET',
    url: issueUrl + issuekey,
    onload: function (res) {
      if (res.status == 200) {
        var resContent = JSON.parse(res.responseText);
        jNode[0].children[0].children[3].children[0].innerText = resContent.fields.status.name
      }
    }
  });
  GM_xmlhttpRequest({
    method: 'GET',
    url: issueUrl + issuekey + "/transitions",
    onload: function (res) {
      if (res.status == 200) {
        var text = res.responseText;
        var json = JSON.parse(text);
        json.transitions.forEach(function (transition) {
          var button = document.createElement('button');
          button.setAttribute('id', 'test' + issuekey + transition.name)
          button.setAttribute("class", "aui-button")
          button.setAttribute('data-issue-key', issuekey)
          button.setAttribute('transition', transition.name)
          button.style = "margin-left:2px"
          var span = document.createElement('span');
          span.innerText = transition.name;
          button.appendChild(span);
          button.onclick = function () {
            console.log(issuekey + transition.name)
            window.event.cancelBubble = true;
            var data = {
              "transition": {
                "id": transition.id
              }
            };
            GM_xmlhttpRequest({
              method: "POST",
              headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json",
                "User-Agent": "lolol"
              },
              url: issueUrl + issuekey + "/transitions",
              dataType: 'json',
              contentType: 'application/json',
              overrideMimeType: 'application/json',
              data: JSON.stringify(data),
              onload: function (response) {
                console.log(response);
                if (response.status == 204) {
                  document.getElementsByClassName("aui-nav-selected")[0].children[0].click()
                }
              }
            })
          };
          jNode[0].children[0].appendChild(button)
        })
      }
    }
  })
}
