import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
  import DLMM from '@meteora-ag/dlmm'
  import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
  import BN from "bn.js";
  import * as dotenv from 'dotenv';
  import { ComputeBudgetProgram} from "@solana/web3.js";

dotenv.config();

const private_key: string = process.env.USER_PRIVATE_KEY!;
console.log('private_key:', private_key);

const rpc_endpoint: string = process.env.RPC!;
console.log('rpc_endpoint:', rpc_endpoint);


  const user = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(private_key))
  );

  const RPC = rpc_endpoint || "https://api.devnet.solana.com";

  const connection = new Connection(RPC, "finalized");
  
  const poolAddress = new PublicKey(
    "3W2HKgUa96Z69zzG3LK1g8KdcRAWzAttiLiHfYnKuPw5"
  );
  


async function swap(dlmmPool: DLMM) {
    const swapAmount = new BN(100);
    // Swap quote
    const swapYtoX = true;
    const binArrays = await dlmmPool.getBinArrayForSwap(swapYtoX);
  
    const swapQuote = await dlmmPool.swapQuote(swapAmount, swapYtoX, new BN(10), binArrays);
  
    console.log("🚀 ~ swapQuote:", swapQuote);
  
    // Swap
    const swapTx = await dlmmPool.swap({
      inToken: dlmmPool.tokenX.publicKey,
      binArraysPubkey: swapQuote.binArraysPubkey,
      inAmount: swapAmount,
      lbPair: dlmmPool.pubkey,
      user: user.publicKey,
      minOutAmount: swapQuote.minOutAmount,
      outToken: dlmmPool.tokenY.publicKey,
    });
    
  //https://solana.com/developers/cookbook/transactions/add-priority-fees
  // set the desired priority fee
  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1,
  });

  //set the priority fee
  swapTx.add(addPriorityFee);

    try {
      const swapTxHash = await sendAndConfirmTransaction(connection, swapTx, [
        user,
      ]);
      console.log("🚀 ~ swapTxHash:", swapTxHash);
    } catch (error) {
      console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    }
  }
async function main() {
    const dlmmPool = await DLMM.create(connection, poolAddress, {
      cluster: "devnet",
    });
    await swap(dlmmPool);
  }


main()