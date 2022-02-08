import Lnd from "../lnd.js";
import { getNetworkGraph } from "ln-service";
import fs from "fs";
import path from "path";

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

  _ls() {
    if (this.snapshot) {
      // show synopsis nodes/channels, btc locked
      const G = GraphCommand.load(this.snapshot);
      let satCap = 0;
      G.channels.forEach((c) => {
        satCap = satCap + c.capacity;
      });
      const summary = {
        nodes: G.nodes.length,
        channels: G.channels.length,
        capacity: satCap / 100000000,
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
    const selectGraphPrompt = [
      {
        name: "snapshot",
        type: "list",
        choices: GraphCommand.listGraphs().map((s) => s.name),
      },
    ];
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
