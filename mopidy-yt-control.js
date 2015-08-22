// ==UserScript==
// @name        mopidy-yt-control
// @namespace   https://github.com/bedzkowp/mopidy-yt-control
// @include     https://*youtube.tld/results*
// @grant       GM_addStyle
// @version     1
// @noframes
// ==/UserScript==


GM_addStyle ( '                \
  .mopidyButton                \
  {                            \
    margin-right: 5px;         \
    border: 1px solid #CCC;    \
    padding: 1px 5px 1px 5px;  \
  }                            \
                               \
  .mopidyButton:hover          \
  {                            \
   background: yellow;         \
  }                            \
' );
             
             
function mopidyNextTrack()
{
  var htr = new XMLHttpRequest();
  htr.onreadystatechange = onResponse;
  htr.open("POST", "https://banana/mopidy/rpc", true);
  htr.send('{"jsonrpc": "2.0", "id": 1, "method": "core.playback.next"}');
  
  function onResponse() {
    if (htr.readyState === 4) {
      if (htr.status === 200) {
        console.log(htr.responseText);
      } else {
        console.log('There was a problem with the request.');
      }
    }
  }
  
}

function mopidyAddToQueue(ytVideoId, mopidyPosition = null, now = false)
{
  var ytLink = 'yt:https://www.youtube.com/watch?v=' + ytVideoId;
  
  if(mopidyPosition === null)
    {
      mopidyPosition = "null";
    }
  
  var htr = new XMLHttpRequest();
  htr.onreadystatechange = onResponse;
  htr.open("POST", "https://banana/mopidy/rpc", true);
  htr.send('{"jsonrpc": "2.0", "id": 1, "method": "core.tracklist.add", "params": [null,' + mopidyPosition + ',"' + ytLink + '"]}');
  
  function onResponse() {
    if (htr.readyState === 4) {
      if (htr.status === 200) {
        console.log(htr.responseText);
        if(now == true)
          {
            mopidyNextTrack();
          }
      } else {
        console.log('There was a problem with the request.');
      }
    }
  }
  
}

function mopidyPlayAfterTlid(ytVideoId, tlid, now = false)
{
  var htr = new XMLHttpRequest();
  htr.onreadystatechange = onResponse;
  htr.open("POST", "https://banana/mopidy/rpc", true);
  htr.send('{"jsonrpc": "2.0", "id": 1, "method": "core.tracklist.index", "params": [null,' + tlid + '] }');
  
  function onResponse() {
    if (htr.readyState === 4) {
      if (htr.status === 200) {
        
        console.log(htr.responseText);
        
        response = JSON.parse(htr.responseText);
        console.log(response.result);
        
        mopidyAddToQueue(ytVideoId, response.result + 1, now);
               
      } else {
        console.log('There was a problem with the request.');
      }
    }
  }
    
  
}

function mopidyPlayNext(ytVideoId, now = false)
{
  var htr = new XMLHttpRequest();
  htr.onreadystatechange = onResponse;
  htr.open("POST", "https://banana/mopidy/rpc", true);
  htr.send('{"jsonrpc": "2.0", "id": 1, "method": "core.playback.get_current_tl_track"}');
  
  function onResponse() {
    if (htr.readyState === 4) {
      if (htr.status === 200) {
        
        console.log(htr.responseText);
        
        response = JSON.parse(htr.responseText);
        console.log(response.result.tlid);
        
        mopidyPlayAfterTlid(ytVideoId, response.result.tlid, now);
        
        
        
        
      } else {
        console.log('There was a problem with the request.');
      }
    }
  }
  
}


function modifyUI()
{
  
  console.log("go");
  console.log(window.self);
  console.log(document.URL);
  console.log(window.location.href);
  console.log("UWAGA   ");
  console.log(window==window.top);
  console.log(window.parent==window.top);

  var videosList = window.top.document.querySelectorAll('[data-context-item-id]');
  console.log(videosList);
  
  for(var i = 0; i < videosList.length; i++)
  {
    var videoId = videosList[i].getAttribute("data-context-item-id");
    console.log(videoId);
    
    
    var addToQueueButton = window.top.document.createElement("button");
    addToQueueButton.appendChild(window.top.document.createTextNode("Add to queue"));
    addToQueueButton.className = "mopidyButton";
    addToQueueButton.vId = videoId
 
    
    addToQueueButton.onclick = function() {
      console.log("addToQueue: " + this.vId);
      mopidyAddToQueue(this.vId);
    }
    
    videosList[i].appendChild(addToQueueButton);

    
    var playNextButton = document.createElement("button");
    playNextButton.appendChild(document.createTextNode("Play next"));
    playNextButton.className = "mopidyButton";
    playNextButton.vId = videoId
    
    playNextButton.onclick = function() {
      console.log("playNext: " + this.vId);    
      mopidyPlayNext(this.vId);
    }
    
    videosList[i].appendChild(playNextButton);
    
    
    var playNowButton = document.createElement("button");
    playNowButton.appendChild(document.createTextNode("Play now"));
    playNowButton.className = "mopidyButton";
    playNowButton.vId = videoId
    
    playNowButton.onclick = function() {
      console.log("playNow: " + this.vId);     
      mopidyPlayNext(this.vId, true);
    }
    
    videosList[i].appendChild(playNowButton);

  }  
}

function main()
{
  console.log("test");
  console.log(location.href);
  
  modifyUI();
  
  setInterval(
    function()
    {
      if(window.top.document.getElementsByClassName("mopidyButton").length == 0) modifyUI();
    }, 500);
}
main();