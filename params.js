import inquirer from "inquirer";

const paramConfig = {
  add_agent: {
    category: "agents",
    exec: {
      command: "agent <key> [value]",
      aliases: ["a", "agt"],
      desc: "Manage agents",
      builder: (yargs) => yargs.default("value", "true"),
      handler: (argv) => {
        console.log(`${argv.key} and ${argv.value}`);
      },
    },
    prompt: [
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
      {
        name: "name",
        type: "input",
        message: "Name this agent: ",
      },
    ],
  },
};

export async function getCommands() {
  let cmds = [];
  for (const cmd_key of Object.keys(paramConfig)) {
    cmds.push(paramConfig[cmd_key].exec);
  }
  return cmds;
}

export async function getParams(command_key) {
  const answers = await inquirer.prompt(paramConfig[command_key].prompt);
  console.log(answers);
  return answers;
}
