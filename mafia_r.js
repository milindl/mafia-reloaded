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

function GameState() {
  this.username = "";
  this.type = "";                         // Potential for an error?
  this.names = {};
  this.round = "";
  this.voteState= {};
  this.teamNames = [];
}
GameState.prototype.toString = function() {
  var repr = "";
  repr+="Username:" + this.username + "<br>";
  repr+="Type: " + this.type + "<br>";
  repr += "List of people: <br>";
  var keys = Object.keys(this.names);
  for(var i=0; i!=keys.length; i++) {
    repr+=keys[i] + " : " + this.names[keys[i]] + "<br>";
  }
  repr+="Round: " + this.round + "<br>";
  repr+="State of the vote: <br>";
  keys =  Object.keys(this.voteState);
  for(var i=0; i!=keys.length; i++) {
    repr+=keys[i] + " votes for " + this.voteState[keys[i]] + "<br>";
  }
  if(this.type!="Victim"){
    repr+="List of people belonging to the team: <br>";
    for(var i=0; i!=this.teamNames.length; i++) {
      repr+="" + this.teamNames[i] + "<br>";
    }
  }
  return repr;
};
GameState.prototype.decorate = function() {
  return "will present well formatted HTML once done.";
};
