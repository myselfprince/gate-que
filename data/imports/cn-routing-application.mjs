const raw = String.raw;
const sourceHash = 'adee929df2f3f0e6f1a7818ec0e2a9d42832439e11260789362993d1c9ac338b';

function question(number, year, marks, setNum, text, options = [], diagram = '', notes = []) {
  const bookPages = number <= 6 ? [708] : number <= 8 ? [708,709] : number === 9 ? [709]
    : number === 10 ? [709,710] : number <= 14 ? [710] : number <= 16 ? [710,711]
      : number <= 21 ? [711] : number <= 28 ? [712] : number <= 35 ? [713]
        : number === 36 ? [713,714] : number <= 42 ? [714] : [715];
  return {
    id: `madeeasy-cn-routing-4-${number}`,
    text, code: '', year: String(year), marks: String(marks), setNum,
    rawTopic: 'Routing and Application Layer', diagram, ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    natAnswer: '', correctOptions: [],
    questionType: !options.length ? 'NAT' : [36,41].includes(number) ? 'MSQ' : 'MCQ',
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false,
    needsManualOptionFix: false, optLayout: [8,15].includes(number) ? '2col' : 'auto', tempPaste: '',
    source: {
      file: '3. Computer Networks/4. Routing and Application Layer.pdf', sha256: sourceHash,
      questionNumber: `4.${number}`, bookPages,
      pdfPages: [...new Set(bookPages.map(page => Math.floor((page - 708) / 2) + 1))],
      answerKeyPdfPage: null, answerKeyStatus: 'not-supplied',
      ...(notes.length ? {notes} : {}),
    },
  };
}

const passage7 = `Linked Data for Q.4.7 and Q.4.8:
Consider the diagram shown below where a number of LANs are connected by (transparent) bridges. In order to avoid packets looping through circuits in the graph, the bridges organize themselves in a spanning tree. First, the root bridge is identified as the bridge with the least serial number. Next, the root sends out (one or more) data units to enable the setting up of the spanning tree of shortest paths from the root bridge to each bridge.
[IMG_1]
Each bridge identifies a port (the root port) through which it will forward frames to the root bridge. Port conflicts are always resolved in favour of the port with the lower index value. When there is a possibility of multiple bridges forwarding to the same LAN (but not through the root port), ties are broken as follows: bridges closest to the root get preference and between such bridges, the one with the lowest serial number is preferred.
`;
const bridgeNote = 'The printed shared diagram repeats host labels H11/H12 on both bottom LANs; the crop preserves these labels without correction.';
const passage15 = raw`Linked Answer Questions 4.15 and 4.16:
Consider a simple graph with unit edge costs. Each node in the graph represents a router. Each node maintains a routing table indicating the next hop router to be used to relay a packet to its destination and the cost of the path to the destination through that router. Initially, the routing table is empty. The routing table is synchronously updated as follows. In each updation interval, three tasks are performed.
(i) A node determines whether its neighbours in the graph are accessible. If so, it sets the tentative cost to each accessible neighbour as 1. Otherwise, the cost is set to $\infty$.
(ii) From each accessible neighbour, it gets the costs to relay to other nodes via that neighbour (as the next hop).
(iii) Each node updates its routing table based on the information received in the previous two steps by choosing the minimum cost.
[IMG_1]
`;
const passage19 = `Linked Data Questions Q.4.19 and Q.4.20:
Consider a network with 6 routers R1 to R6 connected with links having weights as shown in the following diagram.
[IMG_1]
`;
const premise19 = 'All the routers use the distance vector based routing algorithm to update their routing tables. Each router starts with its routing table initialized to contain an entry for each neighbour with the weight of the respective connecting link.\n';
const passage22 = raw`Linked Data Question Q.4.22 and Q.4.23:
Consider a network with five nodes, N1 to N5, as shown below:
[IMG_1]
The network uses a Distance Vector Routing protocol. Once the routes have stabilized, the distance vectors at different nodes are as following.
$$\begin{array}{rl}\mathrm{N1}:&(0,1,7,8,4)\\\mathrm{N2}:&(1,0,6,7,3)\\\mathrm{N3}:&(7,6,0,2,6)\\\mathrm{N4}:&(8,7,2,0,4)\\\mathrm{B5}:&(4,3,6,4,0)\end{array}$$
Each distance vector is the distance of the best known path at that instance to nodes, N1 to N5, where the distance to itself is 0. Also, all links are symmetric and the cost is identical in both directions. In each round, all nodes exchange their distance vectors with their respective neighbors. Then all nodes update their distance vectors. In between two rounds, any change in cost of a link will cause the two incident nodes to change only that entry in their distance vectors.
`;
const vectorNote = 'The final distance-vector row is printed B5, although the network node is N5; B5 is preserved as printed.';

export const ROUTING_APPLICATION_IMPORT = {
  subject: '3. Computer Networks', chapter: '4. Routing and Application Layer', sourceHash,
  questions: [
    question(1,2004,1,'','Which one of the following statements is FALSE?',[
      'Packet switching leads to better utilization of bandwidth resources than circuit switching',
      'Packet switching results in less variation in delay than circuit switching',
      'Packet switching requires more per-packet processing than circuit switching',
      'Packet switching can lead to reordering unlike in circuit switching',
    ]),
    question(2,2005,1,'','Consider the three commands: PROMPT, HEAD and RCPT. Which of the following options indicate a correct association of these commands with protocols where these are used?',[
      'HTTP, SMTP, FTP','FTP, HTTP, SMTP','HTTP, FTP, SMTP','SMTP, HTTP, FTP',
    ]),
    question(3,2005,1,'','Traceroute reports a possible route that is taken by packets moving from some host A to some other host B. Which of the following options represents the technique used by traceroute to identify these hosts',[
      'By progressively querying routers about the next router on the path to B using ICMP packets, starting with the first router',
      'By requiring each router to append the address to the ICMP packet as it is forwarded to B. The list of all routers en-route to B is returned by B in an ICMP reply packet',
      'By ensuring that an ICMP reply packet is returned to A by each router en-route to B, in the ascending order of their hop distance from A',
      'By locally computing the shortest path from A to B',
    ]),
    question(4,2005,1,'','Count to infinity is a problem associated with',[
      'Link state routing protocol.','Distance vector routing protocol.','DNS while resolving host name.','TCP for congestion control.',
    ]),
    question(5,2005,2,'','Assume that "host1.mydomain.dom" has an IP address of 145.128.16.8. Which of the following options would be most appropriate as a subsequent sequence of steps in performing the reverse lookup of 145.128.16.8? In the following options "NS" is an abbreviation of "nameserver".',[
      'Query a NS for the root domain and then NS for the "dom" domains',
      'Directly query a NS for "dom" and then a NS for "mydomain.dom" domains',
      'Query a NS for in-addr.arpa and then a NS for 128.145.in-addr.arpa domains',
      'Directly query a NS for 145.in-addr.arpa and then a NS for 128.145.in-addr.arpa domains',
    ]),
    question(6,2006,2,'','HELO and PORT, respectively, are commands from the protocols',[
      'FTP and HTTP','TELNET and POP3','HTTP and TELNET','SMTP and FTP',
    ]),
    question(7,2006,2,'',passage7+'For the given connection of LANs by bridges, which one of the following choices represents the depth first traversal of the spanning tree of bridges?',[
      'B1, B5, B3, B4, B2','B1, B3, B5, B2, B4','B1, B5, B2, B3, B4','B1, B3, B4, B5, B2',
    ],'cn-routing-4-7-bridges',[bridgeNote]),
    question(8,2006,2,'',passage7+'Consider the correct spanning tree for the previous question. Let host H1 send out a broadcast ping packet. Which of the following options represents the correct forwarding table on B3?',[
      raw`$\begin{array}{l|r}\text{Hosts}&\text{Port}\\\mathrm{H1,H2,H3,H4}&3\\\mathrm{H5,H6,H9,H10}&1\\\mathrm{H7,H8,H11,H12}&2\end{array}$`,
      raw`$\begin{array}{l|r}\text{Hosts}&\text{Port}\\\mathrm{H1,H2}&4\\\mathrm{H3,H4}&3\\\mathrm{H5,H6}&1\\\mathrm{H7,H8,H9,H10,H11,H12}&2\end{array}$`,
      raw`$\begin{array}{l|r}\text{Hosts}&\text{Port}\\\mathrm{H3,H4}&3\\\mathrm{H5,H6,H9,H10}&1\\\mathrm{H1,H2}&4\\\mathrm{H7,H8,H11,H12}&2\end{array}$`,
      raw`$\begin{array}{l|r}\text{Hosts}&\text{Port}\\\mathrm{H1,H2,H3,H4}&3\\\mathrm{H5,H7,H9,H10}&1\\\mathrm{H7,H8,H11,H12}&4\end{array}$`,
    ],'cn-routing-4-7-bridges',[bridgeNote]),
    question(9,2007,1,'','Which of the following uses UDP as the transport protocol?1',['HTTP','Telnet','DNS','SMTP'], '', ['A trailing 1 is printed after the question mark in the source.']),
    question(10,2007,2,'',raw`For the network given in the figure below, the routing tables of the four nodes A, E, D and G are shown. Suppose that F has estimated its delay to its neighbors, A, E, D and G as 8, 10, 12 and 6 msecs respectively and updates its routing table using distance vector routing technique.
[IMG_1]
$$\begin{array}{c|rrrr}\text{Destination}&\text{Table of A}&\text{Table of E}&\text{Table of D}&\text{Table of G}\\A&0&24&20&21\\B&40&27&8&24\\C&14&7&30&22\\D&17&20&0&19\\E&21&0&14&22\\F&9&11&7&10\\G&24&22&22&0\end{array}$$`,[
      raw`$\begin{array}{c|rrrrrrr}&A&B&C&D&E&F&G\\\text{Distance}&8&20&17&12&10&0&6\end{array}$`,
      raw`$\begin{array}{c|rrrrrrr}&A&B&C&D&E&F&G\\\text{Distance}&21&8&7&19&14&0&22\end{array}$`,
      raw`$\begin{array}{c|rrrrrrr}&A&B&C&D&E&F&G\\\text{Distance}&8&20&17&12&10&16&6\end{array}$`,
      raw`$\begin{array}{c|rrrrrrr}&A&B&C&D&E&F&G\\\text{Distance}&8&8&7&12&10&0&6\end{array}$`,
    ],'cn-routing-4-10-network'),
    question(11,2007,2,'','A group of 15 routers are interconnected in a centralized complete binary tree with a router at each tree node. Router i communicates with router j by sending a message to the root of the tree. The root then sends the message back down to router j. The mean number of hops per message, assuming all possible router pairs are equally likely is',['3','4.26','4.53','5.26']),
    question(12,2007,2,'',`Consider the following clauses:
(i) Not inherently suitable for client authentication.
(ii) Not a state sensitive protocol.
(iii) Must be operated with more than one server.
(iv) Suitable for structured message organization.
(v) May need two ports on the serve side for proper operation.
The option that has the maximum number of correct matches is`,[
      'IMAP-(i), FTP-(ii), HTTP-(iii), DNS-(iv), POP3-(v)',
      'FTP-(i), POP3-(ii), SMTP-(iii), HTTP-(iv), IMAP-(v)',
      'POP3-(i), SMTP-(ii), DNS-(iii), IMAP-(iv), HTTP-(v)',
      'SMTP-(i), HTTP-(ii), IMAP-(iii), DNS-(iv), FTP-(v)',
    ]),
    question(13,2007,2,'',raw`Match the following:
$$\begin{array}{ll}P.\ \mathrm{SMTP}&1.\ \text{Application layer}\\Q.\ \mathrm{BGP}&2.\ \text{Transport layer}\\R.\ \mathrm{TCP}&3.\ \text{Data link layer}\\S.\ \mathrm{PPP}&4.\ \text{Network layer}\\&5.\ \text{Physical layer}\end{array}$$
Codes:`,['P-2, Q-1, R-3, S-5','P-1, Q-4, R-2, S-3','P-1, Q-4, R-2, S-5','P-2, Q-4, R-1, S-3']),
    question(14,2008,2,'',`Two popular routing algorithms are Distance Vector (DV) and Link State (LS) routing. Which of the following are true?
S1: Count to infinity is a problem only with DV and not LS routing
S2: In LS, the shortest path algorithm is run only at one node
S3: In DV, the shortest path algorithm is run only at one node
S4: DV requires lesser number of network messages than LS`,['S1, S2 and S4 only','S2 and S3 only','S1, S2 and S3 only','S1 and S4 only']),
    question(15,2005,2,'',passage15+'For the graph given above, possible routing tables for various nodes after they have stabilized, are shown in the following options. Identify the correct table.',[
      raw`Table for node A
$\begin{array}{c|cc}A&-&-\\B&B&1\\C&C&1\\D&B&3\\E&C&3\\F&C&4\end{array}$`,
      raw`Table for node C
$\begin{array}{c|cc}A&A&1\\B&B&1\\C&-&-\\D&D&1\\E&E&1\\F&E&3\end{array}$`,
      raw`Table for node B
$\begin{array}{c|cc}A&A&1\\B&-&-\\C&C&1\\D&D&1\\E&C&2\\F&D&2\end{array}$`,
      raw`Table for node D
$\begin{array}{c|cc}A&B&3\\B&B&1\\C&C&1\\D&-&-\\E&E&1\\F&F&1\end{array}$`,
    ],'cn-routing-4-15-graph',['The source prints GATE 2005 for Q4.15 and Q4.16 despite their placement after 2008 questions; the printed years are retained.']),
    question(16,2005,2,'',passage15+'Continuing from the earlier problem, suppose at some time t, when the costs have stabilized, node A goes down. The cost from node F to node A at time (t + 100) is:',[raw`$>100$ but finite`,raw`$\infty$`,'3',raw`$>3$ and $\leq100$`],'cn-routing-4-15-graph'),
    question(17,2008,2,'','A computer on a 10 Mbps network is regulated by a token bucket. The token bucket is filled at a rate of 2 Mbps. It is initially filled to capacity with 16 Megabits. What is the maximum duration for which the computer can transmit at the full 10 Mbps?',['1.6 seconds','2 seconds','5 seconds','8 seconds']),
    question(18,2010,1,'','Which one of the following is not a client-server application?',['Internet chat','Web browsing','E-mail','Ping']),
    question(19,2010,2,'',passage19+premise19+'After all the routing tables stabilize, how many links in the network will never be used for carrying any data?',['4','3','2','1'],'cn-routing-4-19-network'),
    question(20,2010,2,'',passage19+premise19+'After all the routing tables stabilize, how many links in the network will never be used for carrying any data?\nSuppose the weights of all unused links in the previous question are changed to 2 and the distance vector algorithm is used again until all routing tables stabilize. How many links will now remain unused?',['0','1','2','3'],'cn-routing-4-19-network'),
    question(21,2011,1,'',`Consider different activities related to email
m1: Send an email from a mail client to a mail server
m2: Download an email from mailbox server to a mail client
m3: Checking email in a web browser`,[
      'm1:HTTP m2:SMTP m3:POP','m1:SMTP m2:FTP m3:HTTP','m1:SMTP m2:POP m3:HTTP','m1:POP m2:SMTP m3:IMAP',
    ]),
    question(22,2011,2,'',passage22+'The cost of link N2-N3 reduces to 2 (in both directions). After the next round of updates, what will be the new distance vector at node, N3?',[
      '(3, 2, 0, 2, 5)','(3, 2, 0, 2, 6)','(7, 2, 0, 2, 5)','(7, 2, 0, 2, 6)',
    ],'cn-routing-4-22-network',[vectorNote]),
    question(23,2011,2,'',passage22+raw`Previous question (Q4.22): The cost of link N2-N3 reduces to 2 (in both directions). After the next round of updates, what will be the new distance vector at node, N3?
After the update in the previous question, the link N1-N2 goes down. N2 will reflect this change immediately in its distance vector as cost $\infty$. After the NEXT ROUND of update, what will be the cost to N1 in the distance vector of N3?`,['3','9','10',raw`$\infty$`],'cn-routing-4-22-network',[vectorNote]),
    question(24,2012,1,'','The Protocol Data Unit (PDU) for the application layer in the Internet stack is',['Segment','Datagram','Message','Frame']),
    question(25,2013,1,'','The transport layer protocols used for real time multimedia, file transfer, DNS and email, respectively are',[
      'TCP, UDP, UDP and TCP','UDP, TCP, TCP and UDP','UDP, TCP, UDP and TCP','TCP, UDP, TCP and UDP',
    ]),
    question(26,2013,1,'','Assume that source S and destination D are connected through two intermediate routers labels R. Determine how many times each packet has to visit the network layer and the data link layer during a transmission form S to D.\n[IMG_1]',[
      'Network layer - 4 times and Data link layer - 4 times','Network layer - 4 times and Data link layer - 3 times',
      'Network layer - 4 times and Data link layer - 6 times','Network layer - 2 times and Data link layer - 6 times',
    ],'cn-routing-4-26-path'),
    question(27,2014,1,'1',`Consider the following three statements about link state and distance vector routing protocols, for a large network with 500 network nodes and 4000 links.
S1: The computational overhead in link state protocols is higher than in distance vector protocols.
S2: A distance vector protocol (with split horizon) avoids persistent routing loops, but not a link state protocol.
S3: After a topology change, a link state protocol will converge faster than a distance vector protocol.
Which one of the following is correct about S1, S2, and S3?`,[
      'S1, S2, and S3 are all true.','S1, S2, and S3 are all false.','S1 and S2 are true, but S3 is false.','S1 and S3 are true, but S2 is false.',
    ]),
    question(28,2014,1,'2','Which one of the following is TRUE about the interior gateway routing protocols - Routing Information Protocol (RIP) and Open Shortest Path First (OSPF)',[
      'RIP uses distance vector routing and OSPF uses link state routing','OSPF uses distance vector routing and RIP uses link state routing',
      'Both RIP and OSPF use link state routing','Both RIP and OSPF use distance vector routing',
    ]),
    question(29,2014,2,'2',raw`An IP machine $Q$ has a path to another IP machine H via three IP routers $R1$, $R2$, and $R3$.
$$Q-R1-R2-R3-H$$
$H$ acts as an HTTP server, and $Q$ connects to $H$ via HTTP and downloads a file. Session layer encryption is used, with DES as the shared key encryption protocol. Consider the following four pieces of information:
[I1] The URL of the file downloaded by $Q$
[I2] The TCP port numbers at $Q$ and $H$
[I3] The IP addresses of $Q$ and $H$
[I4] The link layer addresses of $Q$ and $H$
Which of I1, I2, I3, and I4 can an intruder learn through sniffing at $R2$ alone?`,['Only I1 and I2','Only I1','Only I2 and I3','Only I3 and I4']),
    question(30,2015,1,'1','In one of the pairs of protocols given below, both the protocols can use multiple TCP connections between the same client and the server. Which one is that?',['HTTP, FTP','HTTP, TELNET','FTP, SMTP','HTTP, SMTP']),
    question(31,2016,1,'2','Identify the correct sequence in which the following packets are transmitted on the network by a host when a browser requests a webpage from a remote server, assuming that the host has just been restarted.',[
      'HTTP GET request, DNS query, TCP SYN','DNS query, HTTP GET request, TCP SYN','DNS query, TCP SYN, HTTP GET request','TCP SYN, DNS query, HTTP GET request',
    ]),
    question(32,2018,2,'','Consider an IP packet with a length of 4500 bytes that includes a 20-byte IPv4 header and a 40-byte TCP header. The packet is forwarded to an IPv4 router that supports a Maximum Transmission Unit (MTU) of 600 bytes. Assume that the length of the IP header in all the outgoing fragments of this packet is 20 bytes. Assume that the fragmentation offset value stored in the first fragment is 0.\nThe fragmentation offset value stored in the third fragment is ______.'),
    question(33,2019,1,'','Which of the following protocol pairs can be used to send and retrieve e-mails (in that order)?',['IMAP, SMTP','SMTP, MIME','IMAP, POP3','SMTP, POP3'],'',[
      'Printed option labels are (a), (d), (c), (d). The second option is retained in positional optB; its printed label is (d).',
    ]),
    question(34,2020,1,'',`Consider the following statements about the functionality of an IP based router.
I. A router does not modify the IP packets during forwarding.
II. It is not necessary for a router to implement any routing protocol.
III. A router should reassemble IP fragments if the MTU of the outgoing link is larger than the size of the incoming IP packet.
Which of the above statements is/are TRUE?`,['I only','I and II only','II and III only','II only']),
    question(35,2020,1,'','Assume that you have made a request for a web page through your web browser to a web server. Initially the browser cache is empty. Further, the browser is configured to send HTTP requests in non-persistent mode. The web page contains text and five very small images. The minimum number of TCP connections required to display the web page completely in your browser is ______.'),
    question(36,2021,2,'2',raw`Consider a computer network using the distance vector routing algorithm in its network layer. The partial topology of the network is as shown below.
[IMG_1]
The objective is to find the shortest-cost path from the router $R$ to routers $P$ and $Q$. Assume that $R$ does not initially know the shortest routes to $P$ and $Q$. Assume that $R$ has three neighbouring routers denoted as $X$, $Y$ and $Z$. During one iteration, $R$ measures its distance to its neighbours $X$, $Y$ and $Z$ as 3, 2 and 5, respectively. Router $R$ gets routing vectors from its neighbours that indicate that the distance to router $P$ from routers $X$, $Y$ and $Z$ are 7, 6 and 5, respectively. The routing vector also indicates that the distance to router $Q$ from routers $X$, $Y$ and $Z$ are 4, 6 and 8, respectively. Which of the following statement(s) is/are correct with respect to the new routing table of $R$, after updation during this iteration?`,[
      raw`The distance from $R$ to $Q$ will be stored as 7.`,raw`The distance from $R$ to $P$ will be stored as 10.`,
      raw`The next hop router for a packet from $R$ to $Q$ is $Z$.`,raw`The next hop router for a packet from $R$ to $P$ is $Y$.`,
    ],'cn-routing-4-36-topology'),
    question(37,2022,1,'','Consider an enterprise network with two Ethernet segments, a web server and a firewall, connected via three routers as shown below:\n[IMG_1]\nWhat is the number of subnets inside the enterprise network?',['3','12','6','8'],'cn-routing-4-37-enterprise'),
    question(38,2022,1,'','Consider the resolution of the domain name www.gate.org.in by a DNS resolver. Assume that no resource records are cached anywhere across the DNS servers and that the iterative query mechanism is used in the resolution. The number of DNS query-response pairs involved in completely resolving the domain name is ______.'),
    question(39,2022,2,'',raw`Consider routing table of an organization's router shown below:
$$\begin{array}{lll}\text{Subnet number}&\text{Subnet mask}&\text{Next hop}\\12.20.164.0&255.255.252.0&R1\\12.20.170.0&255.255.254.0&R2\\12.20.168.0&255.255.254.0&\text{Interface 0}\\12.20.166.0&255.255.254.0&\text{Interface 1}\\\text{default}&&R3\end{array}$$
Which of the following prefixes in CIDR notation can be collectively used to correctly aggregate all of the subnets in the routing table?`,['12.20.164.0/20','12.20.164.0/22','12.20.164.0/21','12.20.168.0/22']),
    question(40,2022,2,'','Consider a network with three routers P, Q, R shown in the figure below. All the links have cost of unity.\n[IMG_1]\nThe routers exchange distance vector routing information and have converged on the routing tables, after which the link Q-R fails. Assume that P and Q send out routing updates at random times, each at the same average rate. The probability of a routing loop formation (rounded off to one decimal place) between P and Q, leading to count-to-infinity problem, is ______. ',[],'cn-routing-4-40-path'),
    question(41,2023,1,'','Which of the following statements is/are INCORRECT about the OSPF (Open Shortest Path First) routing protocol used in the Internet?',[
      'OSPF implements Bellman-Ford algorithm to find shortest paths.',
      "OSPF uses Dijkstra's shortest path algorithm to implement least-cost path routing.",
      'OSPF is used as an inter-domain routing protocol.','OSPF implements hierarchical routing.',
    ]),
    question(42,2024,1,'1',`A user starts browsing a webpage hosted at a remote server. The browser opens a single connection to fetch the entire webpage from the server. The webpage consists of a top-level index page with multiple embedded image objects. Assume that all caches (e.g., DNS cache, browser cache) are all initially empty. The following packets leave the user's computer in some order.
(i) HTTP GET request for the index page.
(ii) DNS request to resolve the web server's name to its IP address.
(iii) HTTP GET request for an image object.
(iv) TCP SYN to open a connection to the web server.
Which of the following is the CORRECT chronological order (earliest in time to latest) of the packets leaving the computer?`,[
      '(iv), (ii), (iii), (i)','(iv), (ii), (i), (iii)','(ii), (iv), (i), (iii)','(ii), (iv), (iii), (i)',
    ]),
    question(43,2024,2,'1',raw`Consider a network path $P-Q-R$ between nodes $P$ and $R$ via a router $Q$. Node $P$ sends a file of size $10^6$ bytes to $R$ via this path by splitting the file into chunks of $10^3$ bytes each. Node $P$ sends these chunks one after the other without any wait time between the successive chunk transmissions. Assume that the size of extra headers added to these chunks is negligible, and that the chunk size is less than the MTU.
Each of the links $P-Q$ and $Q-R$ has a bandwidth of $10^6$ bits/sec, and negligible propagation latency. Router $Q$ immediately transmits every packet it receives from $P$ to $R$, with negligible processing and queueing delays. Router $Q$ can simultaneously receive on link $P-Q$ and transmit on link $Q-R$.
Assume $P$ starts transmitting the chunks at time $t=0$.
Which one of the following options gives the time (in seconds, rounded off to 3 decimal places) at which $R$ receives all the chunks of the file?`,['16.000','8.000','8.008','15.992']),
  ],
};
