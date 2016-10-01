#Documentation

I've prepared a list of what the websocket server sends and how you are supposed to respond to it.
Also, sometimes, you need to initiate the sending.

##Pre-round1: Type round
This round is a basic round to wait it out till all players connect to the websocket server.

What you need to send it at this point:


`WebSocket("ws://hostname:7000/", subprotocol = [username])`


What you will get back:


`"#NAMES:user1,user2,user3,user4"`


where user1 etc are the names of other users.
This will be followed by the server's message

`#TYPE:[Victim,Mafia,Detective]`

Typically at this point you may need to load additional resources if you are in the mafia or a detective, since mafia ~ victim+killing and detective ~ victim+detection.
To acknowledge that this resource is loaded, you need to send

`#LOADED_MAFIA_JS` or `#LOADED_DETECTIVE_JS`

to the server. 

On acknowledgement, the server will send you

`#MAFIA_NAMES:user1,user2,user3`

and correspondingly

`#DETECTIVE_NAMES:user1,user2,user3`

Victims will not get anything during this period.


## Round1: Mafia Round

The Mafia gets

`#MAFIA_VOTE`

sent by the server at this time. The others get nothing.

You as the client can send out

`#VOTE:user1` and `#DONE_VOTING`

when you are done. This gives the client the job of timekeeping for the round, which is fairer since any lag in communication may lead to mishaps. 

The server will send out

`#VOTE:voter:votee`

whenever anyone votes, if it is an open vote, and you can update your screen accordingly.

## Round2: Detective Round

This round is identical to the above round except that all "MAFIA" is replaced with "DETECTIVE".

However, when the voting ends, the server sends out `#DETECTION_RESULT:user1:True/False` to all the detectives.


## Round3: Anonymous Voting Round
x
This round is started by the server sending out

`#KILLED:user1` followed by `#VOTE_ANON`

Ideally, the detectives should be able to see their detection results in this round only. 

As in the above voting rounds, you can send out

`#VOTE:user1` and `#DONE_VOTING`

however, the server doesn't send anything to you.


## Round4: Discussion Round

This round is designed for human interaction between the players. The server sends out

`#DISCUSSION:user1,user2`

where user1 and user2 are the most-voted-for users in the anon voting round.

The client needs to send out

`#DONE_DISCUSSION`

when it's satisfied with the discussion. All client need to send this to end this round.

### Round5: Open Voting Round

The server sends out

`#VOTE_OPEN`

to the client to initiate the open voting round. This is followed by the usual voting, where the client can send out

`#VOTE:user1` and `#DONE_VOTING`

and the server sends our

`#VOTE:voter:votee`

on a user vote.

At the end of this round, the server sends out a message

`#ELIMINATED:user1:True`

where the True/False indicated whether user1 was in the Mafia or not.


## End Conditions

* \#mafia = 0 : the server sends out `#WIN:CITIZEN`
* \#victims + #detectives < #mafia : the server sends out `#WIN:MAFIA`


This repeats as long as needed.