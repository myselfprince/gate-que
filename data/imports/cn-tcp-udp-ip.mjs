// Transcribed by visual review of all six scanned spreads. Answers follow the printed key.
const raw = String.raw;
const sourceHash = '56139841ba5ebfa3976575c2c90aff616bba7d4cc0b58220cd10c5bfa37cb9e6';
const answers = [
  'D','D','D','B','A','C','A','D','C','B',
  'A','D','B','B','D','D','D','C','B','A',
  'D','C','C','C','A','A','C','D','C','B',
  'D','C','A','D','B','B','C','B','D','C',
  'C','B','D','D','A','C','C','A','C','C',
  '1100','5','C','26','D','D','1','256','A','B',
  'B','B','C','A','C','A','158','13','1.1','B',
  '36','C','D','34 or 35','C','C','B','44','D','B,C,D',
  'A,B','A','33','B,C,D','C,D','3','C,D','B,D','6','40',
  'A,B','C,D','D','4',
];

function question(number, year, marks, setNum, text, options = [], diagram = '') {
  const answer = answers[number - 1];
  const numerical = options.length === 0;
  const bookPages = number <= 10 ? [686] : number <= 20 ? [687] : number === 21 ? [687,688]
    : number <= 28 ? [688] : number <= 36 ? [689] : number <= 47 ? [690]
    : number <= 55 ? [691] : number === 56 ? [691,692] : number <= 63 ? [692]
    : number === 64 ? [692,693] : number <= 73 ? [693] : number <= 80 ? [694]
    : number === 81 ? [694,695] : number <= 86 ? [695] : [696];
  return {
    id: `madeeasy-cn-tcp-udp-ip-3-${number}`,
    text, code: '', year: String(year), marks: String(marks), setNum,
    rawTopic: 'TCP, UDP and IP', diagram, ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    natAnswer: numerical ? answer : '', correctOptions: numerical ? [] : answer.split(','),
    questionType: numerical ? 'NAT' : answer.includes(',') ? 'MSQ' : 'MCQ',
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false,
    needsManualOptionFix: false, optLayout: 'auto', tempPaste: '',
    source: {
      file: '3. Computer Networks/3. TCP, UDP and IP.pdf', sha256: sourceHash,
      questionNumber: `3.${number}`, bookPages,
      pdfPages: [...new Set(bookPages.map((page) => Math.floor((page - 686) / 2) + 1))],
      answerKeyPdfPage: 6,
    },
  };
}

const passage12 = raw`Common data for Questions 3.12 and 3.13:
Consider three IP networks A, B and C. Host $H_A$ in network A sends messages each containing 180 bytes of application data to a host $H_C$ in network C. The TCP layer prefixes a 20 byte header to the message. This passes through an intermediate network B. The maximum packet size, including 20 byte IP header, in each network is
A: 1000 bytes
B: 100 bytes
C: 1000 bytes
The network A and B are connected through a 1 Mbps link, while B and C are connected by a 512 Kbps link (bps = bits per second).
[IMG_1]
`;
const passage37 = 'Common data for Questions 3.37 and 3.38:\nHost X has IP address 192.168.1.97 and is connected through two routers R1 and R2 to another host Y with IP address 192.168.1.80. Router R1 has IP addresses 192.168.1.135 and 192.168.1.110. R2 has IP addresses 192.168.1.67 and 192.168.1.155. The netmask used in the network is 255.255.255.224.\n';

export const TCP_UDP_IP_IMPORT = {
  subject: '3. Computer Networks', chapter: '3. TCP, UDP and IP', sourceHash,
  questions: [
    question(1,2003,1,'','Which of the following assertions is FALSE about the Internet Protocol (IP)?',[
      'It is possible for a computer to have multiple IP addresses',
      'IP packets from the same source to the same destination can take different routes in the network',
      'IP ensures that a packet is forwarded if it is unable to reach its destination within a given number of hops',
      'The packet source cannot set the route of an outgoing packets; the route is determined only by the routing tables in the routers on the way',
    ]),
    question(2,2003,1,'','Which of the following functionalities must be implemented by a transport protocol over and above the network protocol?',[
      'Recovery from packet losses','Detection of duplicate packets','Packet delivery in the correct order','End to end connectivity',
    ]),
    question(3,2003,2,'','The subnet mask for a particular network is 255.255.31.0. Which of the following pairs of IP addresses could belong to this network?',[
      '172.57.88.62 and 172.56.87.23.2','10.35.28.2 and 10.35.29.4','191.203.31.87 and 191.234.31.88','128.8.129.43 and 128.8.161.55',
    ]),
    question(4,2004,1,'','Which of the following is NOT true with respect to a transparent bridge and a router?',[
      'Both bridge and router selectively forward data packets','A bridge uses IP addresses while a router uses MAC addresses',
      'A bridge builds up its routing table by inspecting incoming packets','A router can connect between a LAN and a WAN',
    ]),
    question(5,2004,1,'','Which one of the following statements is FALSE?',[
      'TCP guarantees a minimum communication rate','TCP ensures in-order delivery','TCP reacts to congestion by reducing sender window size','TCP employs retransmission to compensate for packet loss',
    ]),
    question(6,2004,1,'','A subnet has been assigned a subnet mask of 255.255.255.192. What is the maximum number of hosts that can belong to this subnet?',['14','30','62','126']),
    question(7,2004,1,'','In TCP, a unique sequence number is assigned to each',['byte','word','segment','message']),
    question(8,2004,2,'','In the TCP/IP protocol suite, which one of the following is NOT part of the IP header?',['Fragment Offset','Source IP address','Destination IP address','Destination port number']),
    question(9,2004,2,'','A TCP message consisting of 2100 bytes is passed to IP for delivery across two networks. The first network can carry a maximum payload of 1200 bytes per frame and the second network can carry a maximum payload of 400 bytes per frame, excluding network overhead. Assume that IP overhead per packet is 20 bytes. What is the total IP overhead in the second network for this transmission?',['40 bytes','80 bytes','120 bytes','160 bytes']),
    question(10,2004,2,'','Suppose that the maximum transmit window size for a TCP connection is 12000 bytes. Each packet consists of 2000 bytes. At some point of time, the connection is in slow-start phase with a current transmit window of 4000 bytes. Subsequently, the transmitter receives two acknowledgements. Assume that no packets are lost and there are no time-outs. What is the maximum possible value of the current transmit window?',['4000 bytes','8000 bytes','10000 bytes','12000 bytes']),
    question(11,2004,2,'',raw`The routing table of a router is shown below:
$$\begin{array}{lll}\text{Destination}&\text{Subnet Mask}&\text{Interface}\\128.75.43.0&255.255.255.0&\text{Eth0}\\128.75.43.0&255.255.255.128&\text{Eth1}\\192.12.17.5&255.255.255.255&\text{Eth3}\\\text{default}&&\text{Eth2}\end{array}$$
On which interfaces will the router forward packets addressed to destinations 128.75.43.16 and 192.12.17.10 respectively?`,['Eth1 and Eth2','Eth0 and Eth2','Eth0 and Eth3','Eth1 and Eth3']),
    question(12,2004,2,'',passage12+'Assuming that the packets are correctly delivered, how many bytes, including headers, are delivered to the IP layer at the destination for one application message, in the best case? Consider only data packets.',['200','220','240','260'],'cn-tcp-ip-3-12-network'),
    question(13,2004,2,'',passage12+raw`What is the rate at which application data is transferred to host $H_C$? Ignore errors, acknowledgments, and other overheads.`,['325.5 Kbps','354.5 Kbps','409.6 Kbps','512.0 Kbps'],'cn-tcp-ip-3-12-network'),
    question(14,2005,1,'','Packets of the same session may be routed through different paths in',['TCP, but not UDP','TCP and UDP','UDP, but not TCP','Neither TCP, nor UDP']),
    question(15,2005,1,'','The address resolution protocol (ARP) is used for',['Finding the IP address from the DNS','Finding the IP address of the default gateway','Finding the IP address that corresponds to a MAC address','Finding the MAC address that corresponds to an IP address']),
    question(16,2005,1,'','An organization has a class B network and wishes to form subnets for 64 departments. The subnet mask would be',['255.255.0.0','255.255.64.0','255.255.128.0','255.255.252.0']),
    question(17,2005,2,'','In a packet switching network, packets are routed from source to destination along a single path having two intermediate nodes. If the message size is 24 bytes and each packet contains a header of 3 bytes, then the optimum packet size is',['4','6','7','9']),
    question(18,2005,2,'',raw`Suppose the round trip propagation delay for a 10 Mbps Ethernet having 48-bit jamming signal is $46.4\,\mu\mathrm{s}$. The minimum frame size is:`,['94','416','464','512']),
    question(19,2005,2,'','On a TCP connection, current congestion window size is Congestion Window = 4 KB. The window size advertised by the receiver is Advertise Window = 6 KB. The last byte sent by the sender is LastByteSent = 10240 and the last byte acknowledged by the receiver is LastByteAcked = 8192. The current window size at the sender is',['2048 bytes','4096 bytes','6144 bytes','8192 bytes']),
    question(20,2005,2,'',raw`In a communication network, a packet of length $L$ bits takes link L1 with a probability of $p_1$ or link L2 with a probability of $p_2$. Link L1 and L2 have bit error probability of $b_1$ and $b_2$ respectively. The probability that the packet will be received without error via either L1 or L2 is`,[
      raw`$(1-b_1)^L p_1+(1-b_2)^L p_2$`,raw`$[1-(b_1+b_2)^L]p_1p_2$`,raw`$(1-b_1)^L(1-b_2)^L p_1p_2$`,raw`$1-(b_1^L p_1+b_2^L p_2)$`,
    ]),
    question(21,2005,2,'','A company has a class C network address of 204.204.204.0. It wishes to have three subnets, one with 100 hosts and two with 50 hosts each. Which one of the following options represents a feasible set of subnet address/subnet mask pairs?',[
      '204.204.204.128/255.255.255.192\n204.204.204.0/255.255.255.128\n204.204.204.64/255.255.255.128',
      '204.204.204.0/255.255.255.192\n204.204.204.192/255.255.255.128\n204.204.204.64/255.255.255.128',
      '204.204.204.128/255.255.255.128\n204.204.204.192/255.255.255.192\n204.204.204.224/255.255.255.192',
      '204.204.204.128/255.255.255.128\n204.204.204.64/255.255.255.192\n204.204.204.0/255.255.255.192',
    ]),
    question(22,2006,1,'','Which of the following statements is TRUE?',[
      'Both Ethernet frame and IP packet include checksum fields','Ethernet frame includes a checksum field and IP packet includes a CRC field','Ethernet frame includes a CRC field and IP packet includes a checksum field','Both Ethernet frame and IP packet include CRC fields',
    ]),
    question(23,2006,1,'','For which one of the following reasons does Internet Protocol (IP) use the time-to-live (TTL) field in the IP datagram header?',[
      'Ensure packets reach destination within that time','Discard packets that reach later than that time','Prevent packets from looping indefinitely','Limit the time for which a packet gets queued in intermediate routers',
    ]),
    question(24,2006,2,'',raw`A router uses the following routing table:
$$\begin{array}{lll}\text{Destination}&\text{Mask}&\text{Interface}\\144.16.0.0&255.255.0.0&\text{eth0}\\144.16.64.0&255.255.224.0&\text{eth1}\\144.16.68.0&255.255.255.0&\text{eth2}\\144.16.68.64&255.255.255.224&\text{eth3}\end{array}$$
A packet bearing a destination address 144.16.68.117 arrives at the router. On which interface will it be forwarded?`,['eth0','eth1','eth2','eth3']),
    question(25,2006,2,'',raw`Suppose it takes 1 unit of time to transmit a packet (of fixed size) on a communication link. The link layer uses a window flow control protocol with a window size of $N$ packets. Each packet causes an ack or a nak to be generated by the receiver, and ack/nak transmission times are negligible. Further, the round trip time on the link is equal to $N$ units. Consider time $i>N$. If only acks have been received till time $i$ (no naks), then the throughput evaluated at the transmitter at time $i$ (in packets per unit time) is`,[raw`$\dfrac{1-N}{i}$`,raw`$\dfrac{i}{N+i}$`,'1',raw`$1-e^{i/N}$`]),
    question(26,2006,2,'',raw`A link of capacity 100 Mbps is carrying traffic from a number of sources. Each source generates an on-off traffic stream; when the source is on, the rate of traffic is 10 Mbps, and when the source is off, the rate of traffic is zero. The duty cycle, which is the ratio of on-time to off-time, is 1:2. When there is no buffer at the link, the minimum number of sources that can be multiplexed on the link so that link capacity is not wasted and no data loss occurs is $S_1$. Assuming that all sources are synchronized and that the link is provided with a large buffer, the maximum number of sources that can be multiplexed so that no data loss occurs is $S_2$. The values of $S_1$ and $S_2$ are, respectively,`,['10 and 30','12 and 25','5 and 33','15 and 22']),
    question(27,2006,2,'','A program on machine X attempts to open a UDP connection to port 5376 on a machine Y, and a TCP connection to port 8632 on machine Z. However, there are no applications listening at the corresponding ports on Y and Z. An ICMP Port Unreachable error will be generated by',['Y but not Z','Z but not Y','Neither Y nor Z','Both Y and Z']),
    question(28,2006,2,'','A subnetted Class B network has the following broadcast address: 144.16.95.255. Its subnet mask',[
      'is necessarily 255.255.224.0','is necessarily 255.255.240.0','is necessarily 255.255.248.0','could be any one of\n255.255.224.0, 255.255.240.0, 255.255.248.0',
    ]),
    question(29,2006,2,'','Two computers C1 and C2 are configured as follows. C1 has IP address 203.197.2.53 and netmask 255.255.128.0. C2 has IP address 203.197.75.201 and netmask 255.255.192.0. Which one of the following statements is true?',[
      'C1 and C2 both assume they are on the same network','C2 assumes C1 is on same network, but C1 assumes C2 is on a different network','C1 assumes C2 is on same network, but C2 assumes C1 is on a different network','C1 and C2 both assume they are on different networks',
    ]),
    question(30,2007,1,'','Consider the following statements about the timeout value used in TCP.\n(i) The timeout value is set to the RTT (Round Trip Time) measured during TCP connection establishment for the entire duration of the connection.\n(ii) Appropriate RTT estimation algorithm is used to set the timeout value of a TCP connection.\n(iii) Timeout value is set to twice the propagation delay from the sender to the receiver.\nWhich of the following choices hold?',[
      '(i) is false, but (ii) and (iii) are true','(i) and (iii) are false, but (ii) is true','(i) and (ii) are false, but (iii) is true','(i), (ii) and (iii) are false',
    ]),
    question(31,2007,1,'',raw`Consider a TCP connection in a state where there are no outstanding ACKs. The sender sends two segments back to back. The sequence numbers of the first and second segments are 230 and 290 respectively. The first segment was lost, but the second segment was received correctly by the receiver.
Let $X$ be the amount of data carried in the first segment (in bytes), and $Y$ be the ACK number sent by the receiver. The values of $X$ and $Y$ (in that order) are`,['60 and 290','230 and 291','60 and 231','60 and 230']),
    question(32,2007,2,'','The address of a class B host is to be split into subnets with a 6-bit subnet number. What is the maximum number of subnets and the maximum number of hosts in each subnet?',['62 subnets and 262142 hosts','64 subnets and 262142 hosts','62 subnets and 1022 hosts','64 subnets and 1024 hosts']),
    question(33,2008,1,'','What is the maximum size of data that the application layer can pass on to the TCP layer below?',['Any size',raw`$2^{16}$ bytes - size of TCP header`,raw`$2^{16}$ bytes`,'1500 bytes']),
    question(34,2008,1,'','Which of the following system calls results in the sending of SYN packets?',['socket','bind','listen','connect']),
    question(35,2008,2,'','Which of the following statements are TRUE?\nS1: TCP handles both congestion and flow control\nS2: UDP handles congestion but not flow control\nS3: Fast retransmit deals with congestion but not flow control\nS4: Slow start mechanism deals with both congestion and flow control',['S1, S2 and S3 only','S1 and S3 only','S3 and S4 only','S1, S3 and S4 only']),
    question(36,2008,2,'',raw`The three way handshake for TCP connection establishment is shown below:
[IMG_1]
Which of the following statements are TRUE?
S1: Loss of SYN+ACK from the server will not establish a connection
S2: Loss of ACK from the client cannot establish the connection
S3: The server moves $\mathrm{LISTEN}\to\mathrm{SYN\_RCVD}\to\mathrm{SYN\_SENT}\to\mathrm{ESTABLISHED}$ in the state machine on no packet loss
S4: The server moves $\mathrm{LISTEN}\to\mathrm{SYN\_RCVD}\to\mathrm{ESTABLISHED}$ in the state machine on no packet loss.`,['S2 and S3 only','S1 and S4 only','S1 and S3 only','S2 and S4 only'],'cn-tcp-ip-3-36-handshake'),
    question(37,2008,2,'',passage37+'Given the information above, how many distinct subnets are guaranteed to already exist in the network?',['1','2','3','6']),
    question(38,2008,2,'',passage37+'Which IP address should X configure its gateway as?',['192.168.1.67','192.168.1.110','192.168.1.135','192.168.1.155']),
    question(39,2008,2,'','In the slow start phase of the TCP congestion control algorithm, the size of the congestion window',['Does not increase','Increases linearly','Increases quadratically','Increases exponentially']),
    question(40,2008,2,'','If a class B network on the Internet has a subnet mask of 255.255.248.0, what is the maximum number of hosts per subnet?',['1022','1023','2046','2047']),
    question(41,2008,2,'','A client process P needs to make a TCP connection to a server process S. Consider the following situation: the server process S executes a socket(), a bind() and a listen() system call in that order, following which it is preempted. Subsequently, the client process P executes a socket() system call followed by connect() system call to connect to the server process S. The server process has not executed any accept() system call. Which one of the following events could take place?',['connect() system call returns successfully','connect() system call blocks','connect() system call returns an error','connect() system call results in a core dump']),
    question(42,2009,2,'','While opening a TCP connection, the initial sequence number is to be derived using a time-of-day (ToD) clock that keeps running even when the host is down. The lower order 32 bits of the counter of the ToD clock is to be used for the initial sequence numbers. The clock counter increments once per millisecond. The maximum packet lifetime is given to be 64s.\nWhich one of the choices given below is closest to the minimum permissible rate at which sequence numbers used for packets of a connection can increase?',['0.015/s','0.064/s','0.135/s','0.327/s']),
    question(43,2010,1,'','One of the header fields in an IP datagram is the Time-to-Live (TTL) field. Which of the following statements best explains the need for this field?',['It can be used to prioritize packets','It can be used to reduce delays','It can be used to optimize throughput','It can be used to prevent packet looping']),
    question(44,2010,2,'','Suppose computers A and B have IP addresses 10.105.1.113 and 10.105.1.91 respectively and they both use the same netmask N. Which of the values of N given below should not be used if A and B should belong to the same network?',['255.255.255.0','255.255.255.128','255.255.255.192','255.255.255.224']),
    question(45,2011,1,'','A layer-4 firewall (a device that can look at all protocol headers up to the transport layer) CANNOT',[
      'block entire HTTP traffic during 9:00 pm and 5:00 am','block all ICMP traffic','stop incoming traffic from a specific IP address but allow outgoing traffic to the same IP address','block TCP traffic from a specific user on a multi-user system during 9:00 pm and 5:00 am',
    ]),
    question(46,2012,1,'','Which of the following transport layer protocols is used to support electronic mail?',['SMTP','IP','TCP','UDP']),
    question(47,2012,1,'','In the IPv4 addressing format, the number of networks allowed under Class C addresses is',[raw`$2^{14}$`,raw`$2^7$`,raw`$2^{21}$`,raw`$2^{24}$`]),
    question(48,2012,2,'','An Internet Service Provider (ISP) has the following chunk of CIDR-based IP addresses available with it: 245.248.128.0/20. The ISP wants to give half of this chunk of addresses to Organization A, and a quarter of Organization B, while retaining the remaining with itself. Which of the following is a valid allocation of addresses to A and B?',[
      '245.248.136.0/21 and 245.248.128.0/22','245.248.128.0/21 and 245.248.128.0/22','245.248.132.0/22 and 245.248.132.0/21','245.248.136.0/24 and 245.248.132.0/21',
    ]),
    question(49,2012,2,'',"Consider an instance of TCP's Additive Increase Multiplicative Decrease (AIMD) algorithm where the window size at the start of the slow start phase is 2 MSS and the threshold at the start of the first transmission is 8 MSS. Assume that a time-out occurs during the fifth transmission. Find the congestion window size at the end of the tenth transmission.",['8 MSS','14 MSS','7 MSS','12 MSS']),
    question(50,2013,2,'','In an IPv4 datagram, the M bit is 0, the value of HLEN is 10, the value of total length is 400 and the fragment offset value is 300. The position of the datagram, the sequence numbers of the first and the last bytes of the payload, respectively are',[
      'Last fragment, 2400 and 2789','First fragment, 2400 and 2759','Last fragment, 2400 and 2759','Middle fragment, 300 and 689',
    ]),
    question(51,2014,2,'1','Let the size of congestion window of a TCP connection be 32 KB when a timeout occurs. The round trip time of the connection is 100 msec and the maximum segment size used is 2 KB. The time taken (in msec) by the TCP connection to get back to 32 KB congestion window is ______.'),
    question(52,2014,2,'1','Consider a selective repeat sliding window protocol that uses a frame size of 1 KB to send data on a 1.5 Mbps link with a one-way latency of 50 msec. To achieve a link utilization of 60%, the minimum number of bits required to represent the sequence number field is ______.'),
    question(53,2014,1,'2','Which one of the following socket API functions converts an unconnected active TCP socket into a passive socket?',['connect','bind','listen','accept']),
    question(54,2014,1,'2','In the diagram shown below, L1 is an Ethernet LAN and L2 is a Token-Ring LAN. An IP packet originates from sender S and traverses to R, as shown. The links within each ISP and across the two ISPs, are all point-to-point optical links. The initial value of the TTL field is 32. The maximum possible value of the TTL field when R receives the datagram is ______.\n[IMG_1]',[],'cn-tcp-ip-3-54-ttl'),
    question(55,2014,2,'2',raw`Consider the store and forward packet switched network given below. Assume that the bandwidth of each link is $10^6$ bytes/sec. A user on host A sends a file of size $10^3$ bytes to host B through routers R1 and R2 in three different ways. In the first case a single packet containing the complete file is transmitted from A to B. In the second case, the file is split into 10 equal parts, and these packets are transmitted from A to B. In the third case, the file is split into 20 equal parts and these packets are sent from A to B. Each packet contains 100 bytes of header information along with the user data. Consider only transmission time and ignore processing, queuing and propagation delays. Also assume that there are no errors during transmission. Let $T_1$, $T_2$ and $T_3$ be the times taken to transmit the file in the first, second and third case respectively. Which one of the following is CORRECT?
[IMG_1]`,[raw`$T_1<T_2<T_3$`,raw`$T_1>T_2>T_3$`,raw`$T_2=T_3,\ T_3<T_1$`,raw`$T_1=T_3,\ T_3>T_2$`],'cn-tcp-ip-3-55-network'),
    question(56,2014,1,'3','Host A (on TCP/IP v4 network A) sends an IP datagram D to host B (also on TCP/IP v4 network B). Assume that no error occurred during the transmission of D. When D reaches B, which of the following IP header field(s) may be different from that of the original datagram D?\n(i) TTL\n(ii) Checksum\n(iii) Fragment Offset',['(i) only','(i) and (ii) only','(ii) and (iii) only','(i), (ii) and (iii)']),
    question(57,2014,2,'3',raw`An IP router implementing Classless Inter-domain Routing (CIDR) receives a packet address 131.23.151.76. The router's routing table has the following entries:
$$\begin{array}{lc}\text{Prefix}&\text{Output Interface Identifier}\\131.16.0.0/12&3\\131.28.0.0/14&5\\131.19.0.0/16&2\\131.22.0.0/15&1\end{array}$$
The identifier of the output interface on which this packet will be forwarded is ______.`),
    question(58,2014,2,'3','Every host in an IPv4 network has a 1-second resolution real-time clock with battery backup. Each host needs to generate up to 1000 unique identifiers per second. Assume that each host has a globally unique IPv4 address. Design a 50-bit globally unique ID for this purpose. After what period of time (in seconds) will the identifiers generated by a host wrap around?'),
    question(59,2014,2,'3','An IP router with a Maximum Transmission Unit (MTU) of 1500 bytes has received an IP packet of size 4404 bytes with an IP header length 20 bytes. The values of the relevant fields in the header of the third IP fragment generated by the router for this packet are',[
      'MF bit: 0, Datagram Length: 1444; Offset: 370','MF bit: 1, Datagram Length: 1424; Offset: 185','MF bit: 1, Datagram Length: 1500; Offset: 370','MF bit: 0, Datagram Length: 1424; Offset: 2960',
    ]),
    question(60,2015,1,'1',raw`Suppose two hosts use a TCP connection to transfer a large file. Which of the following statements is/are FALSE with respect to the TCP connection?
1. If the sequence number of a segment is $m$, then the sequence number of the subsequent segment is always $m+1$.
2. If the estimated round trip time at any given point of time is $t$ sec, the value of the retransmission timeout is always set to greater than or equal to $t$ sec.
3. The size of the advertised window never changes during the course of the TCP connection.
4. The number of unacknowledged bytes at the sender is always less than or equal to the advertised window.`,['3 only','1 and 3 only','1 and 4 only','2 and 4 only']),
    question(61,2015,1,'1','Which one of the following fields of an IP header is NOT modified by a typical router?',['Checksum','Source address','Time to Live (TTL)','Length']),
    question(62,2015,1,'2','Identify the correct order in which a server process must invoke the function calls accept, bind, listen, and recv according to UNIX socket API.',['listen, accept, bind, recv','bind, listen, accept, recv','bind, accept, listen, recv','accept, listen, bind, recv']),
    question(63,2015,2,'2',raw`Assume that the bandwidth for a TCP connection is 1048560 bits/sec. Let $\alpha$ be the value of RTT in milliseconds (rounded off to the nearest integer) after which the TCP window scale option is needed. Let $\beta$ be the maximum possible window size with window scale option. The values of $\alpha$ and $\beta$ are`,[
      raw`63 milliseconds, $65535\times2^{14}$`,raw`63 milliseconds, $65535\times2^{16}$`,raw`500 milliseconds, $65535\times2^{14}$`,raw`500 milliseconds, $65535\times2^{16}$`,
    ]),
    question(64,2015,2,'2',raw`Consider the following routing table at an IP router:
$$\begin{array}{lll}\text{Network No.}&\text{Net Mask}&\text{Next Hop}\\128.96.170.0&255.255.254.0&\text{Interface 0}\\128.96.168.0&255.255.254.0&\text{Interface 1}\\128.96.166.0&255.255.254.0&\text{R2}\\128.96.164.0&255.255.252.0&\text{R3}\\0.0.0.0&\text{Default}&\text{R4}\end{array}$$
For each IP address in Group-I identify the correct choice of the next hop from Group-II using the entries from the routing table above.
$$\begin{array}{ll}\text{List-I}&\text{List-II}\\\text{A. }128.96.171.92&\text{1. Interface 0}\\\text{B. }128.96.167.151&\text{2. Interface 1}\\\text{C. }128.96.163.121&\text{3. R2}\\\text{D. }128.96.165.121&\text{4. R3}\\&\text{5. R4}\end{array}$$
Codes (A, B, C, D):`,['1, 3, 5, 4','1, 4, 2, 5','2, 3, 4, 5','2, 3, 5, 4']),
    question(65,2015,2,'2','Host A sends a UDP datagram containing 8880 bytes of user data to host B over an Ethernet LAN. Ethernet frames may carry data up to 1500 bytes (i.e. MTU = 1500 bytes). Size of UDP header is 8 bytes and size of IP header is 20 bytes. There is no option field in IP header. How many total number of IP fragments will be transmitted and what will be the contents of offset field in the last fragment?',['6 and 925','6 and 7400','7 and 1110','7 and 8880']),
    question(66,2015,1,'3','Consider the following statements:\nI. TCP connections are full duplex.\nII. TCP has no option for selective acknowledgment.\nIII. TCP connections are message streams.',['Only I is correct','Only I and III are correct','Only II and III are correct','All of I, II and III are correct']),
    question(67,2015,2,'3','In the network 200.10.11.144/27, the fourth octet (in decimal) of the last IP address of the network which can be assigned to a host is ______.'),
    question(68,2016,2,'1','An IP datagram of size 1000 bytes arrives at a router. The router has to forward this packet on a link whose MTU (maximum transmission unit) is 100 bytes. Assume that the size of the IP header is 20 bytes. The number of fragments that the IP datagram will be divided into for transmission is ______.'),
    question(69,2016,2,'1','For a host machine that uses the token bucket algorithm for congestion control, the token bucket has a capacity of 1 megabyte and the maximum output rate is 20 megabytes per second. Tokens arrive at a rate to sustain output at a rate of 10 megabytes per second. The token bucket is currently full and the machine needs to send 12 megabytes of data.\nThe minimum time required to transmit the data is ______ seconds.'),
    question(70,2017,1,'2','Consider socket API on a Linux machine that supports connected UDP sockets. A connected UDP socket is a UDP socket on which connect function has already been called. Which of the following statements is/are CORRECT?\nI. A connected UDP socket can be used to communicate with multiple peers simultaneously.\nII. A process can successfully call connect function again for an already connected UDP socket.',['I only','II only','Both I and II','Neither I nor II']),
    question(71,2017,1,'2','The maximum number of IPv4 router addresses that can be listed in the record route (RR) option field of an IPv4 header is ______.'),
    question(72,2017,1,'2','Consider the following statements about the routing protocols, Routing Information Protocol (RIP) and Open Shortest Path First (OSPF) in an IPv4 network.\nI. RIP uses distance vector routing\nII. RIP packets are sent using UDP\nIII. OSPF packets are sent using TCP\nIV. OSPF operation is based on link-state routing\nWhich of the statements above are CORRECT?',['I and IV only','I, II and III only','I, II and IV only','II, III and IV only']),
    question(73,2017,1,'1','Consider a TCP client and a TCP server running on two different machines. After completing data transfer, the TCP client calls close to terminate the connection and a FIN segment is sent to the TCP server. Server-side TCP responds by sending an ACK, which is received by the client-side TCP. As per the TCP connection state diagram (RFC 793), in which state does the client-side TCP connection wait for the FIN from the server-side TCP?',['LAST-ACK','TIME-WAIT','FIN-WAIT-1','FIN-WAIT-2']),
    question(74,2018,1,'',raw`Consider a long-lived TCP session with an end-to-end bandwidth of 1 Gbps ($=10^9$ bit-per-second). The session starts with a sequence number of 1234. The minimum time (in seconds, rounded to the closest integer) before this sequence number can be used again is ______.`),
    question(75,2018,1,'','Consider the following statements regarding the slow start phase of the TCP congestion control algorithm. Note that the cwnd stands for the TCP congestion window and MSS denotes the Maximum Segment Size.\n(i) The cwnd increases by 2 MSS on every successful acknowledgment.\n(ii) The cwnd approximately doubles on every successful acknowledgment.\n(iii) The cwnd increases by 1 MSS every round trip time.\n(iv) The cwnd approximately doubles every round trip time.\nWhich one of the following is correct?',['Only (ii) and (iii) are true','Only (i) and (iii) are true','Only (iv) is true','Only (i) and (iv) are true']),
    question(76,2018,1,'',"Match the following:\nField\nP. UDP Header's Port Number\nQ. Ethernet MAC Address\nR. IPv6 Next Header\nS. TCP Header's Sequence Number\nLength in bits\nI. 48\nII. 8\nIII. 32\nIV. 16",['P-III, Q-IV, R-II, S-I','P-II, Q-I, R-IV, S-III','P-IV, Q-I, R-II, S-III','P-IV, Q-I, R-III, S-II']),
    question(77,2019,2,'','Consider three machines M, N and P with IP addresses 100.10.5.2, 100.10.5.5 and 100.10.5.6 respectively. The subnet mask is set to 255.255.255.252 for all the three machines. Which one of the following is true?',['M, N and P all belong to the same subnet','Only N and P belong to the same subnet','M, N, and P belong to three different subnets','Only M and N belong to the same subnet']),
    question(78,2020,2,'',raw`Consider a TCP connection between a client and a server with the following specifications: the round trip time is 6 ms, the size of the receiver advertised window is 50 KB, slow-start threshold at the client is 32 KB, and the maximum segment size is 2 KB. The connection is established at time $t=0$. Assume that there are no timeouts and errors during transmission. Then the size of the congestion window (in KB) at time $t+60$ ms after all acknowledgments are processed is ______.`),
    question(79,2020,2,'',"An organization requires a range of IP addresses to assign one to each of its 1500 computers. The organization has approached an Internet Service Provider (ISP) for this task. The ISP uses CIDR and serves the requests from the available IP address space 202.61.0.0/17. The ISP wants to assign an address space to the organization which will minimize the number of routing entries in the ISP's router using route aggregation. Which of the following address spaces are potential candidates from which the ISP can allot any one to the organization?\nI. 202.61.84.0/21\nII. 202.61.104.0/21\nIII. 202.61.64.0/21\nIV. 202.61.144.0/21",['I and IV only','III and IV only','I and II only','II and III only']),
    question(80,2021,2,'1',raw`A TCP server application is programmed to listen on port number $P$ on host $S$. A TCP client is connected to the TCP server over the network. Consider that while the TCP connection was active, the server machine $S$ crashed and rebooted. Assume that the client does not use the TCP keepalive timer.
Which of the following behaviors is/are possible?`,[
      'If the client sends a packet after the server reboot, it will receive a FIN segment.','If the client was waiting to receive a packet, it may wait indefinitely.',raw`The TCP server application on $S$ can listen on $P$ after reboot.`,'If the client sends a packet after the server reboot, it will receive a RST segment.',
    ]),
    question(81,2021,2,'1',raw`Consider two hosts $P$ and $Q$ connected through a router $R$. The maximum transfer unit (MTU) value of the link between $P$ and $R$ is 1500 bytes, and between $R$ and $Q$ is 820 bytes.
A TCP segment of size 1400 bytes was transferred from $P$ to $Q$ through $R$, with IP identification value as 0x1234. Assume that the IP header size is 20 bytes. Further, the packet is allowed to be fragmented, i.e., Don't Fragment (DF) flag in the IP header is not set by $P$.
Which of the following statements is/are correct?`,[
      raw`Two fragments are created at $R$ and the IP datagram size carrying the second fragment is 620 bytes.`,raw`If the second fragment is lost, $P$ is required to resend the whole TCP segment.`,'TCP destination port can be determined by analysing only the second fragment.',raw`If the second fragment is lost, $R$ will resend the fragment with the IP identification value 0x1234`,
    ]),
    question(82,2021,1,'2',raw`Consider the three-way handshake mechanism followed during TCP connection establishment between hosts $P$ and $Q$. Let $X$ and $Y$ be two random 32-bit starting sequence numbers chosen by $P$ and $Q$ respectively. Suppose $P$ sends a TCP connection request message to $Q$ with a TCP segment having SYN bit = 1, SEQ number = $X$, and ACK bit = 0. Suppose $Q$ accepts the connection request. Which one of the following choices represents the information present in the TCP segment header that is sent by $Q$ to $P$?`,[
      raw`SYN bit = 1, SEQ number = $Y$, ACK bit = 1, ACK number = $X+1$, FIN bit = 0`,raw`SYN bit = 1, SEQ number = $Y$, ACK bit = 1, ACK number = $X$, FIN bit = 0`,raw`SYN bit = 0, SEQ number = $X+1$, ACK bit = 0, ACK number = $Y$, FIN bit = 1`,raw`SYN bit = 1, SEQ number = $X+1$, ACK bit = 0, ACK number = $Y$, FIN bit = 0`,
    ]),
    question(83,2022,2,'','Consider the data transfer using TCP over a 1 Gbps link. Assuming that the maximum segment lifetime (MSL) is set to 60 seconds, the minimum number of bits required for the sequence number field of the TCP header, to prevent the sequence number space from wrapping around during the MSL is ______.'),
    question(84,2023,2,'','Suppose you are asked to design a new reliable byte-stream transport protocol like TCP. You name this protocol myTCP. You run myTCP over a 100 Mbps network with Round Trip Time of 150 milliseconds and the maximum segment lifetime of 2 minutes.\nWhich of the following is/are valid lengths of the Sequence Number field in the myTCP header?',['30 bits','32 bits','34 bits','36 bits']),
    question(85,2023,2,'','Suppose in a web browser, you click on www.gate-2023.in URL. The browser cache is empty. The IP address for this URL is not cached in your local host, so a DNS lookup is triggered (by the local DNS server deployed on your local host) over the 3-tier DNS hierarchy in an iterative mode. No resource records are cached anywhere across all DNS servers.\nLet RTT denote the round trip time between your local host and DNS servers in the DNS hierarchy. The round trip time between the local host and the web server hosting www.gate-2023.in is also equal to RTT. The HTML file associated with the URL is small enough to have negligible transmission time and negligible rendering time by your web browser, which references 10 equally small objects on the same web server.\nWhich of the following statements is/are CORRECT about the minimum elapsed time between clicking on the URL and your browser fully rendering it?',[
      '7 RTTs, in case of non-persistent HTTP with 5 parallel TCP connections.','5 RTTs, in case of persistent HTTP with pipelining.','9 RTTs, in case of non-persistent HTTP with 5 parallel TCP connections.','6 RTTs, in case of persistent HTTP with pipelining.',
    ]),
    question(86,2023,2,'',raw`The forwarding table of a router is shown below:
$$\begin{array}{llc}\text{Subnet Number}&\text{Subnet mask}&\text{Interface ID}\\200.150.0.0&255.250.0.0&1\\200.150.64.0&255.255.224.0&2\\200.150.68.0&255.255.255.0&3\\200.150.68.64&255.255.255.224&4\\\text{Default}&&0\end{array}$$
A packet addressed to a destination address 200.150.68.118 arrives at the router. It will be forwarded to the interface with ID ______.`),
    question(87,2024,1,'1',raw`TCP client $P$ successfully establishes a connection to TCP server $Q$. Let $N_P$ denote the sequence number in the SYN sent from $P$ to $Q$. Let $N_Q$ denote the acknowledgement number in the SYN ACK from $Q$ to $P$. Which of the following statements is/are CORRECT?`,[
      raw`The acknowledgement number $N_Q$ is equal to $N_P$`,raw`The sequence number $N_Q$ is always 0 for a new connection`,raw`The acknowledgement number $N_Q$ is equal to $N_P+1$`,raw`The sequence number $N_P$ is chosen randomly by $P$`,
    ]),
    question(88,2024,1,'1','Which of the following fields is/are modified in the IP header of a packet going out of a network address translation (NAT) device from an internal network to an external network?',['Total Length','Source IP','Destination IP','Header Checksum']),
    question(89,2024,2,'1','Consider sending an IP datagram of size 1420 bytes (including 20 bytes of IP header) from a sender to a receiver over a path of two links with a router between them. The first link (sender to router) has an MTU (Maximum Transmission Unit) size of 542 bytes, while the second link (router to receiver) has an MTU size of 360 bytes. The number of fragments that would be delivered at the receiver is ______.'),
    question(90,2024,2,'1','Consider the entries shown below in the forwarding table of an IP router. Each entry consists of an IP prefix and the corresponding next hop router for packets whose destination IP address matches the prefix. The notation "/N" in a prefix indicates a subnet mask with the most significant N bits set to 1.\n'+raw`$$\begin{array}{lc}\text{Prefix}&\text{Next hop router}\\10.1.1.0/24&\text{R1}\\10.1.1.128/25&\text{R2}\\10.1.1.64/26&\text{R3}\\10.1.1.192/26&\text{R4}\end{array}$$`+'\nThis router forwards 20 packets each to 5 hosts. The IP addresses of the hosts are 10.1.1.16, 10.1.1.72, 10.1.1.132, 10.1.1.191, and 10.1.1.205. The number of packets forwarded via the next hop router R2 is ______.'),
    question(91,2024,1,'2','Which of the following fields of an IP header is/are always modified by any router before it forwards the IP packet?',['Time to Live (TTL)','Header Checksum','Protocol','Source IP Address']),
    question(92,2024,1,'2','Which of the following statements about IPv4 fragmentation is/are TRUE?',[
      'The fragmentation of an IP datagram is performed only at the source of the datagram.','The reassembly of fragments is performed at all intermediate routers along the path from the source to the destination.','The reassembly of the fragments is performed only at the destination of the datagram.','The fragmentation of an IP datagram is performed at any IP router which finds that the size of the datagram to be transmitted exceeds the MTU.',
    ]),
    question(93,2024,2,'2','Which one of the following CIDR prefixes exactly represents the range of IP address 10.12.2.0 to 10.12.3.255?',['10.12.0.0/22','10.12.2.0/22','10.12.2.0/24','10.12.2.0/23']),
    question(94,2024,2,'2',"Consider a TCP connection operating at a point of time with the congestion window of size 12 MSS (Maximum Segment Size), when a timeout occurs due to packet loss. Assuming that all the segments transmitted in the next two RTTs (Round Trip Time) are acknowledged correctly, the congestion window size (in MSS) during the third RTT will be ______."),
  ],
};
