import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppConfig from '@/models/AppConfig';

// Your default data to seed the database if it's empty
const DEFAULT_SYLLABUS = {
  "1. Discrete Maths": ["1. Mathematical Logic", "2. Set Theory and Algebra", "3. Combinatorics", "4. Graph Theory"],
  "2. TOC": ["1. Finite Automata and Regular Languages", "2. PDA - CFL and DCFL", "3. Turing Machine, RE, REC, Undecidabilitu"],
  "3. Computer Networks": ["1. ISO-OSI Stack and SWP", "2. LAN", "3. TCP, UDP and IP", "4. Routing and Application Layer"],
  "4. COA": ["1. CPU Arch. and Address. Modes", "2. Control Unit Design", "3. Instructions Pipeline", "4. Memory Organization", "5. IO Organisation"],
  "5. Operating Systems": ["1. Process Management-1", "2. Process Management-2", "3. Deadlock", "4. Mem. Mgmt and Virtual Mem", "5. File Sys and Device Mgmt", "6. Miscellaneous"],
  "6. Data Structures": ["1. Arrays", "2. Stack and Queues", "3. Linked Lists", "4. Trees", "5. Graphs", "6. Hashing"],
  "7. Algorithms": ["1. Algo. Analysis and Asymptotic Notations", "2. Divide and Conquer", "3. Greedy Method", "4. Dynamic Programming", "5. P and NP Concepts", "6. Miscellaneous Topics"],
  "8. C Prog": ["1. Programming"],
  "9. Digital Logic": ["1. Logic Functions and Minimizations", "2. Combinational Circuits", "3. Sequential Circuits", "4. Number Systems"],
  "10. Compiler Design": ["1. Lexical Analysis", "2. Parsing Techniques", "3. Syntax Directed Translations", "4. Code Generations and Optimizatinos"],
  "11. Engg. Maths": ["1. Probability", "2. Linear Algebra", "3. Calculus"],
  "12. DBMS": ["1. ER Model", "2. Funcational Dependencies and Normalizaation", "3. Structure Query Language", "4. Relational Model", "5. Transactions and Concurrency Contorl", "6. File Structures"]
};

const DEFAULT_MAPPING = {
  "Asymptotic Notation": "1. Algo. Analysis and Asymptotic Notations",
  "Array": "1. Arrays" // (It will use this as a base, you can update it later via POST)
};

export async function GET() {
  try {
    await dbConnect();
    let config = await AppConfig.findOne({ configName: "default" });
    
    // 🔥 SELF-HEALING: If no config exists, create it instantly!
    if (!config) {
      config = await AppConfig.create({
        configName: "default",
        syllabus: DEFAULT_SYLLABUS,
        topicMapping: DEFAULT_MAPPING
      });
    }
    
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("Config GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { syllabus, topicMapping } = await req.json();
    const config = await AppConfig.findOneAndUpdate(
      { configName: "default" },
      { syllabus, topicMapping },
      { new: true, upsert: true }
    );
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}