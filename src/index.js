"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_js_1 = require("@solana/web3.js");
var dlmm_1 = require("@meteora-ag/dlmm");
var bytes_1 = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
var bn_js_1 = require("bn.js");
var dotenv = require("dotenv");
var web3_js_2 = require("@solana/web3.js");
dotenv.config();
var private_key = process.env.USER_PRIVATE_KEY;
console.log('private_key:', private_key);
var rpc_endpoint = process.env.RPC;
console.log('rpc_endpoint:', rpc_endpoint);
var user = web3_js_1.Keypair.fromSecretKey(new Uint8Array(bytes_1.bs58.decode(private_key)));
var RPC = rpc_endpoint || "https://api.devnet.solana.com";
var connection = new web3_js_1.Connection(RPC, "finalized");
var poolAddress = new web3_js_1.PublicKey("3W2HKgUa96Z69zzG3LK1g8KdcRAWzAttiLiHfYnKuPw5");
function swap(dlmmPool) {
    return __awaiter(this, void 0, void 0, function () {
        var swapAmount, swapYtoX, binArrays, swapQuote, swapTx, modifyComputeUnits, addPriorityFee, swapTxHash, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    swapAmount = new bn_js_1.default(100);
                    swapYtoX = true;
                    return [4 /*yield*/, dlmmPool.getBinArrayForSwap(swapYtoX)];
                case 1:
                    binArrays = _a.sent();
                    return [4 /*yield*/, dlmmPool.swapQuote(swapAmount, swapYtoX, new bn_js_1.default(10), binArrays)];
                case 2:
                    swapQuote = _a.sent();
                    console.log("🚀 ~ swapQuote:", swapQuote);
                    return [4 /*yield*/, dlmmPool.swap({
                            inToken: dlmmPool.tokenX.publicKey,
                            binArraysPubkey: swapQuote.binArraysPubkey,
                            inAmount: swapAmount,
                            lbPair: dlmmPool.pubkey,
                            user: user.publicKey,
                            minOutAmount: swapQuote.minOutAmount,
                            outToken: dlmmPool.tokenY.publicKey,
                        })];
                case 3:
                    swapTx = _a.sent();
                    modifyComputeUnits = web3_js_2.ComputeBudgetProgram.setComputeUnitLimit({
                        units: 1000000,
                    });
                    addPriorityFee = web3_js_2.ComputeBudgetProgram.setComputeUnitPrice({
                        microLamports: 1,
                    });
                    swapTx.add(modifyComputeUnits);
                    //set the priority fee
                    swapTx.add(addPriorityFee);
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, web3_js_1.sendAndConfirmTransaction)(connection, swapTx, [
                            user,
                        ])];
                case 5:
                    swapTxHash = _a.sent();
                    console.log("🚀 ~ swapTxHash:", swapTxHash);
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error_1)));
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var dlmmPool;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dlmm_1.default.create(connection, poolAddress, {
                        cluster: "devnet",
                    })];
                case 1:
                    dlmmPool = _a.sent();
                    return [4 /*yield*/, swap(dlmmPool)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
