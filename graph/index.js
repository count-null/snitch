import Lnd from "../lnd.js";
import { getNetworkGraph } from "ln-service";
import fs from "fs";
import path from "path";
const { keys } = Object;

const GRAPH_DIR = "./.graphs";

export default class GraphCommand {
  constructor(config) {
    // create class with an instance of Config.init()
    this.config = config;
    this.args = GraphCommand.args;
    this.timestamp =
      // other properties are set by handlers
      this.node;
    this.name;
  }

  static load(name) {
    // load the JSON from file using default_graph
    return JSON.parse(fs.readFileSync(`${GRAPH_DIR}/${name}.json`));
  }

  static pubkeyParse(snapshot) {
    // parse the default graph into a more effieicent struct
    // {
    //  pubkey: [channels]
    // }
    const G = GraphCommand.load(snapshot);
    let newG = {};
    const { nodes, channels } = G;
    for (const node of nodes) {
      newG[node.pub_key] = node;
    }
    for (const channel of channels) {
      for (const pub of ["node1_pub", "node2_pub"]) {
        if (keys(newG[channel[pub]]).includes("channels")) {
          newG[channel[pub]].channels.push(channel);
        } else {
          newG[channel[pub]].channels = [channel];
        }
      }
    }
    return newG;
  }

  getName() {
    return `${this.node}-${Math.floor(Date.now() / 1000)}`;
  }

  async _fetch() {
    const snapshot = this.getName();
    const { conn } = Lnd.init(this.config);
    const graph = await getNetworkGraph({ lnd: conn });
    // make graph storage directory
    fs.mkdir(GRAPH_DIR, { recursive: true }, (err) => {
      if (err) throw err;
    });
    fs.writeFile(
      `${GRAPH_DIR}/${snapshot}.json`,
      JSON.stringify(graph),
      function (err) {
        if (err) return console.log(`Error writing file: ${err}`);
      }
    );
    console.log(snapshot);
  }

  _rm() {
    fs.unlinkSync(`${GRAPH_DIR}/${this.snapshot}.json`);
  }

  _cat() {
    console.log(GraphCommand.load(this.snapshot));
  }

  _ls() {
    if (this.snapshot) {
      // show synopsis nodes/channels, btc locked
      const G = GraphCommand.load(this.snapshot);
      let btcCap = 0;
      G.channels.forEach((c) => {
        btcCap = btcCap + c.capacity / 100000000;
      });
      const summary = {
        nodes: G.nodes.length,
        channels: G.channels.length,
        capacity: btcCap,
        date: new Date(1000 * Number(this.snapshot.split("-")[1])),
      };
      console.log(summary);
    } else {
      // list graphs
      console.log(GraphCommand.listGraphs());
    }
  }

  static listGraphs() {
    return fs.readdirSync(GRAPH_DIR).map((f) => ({
      name: f.split(".")[0],
      created: new Date(1000 * Number(f.split(".")[0].split("-")[1])),
    }));
  }

  static args(config) {
    return {
      fetch: {
        required: { options: ["node"] },
        prompt: [
          {
            name: "node",
            type: "list",
            choices: config.nodes.map((n) => n.name),
          },
        ],
      },
      ls: {
        optional: { args: ["snapshot"] },
        prompt: selectGraphPrompt,
      },
      cat: {
        required: { args: ["snapshot"] },
        prompt: selectGraphPrompt,
      },
      rm: {
        required: { args: ["snapshot"] },
        prompt: selectGraphPrompt,
      },
    };
  }
}

export const selectGraphPrompt = [
  {
    name: "snapshot",
    type: "list",
    choices: GraphCommand.listGraphs().map((s) => s.name),
  },
];
