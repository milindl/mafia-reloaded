// This contains a collection of some oft used functions

function loadScript(location) {                  // Dynamically loads a javascript file for use
  js = document.createElement("script");
  js.src = location;
  js.id = "sandboxScript";
  document.body.appendChild(js);
}
function timer(interval, callbackEnd, callPerSecond) { //Timer function
  /*
  Usage: timer(intervalInSeconds, functionToBeCalledWhenTimeUp, functionToBeCalledPerSecond(timeElapsed))
  */
  var initialTime = Date.now();
  // Interval should be in seconds
  //Call per second gets the diff as well
  var _timer = setInterval(function() {
    var diff = Date.now() - initialTime;
    callPerSecond.call(this, Math.floor(diff/1000));
    if((diff/1000)>=interval) {
      clearInterval(_timer);
      callbackEnd.call(this);
    }
  }, 900);
}

function voteBankString(voteBank) {
  var keys = Object.keys(voteBank);
  var st = "";
  for(var i=0; i!=keys.length; i++) {
    st += "<br>" + keys[i] + " : " + voteBank[keys[i]];
  }
  return st;
}

function setupVoting(roundTime) {
  round="#vote";
  document.getElementById("voting-for").innerHTML = "";
  voteBank = {};
  var rboxes = document.getElementsByClassName("radio-for-player");
  var endVote;
  var sendVote = function(e){
    var selected = document.player_names.selected_player.value;
    ws.send("#VOTE:"+selected.substring("radio-for-".length));
  };
  endVote = function() {

    for(var i=0; i!=rboxes.length; i++) {
      rboxes[i].style.display = "none";
      rboxes[i].checked = false ;
      rboxes[i].removeEventListener("change", sendVote);
    }
    ws.send("#DONE_VOTING");
  };


  for(var i=0; i!=rboxes.length; i++) {
    rboxes[i].style.display = "";
    rboxes[i].addEventListener("change", sendVote);
  }
  timer(roundTime,endVote, function(){});
}
