var gs = new GameState();
var players = [];
var usrname = window.location.toString().split("?username=")[1]
var ws = new WebSocket("ws://localhost:7000", usrname);
ws.onopen = function(e) {
  ws.addEventListener("message", dealMessage);
};
ws.onerror = function(e) {
  alert("Error".toString());
};

var stillAlive = true;
function dealMessage(e) {
  var message = e.data.toString();
  console.log(message);
  if(message.indexOf("#TYPE:")==0) {
    type = message.substring(6);
    gs.username = usrname;
    gs.type = type;
    if(type=="Mafia") loadScript("player_mafia.js");
    if(type=="Detective") loadScript("player_detective.js");
    if(type=="Victim") {
      gs.initiate();
      gs.decorate("It's time to start a game of MAFIA");
    }
    return;
  }
  if(message.indexOf("#NAMES:") == 0) {
    players = message.substring(7).split(",");
    for(var i=0; i!=players.length; i++) {
      gs.names[players[i]] = true;
    }
  }
  if(message.indexOf("#KILLED:")==0) {
    var ms = message.split(":")[1];
    gs.names[ms] = false;
    gs.decorate(ms + " has died :(");
  }
  if(message.indexOf("#VOTE:")==0) {
    var ms = message.split(":");
    voter = ms[1];
    votee = ms[2];
    gs.voteState[voter] = votee;
    gs.decorate("");
  }
  if(message.indexOf("#VOTE_ANON")==0) {
    gs.round = "#VOTE_ANON";
    setupVoting(15, gs);
  }
  if(message.indexOf("#DISCUSSION:") == 0) {
    gs.round = "#DISCUSSION";
    var maxVotes = message.split(":")[1].split(",");
    var mes = "It's time to discuss. " + maxVotes[0] + " and " + maxVotes[1] + " are under the most suspicion. They speak first, then press the button when you've spoken to your satisfaction"
    gs.splash(mes,0, function() {ws.send("#DONE_DISCUSSION");});
    // document.getElementById("round-name").innerHTML = "Discussion round is on <br>";
    // document.getElementById("discussion-round").style.display="";
    // document.getElementById("discussion-round-announcement").innerHTML = maxVotes[0] + " and " + maxVotes[1] + " are under the highest suspicion. They get to speak first, then everyone speaks. Press the button after you're done!";
    // var discussionRoundHandler = function(e) {
    //   document.getElementById("discussion-round-announcement").innerHTML = "";
    //   document.getElementById("discussion-round").style.display="none";
    //   ws.send("#DONE_DISCUSSION");
    //   document.getElementById("discussion-round-done").removeEventListener("click",discussionRoundHandler);
    // }
    // document.getElementById("discussion-round-done").addEventListener("click",discussionRoundHandler);
  }

  if(message.indexOf("#VOTE_OPEN") == 0) {
    gs.decorate("It's the open vote.");
    gs.round = "#VOTE_OPEN";
    setupVoting(15, gs);
  }


  if(message.indexOf("#ELIMINATED:")==0) {
    var ms = message.split(":");
    gs.names[ms[1]] = false;
    if(ms[1]==gs.username) {
      gs.splash("You've been eliminated in this round. Sorry for that :(", 0, function() {document.body.style.display = "";});
      ws.close();
      return;
    }
    if(gs.names[gs.username] == false) {
      gs.splash("You've been killed in this round. Sorry for that :(", 0, function() {document.body.style.display = "";});
      ws.close();
      return;
    }
    var tf = (ms[2]=="True")?"":"not";
    gs.splash(ms[1] + " has been eliminated. He was " + tf + " a mafia.", 2, function(){});

  }
}
