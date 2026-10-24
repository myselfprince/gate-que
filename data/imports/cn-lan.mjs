// Visually transcribed from the user's scanned chapter; answers follow its key.
const sourceHash = 'c285f967a7939091d6d7c20c98b9e762b44751111cd56e606730c491c66c46ea';
const raw = String.raw;

function question(number, year, marks, setNum, text, options, answer, type) {
  const numerical = options.length === 0;
  return {
    id: `madeeasy-cn-lan-2-${number}`,
    text, code: '', year: String(year), marks: String(marks), setNum,
    rawTopic: 'LAN', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    natAnswer: numerical ? String(answer) : '',
    correctOptions: numerical ? [] : [answer],
    questionType: type || (numerical ? 'NAT' : 'MCQ'),
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false,
    needsManualOptionFix: false, optLayout: 'auto', tempPaste: '',
    source: {
      file: '3. Computer Networks/2. LAN.pdf', sha256: sourceHash,
      questionNumber: `2.${number}`,
      pdfPages: number <= 9 ? [1] : number <= 29 ? [2] : number === 30 ? [2, 3] : [3],
      bookPages: number <= 9 ? [677] : number <= 20 ? [678] : number <= 29 ? [679] : number === 30 ? [679, 680] : [680],
      answerKeyPdfPage: 3,
    },
  };
}

export const LAN_IMPORT = {
  subject: '3. Computer Networks', chapter: '2. LAN',
  sourceHash,
  questions: [
    question(1, 2003, 2, '', raw`A $2\,\mathrm{km}$ long broadcast LAN has $10^7\,\mathrm{bps}$ bandwidth and uses CSMA/CD. The signal travels along the wire at $2\times10^8\,\mathrm{m/s}$. What is the minimum packet size that can be used on this network?`,
      ['50 bytes', '100 bytes', '200 bytes', 'None of these'], 'D'),
    question(2, 2004, 1, '', 'A host is connected to a Department network which is part of a University network. The University network, in turn, is part of the Internet. The largest network in which the Ethernet address of the host is unique is',
      ['the subnet to which the host belongs', 'the Department network', 'the University network', 'the Internet'], 'D'),
    question(3, 2004, 2, '', raw`Consider a simplified time slotted MAC protocol, where each host always has data to send and transmits with probability $p=0.2$ in every slot. There is no backoff and one frame can be transmitted in one slot. If more than one host transmits in the same slot, the transmission is unsuccessful due to collision. What is the maximum number of hosts which this protocol can support, if each host has to be provided a minimum throughput of $0.16$ frames per time slot?`,
      ['1', '2', '3', '4'], 'B'),
    question(4, 2004, 2, '', 'A and B are the only two stations on an Ethernet. Each has a steady queue of frames to send. Both A and B attempt to transmit a frame, collide, and A wins the first backoff race. At the end of this successful transmission by A, both A and B attempt to transmit and collide. The probability that A wins the second backoff race is',
      ['0.5', '0.625', '0.75', '1.0'], 'B'),
    question(5, 2005, 1, '', 'In a network of LANs connected by bridges, packets are sent from one LAN to another through intermediate bridges. Since more than one path may exist between two LANs, packets may have to be routed through multiple bridges. Why is the spanning tree algorithm used for bridge-routing?',
      ['For shortest path routing between LANs', 'For avoiding loops in the routing paths', 'For fault tolerance', 'For minimizing collisions'], 'B'),
    question(6, 2005, 1, '', 'Which of the following statements is TRUE about CSMA/CD?',
      ['IEEE 802.11 wireless LAN runs CSMA/CD protocol', 'Ethernet is not based on CSMA/CD protocol', 'CSMA/CD is not suitable for a high propagation delay network like satellite network', 'There is no contention in a CSMA/CD network'], 'C'),
    question(7, 2005, 1, '', 'Which of the following statements is FALSE regarding a bridge?',
      ['Bridge is a layer 2 device', 'Bridge reduces collision domain', 'Bridge is used to connect two or more LAN segments', 'Bridge reduces broadcast domain'], 'D'),
    question(8, 2005, 2, '', raw`A network with CSMA/CD protocol in the MAC layer is running at $1\,\mathrm{Gbps}$ over a $1\,\mathrm{km}$ cable with no repeaters. The signal speed in the cable is $2\times10^8\,\mathrm{m/sec}$. The minimum frame size for this network should be`,
      ['10000 bits', '10000 bytes', '5000 bits', '5000 bytes'], 'A'),
    question(9, 2005, 2, '', raw`In a TDM medium access control bus LAN, each station is assigned one time slot per cycle for transmission. Assume that the length of each time slot is the time to transmit $100$ bits plus the end-to-end propagation delay. Assume a propagation speed of $2\times10^8\,\mathrm{m/sec}$. The length of the LAN is $1\,\mathrm{km}$ with a bandwidth of $10\,\mathrm{Mbps}$. The maximum number of stations that can be allowed in the LAN so that the throughput of each station can be $2/3\,\mathrm{Mbps}$ is`,
      ['3', '5', '10', '20'], 'C'),
    question(10, 2006, 2, '', raw`A router has two full-duplex Ethernet interfaces each operating at $100\,\mathrm{Mb/s}$. Ethernet frames are at least $84$ bytes long (including the Preamble and the Inter-Packet-Gap).
The maximum packet processing time at the router for wirespeed forwarding to be possible is (in micro-seconds)`,
      ['0.01', '3.36', '6.72', '8'], 'B'),
    question(11, 2007, 1, '', 'In Ethernet when Manchester encoding is used, the bit rate is',
      ['Half the baud rate', 'Twice the baud rate', 'Same as the baud rate', 'None of these'], 'A'),
    question(12, 2007, 2, '', raw`A broadcast channel has $10$ nodes and a total capacity of $10\,\mathrm{Mbps}$. It uses polling for medium access. Once a node finishes transmission, there is a polling delay of $80\,\mu\mathrm{s}$ to poll the next node. Whenever a node is polled, it is allowed to transmit a maximum of $1000$ bytes. The maximum throughput of the broadcast channel is`,
      ['1 Mbps', raw`$\dfrac{100}{11}\,\mathrm{Mbps}$`, '10 Mbps', '100 Mbps'], 'B'),
    question(13, 2007, 2, '', raw`There are $n$ stations in a slotted LAN. Each station attempts to transmit with a probability $p$ in each time slot. What is the probability that ONLY one station transmits in a given time slot?`,
      [raw`$np(1-p)^{n-1}$`, raw`$(1-p)^{n-1}$`, raw`$p(1-p)^{n-1}$`, raw`$1-(1-p)^{n-1}$`], 'A'),
    question(14, 2007, 2, '', raw`The distance between two stations M and N is $L$ kilometres. All frames are $K$ bits long. The propagation delay per kilometre is $t$ seconds. Let $R\,\mathrm{bits/second}$ be the channel capacity. Assuming that processing delay is negligible, the minimum number of bits for the sequence number field in a frame for maximum utilization, when the sliding window protocol is used, is:`,
      [raw`$\left[\log_2\dfrac{2LtR+2K}{K}\right]$`, raw`$\left[\log_2\dfrac{2LtR}{K}\right]$`, raw`$\left[\log_2\dfrac{2LtR+K}{K}\right]$`, raw`$\left[\log_2\dfrac{2LtR+K}{2K}\right]$`], 'C'),
    question(15, 2008, 2, '', raw`The minimum frame size required for a CSMA/CD based computer network running at $1\,\mathrm{Gbps}$ on a $200\,\mathrm{m}$ cable with a link speed of $2\times10^8\,\mathrm{m/s}$ is`,
      ['125 bytes', '250 bytes', '500 bytes', 'None of these'], 'B'),
    question(16, 2012, 2, '', raw`Consider a source computer (S) transmitting a file of size $10^6$ bits to a destination computer (D) over a network of two routers ($R_1$ and $R_2$) and three links ($L_1$, $L_2$ and $L_3$). $L_1$ connects S to $R_1$; $L_2$ connects $R_1$ to $R_2$; and $L_3$ connects $R_2$ to D. Let each link be of length $100\,\mathrm{km}$. Assume signals travel over each link at a speed of $10^8$ meters per second. Assume that the link bandwidth on each link is $1\,\mathrm{Mbps}$. Let the file be broken down into $1000$ packets each of size $1000$ bits. Find the total sum of transmission and propagation delays in transmitting the file from S to D?`,
      ['1005 ms', '1010 ms', '3000 ms', '3003 ms'], 'A'),
    question(17, 2013, 2, '', raw`Determine the maximum length of the cable (in km) for transmitting data at a rate of $500\,\mathrm{Mbps}$ in an Ethernet LAN with frames of size $10{,}000$ bits. Assume the signal speed in the cable to be $2{,}00{,}000\,\mathrm{km/s}$.`,
      ['1', '2', '2.5', '5'], 'B'),
    question(18, 2015, 2, '1', raw`Consider a LAN with four nodes $S_1$, $S_2$, $S_3$ and $S_4$. Time is divided into fixed-size slots, and a node can begin its transmission only at the beginning of a slot. A collision is said to have occurred if more than one node transmits in the same slot. The probabilities of generation of a frame in a time slot by $S_1$, $S_2$, $S_3$ and $S_4$ are $0.1$, $0.2$, $0.3$ and $0.4$, respectively. The probability of sending a frame in the first slot without any collision by any of the four stations is ______.`,
      [], '0.4404'),
    question(19, 2015, 1, '3', raw`Consider a CSMA/CD network that transmits data at a rate of $100\,\mathrm{Mbps}$ ($10^8$ bits per second) over a $1\,\mathrm{km}$ (kilometer) cable with no repeaters. If the minimum frame size required for this network is $1250$ bytes, what is the signal speed (km/sec) in the cable?`,
      ['8000', '10000', '16000', '20000'], 'D'),
    question(20, 2016, 2, '1', 'Which one of the following protocols is NOT used to resolve one form of address to another one?',
      ['DNS', 'ARP', 'DHCP', 'RARP'], 'A'),
    question(21, 2016, 2, '1', 'Which of the following is/are example(s) of stateful application layer protocols?\n(i) HTTP                       (ii) FTP\n(iii) TCP                      (iv) POP3',
      ['(i) and (ii) only', '(ii) and (iii) only', '(ii) and (iv) only', '(iv) only'], 'C'),
    question(22, 2016, 2, '1', raw`A sender uses the Stop-and-Wait ARQ protocol for reliable transmission of frames. Frames are of size $1000$ bytes and the transmission rate at the sender is $80\,\mathrm{Kbps}$ ($1\,\mathrm{Kbps}=1000\,\mathrm{bits/second}$). Size of an acknowledgment is $100$ bytes and the transmission rate at the receiver is $8\,\mathrm{Kbps}$. The one-way propagation delay is $100$ milliseconds. Assuming no frame is lost, the sender throughput is ______ bytes/second.`,
      [], '2500'),
    question(23, 2016, 2, '2', 'In an Ethernet local area network, which one of the following statements is TRUE?',
      ['A station stops to sense the channel once it starts transmitting a frame.', 'The purpose of the jamming signal is to pad the frames that are smaller than the minimum frame size.', 'A station continues to transmit the packet even after the collision is detected.', 'The exponential backoff mechanism reduces the probability of collision on retransmissions.'], 'D'),
    question(24, 2016, 2, '2', raw`A network has a data transmission bandwidth of $20\times10^6$ bits per second. It uses CSMA/CD in the MAC layer. The maximum signal propagation time from one node to another node is $40$ microseconds. The minimum size of a frame in the network is ______ bytes.`,
      [], '200'),
    question(25, 2016, 2, '2', raw`Consider a $128\times10^3\,\mathrm{bits/second}$ satellite communication link with one way propagation delay of $150$ milliseconds. Selective retransmission (repeat) protocol is used on this link to send data with a frame size of $1$ kilobyte. Neglect the transmission time of acknowledgement. The minimum number of bits required for the sequence number field to achieve $100\%$ utilization is ______.`,
      [], '4'),
    question(26, 2016, 2, '2', 'For the IEEE 802.11 MAC protocol for wireless communication, which of the following statements is/are TRUE?\nI. At least three non-overlapping channels are available for transmission.\nII. The RTS-CTS mechanism is used for collision detection.\nIII. Unicast frames are ACKed.',
      ['All I, II, and III', 'I and III only', 'II and III only', 'II only'], 'B'),
    question(27, 2017, 2, '1', raw`The values of parameters for the Stop-and-Wait ARQ protocol are as given below:
• Bit rate of the transmission channel = $1\,\mathrm{Mbps}$.
• Propagation delay from sender to receiver = $0.75\,\mathrm{ms}$.
• Time to process a frame = $0.25\,\mathrm{ms}$.
• Number of bytes in the information frame = $1980$.
• Number of bytes in the acknowledge frame = $20$.
• Number of overhead bytes in the information frame = $20$.
Assume that there are no transmission errors. Then, the transmission efficiency (expressed in percentage) of the Stop-and-Wait ARQ protocol for the above parameters is ______ (correct to 2 decimal places).`,
      [], '89.33'),
    question(28, 2017, 2, '1', raw`A computer network uses polynomials over $\mathrm{GF}(2)$ for error checking with $8$ bits as information bits and uses $x^3+x+1$ as the generator polynomial to generate the check bits. In this network, the message $01011011$ is transmitted as`,
      ['01011011010', '01011011011', '01011011101', '01011011100'], 'C'),
    question(29, 2017, 2, '2', raw`Consider a binary code that consists of only four valid codewords as given below:
$00000,\;01011,\;10101,\;11110$
Let the minimum Hamming distance of the code be $p$ and the maximum number of erroneous bits that can be corrected by the code be $q$. Then the values of $p$ and $q$ are`,
      [raw`$p=3$ and $q=1$`, raw`$p=3$ and $q=2$`, raw`$p=4$ and $q=1$`, raw`$p=4$ and $q=2$`], 'A'),
    question(30, 2018, 2, '', raw`Consider a simple communication system where multiple nodes are connected by a shared broadcast medium (like Ethernet or wireless). The nodes in the system use the following carrier-sense based medium access protocol. A node that receives a packet to transmit will carrier-sense the medium for $5$ units of time. If the node does not detect any other transmission in this duration, it starts transmitting its packet in the next time unit. If the node detects another transmission, it waits until this other transmission finishes, and then begins to carrier-sense for $5$ time units again. Once they start to transmit, nodes do not perform any collision detection and continue transmission even if a collision occurs. All transmissions last for $20$ units of time. Assume that the transmission signal travels at the speed of $10$ meters per unit time in the medium.
Assume that the system has two nodes P and Q, located at a distance $d$ meters from each other. P starts transmitting a packet at time $t=0$ after successfully completing its carrier-sense phase. Node Q has a packet to transmit at time $t=0$ and begins to carrier-sense the medium. The maximum distance $d$ (in meters, round to the closest integer) that allows Q to successfully avoid a collision between its proposed transmission and P's on-going transmission is ______.`,
      [], '50'),
    question(31, 2019, 2, '', raw`Consider that $15$ machines need to be connected in a LAN using $8$-port Ethernet switches. Assume that these switches do not have any separate uplink ports. The minimum number of switches needed is ______.`,
      [], '3'),
    question(32, 2019, 2, '', 'Suppose that in an IP-over-Ethernet network, a machine X wishes to find the MAC address of another machine Y in its subnet. Which one of the following techniques can be used for this?',
      ['X sends an ARP request packet with broadcast IP address in its local subnet', 'X sends an ARP request packet to the local gateway\u2019s MAC address which then finds the MAC address of Y and sends to X', 'X sends an ARP request packet with broadcast MAC address in its local subnet', 'X sends an ARP request packet to the local gateway\u2019s IP address which then finds the MAC address of Y and sends to X'], 'C'),
    question(33, 2021, 2, '2', raw`Consider a network using the pure ALOHA medium access control protocol, where each frame is of length $1{,}000$ bits. The channel transmission rate is $1\,\mathrm{Mbps}$ ($=10^6$ bits per second). The aggregate number of transmissions across all the nodes (including new frame transmissions and retransmitted frames due to collisions) is modelled as a Poisson process with a rate of $1{,}000$ frames per second. Throughput is defined as the average number of frames successfully transmitted per second. The throughput of the network (rounded to the nearest integer) is ______.`,
      [], '135'),
    question(34, 2024, 1, '2', 'Node X has a TCP connection open to node Y. The packets from X to Y go through an intermediate IP router R. The Ethernet switch S is the first switch on the network path between X and R. Consider a packet sent from X to Y over this connection.\nWhich of the following statements is/are TRUE about the destination IP and MAC address on this packet at the time it leaves X?',
      ['The destination IP address is the IP address of Y.', 'The destination MAC address is the MAC address of Y.', 'The destination MAC address is the MAC address of S.', 'The destination IP address is the IP address of R.'], 'A', 'MSQ'),
    question(35, 2024, 2, '2', raw`Consider an Ethernet segment with a transmission speed of $10^8\,\mathrm{bits/sec}$ and a maximum segment length of $500$ meters. If the speed of propagation of the signal in the medium is $2\times10^8\,\mathrm{m/sec}$, then the minimum frame size (in bits) required for collision detection is ______.`,
      [], '500'),
  ],
};
