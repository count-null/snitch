import inquirer from "inquirer";

export const paramConfig = {
  agent: {
    _args: {
      command: "agent <command>",
      desc: "Manage RPC hosts",
      builder: (yargs) => null,
      handler: (argv) => {
        console.log("HANDLING AGENT COMMANDS");
      },
    },
    _choices: { c: ["create", "list", "show", "rm"] },
    agent_add: {
      options: {
        name: {
          alias: "n",
          describe: "name this connection",
          prompt: "Enter new connection name: ",
          type: "input",
          demandOption: true,
        },
        socket: {
          alias: "s",
          describe: "provide a socket e.x. localhost:10001",
          prompt: "Enter socket: ",
          type: "input",
          demandOption: true,
        },
        cert: {
          alias: "c",
          describe: "provide a base 64 lnd cert",
          prompt: "Enter cert: ",
          type: "input",
          demandOption: true,
        },
        macaroon: {
          alias: "m",
          describe: "provide a base 64 lnd macaroon",
          prompt: "Enter macaroon: ",
          type: "input",
          demandOption: true,
        },
      },
    },
  },
};

export async function inquireParams(command_key) {
  const [command, key] = command_key.split("_");
  const { options } = paramConfig[command][command_key];
  const answers = await inquirer.prompt(
    Object.keys(options).map((c) => ({
      name: c,
      type: options[c].type,
      message: options[c].prompt,
    }))
  );
  return answers;
}
