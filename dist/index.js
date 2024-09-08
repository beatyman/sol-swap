"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dlmm_1 = __importDefault(require("@meteora-ag/dlmm"));
const bytes_1 = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
const bn_js_1 = __importDefault(require("bn.js"));
const dotenv = __importStar(require("dotenv"));
const web3_js_2 = require("@solana/web3.js");
dotenv.config();
const private_key = process.env.USER_PRIVATE_KEY;
console.log('private_key:', private_key);
const rpc_endpoint = process.env.RPC;
console.log('rpc_endpoint:', rpc_endpoint);
const user = web3_js_1.Keypair.fromSecretKey(new Uint8Array(bytes_1.bs58.decode(private_key)));
const RPC = rpc_endpoint || "https://api.devnet.solana.com";
const connection = new web3_js_1.Connection(RPC, "finalized");
const poolAddress = new web3_js_1.PublicKey("3W2HKgUa96Z69zzG3LK1g8KdcRAWzAttiLiHfYnKuPw5");
async function swap(dlmmPool) {
    const swapAmount = new bn_js_1.default(100);
    // Swap quote
    const swapYtoX = true;
    const binArrays = await dlmmPool.getBinArrayForSwap(swapYtoX);
    const swapQuote = await dlmmPool.swapQuote(swapAmount, swapYtoX, new bn_js_1.default(10), binArrays);
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
    // request a specific compute unit budget
    const modifyComputeUnits = web3_js_2.ComputeBudgetProgram.setComputeUnitLimit({
        units: 1000000,
    });
    // set the desired priority fee
    const addPriorityFee = web3_js_2.ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1,
    });
    swapTx.add(modifyComputeUnits);
    //set the priority fee
    swapTx.add(addPriorityFee);
    try {
        const swapTxHash = await (0, web3_js_1.sendAndConfirmTransaction)(connection, swapTx, [
            user,
        ]);
        console.log("🚀 ~ swapTxHash:", swapTxHash);
    }
    catch (error) {
        console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    }
}
async function main() {
    const dlmmPool = await dlmm_1.default.create(connection, poolAddress, {
        cluster: "devnet",
    });
    await swap(dlmmPool);
}
main();
