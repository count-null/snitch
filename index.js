import Config from "./config.js";
import Menu from "./menu.js";
import NodeCommand from "./node/index.js";
import Command from "./command.js";
import prog from "caporal";
import GraphCommand from "./graph/index.js";
const { keys } = Object;

const VERSION = "0.0.1-alpha";
const CONFIG = await Config.init();

prog
  .version(VERSION)

  // Start the menu by default
  .command("menu", "Launch the interactive menu")
  .default()
  .action(async () => new Menu(CONFIG, VERSION).menuLoop())

  // NODE - manage node connections
  .command("node", "Manage saved node connections")
  .argument("<action>", "action to perform", keys(NodeCommand.args(CONFIG)))
  .argument("[name]", "the case-insensitive name of the node")
  .help(`Actions: ${keys(NodeCommand.args(CONFIG)).join(", ")}`)
  .option("--c --cert <base64>", "node add cert in base64")
  .option("--m --macaroon <bsae64>", "node add macroon in base64")
  .option("--s --socket <host>:<port>", "node add network socket")
  .action((args, options, logger) => {
    Command.cliHandler(args, options, logger, new NodeCommand(CONFIG));
  })

  // GRAPH - manage network snapshots
  .command("graph", "Manage saved network graph snapshots")
  .argument("<action>", "action to perform", keys(GraphCommand.args(CONFIG)))
  .argument("[snapshot]", "the name of the snapshot e.x. alice-1644281970")
  .help(`Actions: ${keys(GraphCommand.args(CONFIG)).join(", ")}`)
  .option("--n --node <node_name>", "node name to fetch graph from")
  .action((args, options, logger) => {
    Command.cliHandler(args, options, logger, new GraphCommand(CONFIG));
  });

prog.parse(process.argv);
