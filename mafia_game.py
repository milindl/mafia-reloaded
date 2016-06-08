from server import WebServerSocket
import threading,time

class MafiaGame:
    def __init__(self):
        ''' Define all init variables and start a thread for the WebServerSocket '''
        self.round = ""
        self.victims = []
        self.mafias = []
        self.detectives = []
        self.wssock = WebServerSocket()
        threading.Thread(target = self.wssock.start, daemon=True).start()

    def type_round(self):
        ''' Waits till all users have joined and then assigns them type and sends namelists'''
        while len(self.wssock.client_list)!=6:   # Wait till we're done with connections
            pass
        self.wssock.send(self.wssock.client_list, "#NAMES:" + ",".join([str(cl) for cl in self.wssock.client_list]))

        # TODO: Make this assignment random, not like it is now.
        self.victims = self.wssock.client_list[:2]
        self.mafias = self.wssock.client_list[2:4]
        self.detectives = self.wssock.client_list[4:]
        self.wssock.send(self.victims, "#TYPE:Victim")
        self.wssock.send(self.mafias, "#TYPE:Mafia")
        # Now wait for all mafia to acknowledge
        self._wait_acknowledge(self.mafias, "#LOADED_MAFIA_JS")
        self.wssock.send(self.detectives, "#TYPE:Detective")
        self._wait_acknowledge(self.detectives, "#LOADED_DETECTIVE_JS")
        self.wssock.send(self.mafias, "#MAFIA_NAMES:" + ",".join([str(m) for m in self.mafias]))
        self.wssock.send(self.detectives, "#DETECTIVE_NAMES:" + ",".join([str(d) for d in self.detectives]))

    def _wait_acknowledge(self, cl_list, message):
        looking_for = {(cl, message) for cl in cl_list}
        forward_q_set = set(self.wssock.forward_q)
        while (forward_q_set | looking_for != forward_q_set):
            looking_for = {(cl, message) for cl in cl_list}
            forward_q_set = set(self.wssock.forward_q)

        with self.wssock.forward_q_lock:
            self.wssock.forward_q = []

    def mafia_round(self):
        self.wssock.send(self.mafias, "#MAFIA_VOTE")
        print("Sent.")
        vote_state = self._vote_mechanism(self.mafias,self.wssock.client_list, self.mafias)
        votes_counter = {x:0 for x in self.wssock.client_list}
        for key in vote_state:
            print(str(key) + " : " + str(vote_state[key]))
            votes_counter[vote_state[key]]+=1
        max_votes = self.wssock.client_list[0]
        for key in votes_counter:
            if votes_counter[key]>votes_counter[max_votes]:
                max_votes = key
        return (max_votes)

    def detective_round(self):
        self.wssock.send(self.detectives, "#DETECTIVE_VOTE")
        print("Sent")
        vote_state = self._vote_mechanism(self.detectives, self.wssock.client_list, self.detectives);
        votes_counter = {x:0 for x in self.wssock.client_list}
        for key in vote_state:
            print(str(key) + " : " + str(vote_state[key]))
            votes_counter[vote_state[key]]+=1
        max_votes = self.wssock.client_list[0]
        for key in votes_counter:
            if votes_counter[key]>votes_counter[max_votes]:
                max_votes = key
        self.wssock.send(self.detectives, "#DETECTION_RESULT:"+max_votes.name+":"+str(max_votes in self.mafias))

    def _vote_mechanism(self, voter_list, votee_list, send_to_list=None):
        breaking = 0
        votee_str_dic = {str(v.name):v for v in votee_list}
        vote_state = {}
        while breaking!=len(voter_list):
            time.sleep(0.5)      #TODO: NEEDS INVESTIGATION. Without a time.sleep, it fails periodically
            with self.wssock.forward_q_lock:
                # if len(self.wssock.forward_q)!=0:print(self.wssock.forward_q)
                for i in range(len(self.wssock.forward_q)):
                    cl,mes = self.wssock.forward_q.pop()
                    for v in voter_list:
                        if (v,"#DONE_VOTING")==(cl,mes):
                            breaking += 1
                    if(mes[:len("#VOTE:")] == "#VOTE:"):
                        votee_key = mes[len("#VOTE:"):]
                        vote_state[cl] = votee_str_dic[votee_key]
                        if send_to_list:
                            self.wssock.send(send_to_list, "#VOTE:" + cl.name + ":" + votee_key)



        return vote_state

    def play(self):
        self.type_round()
        # Stime.sleep(2)
        who_died = self.mafia_round()
        self.detective_round()

MafiaGame().play()
