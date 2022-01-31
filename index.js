#!/usr/bin/env node

import fs from "fs";
import lnService from "ln-service";
import { sleep, log } from "./helpers.js";
import { hello, askConnect, menuLoop, loggedInAs } from "./menu.js";

const CONFIG_PATH = "./.snitch.json";
const VERSION = "0.0.1-alpha";

async function startup(menuKey) {
  fs.readFile(CONFIG_PATH, "utf8", async (err, data) => {
    if (err) {
      log("Creating new config...");
      const conn = await askConnect();
      await writeConfig({ conn });
      await sleep();
      return startup("main_menu");
    } else {
      const CONFIG = JSON.parse(data);
      const { lnd } = lnService.authenticatedLndGrpc({
        cert: CONFIG.conn.cert,
        macaroon: CONFIG.conn.macaroon,
        socket: CONFIG.conn.socket,
      });
      await loggedInAs(lnd);
      await menuLoop(menuKey, lnd, CONFIG, startup);
    }
  });
}
await hello(VERSION);

await startup("main_menu");
