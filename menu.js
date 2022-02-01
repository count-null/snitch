import lnService from "ln-service";
import chalk from "chalk";

export async function loggedInAs(lnd) {
  const wallet = await lnService.getWalletInfo({ lnd });
  console.log(
    `${chalk.hex(wallet.color).bold(wallet.alias)} ${wallet.public_key}`
  );
  console.log(
    `Channels: ${wallet.active_channels_count} Peers: ${wallet.peers_count}`
  );
}

export async function menuLoop(lnd, VERSION) {
  console.log(
    `
  
    ,e,   d8        "   888           888                                
    d88~\\ 888-~88e  "  _d88__  e88~~\\ 888-~88e  e88~~8e  888-~\\ 
   C888   888  888 888  888   d888    888  888 d888  88b 888    
    Y88b  888  888 888  888   8888    888  888 8888__888 888    
     888D 888  888 888  888   Y888    888  888 Y888    , 888    
   \\_88P  888  888 888  "88_/  "88__/ 888  888  "88___/  888
  
                                                    ${VERSION}
    `
  );
  await loggedInAs(lnd);
}
