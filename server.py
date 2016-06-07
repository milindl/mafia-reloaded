import socket,hashlib,base64,threading
from client import Client
class WebServerSocket:
    def __init__(self, host = "0.0.0.0", port = 7000):
        '''
            Initialization things
        '''
        self.host = host
        self.port= port
        self.ssock = None
        self.client_list = []                                   # A better name may be handshaken list
        self.client_list_lock = threading.Lock()
        self.forward_q = []
        self.forward_q_lock = threading.Lock()

    def log(self, cl):
        '''
        Listens to whatever socket we have assigned to it and messages go to the forward_q
        '''
        while True:
            data = cl.sock.recv(1024)
            if data[0]==0x88:
                self.close(cl)
                break
            secondByte = data[1]
            lg_byte = secondByte & 127
            #Adjust for the location of the first byte of mask depending on whether extended payload length is used or not
            indexFirstMask = 2
            if lg_byte == 126:
                indexFirstMask = 4
            if lg_byte == 127:
                indexFirstMask = 10
            masks = data[indexFirstMask:indexFirstMask+4]
            indexFirstDataByte = indexFirstMask + 4
            decoded = bytearray()
            #decoded length = bytes.length - indexFirstDataByte
            for i in range(indexFirstDataByte, len(data)):          # Iterate from the first byte of data till the end of it
                decoded.append(data[i]^masks[(i-indexFirstMask)%4])
            with self.forward_q_lock:
                self.forward_q.append((cl, decoded.decode()))

    def __prepare_message(self, data):
        '''
        Prepare utf-8 text to be sent as per protocol
        Returns a bytearray
        '''
        data = data.encode('utf-8')
        payload=bytearray()
        length = len(data)
        s1=0b10000001
        #Flg:fin,rsv1,rsv2,rsv3,opcode
        s2=0b0
        # flg:mask
        #Possible thingies:
        #   Length less than 125
        #   Length more than 125 but less than 16 bit
        #   Length more than 16bit(rare)
        payload.append(s1)
        if length<=125:
            payload.append(s2+length)
        elif length.bit_length()<=16:
            payload.append(s2+126)
            import struct
            payload.extend(struct.pack("!H", length))  # This tricky bit changes the length 2 byte int to 2 bytes to extend the barray
        elif length.bit_length()<=64:
            payload.append(s2+127)
            import struct
            payload.extend(struct.pack("!Q", length))  # This changes int->8bytes to add to the bytearray
        # print(payload)
        payload.extend(data)
        # print(payload)
        return payload

    def send(self, client_list, mes):
        '''
        Sends a utf 8 mes to all clients in the client list provided that they are a sublist of the main client list
        '''
        client_list = [cl for cl in client_list if cl in self.client_list]
        for cl in client_list:
            cl.sock.sendall(self.__prepare_message(mes))

    def __parse_headers(self,headers):
        '''
            Usage:
            parse_headers(headers)
            Returns a dictionary of headers
        '''
        parsed_headers = {}
        lines = headers.split("\n")
        for line in lines:
            k = line.split(":")
            if(len(k)<2): continue
            parsed_headers[k[0].strip()] = "".join([str(k[i]).strip() for i in range(1,len(k))])
        return parsed_headers

    def __sec_key_hash(self, key):
        '''
        Complies with the weird websocket protocol
        '''
        GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
        key = key.strip()+GUID.strip()
        hasher = hashlib.sha1()
        hasher.update(key.encode())
        to_return = base64.b64encode(hasher.digest())
        return (to_return.decode('utf-8'))

    def _handshake(self, sock):
        '''
        Shakes hand with the given socket and returns the username by looking at the GET headers.
        '''
        req = sock.recv(4096).decode("utf-8")
        headers = self.__parse_headers(req)
        sec_ws_accept = self.__sec_key_hash(headers["Sec-WebSocket-Key"])
        username = headers["Sec-WebSocket-Protocol"]
        reply = "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Protocol:"+username+" \r\nSec-WebSocket-Accept:" + sec_ws_accept + "\r\n\r\n"
        sock.send(reply.encode())
        #Now to get the username
        return username

    def close(self, cl, status_code = 1000):
        '''
        This responds to a closing handshake from a client socket, and also causes a close.
        '''
        s1 = 0b10001000
        s2 = 0b00000010
        payload = bytearray()
        payload.append(s1)
        payload.append(s2)
        import struct
        payload.extend(struct.pack("!H", status_code))
        try:
            cl.sock.sendall(payload)
            cl.sock.close()
        finally:
            with self.client_list_lock:
                self.client_list.remove(cl)

    def start(self):
        '''
        Starts the server --
        1. Bind to port and host as given in the constuctor
        2. Start a lot of listener threads
        '''
        #Bind
        self.ssock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.ssock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.ssock.bind((self.host, self.port))
        self.ssock.listen(1)

        #Accept and listen
        while True:
            csock, add = self.ssock.accept()
            name = self._handshake(csock)
            cl = Client(csock, name)
            with self.client_list_lock:
                self.client_list.append(cl)
            threading.Thread(target = self.log, args = (cl,)).start()
        self.ssock.close()
