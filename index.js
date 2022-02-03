import { paramConfig } from "./params.js";
import { initConfig, writeConfig, Config } from "./config.js";
import Yargs from "yargs";
import lnService from "ln-service";
import { menuLoop } from "./menu.js";

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
const argv = Yargs(process.argv.slice(2));
let command_options = {};
for (const cmd of Object.keys(paramConfig)) {
  const { _args, _choices } = paramConfig[cmd];
  for (const key of Object.keys(_choices)) {
    argv.choices(key, _choices[key]);
  }
  const command_keys = Object.keys(paramConfig[cmd]).filter(
    (k) => !k.startsWith("_")
  );
  for (const command_key of command_keys) {
    const { options } = paramConfig[cmd][command_key];
    command_options = { ...options, ...command_options };
  }
  argv.command(_args);
}
console.log(argv.argv);

argv
  .command(
    "$0",
    "run the menu by default",
    () => {},
    async (argv) => {
      await menuLoop(lnd, VERSION);
    }
  )
  .alias("c", "command")
  .options(command_options)
  .help().argv;
