import socket


class Client:
    def __init__(self, sock = None, name = None):
        '''
        Contructor for the client class
        '''
        self.sock = sock
        self.name = name
    def __str__(self):
        return self.name

def dictionary_by_name(list_of_clients):
    pass
