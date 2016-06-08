ws.removeEventListener("message",dealMessage);
ws.addEventListener("message", dealMafiaMessage);
ws.send("#LOADED_MAFIA_JS");
//Certain anonymous functions to make spaces in the player-panel
(function() {
  var mafia_list = document.createElement("ul");
  mafia_list.appendChild(document.createTextNode("Your Mafia brothers are:"))
  mafia_list.id = "player-names-mafia";
  document.getElementById("player-type").appendChild(mafia_list);
}).call(window);


var mafiaPlayers = null;
var vote_bank = {};
function vote_bank_string(vote_bank) {
  var keys = Object.keys(vote_bank);
  var st = "";
  for(var i=0; i!=keys.length; i++) {
    st += "<br>" + keys[i] + " : " + vote_bank[keys[i]];
  }
  return st;
}
function dealMafiaMessage(e) {
  console.log("dealMafiaMessage: " + e.data);
  var message = e.data.toString()
  if(message.indexOf("#MAFIA_NAMES:") == 0){
    //Need to populate mafia list
    mafiaPlayers = message.substring("#MAFIA_NAMES:".length).split(",");
    for(var i=0; i!=mafiaPlayers.length; i++) {
      var mplayer = document.createElement('li');
      mplayer.appendChild(document.createTextNode(mafiaPlayers[i]));
      document.getElementById("player-names-mafia").appendChild(mplayer);
    }
  }
  if(message.indexOf("#MAFIA_VOTE") == 0) {
    round="#vote";
    document.getElementById("voting-for").innerHTML = "";
    vote_bank = {};
    var rboxes = document.getElementsByClassName("radio-for-player");
    var endVote;
    var sendVote = function(e){
      var selected = document.player_names.selected_player.value;
      ws.send("#VOTE:"+selected.substring("radio-for-".length));
      timer(10, endVote, function(){});
    };
    endVote = function() {
      for(var i=0; i!=rboxes.length; i++) {
        rboxes[i].style.display = "none";
        rboxes[i].removeEventListener("change", sendVote);
      }
      ws.send("#DONE_VOTING");
    };


    for(var i=0; i!=rboxes.length; i++) {
      rboxes[i].style.display = "";
      rboxes[i].addEventListener("change", sendVote);
    }
  }
  if(message.indexOf("#VOTE:")==0) {
    var ms = message.split(":")
    voter = ms[1]
    votee = ms[2]
    vote_bank[voter] = votee;
    document.getElementById("voting-for").innerHTML = "" + vote_bank_string(vote_bank);
  }
}
