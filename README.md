# MAFIA reloaded

Mafia is a common game played by people when they are bored and in large groups. Mostly, things are done by choosing a "God" and then closing your eyes when "God" says so. This often leads to semi-open eyes and so on. This is designed to complement the actual game and remove the need for a "God" in the game.
I've included the game instructions on the index.html page, but they are only pointers, you're better off searching the internet.

### Usage Instructions
You need `python3` installed, and an _up to date_ web browser.
I use a technology called WebSockets, which is relatively new, thus you need a good browser.
There is no other direct dependancy.
On separate terminals, invoke the following commands:

```shell
$cd (directory of code)
$python3 -m http.server 8888
```

and

```shell
$cd (directory of code)
$python3 mafia_game.py [number_of_players]
```
After this, you may access the game by navigating to http://(ip_of_pc_where_server_started):8888/
If you do not specify the number of players, the default is 6.
The game doesn't start until all of the players have joined and chosen a username for themselves.
Also , currently it only works on localhost. I need to make a few changes so that it can be extended to all addresses :P 
