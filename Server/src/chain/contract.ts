import "dotenv/config";
import { ethers } from "ethers";
import { CONTRACT_ABI } from "./abi.js";

const rpcUrl = process.env.RPC_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;
if (!rpcUrl) throw new Error("RPC_URL is not set");
if (!contractAddress) throw new Error("CONTRACT_ADDRESS is not set");

export const provider = new ethers.JsonRpcProvider(rpcUrl);
export const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
export const CONTRACT_ADDRESS = contractAddress;
