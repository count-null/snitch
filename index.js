import { getCommands } from "./params.js";
import { initConfig, Config } from "./config.js";
import Yargs from "yargs";
import lnService from "ln-service";
import { menuLoop } from "./menu.js";

const num_args = process.argv.length - 2;
const VERSION = "0.0.1-alpha";
const CONFIG = new Config(null, null);
await initConfig(CONFIG);

const { cert, macaroon, socket } = CONFIG.agents.find(
  (a) => a.name === CONFIG.default_agent
);
export const { lnd } = lnService.authenticatedLndGrpc({
  cert,
  macaroon,
  socket,
});

if (num_args > 0) {
  const argv = Yargs(process.argv.slice(2));
  const commands = await getCommands();
  for (const command in commands) {
    if (Object.hasOwnProperty.call(commands, command)) {
      const element = commands[command];
      argv.command(element);
    }
  }
  argv.demandCommand().help().wrap(72).argv;

  console.log(argv._);
}
await menuLoop(lnd, VERSION);
