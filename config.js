import fs from "fs";
import inquirer from "inquirer";
import NodeCommand from "./node/index.js";

const CONFIG_PATH = ".snitch.json";

export default class Config {
  constructor(nodes, default_node) {
    // use async init method to create instances of config
    this.nodes = nodes;
    this.default_node = default_node;
  }

  async writeConfig() {
    fs.writeFile(
      CONFIG_PATH,
      JSON.stringify({
        nodes: this.nodes,
        default_node: this.default_node,
      }),
      function (err) {
        if (err) return console.log(`Error writing file: ${err}`);
      }
    );
  }

  static async init() {
    try {
      // config exists
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH));
      return new Config(config.nodes, config.default_node);
    } catch (err) {
      // config missing
      const answers = await inquirer.prompt(NodeCommand.prompt.add);
      const config = new Config(
        [
          {
            name: answers.name,
            cert: answers.cert,
            macaroon: answers.macaroon,
            socket: answers.socket,
          },
        ],
        answers.name
      );
      config.writeConfig();
      return config;
    }
  }
}
