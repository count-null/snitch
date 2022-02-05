import Config from "./config.js";
import Menu from "./menu.js";
import NodeCommand from "./node/index.js";
import Command from "./command.js";
import prog from "caporal";
const { keys } = Object;

const VERSION = "0.0.1-alpha";
const CONFIG = await Config.init();

prog
  .version(VERSION)

  // Start the menu by default
  .command("menu", "Launch the interactive menu")
  .default()
  .action(async () => new Menu(CONFIG, VERSION).menuLoop())

  // Get accounting information
  .command("node", "Manage saved node connections")
  .argument("<action>", "action to perform", keys(NodeCommand.args(CONFIG)))
  .argument("[name]", "the case-insensitive name of the node")
  .help(`Actions: ${keys(NodeCommand.args(CONFIG)).join(", ")}`)
  .option("--c --cert <base64>", "node add cert in base64")
  .option("--m --macaroon <bsae64>", "node add macroon in base64")
  .option("--s --socket <host>:<port>", "node add network socket")
  .action((args, options, logger) => {
    Command.handler(args, options, logger, new NodeCommand(CONFIG));
  });

prog.parse(process.argv);
