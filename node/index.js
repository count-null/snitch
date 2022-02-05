import Lnd from "../lnd.js";

const { keys } = Object;

export default class NodeCommand {
  constructor(config) {
    // create class with an instance of Config.init()
    this.config = config;
    this.args = NodeCommand.args;
    // other properties are set by handlers
    this.name;
    this.cert;
    this.macaroon;
    this.socket;
  }

  add() {
    const { name, cert, macaroon, socket } = this;
    this.config.nodes = [
      { name, cert, macaroon, socket },
      ...this.config.nodes,
    ];
    this.config.writeConfig();
  }

  rm() {
    try {
      this.config.nodes = [
        ...this.config.nodes.filter((n) => n.name !== this.name),
      ];
      this.config.writeConfig();
    } catch (err) {
      console.error(err);
    }
  }

  ls() {
    if (this.name) {
      try {
        const target = this.config.nodes.find((n) => n.name === this.name);
        console.log(target);
      } catch (err) {
        console.error(err);
      }
    } else {
      console.log(this.config.nodes);
    }
  }
  become() {
    this.config.default_node = this.name;
    Lnd.init(this.config).testConn();
    this.config.writeConfig();
  }

  static args(config) {
    const selectNodePrompt = [
      {
        name: "name",
        type: "list",
        choices: config.nodes.map((n) => n.name),
      },
    ];
    return {
      add: {
        required: { args: ["name"], options: ["cert", "macaroon", "socket"] },
        prompt: [
          {
            name: "name",
            type: "input",
            message: "Enter new node name: ",
          },
          {
            name: "cert",
            type: "input",
            message: "Enter cert: ",
          },
          {
            name: "macaroon",
            type: "input",
            message: "Enter macaroon: ",
          },
          {
            name: "socket",
            type: "input",
            default: "localhost:10001",
            message: "Enter connection socket: ",
          },
        ],
      },
      ls: {
        optional: { args: ["name"] },
        prompt: selectNodePrompt,
      },
      rm: {
        required: { args: ["name"] },
        prompt: selectNodePrompt,
      },
      become: {
        required: { args: ["name"] },
        prompt: selectNodePrompt,
      },
    };
  }
}
