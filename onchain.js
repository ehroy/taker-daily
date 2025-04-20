import { Curl } from "./src/services/index.js";
import { JsonRpcProvider, Wallet ,ethers} from "ethers";
import fs from "fs";
import { log } from "./src/utils/utils.js";
import Solver from "capsolver-npm";
import config from "./src/config/config.json" with { type: "json" };
const { REFF,APIKEY_CAPSOLVER } = config
async function GenerateRecapcta() {
  let tokencapctha;
  do {
    try {
      const solver = new Solver(APIKEY_CAPSOLVER);
      tokencapctha = await solver.antiturnstile({
        websiteURL: "https://sowing.taker.xyz",
        websiteKey: "0x4AAAAAABNqF8H4KF9TDs2O",
      });
    } catch (error) {
      console.log(error);
    }
  } while (!tokencapctha);
  return tokencapctha.token;
}
(async () => {
    const RPC_URL = "https://rpc-mainnet.taker.xyz/";

    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCH = 5000; // jeda antar batch (5 detik)
    
    async function processWallet(privatekey) {
      try {
        const provider = new JsonRpcProvider(RPC_URL);
        const wallet = new Wallet(privatekey, provider);
    
       log(`balance TAKER ${ethers.formatUnits(await provider.getBalance(wallet.address), 18)}`,'success')
    
        // const captcha = await GenerateRecapcta();
    
        const claimDaily = new ethers.Contract("0xF929AB815E8BfB84Cdab8d1bb53F22eB1e455378",[{"inputs":[],"name":"active","outputs":[],"stateMutability":"nonpayable","type":"function"}],wallet,{
            gasPrice : (await provider.getFeeData()).gasPrice
        })
        const tx = await claimDaily.active()
        const receipt = await tx.wait();
        log("Approval confirmed in block:" + receipt.blockNumber, "success");
      } catch (err) {
        log(`❌ Error on wallet: ${privatekey.slice(0, 6)}...: ${err.message.substring(0,75)}`,'error');
      }
    }
    
    function delay(ms) {
      return new Promise((res) => setTimeout(res, ms));
    }
    
    async function runBatch(wallets) {
      for (let i = 0; i < wallets.length; i += BATCH_SIZE) {
        const batch = wallets.slice(i, i + BATCH_SIZE);
        log(`🚀 Menjalankan batch ${i / BATCH_SIZE + 1} (${batch.length} wallet)`,'warning');
    
        await Promise.allSettled(batch.map(processWallet));
    
        if (i + BATCH_SIZE < wallets.length) {
          log(`⏳ Menunggu sebelum batch berikutnya...\n`,'warning');
          await delay(DELAY_BETWEEN_BATCH);
        }
      }
    }
    
    async function runTask() {
      const file = fs.readFileSync("pk.txt", "utf8").split("\n").map(line => line.trim()).filter(Boolean);
      await runBatch(file);
      log(`✅ Semua batch selesai. Menunggu 3 jam 15 menit...\n`,'warning');
    }
    
    // ⏱️ Eksekusi pertama kali
    runTask();
    
    // ⏱️ Jadwal ulang setiap 195 menit
    setInterval(runTask, 195 * 60 * 1000);
})();
