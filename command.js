const { keys } = Object;

export default class Command {
  static cliHandler(args, options, logger, CmdInstance) {
    let exec = true;
    // get the action requirements
    const { required } = CmdInstance.args(CmdInstance.config)[args.action];
    const { optional } = CmdInstance.args(CmdInstance.config)[args.action];
    if (required && required.args) {
      // flag missing required args
      for (const arg of required.args) {
        if (!args[arg]) {
          exec = false;
          logger.error(`[${arg}] is a required argument`);
        } else {
          CmdInstance[arg] = args[arg];
        }
      }
    }
    if (required && required.options) {
      // flag missing required options
      for (const opt of required.options) {
        if (!options[opt]) {
          exec = false;
          logger.error(`--${opt} is a required option`);
        } else {
          CmdInstance[opt] = options[opt];
        }
      }
    }
    if (optional && optional.args) {
      // assign optional args
      for (const arg of optional.args) {
        CmdInstance[arg] = args[arg];
      }
    }
    if (optional && optional.options) {
      // assign optional options
      for (const opt of optional.options) {
        CmdInstance[opt] = options[opt];
      }
    }
    // run the method for the cli argument
    if (exec) {
      CmdInstance[`_${args.action}`]();
    }
  }

  static menuHandler(action, selection, CmdInstance) {
    // assign all attributes
    for (const attr of keys(selection)) {
      CmdInstance[attr] = selection[attr];
    }
    // run the method for the menu action
    CmdInstance[`_${action}`]();
  }
}
