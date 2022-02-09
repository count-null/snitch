import GraphCommand, { selectGraphPrompt } from "../graph/index.js";

export default class CycleCommand {
  constructor(config) {
    // create class with an instance of Config.init()
    this.config = config;
    this.args = CycleCommand.args;
    this.pubkey;
    this.num;
    this.snapshot;
    this.min_cap;
    this.max_cap;
    this.min_cycles;
  }

  getPeers(G, pubkey) {
    let peers = [];
    const { channels } = G[pubkey];
    for (const pub of ["node1_pub", "node2_pub"]) {
      for (const chan of channels) {
        const peer = chan[pub];
        if (peer !== pubkey && !peers.includes(peer)) {
          peers.push(peer);
        }
      }
    }
    return peers;
  }

  _triangles() {
    const G = GraphCommand.pubkeyParse(this.snapshot);
    // TODO: run triangles algo
    const peers = this.getPeers(G, this.pubkey);
    const candidates = [];
    const visited = [];
    for (const peer of peers) {
      const one_hops = this.getPeers(G, peer);
      for (const one_hop of one_hops) {
        if (
          !visited.includes(one_hop) &&
          !peers.includes(one_hop) &&
          one_hop !== this.pubkey
        ) {
          const two_hops = this.getPeers(G, one_hop);
          const shared_edges = peers.filter((p) => two_hops.includes(p));
          if (shared_edges.length >= this.min_cycles) {
            visited.push(one_hop);
            candidates.push({
              pubkey: one_hop,
              alias: G[one_hop].alias,
              num_triangles: shared_edges.length,
              neighbors: shared_edges,
            });
          }
        }
      }
    }
    const sorted = candidates.sort((a, b) => a.num_triangles - b.num_triangles);
    console.log(sorted);
  }

  static args(config) {
    return {
      triangles: {
        required: { args: ["snapshot"], options: ["pubkey", "num"] },
        prompt: [
          ...selectGraphPrompt,
          {
            name: "pubkey",
            type: "input",
            message: "Enter pubkey: ",
          },
          {
            name: "min_cycles",
            type: "input",
            message: "Enter minimum cycles to show: ",
            default: 4,
          },
        ],
      },
    };
  }
}
