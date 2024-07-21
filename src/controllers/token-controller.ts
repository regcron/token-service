import { Request, Response, NextFunction } from "express";
import { ApiSuccess } from "@/utils/ApiSucess";
import { asyncHandler } from "@/middleware/async-middleware";
import { Token } from "@/types/interfaces/interfaces.common";
import { ApiError } from "@/utils/ApiError";
import { readJsonFile } from '../utils/FileReader';
import path from 'path';
const { Web3 } = require("web3");
const web3 = new Web3(process.env.SEPOLIA_RPC_ENDPOINT);

// @desc     Get token information
// @route    /token
// @method   GET
export const getToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate input
      const tokenAddress = req.query.address as string;
      if (!tokenAddress) {
        res.status(400).json(new ApiError({}, 400, "Token address is required"));
        return;
      }

      // Load abi
      const tokenAbi = loadTokenAbi();
      if (!tokenAbi) {
        res.status(500).json(new ApiError({}, 500, "Failed to load token abi"));
        return;
      }
      const contract = new web3.eth.Contract(tokenAbi, tokenAddress);
      if (!contract) {
        res.status(500).json(new ApiError({}, 500, "Failed to load token contract"));
        return;
      }

      const result = await Promise.all([
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        contract.methods.owner().call(),
        contract.methods.decimals().call(),
        contract.methods.totalSupply().call(),
      ]);
      if (!result) {
        res.status(500).json(new ApiError({}, 500, "Failed to get token information"));
        return;
      }

      // Return token information
      const token: Token = {
        name: result[0],
        symbol: result[1],
        decimals: Number(result[3]).toString(),
        address: tokenAddress,
        owner: result[2],
        total_supply: BigInt(result[4]).toString(),
      };
      res.status(200).json(new ApiSuccess(token, ""));
    } catch (e: any) {
      console.error("Failed to get token info:", e);
      res.status(500).json(new ApiError({}, 500, "Internal server error"));
    }
  });

const loadTokenAbi = () => {
  try {
    var jsonPath = path.join(__dirname, '../../smart-contracts/artifacts/contracts/MyToken.sol/MyToken.json');
    var token = readJsonFile(jsonPath);
    return token.abi;
  } catch (e) {
    console.error("Failed to load token abi:", e);
  }
}

