import { log, sleep } from "./helpers.js";
import chalk from "chalk";
import inquirer from "inquirer";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import lnService from "ln-service";
import { createSnapshot, cleanSnapshots } from "./snapshots.js";

export async function hello(VERSION) {
  const msg = "snitcher";
  log("\n\n\n");
  log(figlet.textSync(msg, "Bolger"));
  const rainbow = chalkAnimation.rainbow(new Array(50).join(" ") + VERSION);
  await sleep();
  rainbow.stop();
  log("\n\n\n");
}

export async function askConnect() {
  const answers = await inquirer.prompt([
    {
      name: "cert",
      type: "input",
      message: "Enter cert: ",
    },
    {
      name: "macaroon",
      type: "input",
      message: "Enter macroon: ",
    },
    {
      name: "socket",
      type: "input",
      message: "Enter socket: ",
    },
  ]);

  const { cert, macaroon, socket } = answers;
  return { cert, macaroon, socket };
}

export const menuStateMachine = (reload) => ({
  main_menu: [
    { name: "Centralize", action: "centralize" },
    { name: "Probe", action: "probe" },
    { name: "Snapshots", action: "snapshots" },
    { name: "Agents", action: "agents" },
    { name: "Exit", action: async () => process.exit(1) },
  ],
  centralize: [
    {
      name: "Info",
      action: async () =>
        log(
          `
      Centrality is a measure of how close your node is to every other node. 
      You can imporve centrality by establihing connections to other nodes with high centrality. 
      Probing a channel will be more sucessfull if that channel is close to your node. 
      The larger your channels are, the more you are able to probe.
            `
        ),
    },
    { name: "Back", action: "main_menu" },
  ],
  probe: [
    {
      name: "Info",
      action: async () =>
        log(`
       Probing is a method to reveal the relative balance of a channel you do not share ownership in.
      It works by routing "test" payments of various amounts through the interested channel.
      If the channel sucessfully routes a payment, a larger one will be sent next.
      If the channel cannot route the payment, a smaller one will be tried. 
      This is repeated until the relative balance of the channel is revealed.
    `),
    },
    { name: "Back", action: "main_menu" },
  ],
  snapshots: [
    {
      name: "Info",
      action: async () =>
        log(`
      Some tools use a local copy of the network graph for doing analysis.
      CREATE - enables you to create live snapshots from your conencted nodes (agents).
      CLEAN - enables you to delete snapshots
      Snapshot files will be stored in the current working directory as:
          snapshot-NODEALIAS-TIMESTAMP.json
        `),
    },
    { name: "CREATE", action: createSnapshot },
    { name: "CLEAN", action: cleanSnapshots },
    { name: "Back", action: "main_menu" },
  ],
  agents: [
    {
      name: "Info",
      action: async () =>
        log(`
        
        `),
    },
    {
      name: "Add",
      action: async () => {
        const newAgent = await askConnect();
        log(newAgent);
        return await reload("agents");
      },
    },
    { name: "Back", action: "main_menu" },
  ],
});

export async function writeConfig(data) {
  fs.writeFile(CONFIG_PATH, JSON.stringify(data), function (err) {
    if (err) return log(`Error writing file: ${err}`);
  });
}

export async function menuLoop(menuKey, lnd, CONFIG, reload) {
  let key = menuKey;
  while (true) {
    let menuTitle = key.split("_").join(" ").toUpperCase();
    const answer = await inquirer.prompt({
      name: "action",
      type: "list",
      message: menuTitle,
      choices: menuStateMachine(reload)[key].filter((s) => s.name),
    });
    const { action } = menuStateMachine(reload)[key].find(
      (s) => s.name === answer.action
    );
    if (typeof action === "function") {
      await action(lnd, CONFIG);
    } else {
      key = action;
    }
  }
}

export async function loggedInAs(lnd) {
  const wallet = await lnService.getWalletInfo({ lnd });
  log(
    `Logged in as ${chalk.hex(wallet.color).bold(wallet.alias)} ${
      wallet.public_key
    }`
  );
  log(`Channels: ${wallet.active_channels_count} Peers: ${wallet.peers_count}`);
  log("\n");
}
