import fs from "fs";
import { getParams } from "./params.js";

const CONFIG_PATH = ".snitch.json";

export class Config {
  constructor(agents, default_agent) {
    this.agents = agents;
    this.default_agent = default_agent;
  }
}

export async function initConfig(CONFIG) {
  try {
    // config exists
    const data = fs.readFileSync(CONFIG_PATH);
    const config = JSON.parse(data);
    CONFIG.default_agent = config.default_agent;
    CONFIG.agents = config.agents;
  } catch (err) {
    // config missing
    const answers = await getParams("add_agent");
    CONFIG.default_agent = answers.name;
    CONFIG.agents = [
      {
        name: answers.name,
        cert: answers.cert,
        macaroon: answers.macaroon,
        socket: answers.socket,
      },
    ];
    const content = JSON.stringify(CONFIG);
    try {
      fs.writeFileSync(CONFIG_PATH, content);
      // it worked
    } catch (err) {
      // can't write to config file
      console.error(err);
    }
  }
}
