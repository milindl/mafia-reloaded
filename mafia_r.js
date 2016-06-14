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

function setupVoting(roundTime, gameState) {
  gameState.voteState = {};
  gameState.populateForm();
  //TODO: It makes me queasy to have to touch the HTML code OUTSIDE the decorate function - definite need to refactor this bit. It's frequently used, too
  var radioButtons = document.getElementsByClassName("players");
  var labels = document.getElementsByClassName("players-label");
  var endVote;
  var sendVote = function(e){
    var selected = false;
    for(var i=0; i!=radioButtons.length; i++) {
      if(radioButtons[i].checked==true) {
        selected = radioButtons[i].value;
        ws.send("#VOTE:"+selected);
        if(gameState.round=="#VOTE_ANON") gameState.decorate("");
        console.log("You've clicked on " + selected);
        break;
      }
    }

  };
  endVote = function() {

    for(var i=0; i!=radioButtons.length; i++) {
      radioButtons[i].removeEventListener("change", sendVote);
      radioButtons[i].checked = false ;
    }
    gameState.sanitizeForm();
    ws.send("#DONE_VOTING");
  };


  for(var i=0; i!=radioButtons.length; i++) {
    radioButtons[i].addEventListener("change", sendVote);
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
GameState.prototype.initiate = function () {
  //Initiate with username, type, team, detection-result
  document.getElementById("username").lastChild.innerHTML = this.username;
  document.getElementById("type").lastChild.innerHTML = this.type;
  if(this.type=="Victim") {
    document.getElementById("team").style.display = "none";
  }
  else {
    var place = document.getElementById("team").lastChild;
    place.innerHTML = "";
    for(var i=0; i!=this.teamNames.length; i++) {
      place.innerHTML += "<br>" + this.teamNames[i];
    }
  }
  if(this.type!="Detective") {
    document.getElementById("detection-result").style.display="none";
  }
};
GameState.prototype.populateForm = function () {
  this.sanitizeForm();
  var form = document.getElementById("voting-form");
  var nameKeys = Object.keys(this.names);
  for(var i=0; i!=nameKeys.length; i++) {
    if(this.names[nameKeys[i]]==false) continue;
    var radioButton = document.createElement("input");
    var label = document.createElement("label");
    var voteSpan = document.createElement("span");
    radioButton.name="players";
    radioButton.type="radio";
    radioButton.className="players";
    radioButton.value = "" + nameKeys[i];
    radioButton.id = "players-"+nameKeys[i];
    voteSpan.id = "others-"+nameKeys[i];
    if(i%2==0) label.className = "alter ";
    label.className += "players-label"
    label.appendChild(radioButton);
    label.appendChild(document.createTextNode(nameKeys[i]));
    label.appendChild(voteSpan);
    form.appendChild(label);
    //TODO: Add functionality as well as decor
  }
};
GameState.prototype.sanitizeForm = function () {
  document.getElementById("voting-form").innerHTML="";
};
GameState.prototype.decorate = function(status) {
  //This has the task of filling up the template from the GameState Object
  if(status!="") {
    document.getElementById("status").lastChild.innerHTML = status;
  }
  //Now to add the names and the entire shebang if it is a voting round.
  if(this.round == "#MAFIA_VOTE" || this.round == "#DETECTIVE_VOTE" || this.round == "#VOTE_OPEN") {
    var voteKeys = Object.keys(this.voteState);
    var nameKeys = Object.keys(this.names);
    //Need to clear the voteSpans

    for(var i=0; i!=nameKeys.length; i++) {
      if(this.names[nameKeys[i]] == false) continue;

      console.log("Trying for.... " + nameKeys[i])
      document.getElementById("others-"+nameKeys[i]).innerHTML = "";

    }
    for(var i=0; i!=voteKeys.length; i++) {
      var voter = voteKeys[i];
      var votee = this.voteState[voteKeys[i]];
      var voteSpan = document.getElementById("others-"+votee);
      if(voteSpan) voteSpan.innerHTML+=" " + voter + " ";
    }
  }
  if(this.round == "#VOTE_ANON") {
    var radioButtons = document.getElementsByClassName("players");
    for(var i=0; i!=radioButtons.length; i++) {
      if(radioButtons[i].checked==true) {
        document.getElementById("others-" + radioButtons[i].value).innerHTML = "You";
      } else {
        document.getElementById("others-" + radioButtons[i].value).innerHTML = "";        
      }
    }
  }
};
GameState.prototype.splash = function (text, duration, callback) {
  var sscreen = document.getElementById("splash");
  sscreen.innerHTML = "";
  var h1 = document.createElement("h1");
  h1.appendChild(document.createTextNode(text));
  sscreen.appendChild(h1);
  if(duration == 0) {
    var button = document.createElement("div");
    button.id = "done-button";
    button.appendChild(document.createTextNode("Done"));
    button.onclick = function() {
      sscreen.style.display = "none";
      callback.call(window);
    };
    sscreen.appendChild(button);
  } else {
    timer(duration, function() {
      sscreen.style.display = "none";
      callback.call(window);
    }, function(s){});
  }
  sscreen.style.display = "block";
};
