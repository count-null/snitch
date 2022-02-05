import lnService from "ln-service";
import chalk from "chalk";

export default class Lnd {
  constructor(config, conn) {
    this.config = config;
    this.conn = conn;
  }

  static init(config) {
    try {
      // read connection details
      const { cert, macaroon, socket } = config.nodes.find(
        (a) => a.name === config.default_node
      );

      // initialize lnd connection
      const { lnd } = lnService.authenticatedLndGrpc({
        cert,
        macaroon,
        socket,
      });
      return new Lnd(config, lnd);
    } catch (err) {
      console.error(err);
    }
  }

  async testConn() {
    try {
      const wallet = await lnService.getWalletInfo({ lnd: this.conn });
      console.log(
        `${chalk.hex(wallet.color).bold(wallet.alias)} ${wallet.public_key}`
      );
    } catch (err) {
      console.error(err);
    }
  }
}
