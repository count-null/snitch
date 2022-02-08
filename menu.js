import Lnd from "./lnd.js";
import NodeCommand from "./node/index.js";
import inquirer from "inquirer";
import Command from "./command.js";
import GraphCommand from "./graph/index.js";
const { keys } = Object;

export default class Menu {
  constructor(config, version) {
    this.config = config;
    this.version = version;
    this.conn = Lnd.init(config);
    this.commands = { nodes: NodeCommand, graphs: GraphCommand };
  }

  splash() {
    console.log(
      `
              
                ,e,   d8        "   888           888                                
                d88~\\ 888-~88e  "  _d88__  e88~~\\ 888-~88e  e88~~8e  888-~\\ 
               C888   888  888 888  888   d888    888  888 d888  88b 888    
                Y88b  888  888 888  888   8888    888  888 8888__888 888    
                 888D 888  888 888  888   Y888    888  888 Y888    , 888    
               \\_88P  888  888 888  "88_/  "88__/ 888  888  "88___/  888
              
                                                                ${this.version}
                `
    );
  }

  async mainMenu() {
    const title = "MAIN MENU";
    const choices = [...keys(this.commands), "exit"];
    const selection = await inquirer.prompt([
      {
        name: title,
        type: "list",
        choices,
      },
    ]);
    return selection[title];
  }

  async commandMenu(command) {
    const title = `${command.toUpperCase()} MENU`;
    const selection = await inquirer.prompt([
      {
        name: title,
        type: "list",
        choices: keys(this.commands[command].args(this.config)),
      },
    ]);
    return selection[title];
  }

  async menuLoop() {
    this.splash();
    await this.conn.testConn();
    let stack = [];
    if (stack.length === 0) {
      const selection = await this.mainMenu();
      if (selection === "exit") {
        process.exit(1);
      }
      stack.push(selection);
    }
    if (stack.length === 1) {
      const selection = await this.commandMenu(stack[0]);
      if (selection === "back") {
        stack.pop();
      } else {
        stack.push(selection);
      }
    }
    if (stack.length === 2) {
      const selection = await inquirer.prompt(
        this.commands[stack[0]].args(this.config)[stack[1]].prompt
      );
      Command.menuHandler(
        stack[1],
        selection,
        new this.commands[stack[0]](this.config)
      );
    }
  }
}
