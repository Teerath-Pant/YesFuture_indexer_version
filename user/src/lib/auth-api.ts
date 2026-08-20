// src/lib/auth-api.ts

import { RootID } from "@/constants/programs";
import { ethers } from "ethers";

// const CONTRACT_ADDRESS = "0x525948e3f8c6ee04fd55e84eca6596963675ff98";
// const CONTRACT_ADDRESS = "0x4744a8b0e0b5a475116f89b00c306a726ea6bc55";
// const CONTRACT_ADDRESS = "0x299724c47e64812a4139034e673f79d9534375fe";
// const CONTRACT_ADDRESS = "0x03fd416a6bb06d163ed22a1b774d24328cb1f661";
const CONTRACT_ADDRESS = "0x6d9a68bf32fd0f593f92aaf32e12d55acc970f72";

const TAAQO_RPC_URL = "https://rpc.nexischain.com";

const CORE_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_usdtAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_adminWallet",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "name": "DirectIncome",
    "type": "event",
    "inputs": [
      {
        "name": "receiver",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "packageId",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "cycle",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "name": "IncomeCapped",
    "type": "event",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "requestedAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "paidAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "redirectedToAdmin",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "name": "Level5ReEntry",
    "type": "event",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "packageId",
        "type": "uint8",
        "indexed": true,
        "internalType": "uint8"
      },
      {
        "name": "cycleNumber",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "phantomNode",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "name": "LevelIncome",
    "type": "event",
    "inputs": [
      {
        "name": "receiver",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "packageId",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "level",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "name": "LevelIncomeRedirected",
    "type": "event",
    "inputs": [
      {
        "name": "wouldBeReceiver",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "level",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "packageId",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "name": "ManualUpgrade",
    "type": "event",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "packageId",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "track",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ],
    "anonymous": false
  },
  {
    "name": "MatrixAutoUpgrade",
    "type": "event",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "fromPackageId",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "newPackageId",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "priceUsed",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "name": "MatrixHoldRefunded",
    "type": "event",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "packageId",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "name": "MatrixIncome",
    "type": "event",
    "inputs": [
      {
        "name": "receiver",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "packageId",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "level",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "name": "MatrixIncomeHeld",
    "type": "event",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "packageId",
        "type": "uint8",
        "indexed": true,
        "internalType": "uint8"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "memberCount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "name": "MatrixPlaced",
    "type": "event",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "matrixParent",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "sponsor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "packageId",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      }
    ],
    "anonymous": false
  },
  {
    "name": "NameUpdated",
    "type": "event",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ],
    "anonymous": false
  },
  {
    "name": "OwnerSet",
    "type": "event",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "name": "OwnershipRenounced",
    "type": "event",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "name": "OwnershipTransferred",
    "type": "event",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "name": "SponsorAutoUpgrade",
    "type": "event",
    "inputs": [
      {
        "name": "sponsor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "fromPackageId",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "newPackageId",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "priceUsed",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "name": "SponsorHoldRefunded",
    "type": "event",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "packageId",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "name": "SponsorIncomeHeld",
    "type": "event",
    "inputs": [
      {
        "name": "sponsor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "packageId",
        "type": "uint8",
        "indexed": true,
        "internalType": "uint8"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "count",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "name": "SponsorIncomeRedirected",
    "type": "event",
    "inputs": [
      {
        "name": "wouldBeReceiver",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "packageId",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "name": "SponsorReEntry",
    "type": "event",
    "inputs": [
      {
        "name": "sponsor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "packageId",
        "type": "uint8",
        "indexed": true,
        "internalType": "uint8"
      }
    ],
    "anonymous": false
  },
  {
    "name": "UserRegistered",
    "type": "event",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "_sponsor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "numericId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "stringId",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ],
    "anonymous": false
  },
  {
    "name": "DIRECT_INCOME_PERCENT",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "LEVEL_POOL_PERCENT",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "MATRIX_POOL_PERCENT",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "MAX_PACKAGE",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "PERCENT_DENOMINATOR",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "activationDate",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "adminWallet",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "cycleRootByPkg",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "displayName",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "getEarningsCap",
    "type": "function",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "getLevelPrice",
    "type": "function",
    "inputs": [
      {
        "name": "packageId",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "getMatrixPrice",
    "type": "function",
    "inputs": [
      {
        "name": "packageId",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "getSponsorPrice",
    "type": "function",
    "inputs": [
      {
        "name": "packageId",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "getTotalEarned",
    "type": "function",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "level5MemberCountByPkg",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "levelPackageId",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "levelPercent",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "matrixChildrenByPkg",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "matrixHoldByPkg",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "matrixOpenQueue",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "matrixPackageId",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "matrixParentByPkg",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "matrixPercent",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "matrixQueueHead",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "maxLevelPackage",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "maxMatrixPackage",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "maxSponsorPackage",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "memberAddress",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "memberByStringId",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "memberCounter",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "memberId",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "memberStringId",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "owner",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "packages",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [
      {
        "name": "price",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "phantomCounter",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "purchaseLevelPackage",
    "type": "function",
    "inputs": [
      {
        "name": "packageId",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "purchaseMatrixPackage",
    "type": "function",
    "inputs": [
      {
        "name": "packageId",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "purchaseSponsorPackage",
    "type": "function",
    "inputs": [
      {
        "name": "packageId",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "realOwnerByPkg",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "recycleCount",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "referralCount",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "registerMember",
    "type": "function",
    "inputs": [
      {
        "name": "sponsorStringId",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "renounceOwnership",
    "type": "function",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "rescueTokens",
    "type": "function",
    "inputs": [
      {
        "name": "tokenAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "setAdminWallet",
    "type": "function",
    "inputs": [
      {
        "name": "newAdminWallet",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "setDisplayName",
    "type": "function",
    "inputs": [
      {
        "name": "newName",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "sponsor",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "sponsorCycleCountByPkg",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "sponsorHoldByPkg",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "sponsorPackageId",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "topupFlag",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "totalInvestment",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "totalLevelIncomeByLevel",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "transferOwnership",
    "type": "function",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "usdt",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "userLevelIncome",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "userTotalDirectIncome",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "userTotalInvestment",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "userTotalLevelProfit",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "userTotalMatrixIncome",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  }
];
const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
];

// =========================================================================
// INDEXER API (Server/) — dashboard/income data. The deleted on-chain getters
// this used to call (getTotalTeamSize, getUserProfile, getUserIncomeBreakdown,
// getTeamStats, getTeamActivityStats, getTeamByLevel, directReferrals array)
// no longer exist on the trimmed contract. This is the replacement.
// =========================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

export interface DashboardStats {
  userAddress: string;
  sponsorId: string;
  directPartners: string;
  totalTeam: string;
}

export interface DashboardToday {
  todayJoinedDirectPartners: string;
  totalTeamJoinedToday: string;
}

export interface IncomeStats {
  walletAddress: string;
  totalMagicLevelIncome: string;
  totalMagicGoldMatrixIncome: string;
  totalSponsorIncome: string;
  totalIncome: string;
}

export interface IncomeToday {
  todayMagicLevelIncome: string;
  todayMagicGoldMatrixIncome: string;
  todaySponsorIncome: string;
  todayTotalIncome: string;
}

// GET /dashboard/:address — directPartners/totalTeam running totals.
export async function fetchDashboardStats(
  walletAddress: string,
): Promise<DashboardStats | null> {
  return apiGet<DashboardStats>(`/dashboard/${walletAddress}`);
}

// GET /dashboard/:address/today — day-relative counts, computed live.
export async function fetchDashboardToday(
  walletAddress: string,
): Promise<DashboardToday> {
  const data = await apiGet<DashboardToday>(
    `/dashboard/${walletAddress}/today`,
  );
  return data ?? { todayJoinedDirectPartners: "0", totalTeamJoinedToday: "0" };
}

// GET /income/:address — total income per track, wei strings formatted to decimal.
export async function fetchIncomeStats(walletAddress: string): Promise<{
  totalMagicLevelIncome: string;
  totalMagicGoldMatrixIncome: string;
  totalSponsorIncome: string;
  totalIncome: string;
}> {
  const data = await apiGet<IncomeStats>(`/income/${walletAddress}`);
  if (!data) {
    return {
      totalMagicLevelIncome: "0",
      totalMagicGoldMatrixIncome: "0",
      totalSponsorIncome: "0",
      totalIncome: "0",
    };
  }
  return {
    totalMagicLevelIncome: ethers.formatUnits(data.totalMagicLevelIncome, 18),
    totalMagicGoldMatrixIncome: ethers.formatUnits(
      data.totalMagicGoldMatrixIncome,
      18,
    ),
    totalSponsorIncome: ethers.formatUnits(data.totalSponsorIncome, 18),
    totalIncome: ethers.formatUnits(data.totalIncome, 18),
  };
}

// GET /income/:address/today — day-relative income sums, computed live.
export async function fetchIncomeToday(walletAddress: string): Promise<{
  todayMagicLevelIncome: string;
  todayMagicGoldMatrixIncome: string;
  todaySponsorIncome: string;
  todayTotalIncome: string;
}> {
  const data = await apiGet<IncomeToday>(`/income/${walletAddress}/today`);
  if (!data) {
    return {
      todayMagicLevelIncome: "0",
      todayMagicGoldMatrixIncome: "0",
      todaySponsorIncome: "0",
      todayTotalIncome: "0",
    };
  }
  return {
    todayMagicLevelIncome: ethers.formatUnits(data.todayMagicLevelIncome, 18),
    todayMagicGoldMatrixIncome: ethers.formatUnits(
      data.todayMagicGoldMatrixIncome,
      18,
    ),
    todaySponsorIncome: ethers.formatUnits(data.todaySponsorIncome, 18),
    todayTotalIncome: ethers.formatUnits(data.todayTotalIncome, 18),
  };
}

// Live on-chain read — userTotalInvestment is kept on-chain (never deleted),
// no indexer equivalent needed: it's set once at registration and never
// changes after, so a live single-slot read is as cheap as it gets.
export async function fetchUserTotalInvestment(
  walletAddress: string,
): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);
    const investment = await contract.userTotalInvestment(walletAddress);
    return ethers.formatUnits(investment, 18);
  } catch (error) {
    console.error("Error fetching user total investment:", error);
    return "0";
  }
}

// DB-sourced sum of every package purchase (all 3 tracks) — see the backend
// route for why this replaces fetchUserTotalInvestment for ratio-type stats:
// the on-chain figure is frozen at registration, this one tracks every
// upgrade since.
export async function fetchUserTotalInvested(
  walletAddress: string,
): Promise<string> {
  try {
    const data = await apiGet<{ total: string }>(
      `/users/${walletAddress}/total-invested`,
    );
    return ethers.formatUnits(data?.total ?? "0", 18);
  } catch (error) {
    console.error("Error fetching user total invested:", error);
    return "0";
  }
}

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

function formatDate(timestamp: number): string {
  if (!timestamp || timestamp === 0 || timestamp < 1000000000) {
    return "Pending";
  }

  const date = new Date(timestamp * 1000);

  if (isNaN(date.getTime())) {
    return "Pending";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function normalizePackageHistoryRecord(record: any) {
  if (!record) return { packageId: 1, amount: 0n, track: "", date: 0 };

  const packageId =
    record.packageId !== undefined
      ? Number(record.packageId)
      : Number(record[0] ?? 1);
  const amount =
    record.amount !== undefined ? record.amount : (record[1] ?? 0n);

  let track = "";
  if (record.track !== undefined && record.track !== null) {
    track = String(record.track);
  } else if (typeof record[2] === "string") {
    track = record[2];
  }

  let dateValue: any = 0;
  if (record.date !== undefined && record.date !== null) {
    dateValue = record.date;
  } else if (record[3] !== undefined && record[3] !== null) {
    dateValue = record[3];
  } else if (
    record[2] !== undefined &&
    record[2] !== null &&
    typeof record[2] !== "string"
  ) {
    dateValue = record[2];
  }

  const date = Number(dateValue || 0);

  return { packageId, amount, track: track.toUpperCase(), date };
}

// =========================================================================
// INTERFACES
// =========================================================================

export interface PurchasedPackageRow {
  index: number;
  package: string;
  amount: string;
  date: string;
  track?: string;
  packageId?: number;
}

export interface LevelIncomeRow {
  level: number;
  childId: string;
  amount: string;
  date: string;
}

// export type MatrixSlotType = "direct" | "empty";
export type SlotType =
  "direct" | "spilloverAbove" | "spilloverBelow" | "gift" | "empty";

type MatrixSlotType =
  "direct" | "spilloverAbove" | "spilloverBelow" | "gift" | "empty";

// export interface MagicGoldMatrixStructure {
//   root: string;
//   nodes: string[];
//   tree: MatrixSlotType[][];
//   filledCount: number;
// }

export interface MagicGoldMatrixStructure {
  root: string;
  nodes: string[];
  nodeInfos: ({
    address: string;
    isDirectPlacement: boolean;
    isInDownline: boolean;
  } | null)[];
  tree: MatrixSlotType[][];
  filledCount: number;
}

export interface MatrixCycleIncomeRow {
  id: number;
  date: string;
  refId: string;
  level: number;
  wallet: string;
  fullWallet: string;
  type: "join";
  amount: string;
  amountValue: number;
}

// ========== NEW INTERFACE FOR USER STATS ==========
export interface UserStats {
  totalReferrals: string;
  totalRecycles: string;
  totalTeam: string;
  activeTeam: string;
  inactiveTeam: string;
  totalProfit: string;
  totalLevelProfit: string;
  totalDirectIncome: string;
  totalMatrixIncome: string;
  totalInvestment: string;
}

export interface TeamStats {
  totalTeam: string;
  activeTeam: string;
  inactiveTeam: string;
  totalProfit: string;
  totalLevelProfit: string;
  totalDirectIncome: string;
  totalMatrixIncome: string;
}

export interface IncomeBreakdown {
  totalLevelIncome: string;
  totalDirectIncome: string;
  totalMatrixIncome: string;
  totalProfit: string;
}

// =========================================================================
// NEW FUNCTIONS FOR TEAM AND PROFIT TRACKING
// =========================================================================

/**
 * Get total team size for a user (all downlines)
 */
export async function fetchTotalTeamSize(
  walletAddress: string,
): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const teamSize = await contract.getTotalTeamSize(walletAddress);
    return teamSize.toString();
  } catch (error) {
    console.error("Error fetching total team size:", error);
    return "0";
  }
}

/**
 * Get direct sponsor/partner count for a user from the contract profile.
 */
export async function fetchDirectPartnersCount(
  walletAddress: string,
): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const profile = await contract.getUserProfile(walletAddress);
    return profile.totalDirects?.toString() || "0";
  } catch (error) {
    console.error("Error fetching direct partners count:", error);
    return "0";
  }
}

export interface DirectPartnerRow {
  id: number;
  date: string;
  wallet: string;
  fullWallet: string;
  refId: string;
  x3: number;
  x4: number;
  xXx: number;
  xGold: number;
  xQore: number;
  maxQore: number;
  profitUSDT: string;
  profitBNB: string;
  newPartners: number;
  partners: number;
}

interface DirectPartnerApiRow {
  id: number;
  date: string;
  wallet: string;
  stringId: string;
  sponsorPackageId: number;
  matrixPackageId: number;
  levelPackageId: number;
  totalIncome: string;
  directPartners: string;
}

// Replaces the dead directReferrals-array-getter-based version (that mapping
// no longer exists on the trimmed contract). GET /users/:address/direct-partners
// does the whole join server-side (user_registrations for the list, live
// package reads, income/dashboard totals) in one call.
export async function fetchDirectPartners(
  walletAddress: string,
): Promise<DirectPartnerRow[]> {
  const rows = await apiGet<DirectPartnerApiRow[]>(
    `/users/${walletAddress}/direct-partners`,
  );
  return (rows ?? []).map((r) => {
    const dateSeconds = Math.floor(new Date(r.date).getTime() / 1000);
    const directCount = Number(r.directPartners) || 0;
    return {
      id: r.id,
      date: formatDate(dateSeconds),
      wallet: `${r.wallet.slice(0, 6)}...${r.wallet.slice(-4)}`,
      fullWallet: r.wallet,
      refId: r.stringId || `ID ${r.id}`,
      x3: r.sponsorPackageId,
      x4: r.matrixPackageId,
      xXx: r.levelPackageId,
      xGold: 0,
      xQore: 0,
      maxQore: 0,
      profitUSDT: `${parseFloat(ethers.formatUnits(r.totalIncome, 18)).toLocaleString()} USDT`,
      profitBNB: "0 BNB",
      newPartners: directCount,
      partners: directCount,
    };
  });
}

export async function fetchDirectPartnersLast24h(
  walletAddress: string,
  maxCount = 100,
): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const cutoffTimestamp = nowInSeconds - 24 * 60 * 60;

    let count = 0;

    for (let i = 0; i < maxCount; i++) {
      let childAddress: string;
      try {
        childAddress = await contract.directReferrals(walletAddress, i);
      } catch (error: any) {
        if (
          error?.message?.includes("out of bounds") ||
          error?.message?.includes("index") ||
          error?.message?.includes("revert")
        ) {
          break;
        }
        console.error("Error fetching direct referral at index", i, error);
        break;
      }

      if (!childAddress || childAddress === ethers.ZeroAddress) {
        break;
      }

      const activationTs = await contract
        .activationDate(childAddress)
        .catch(() => 0);

      const dateNum = Number(activationTs);

      if (dateNum >= cutoffTimestamp) {
        count++;
      }
    }

    return count;
  } catch (error) {
    console.error("Error fetching last 24h partner count:", error);
    return 0;
  }
}

/**
 * Get team activity stats (active/inactive members)
 */
export async function fetchTeamActivityStats(
  walletAddress: string,
): Promise<{ active: string; inactive: string }> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const [active, inactive] =
      await contract.getTeamActivityStats(walletAddress);
    return {
      active: active.toString(),
      inactive: inactive.toString(),
    };
  } catch (error) {
    console.error("Error fetching team activity stats:", error);
    return { active: "0", inactive: "0" };
  }
}

/**
 * Get team size by specific level
 */
export async function fetchTeamByLevel(
  walletAddress: string,
  level: number,
): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const teamCount = await contract.getTeamByLevel(walletAddress, level);
    return teamCount.toString();
  } catch (error) {
    console.error(`Error fetching team by level ${level}:`, error);
    return "0";
  }
}

/**
 * Get income breakdown for a user
 */
export async function fetchIncomeBreakdown(
  walletAddress: string,
): Promise<IncomeBreakdown> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const [
      totalLevelIncome,
      totalDirectIncome,
      totalMatrixIncome,
      totalProfit,
    ] = await contract.getUserIncomeBreakdown(walletAddress);

    return {
      totalLevelIncome: ethers.formatUnits(totalLevelIncome, 18),
      totalDirectIncome: ethers.formatUnits(totalDirectIncome, 18),
      totalMatrixIncome: ethers.formatUnits(totalMatrixIncome, 18),
      totalProfit: ethers.formatUnits(totalProfit, 18),
    };
  } catch (error) {
    console.error("Error fetching income breakdown:", error);
    return {
      totalLevelIncome: "0",
      totalDirectIncome: "0",
      totalMatrixIncome: "0",
      totalProfit: "0",
    };
  }
}

/**
 * Get complete team stats for a user
 */
export async function fetchTeamStats(
  walletAddress: string,
): Promise<TeamStats> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const [
      totalTeam,
      activeTeam,
      inactiveTeam,
      totalProfit,
      totalLevelProfit,
      totalDirectIncome,
      totalMatrixIncome,
    ] = await contract.getTeamStats(walletAddress);

    return {
      totalTeam: totalTeam.toString(),
      activeTeam: activeTeam.toString(),
      inactiveTeam: inactiveTeam.toString(),
      totalProfit: ethers.formatUnits(totalProfit, 18),
      totalLevelProfit: ethers.formatUnits(totalLevelProfit, 18),
      totalDirectIncome: ethers.formatUnits(totalDirectIncome, 18),
      totalMatrixIncome: ethers.formatUnits(totalMatrixIncome, 18),
    };
  } catch (error) {
    console.error("Error fetching team stats:", error);
    return {
      totalTeam: "0",
      activeTeam: "0",
      inactiveTeam: "0",
      totalProfit: "0",
      totalLevelProfit: "0",
      totalDirectIncome: "0",
      totalMatrixIncome: "0",
    };
  }
}

/**
 * Get complete user stats including all details
 */
export async function fetchUserFullStats(
  walletAddress: string,
): Promise<UserStats> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const stats = await contract.getUserFullStats(walletAddress);

    return {
      totalReferrals: stats[0].toString(),
      totalRecycles: stats[1].toString(),
      totalTeam: stats[2].toString(),
      activeTeam: stats[3].toString(),
      inactiveTeam: stats[4].toString(),
      totalProfit: ethers.formatUnits(stats[5], 18),
      totalLevelProfit: ethers.formatUnits(stats[6], 18),
      totalDirectIncome: ethers.formatUnits(stats[7], 18),
      totalMatrixIncome: ethers.formatUnits(stats[8], 18),
      totalInvestment: ethers.formatUnits(stats[9], 18),
    };
  } catch (error) {
    console.error("Error fetching user full stats:", error);
    return {
      totalReferrals: "0",
      totalRecycles: "0",
      totalTeam: "0",
      activeTeam: "0",
      inactiveTeam: "0",
      totalProfit: "0",
      totalLevelProfit: "0",
      totalDirectIncome: "0",
      totalMatrixIncome: "0",
      totalInvestment: "0",
    };
  }
}

/**
 * Get user's total matrix income
 */
export async function fetchUserTotalMatrixIncome(
  walletAddress: string,
): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const income = await contract.userTotalMatrixIncome(walletAddress);
    return ethers.formatUnits(income, 18);
  } catch (error) {
    console.error("Error fetching total matrix income:", error);
    return "0";
  }
}

/**
 * Get user's total direct income
 */
export async function fetchUserTotalDirectIncome(
  walletAddress: string,
): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const income = await contract.userTotalDirectIncome(walletAddress);
    return ethers.formatUnits(income, 18);
  } catch (error) {
    console.error("Error fetching total direct income:", error);
    return "0";
  }
}

// =========================================================================
// LEVEL MAGIC - PACKAGE & ID
// =========================================================================

// Replaces the dead getUserProfile/getUserPackages-based version. pkgId/maxPkg
// intentionally stay the LEVEL track (matches original behavior — every
// caller gets the level package regardless of which program page it's on;
// not changing that quirk here, out of scope).
export async function fetchPackageAndId(walletAddress: string) {
  const [profile, packages] = await Promise.all([
    apiGet<{ stringId: string; numericId: string; sponsorStringId: string }>(
      `/users/${walletAddress}/profile`,
    ),
    // package ids come back as strings (server serializes bigint -> string);
    // Number(...) here is load-bearing, not cosmetic — `currentPkg + 1`
    // silently does string concatenation ("1"+1="11") without it.
    apiGet<{ level: { current: string; max: string } }>(
      `/users/${walletAddress}/packages`,
    ),
  ]);
  return {
    pkgId: Number(packages?.level.current) || 1,
    uplineId: profile?.sponsorStringId,
    maxPkg: Number(packages?.level.max) || 1,
    numericId: profile?.numericId ?? "...",
    stringId: profile?.stringId ?? "...",
  };
}

// Shared by fetch{Matrix,Level,Sponsor}PackageAndIdWithMax — replaces the dead
// getUserProfile/getUserPackages-based versions. isRoot override preserved
// exactly (root always shows package 9 in the UI regardless of its actual
// on-chain matrixPackageId/etc, which stays 0 since the constructor never
// sets a "current package" for admin — only the max* grants).
async function fetchTrackPackageWithMax(
  walletAddress: string,
  track: "matrix" | "level" | "sponsor",
) {
  const [profile, packages] = await Promise.all([
    apiGet<{ stringId: string; numericId: string }>(
      `/users/${walletAddress}/profile`,
    ),
    // package ids come back as strings (server serializes bigint -> string);
    // Number(...) below is load-bearing — `currentPkg + 1` silently does
    // string concatenation ("1"+1="11") without it.
    apiGet<{ [k in typeof track]: { current: string; max: string } }>(
      `/users/${walletAddress}/packages`,
    ),
  ]);
  if (!profile || !packages) {
    return {
      pkgId: 1,
      maxPkg: 1,
      numericId: "...",
      stringId: "...",
      isRoot: false,
    };
  }

  const cleanStrId = (profile.stringId || "")
    .replace(/^ID\s*/i, "")
    .trim()
    .toUpperCase();
  const isRoot =
    profile.numericId === "1" || cleanStrId === RootID || cleanStrId === "1";

  return {
    pkgId: isRoot ? 9 : Number(packages[track].current) || 1,
    maxPkg: isRoot ? 9 : Number(packages[track].max) || 1,
    numericId: profile.numericId,
    stringId: profile.stringId,
    isRoot,
  };
}

export async function fetchLevelPackageAndIdWithMax(walletAddress: string) {
  return fetchTrackPackageWithMax(walletAddress, "level");
}

// =========================================================================
// LEVEL MAGIC - USER LEVEL INCOME
// =========================================================================

export async function fetchUserLevelIncome(walletAddress: string) {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const levelIncomes: { [key: number]: string } = {};

    for (let i = 1; i <= 10; i++) {
      try {
        const amount = await contract.userLevelIncome(walletAddress, i);
        const formatted = ethers.formatUnits(amount, 18);
        if (parseFloat(formatted) > 0) {
          levelIncomes[i] = formatted;
        }
      } catch {
        // Level not available
      }
    }

    return levelIncomes;
  } catch (error) {
    console.error("Error fetching level income:", error);
    return {};
  }
}

export async function fetchUserTotalLevelProfit(walletAddress: string) {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const total = await contract.userTotalLevelProfit(walletAddress);
    return ethers.formatUnits(total, 18);
  } catch (error) {
    console.error("Error fetching total level profit:", error);
    return "0";
  }
}
interface TransactionApiRow {
  level: number | null;
  cycle: string | null;
  package_id: number | null;
  amount: string;
  block_timestamp: string;
  counterparty_string_id: string | null;
  counterparty_address: string | null;
}

// Replaces the dead levelIncomeHistory-array-getter-based version (that
// mapping no longer exists on the trimmed contract — see
// [[contract_gas_strip]]). Sourced from the unified transactions table
// (GET /transactions/:address?type=LEVEL_INCOME), counterparty resolved to a
// string ID server-side.
export async function fetchLevelIncomeHistory(
  walletAddress: string,
): Promise<LevelIncomeRow[]> {
  const rows = await apiGet<TransactionApiRow[]>(
    `/transactions/${walletAddress}?type=LEVEL_INCOME`,
  );
  return (rows ?? [])
    .map((r) => {
      const dateSeconds = Math.floor(
        new Date(r.block_timestamp).getTime() / 1000,
      );
      return {
        level: r.level ?? 0,
        childId: r.counterparty_string_id ?? "ID ...",
        amount: `${ethers.formatUnits(r.amount, 18)} USDT`,
        date: formatDate(dateSeconds),
      };
    })
    .reverse();
}

// =========================================================================
// LEVEL MAGIC - PURCHASE HISTORY
// =========================================================================

interface PackageHistoryApiRow {
  packageId: number;
  track: string;
  amount: string;
  blockTimestamp: string;
}

// Replaces the dead userPackageHistory-array-getter-based version (that
// mapping no longer exists on the trimmed contract — see
// [[contract_gas_strip]]). GET /users/:address/history/packages is the
// event-sourced replacement (package_purchase_events table), oldest-first;
// reversed here to match the original newest-first ordering.
export async function fetchPurchaseHistory(walletAddress: string) {
  const rows = await apiGet<PackageHistoryApiRow[]>(
    `/users/${walletAddress}/history/packages`,
  );
  return (rows ?? [])
    .map((r, i) => {
      const dateSeconds = Math.floor(
        new Date(r.blockTimestamp).getTime() / 1000,
      );
      return {
        index: i + 1,
        package: `Package ${r.packageId}`,
        amount: `${ethers.formatUnits(r.amount, 18)} USDT`,
        date: formatDate(dateSeconds),
        packageId: r.packageId,
        track: r.track,
        isLevelMagic: r.track === "LEVEL",
      };
    })
    .reverse();
}

export async function fetchLevelOnlyHistory(
  walletAddress: string,
): Promise<PurchasedPackageRow[]> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const historyList: PurchasedPackageRow[] = [];
    let i = 0;
    let hasMore = true;

    while (hasMore && i < 100) {
      try {
        const record = await contract.userPackageHistory(walletAddress, i);

        const { packageId, amount, track, date } =
          normalizePackageHistoryRecord(record);

        const amountInUsdt = parseFloat(ethers.formatUnits(amount, 18));

        const isLevelAmount = [
          24.975, 49.95, 99.9, 199.8, 399.6, 799.2, 1598.4, 3196.8, 6393.6,
        ].some((val) => Math.abs(amountInUsdt - val) < 0.001);

        if (track === "LEVEL" || (!track && isLevelAmount)) {
          historyList.push({
            index: historyList.length + 1,
            package: `Package ${packageId}`,
            amount: `${ethers.formatUnits(amount, 18)} USDT`,
            date: formatDate(date),
            packageId: packageId,
            track: track || "LEVEL",
          });
        }

        i++;
      } catch {
        hasMore = false;
        break;
      }
    }

    return historyList.reverse();
  } catch (error) {
    console.error("Error fetching level-only purchase history:", error);
    return [];
  }
}

export interface RecentActivityItem {
  id: string;
  label: string;
  time: string;
  type: "income" | "join";
}

export async function fetchRecentActivity(
  walletAddress: string,
  maxItems = 5,
): Promise<RecentActivityItem[]> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const records = await contract.getUserPackageHistory(walletAddress);

    const activity = records
      .map((record: any, index: number) => {
        const packageId =
          record.packageId !== undefined
            ? Number(record.packageId)
            : Number(record[0]);
        const amountRaw =
          record.amount !== undefined ? record.amount : record[1];
        const track = record.track !== undefined ? String(record.track) : "";
        const date = Number(
          record.date !== undefined ? record.date : record[3],
        );
        const amountValue = parseFloat(ethers.formatUnits(amountRaw, 18));
        const formattedAmount = `${amountValue.toLocaleString()} USDT`;

        let label = `Package ${packageId} ${formattedAmount}`;
        let type: "income" | "join" = "income";

        if (track === "SPONSOR") {
          label = `Sponsor package ${packageId} +${formattedAmount}`;
          type = "join";
        } else if (track === "MATRIX") {
          label = `Matrix package ${packageId} +${formattedAmount}`;
          type = "income";
        } else if (track === "LEVEL") {
          label = `Level package ${packageId} +${formattedAmount}`;
          type = "income";
        } else if (track) {
          label = `${track.toLowerCase()} package ${packageId} +${formattedAmount}`;
        }

        return {
          id: `${index}-${packageId}-${date}`,
          label,
          time: formatDate(date),
          type,
        };
      })
      .slice(0, maxItems);

    return activity;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
}

// Replaces the dead getSystemStats-based version. GET /system/stats is a
// live proxy for memberCounter()/totalInvestment() (both kept on-chain).
export async function fetchPlatformStats(): Promise<{
  totalMembers: string;
  totalUsdtInvested: string;
  totalInvestment: string;
}> {
  const stats = await apiGet<{
    totalMembers: string;
    totalUsdtInvested: string;
  }>("/system/stats");
  if (!stats)
    return { totalMembers: "0", totalUsdtInvested: "0", totalInvestment: "0" };
  const totalUsdtInvested = ethers.formatUnits(stats.totalUsdtInvested, 18);
  return {
    totalMembers: stats.totalMembers,
    totalUsdtInvested,
    totalInvestment: totalUsdtInvested,
  };
}

export async function fetchDailyRegistrations(dayOffset = 0): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);
    const dayIndex = Math.floor(Date.now() / 1000 / 86400) + dayOffset;
    const registrations = await contract.dailyRegistrations(dayIndex);
    return registrations.toString();
  } catch (error) {
    console.error("Error fetching daily registrations:", error);
    return "0";
  }
}

// =========================================================================
// LEVEL MAGIC - BUY PACKAGE
// =========================================================================

export async function buyLevelPackage(
  packageId: number,
  priceInUsdt: string,
  onStatusChange: (status: string) => void,
) {
  if (!window.ethereum) throw new Error("Please install a Web3 wallet");

  const readProvider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
  const readContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    ["function usdt() external view returns (address)"],
    readProvider,
  );

  const usdtAddress = await readContract.usdt();
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const CONTRACT_ABI = [
    "function purchaseLevelPackage(uint8 packageId) external",
  ];
  const USDT_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
  ];

  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const usdtContract = new ethers.Contract(usdtAddress, USDT_ABI, signer);

  const packagePriceRaw = ethers.parseUnits(
    priceInUsdt.replace(" USDT", "").trim(),
    18,
  );
  const userAddress = await signer.getAddress();

  const currentAllowance = await usdtContract.allowance(
    userAddress,
    CONTRACT_ADDRESS,
  );
  if (currentAllowance < packagePriceRaw) {
    onStatusChange("approving");
    // Infinite approval — see registerUser's approve call for why.
    const approveTx = await usdtContract.approve(
      CONTRACT_ADDRESS,
      ethers.MaxUint256,
    );
    await approveTx.wait();
  }

  onStatusChange("purchasing");
  const purchaseTx = await contract.purchaseLevelPackage(packageId);
  await purchaseTx.wait();
}

// =========================================================================
// LEVEL MAGIC - SYSTEM STATS
// =========================================================================

export async function fetchLevelSystemStats() {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const levelStats: { [key: number]: { income: string; members: string } } =
      {};

    for (let i = 1; i <= 10; i++) {
      try {
        const income = await contract.totalLevelIncomeByLevel(i);
        const members = await contract.totalMembersByLevel(i);

        levelStats[i] = {
          income: ethers.formatUnits(income, 18),
          members: members.toString(),
        };
      } catch {
        // Skip if not available
      }
    }

    return levelStats;
  } catch (error) {
    console.error("Error fetching level system stats:", error);
    return {};
  }
}

export async function fetchLevelPackageCosts() {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const costs: { [key: number]: string } = {};

    for (let i = 1; i <= 9; i++) {
      try {
        const price = await contract.getLevelPrice(i);
        costs[i] = ethers.formatUnits(price, 18);
      } catch {
        // Skip if not available
      }
    }

    return costs;
  } catch (error) {
    console.error("Error fetching level package costs:", error);
    return {};
  }
}

export interface PackageCosts {
  fullPrice: string;
  matrixPortion: string;
  sponsorPortion: string;
  levelPortion: string;
}

// Income distribution — how one package's price splits across the 3 tracks.
// GET /system/packages/:id/costs is a live proxy (packages()/getMatrixPrice()/
// getSponsorPrice()/getLevelPrice(), all kept on-chain, never deleted).
export async function fetchPackageCosts(
  packageId: number,
): Promise<PackageCosts> {
  const costs = await apiGet<PackageCosts>(
    `/system/packages/${packageId}/costs`,
  );
  if (!costs)
    return {
      fullPrice: "0",
      matrixPortion: "0",
      sponsorPortion: "0",
      levelPortion: "0",
    };
  return {
    fullPrice: ethers.formatUnits(costs.fullPrice, 18),
    matrixPortion: ethers.formatUnits(costs.matrixPortion, 18),
    sponsorPortion: ethers.formatUnits(costs.sponsorPortion, 18),
    levelPortion: ethers.formatUnits(costs.levelPortion, 18),
  };
}

// =========================================================================
// SPONSOR MAGIC - SPECIFIC FUNCTIONS
// =========================================================================

export async function fetchSponsorPackageAndIdWithMax(walletAddress: string) {
  return fetchTrackPackageWithMax(walletAddress, "sponsor");
}

export async function fetchSponsorOnlyHistory(walletAddress: string) {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const historyList = [];
    let i = 0;
    let hasMore = true;

    while (hasMore && i < 100) {
      try {
        const record = await contract.userPackageHistory(walletAddress, i);

        const { packageId, amount, track, date } =
          normalizePackageHistoryRecord(record);

        const amountInUsdt = parseFloat(ethers.formatUnits(amount, 18));

        const isSponsorAmount = [
          12.525, 25.05, 50.1, 100.2, 200.4, 400.8, 801.6, 1603.2, 3206.4,
        ].some((val) => Math.abs(amountInUsdt - val) < 0.001);

        if (track === "SPONSOR" || (!track && isSponsorAmount)) {
          historyList.push({
            index: historyList.length + 1,
            package: `Package ${packageId}`,
            amount: `${ethers.formatUnits(amount, 18)} USDT`,
            date: formatDate(date),
            track: track || "SPONSOR",
          });
        }

        i++;
      } catch {
        hasMore = false;
        break;
      }
    }

    return historyList.reverse();
  } catch (error) {
    console.error("Error fetching sponsor-only purchase history:", error);
    return [];
  }
}

export async function fetchSponsorHistoryByTrack(walletAddress: string) {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);

    const META6_ABI = [
      "function getUserHistoryByTrack(address user, string memory trackName) external view returns (tuple(uint8 packageId, uint256 amount, string track, uint256 date)[])",
    ];

    const contract = new ethers.Contract(CONTRACT_ADDRESS, META6_ABI, provider);

    const records = await contract.getUserHistoryByTrack(
      walletAddress,
      "SPONSOR",
    );

    const historyList = records.map((record: any, index: number) => ({
      index: index + 1,
      package: `Package ${Number(record.packageId)}`,
      amount: `${ethers.formatUnits(record.amount, 18)} USDT`,
      date: formatDate(Number(record.date)),
      packageId: Number(record.packageId),
      track: record.track,
    }));

    return historyList.reverse();
  } catch (error) {
    console.error("Error fetching sponsor history by track:", error);
    return [];
  }
}

export async function buySponsorPackage(
  packageId: number,
  priceInUsdt: string,
  onStatusChange: (status: string) => void,
) {
  if (!window.ethereum) throw new Error("Please install a Web3 wallet");

  const readProvider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
  const readContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CORE_ABI,
    readProvider,
  );

  const usdtAddress = await readContract.usdt();
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const CONTRACT_ABI = [
    "function purchaseSponsorPackage(uint8 packageId) external",
  ];
  const USDT_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
  ];

  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const usdtContract = new ethers.Contract(usdtAddress, USDT_ABI, signer);

  const packagePriceRaw = ethers.parseUnits(
    priceInUsdt.replace(" USDT", "").trim(),
    18,
  );
  const userAddress = await signer.getAddress();

  const currentAllowance = await usdtContract.allowance(
    userAddress,
    CONTRACT_ADDRESS,
  );
  if (currentAllowance < packagePriceRaw) {
    onStatusChange("approving");
    // Infinite approval — see registerUser's approve call for why.
    const approveTx = await usdtContract.approve(
      CONTRACT_ADDRESS,
      ethers.MaxUint256,
    );
    await approveTx.wait();
  }

  onStatusChange("purchasing");
  const purchaseTx = await contract.purchaseSponsorPackage(packageId);
  await purchaseTx.wait();
}

export async function fetchSponsorPurchaseHistory(walletAddress: string) {
  return fetchPurchaseHistory(walletAddress);
}

// =========================================================================
// SPONSOR INCOME - FUNCTIONS
// =========================================================================

// Replaces the dead referralIncomeHistory-array-getter-based version (that
// mapping no longer exists on the trimmed contract — see
// [[contract_gas_strip]]). Sourced from income.totalSponsorIncome, the
// indexer-maintained running total (GET /income/:address).
export async function fetchTotalSponsorIncome(
  walletAddress: string,
): Promise<string> {
  try {
    const row = await apiGet<{ totalSponsorIncome: string }>(
      `/income/${walletAddress}`,
    );
    return ethers.formatUnits(row?.totalSponsorIncome ?? "0", 18);
  } catch (error) {
    console.error("Error fetching total sponsor income:", error);
    return "0";
  }
}
// checkpoint
// Replaces the dead referralIncomeHistory-array-getter-based version (that
// mapping no longer exists on the trimmed contract — see
// [[contract_gas_strip]]). Sourced from the unified transactions table
// (GET /transactions/:address?type=DIRECT_INCOME), counterparty resolved to a
// string ID server-side.
export async function fetchSponsorIncomeHistory(walletAddress: string) {
  const rows = await apiGet<TransactionApiRow[]>(
    `/transactions/${walletAddress}?type=DIRECT_INCOME`,
  );
  return (rows ?? [])
    .map((r, index) => {
      const dateSeconds = Math.floor(
        new Date(r.block_timestamp).getTime() / 1000,
      );
      return {
        id: index + 1,
        childId: r.counterparty_string_id ?? "ID ...",
        amount: `${ethers.formatUnits(r.amount, 18)} USDT`,
        cycle: Number(r.cycle) || 0,
        // DirectIncome is the one income event that carries its own packageId
        // (no tx_hash-join heuristic needed, unlike Matrix/Level income).
        packageId: r.package_id ?? 0,
        date: formatDate(dateSeconds),
      };
    })
    .reverse();
}

// Real recycle counts per package (from SponsorReEntry events, not the
// DirectIncome `cycle` position field — see the backend route for why those
// aren't the same thing). Powers the Sponsor Magic overview grid's "Cycles"
// stat.
export async function fetchSponsorRecycleCounts(
  walletAddress: string,
): Promise<Record<number, number>> {
  try {
    const data = await apiGet<{ counts: Record<number, number> }>(
      `/users/${walletAddress}/sponsor-recycle-counts`,
    );
    return data?.counts ?? {};
  } catch (error) {
    console.error("Error fetching sponsor recycle counts:", error);
    return {};
  }
}

// Batched held-partner ids per package (see the backend route). Powers the
// Sponsor Magic overview grid's partner slots/count — same held-partner gap
// as the per-level detail page, fixed with one batched call instead of 9.
export async function fetchSponsorHeldSummary(
  walletAddress: string,
): Promise<Record<number, string[]>> {
  try {
    const data = await apiGet<{ byPackage: Record<number, string[]> }>(
      `/users/${walletAddress}/sponsor-held-summary`,
    );
    return data?.byPackage ?? {};
  } catch (error) {
    console.error("Error fetching sponsor held summary:", error);
    return {};
  }
}

// =========================================================================
// SPONSOR LEVEL DETAIL (powers XThreeLevelPage: cycles, partner slots, revenue)
// =========================================================================

export interface SponsorLevelTransaction {
  id: number;
  date: string;
  refId: string;
  level: number;
  wallet: string;
  fullWallet: string;
  type: "join" | "recycle";
  recycleCount?: number;
  amount: string;
}

export interface CyclePartner {
  id: string;
  isHeld: boolean; // income for this slot is escrowed (SponsorIncomeHeld), not paid out yet
}

export interface SponsorLevelDetail {
  ownStringId: string;
  uplineStringId: string;
  partnersCount: number;
  cyclesCount: number;
  totalRevenue: string;
  cyclePartnerIds: CyclePartner[][];
  transactions: SponsorLevelTransaction[];
}

// Replaces the dead referralIncomeHistory-array-getter-based version (that
// mapping no longer exists on the trimmed contract — see
// [[contract_gas_strip]]). Sourced from GET /users/:address/profile
// (own/upline string IDs) and GET /transactions/:address?type=DIRECT_INCOME
// (DirectIncome carries its own real packageId + cycle now — no more
// amount-matching heuristic to guess which package a payout belongs to, and
// cycle grouping uses the real `cycle` field instead of positional slicing).
export async function fetchSponsorLevelDetail(
  walletAddress: string,
  packageId: number,
): Promise<SponsorLevelDetail> {
  const empty: SponsorLevelDetail = {
    ownStringId: "...",
    uplineStringId: "NONE",
    partnersCount: 0,
    cyclesCount: 0,
    totalRevenue: "0",
    cyclePartnerIds: [],
    transactions: [],
  };

  try {
    let targetAddress = walletAddress;
    if (targetAddress && !targetAddress.startsWith("0x")) {
      const resolved = await getWalletAddressFromUserId(targetAddress);
      if (resolved) {
        targetAddress = resolved;
      }
    }

    const [profile, rows, heldRows, recycleCounts, directPartners] =
      await Promise.all([
        apiGet<{ stringId: string; sponsorStringId: string }>(
          `/users/${targetAddress}/profile`,
        ),
        apiGet<TransactionApiRow[]>(
          `/transactions/${targetAddress}?type=DIRECT_INCOME`,
        ),
        apiGet<
          {
            from_string_id: string | null;
            cycle: string | null;
            amount: string;
            block_timestamp: string;
          }[]
        >(`/users/${targetAddress}/history/sponsor-held/${packageId}`),
        fetchSponsorRecycleCounts(targetAddress),
        // Only meaningful for packageId 1: everyone auto-buys sponsor package 1
        // at registration, so registration order === package-1 cycle order.
        // For packageId > 1, purchase order isn't known from this endpoint, so
        // it's not used there.
        packageId === 1
          ? fetchDirectPartners(targetAddress)
          : Promise.resolve([]),
      ]);

      console.log(rows)
    if (!profile) return empty;

    const ownStringId = profile.stringId || "...";
    const uplineStringId = profile.sponsorStringId || "NONE";

    const rawMatches = (rows ?? [])
      .filter((r) => (r.package_id ?? 0) === packageId)
      .map((r) => ({
        childId: r.counterparty_string_id ?? "ID ...",
        childFullAddr: r.
counterparty_address ?? "ADDRESS ...",
        amount: `${ethers.formatUnits(r.amount, 18)} USDT`,
        rawAmount: parseFloat(ethers.formatUnits(r.amount, 18)),
        cycle: Number(r.cycle) || 0,
        date: formatDate(
          Math.floor(new Date(r.block_timestamp).getTime() / 1000),
        ),
        rawDate: Math.floor(new Date(r.block_timestamp).getTime() / 1000),
        isHeld: false,
      }))
      .sort((a, b) => a.rawDate - b.rawDate);

    // Partners #3/#4 of a batch don't always get paid out immediately — if the
    // sponsor hasn't manually upgraded yet, their share is held toward an
    // auto-upgrade instead (SponsorIncomeHeld, not DirectIncome — see
    // /history/sponsor-held). Those partners are just as real; merge them in
    // so the partner-slot count matches actual direct partners instead of
    // silently dropping whoever landed on a held count. Excluded from
    // totalRevenue/transactions below since that money hasn't reached the
    // sponsor's wallet yet.
    const heldMatches = (heldRows ?? []).map((r) => ({
      childId: r.from_string_id ?? "ID ...",
      childFullAddr: "",
      amount: `${ethers.formatUnits(r.amount, 18)} USDT`,
      rawAmount: 0,
      cycle: Number(r.cycle) || 0,
      date: formatDate(
        Math.floor(new Date(r.block_timestamp).getTime() / 1000),
      ),
      rawDate: Math.floor(new Date(r.block_timestamp).getTime() / 1000),
      isHeld: true,
    }));

    const allMatches = [...rawMatches, ...heldMatches].sort(
      (a, b) => a.rawDate - b.rawDate,
    );

    // `cycle` on-chain is sponsorCycleCountByPkg — the within-batch position
    // (1st..5th direct referral), which RESETS to 0 every time it hits 5 (see
    // the SponsorReEntry reset in contract.sol). It is NOT a unique batch
    // number, so grouping by `cycle - 1` directly (previous version of this
    // function) merged every batch's "1st of 5" into one slot, every "2nd of
    // 5" into another, etc. A real new batch is detected by the position
    // failing to strictly increase from the previous row (chronological order);
    // batchNumber (1-based) is attached per row for the transactions list below.
    const cyclePartnerIds: CyclePartner[][] = [];
    let prevCyclePos = 0;
    const matches = allMatches.map((m) => {
      if (m.cycle <= prevCyclePos || cyclePartnerIds.length === 0)
        cyclePartnerIds.push([]);
      prevCyclePos = m.cycle;
      cyclePartnerIds[cyclePartnerIds.length - 1].push({
        id: m.childId,
        isHeld: m.isHeld,
      });
      return { ...m, batchNumber: cyclePartnerIds.length };
    });

    const totalRevenue = matches
      .filter((m) => !m.isHeld)
      .reduce((sum, m) => sum + m.rawAmount, 0)
      .toFixed(3);

    const transactions: SponsorLevelTransaction[] = matches
      .filter((m) => !m.isHeld)
      .map((m, idx) => {
        const isRecycle = m.cycle === 5;
        return {
          id: idx + 1,
          date: m.date,
          refId: m.childId.replace(/^ID\s*/i, ""),
          level: packageId,
          wallet: m.childId,
          fullWallet: m.childFullAddr,
          type: isRecycle ? ("recycle" as const) : ("join" as const),
          recycleCount: isRecycle ? m.batchNumber : undefined,
          amount: isRecycle ? "recycle" : m.amount,
        };
      })
      .reverse();

    // cyclePartnerIds is inferred purely from referral rows — it can't see a
    // recycle until a 6th referral actually lands and produces a new
    // cycle-position-1 row. If the real SponsorReEntry count (see
    // fetchSponsorRecycleCounts) is ahead of what the inferred groups show,
    // a cycle has completed with nobody new yet — pad in the empty new
    // cycle so the page defaults to showing it instead of the stale,
    // already-recycled batch.
    const realRecycleCount = recycleCounts[packageId] ?? 0;
    while (cyclePartnerIds.length < realRecycleCount + 1)
      cyclePartnerIds.push([]);

    // The 5th referral of a closed batch is invisible to this sponsor's own
    // data — DirectIncome for count==5 pays the sponsor's OWN upline, not
    // this sponsor (see the contract's recycle branch), so it never shows up
    // in either the paid or held feeds above. For packageId 1, recover it
    // from registration order (everyone auto-buys package 1 at registration,
    // so the Nth direct partner IS the Nth package-1 cycle slot) and fill it
    // in as each closed batch's 5th slot, paid (that slot's income really
    // was paid out — just to someone else, not held).
    if (packageId === 1 && directPartners.length) {
      for (let batch = 0; batch < realRecycleCount; batch++) {
        const fifth = directPartners[batch * 5 + 4];
        if (fifth && cyclePartnerIds[batch]) {
          cyclePartnerIds[batch].push({ id: fifth.refId, isHeld: false });
        }
      }
    }

    return {
      ownStringId,
      uplineStringId,
      partnersCount: matches.length,
      cyclesCount: cyclePartnerIds.length,
      totalRevenue,
      cyclePartnerIds,
      transactions,
    };
  } catch (error) {
    console.error(
      `Error fetching sponsor level detail for package ${packageId}:`,
      error,
    );
    return empty;
  }
}

// =========================================================================
// MATRIX MAGIC - SPECIFIC FUNCTIONS
// =========================================================================

export async function fetchMatrixPackageAndIdWithMax(walletAddress: string) {
  return fetchTrackPackageWithMax(walletAddress, "matrix");
}

export async function fetchMatrixOnlyHistory(walletAddress: string) {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const historyList = [];
    let i = 0;
    let hasMore = true;

    while (hasMore && i < 100) {
      try {
        const record = await contract.userPackageHistory(walletAddress, i);

        const { packageId, amount, track, date } =
          normalizePackageHistoryRecord(record);

        const amountInUsdt = parseFloat(ethers.formatUnits(amount, 18));

        const isMatrixAmount = [
          37.5, 75, 150, 300, 600, 1200, 2400, 4800, 9600,
        ].some((val) => Math.abs(amountInUsdt - val) < 0.001);

        if (track === "MATRIX" || (!track && isMatrixAmount)) {
          historyList.push({
            index: historyList.length + 1,
            package: `Package ${packageId}`,
            amount: `${ethers.formatUnits(amount, 18)} USDT`,
            date: formatDate(date),
            packageId: packageId,
            track: track || "MATRIX",
          });
        }

        i++;
      } catch {
        hasMore = false;
        break;
      }
    }

    return historyList.reverse();
  } catch (error) {
    console.error("Error fetching matrix-only purchase history:", error);
    return [];
  }
}

export async function fetchMatrixCycleAndHoldStatus(
  walletAddress: string,
  packageId: number = 1,
) {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const status = await contract.getCycleAndHoldStatus(
      walletAddress,
      packageId,
    );

    return {
      matrixMembersFilled: status.matrixMembersFilled.toString(),
      matrixHoldAmount: ethers.formatUnits(status.matrixHoldAmount, 18),
      sponsorMembersFilled: status.sponsorMembersFilled.toString(),
      sponsorHoldAmount: ethers.formatUnits(status.sponsorHoldAmount, 18),
    };
  } catch (error) {
    console.error("Error fetching matrix cycle and hold status:", error);
    return null;
  }
}

export async function fetchMatrixTreeInfo(
  walletAddress: string,
  packageId: number = 1,
) {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const treeInfo = await contract.getMatrixTreeInfo(walletAddress, packageId);

    return {
      parent: treeInfo.matrixParent,
      children: treeInfo.directMatrixChildren.map((addr: string) => addr),
    };
  } catch (error) {
    console.error("Error fetching matrix tree info:", error);
    return null;
  }
}

// Replaces the dead on-chain magicGoldMatrixStructure call (removed from the
// trimmed contract — see [[contract_gas_strip]]) with GET
// /users/:address/magic-gold/:packageId/:cycleIndex, backed by matrix_placements
// + level5_reentries. Null slots from the API are normalized to ZeroAddress so
// callers' existing "!== ZeroAddress" empty-slot checks keep working unchanged.

// export async function fetchMagicGoldMatrixStructure(
//   walletAddress: string,
//   packageId: number,
//   cycleIndex = 0,
// ): Promise<MagicGoldMatrixStructure> {
//   try {
//     const data = await apiGet<{ root: string; nodes: (string | null)[] }>(
//       `/users/${walletAddress}/magic-gold/${packageId}/${cycleIndex}`,
//     );
//     if (!data) throw new Error("empty response");

//     const root = data.root;
//     const nodes = data.nodes.map((n) => n ?? ethers.ZeroAddress);
//     const visibleNodes = nodes.slice(0, 30);
//     const toSlot = (address: string): MatrixSlotType =>
//       address && address !== ethers.ZeroAddress ? "direct" : "empty";

//     const filledCount = visibleNodes.filter(
//       (address) => address && address !== ethers.ZeroAddress,
//     ).length;

//     return {
//       root,
//       nodes,
//       tree: [
//         visibleNodes.slice(0, 2).map(toSlot),
//         visibleNodes.slice(2, 6).map(toSlot),
//         visibleNodes.slice(6, 14).map(toSlot),
//         visibleNodes.slice(14, 30).map(toSlot),
//       ],
//       filledCount,
//     };
//   } catch (error) {
//     console.error(
//       `Error fetching magic gold matrix structure for package ${packageId}:`,
//       error,
//     );
//     return { root: ethers.ZeroAddress, nodes: [], tree: [], filledCount: 0 };
//   }
// }

export async function fetchMagicGoldMatrixStructure(
  walletAddress: string,
  packageId: number,
  cycleIndex = 0,
): Promise<MagicGoldMatrixStructure> {
  try {
    const data = await apiGet<{
      root: string;
      nodes: ({
        address: string;
        isDirectPlacement: boolean;
        isInDownline: boolean;
      } | null)[];
    }>(`/users/${walletAddress}/magic-gold/${packageId}/${cycleIndex}`);
    if (!data) throw new Error("empty response");

    const root = data.root;
    const nodes = data.nodes.map((n) => n?.address ?? ethers.ZeroAddress);
    const visibleNodes = data.nodes.slice(0, 30);

    const toSlot = (
      node: {
        address: string;
        isDirectPlacement: boolean;
        isInDownline: boolean;
      } | null,
    ): MatrixSlotType => {
      if (!node) return "empty";
      if (node.isDirectPlacement) return "direct";
      return node.isInDownline ? "spilloverAbove" : "spilloverBelow";
    };

    const filledCount = data.nodes.filter((n) => n !== null).length;

    return {
      root,
      nodes,
      nodeInfos: data.nodes,
      tree: [
        visibleNodes.slice(0, 2).map(toSlot),
        visibleNodes.slice(2, 6).map(toSlot),
        visibleNodes.slice(6, 14).map(toSlot),
        visibleNodes.slice(14, 30).map(toSlot),
      ],
      filledCount,
    };
  } catch (error) {
    console.error(
      `Error fetching magic gold matrix structure for package ${packageId}:`,
      error,
    );
    return {
      root: ethers.ZeroAddress,
      nodes: [],
      nodeInfos: [],
      tree: [],
      filledCount: 0,
    };
  }
}

// Replaces the per-address live memberStringId RPC loop with one DB query
// (GET /users/string-ids) — was up to 62 sequential calls per matrix tree
// render. Pass packageId when resolving matrix-tree node addresses — some
// slots are a recycle's synthetic "phantom" address (see the backend route),
// and resolving those needs to know which package's realOwnerByPkg to check.
export async function fetchMemberIdsForAddresses(
  addresses: string[],
  packageId?: number,
): Promise<Record<string, string>> {
  const uniqueAddresses = Array.from(
    new Set(
      addresses
        .filter((address) => address && address !== ethers.ZeroAddress)
        .map((address) => address.toLowerCase()),
    ),
  );
  if (uniqueAddresses.length === 0) return {};

  try {
    const pkgParam = packageId ? `&packageId=${packageId}` : "";
    const result = await apiGet<Record<string, string>>(
      `/users/string-ids?addresses=${uniqueAddresses.join(",")}${pkgParam}`,
    );
    return result ?? {};
  } catch (error) {
    console.error("Error fetching member IDs for matrix nodes:", error);
    return {};
  }
}

export async function fetchMatrixPackagePrice(
  packageId: number,
): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);
    const price = await contract.getMatrixPrice(packageId);
    return Number(ethers.formatUnits(price, 18));
  } catch (error) {
    console.error(
      `Error fetching matrix package price for package ${packageId}:`,
      error,
    );
    return 0;
  }
}

export async function fetchMagicGoldMatrixCycleIncome(
  walletAddress: string,
  packageId: number,
  cycleIndex: number,
  structure?: MagicGoldMatrixStructure,
): Promise<MatrixCycleIncomeRow[]> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const matrixStructure =
      structure ??
      (await fetchMagicGoldMatrixStructure(
        walletAddress,
        packageId,
        cycleIndex,
      ));
    const nodeAddresses = matrixStructure.nodes
      .filter((address) => address && address !== ethers.ZeroAddress)
      .map((address) => address.toLowerCase());

    if (nodeAddresses.length === 0) return [];

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      [
        "event MatrixIncome(address indexed receiver, address indexed from, uint8 level, uint256 amount)",
        "function memberId(address user) external view returns (uint256)",
      ],
      provider,
    );
    const receiverFilter = contract.filters.MatrixIncome(walletAddress);
    const logs = await contract.queryFilter(receiverFilter, 0, "latest");
    const filteredLogs = logs.filter((log: any) => {
      const from = String(log.args?.from ?? "").toLowerCase();
      const level = Number(log.args?.level ?? 0);
      return level === packageId && nodeAddresses.includes(from);
    });

    const rows = await Promise.all(
      filteredLogs.map(async (log: any, index) => {
        const from = String(log.args.from);
        const amount = log.args.amount;
        const [memberIdValue, block] = await Promise.all([
          contract
            .memberId(from)
            .then((id: bigint) => (id > 0n ? id.toString() : from.slice(0, 6)))
            .catch(() => from.slice(0, 6)),
          provider.getBlock(log.blockNumber).catch(() => null),
        ]);
        const amountValue = Number(ethers.formatUnits(amount, 18));

        return {
          id: index + 1,
          date: block?.timestamp
            ? formatDate(Number(block.timestamp))
            : "Pending",
          refId: memberIdValue,
          level: packageId,
          wallet: `${from.slice(0, 6)}...${from.slice(-4)}`,
          fullWallet: from,
          type: "join" as const,
          amount: `${amountValue.toLocaleString()} USDT`,
          amountValue,
        };
      }),
    );

    return rows.reverse();
  } catch (error) {
    console.error(
      `Error fetching matrix cycle income for package ${packageId}:`,
      error,
    );
    return [];
  }
}

interface MatrixIncomeApiRow {
  level: number;
  amount: string;
  block_timestamp: string;
  from_string_id: string | null;
  from_address: string;
  package_id: number;
}

/**
 * Replaces the dead getUserMatrixIncomeHistory-based version (that mapping no
 * longer exists on the trimmed contract). GET /users/:address/history/matrix-income
 * is the event-sourced replacement, from_string_id resolved server-side.
 * package_id now comes from the contract's MatrixIncome event directly
 * (redeployed to carry it, mirroring DirectIncome) with a tx_hash-join
 * fallback for rows indexed before the redeploy.
 */
// export async function fetchUserMatrixIncomeHistory(
//   walletAddress: string,
//   packageId: number,
// ): Promise<MatrixCycleIncomeRow[]> {
//   const rows = await apiGet<MatrixIncomeApiRow[]>(`/users/${walletAddress}/history/matrix-income`);
//   return (rows ?? []).map((r, index) => {
//     const dateSeconds = Math.floor(new Date(r.block_timestamp).getTime() / 1000);
//     const amountValue = Number(ethers.formatUnits(r.amount, 18));
//     const refId = r.from_string_id ?? "ID ...";
//     return {
//       id: index + 1,
//       date: formatDate(dateSeconds),
//       refId,
//       level: packageId,
//       wallet: refId,
//       fullWallet: "",
//       type: "join" as const,
//       amount: `${amountValue.toLocaleString()} USDT`,
//       amountValue,
//     };
//   }).reverse();
// }

// LevelIncome events carry no packageId (their "level" field is sponsor-chain
// depth, not package tier — see fetchLevelIncomeHistory), so per-package
// totals can't be derived from history rows. GET /users/:address/level-income-total/:packageId
// recovers the exact figure via the same tx_hash-join trick as matrix income.

export async function fetchUserMatrixIncomeHistory(
  walletAddress: string,
  packageId: number,
): Promise<MatrixCycleIncomeRow[]> {
  const rows = await apiGet<MatrixIncomeApiRow[]>(
    `/users/${walletAddress}/history/matrix-income`,
  );
  return (rows ?? [])
    .filter((r) => Number(r.package_id) === packageId)
    .map((r, index) => {
      const dateSeconds = Math.floor(
        new Date(r.block_timestamp).getTime() / 1000,
      );
      const amountValue = Number(ethers.formatUnits(r.amount, 18));
      const refId = r.from_string_id ?? "ID ...";
      return {
        id: index + 1,
        date: formatDate(dateSeconds),
        refId,
        level: Number(r.package_id) || packageId,
        wallet: refId,
        fullWallet: r.from_address, // ← ye fix hua
        type: "join" as const,
        amount: `${amountValue.toLocaleString()} USDT`,
        amountValue,
      };
    })
    .reverse();
}

export async function fetchLevelIncomeTotal(
  walletAddress: string,
  packageId: number,
): Promise<number> {
  try {
    const row = await apiGet<{ total: string }>(
      `/users/${walletAddress}/level-income-total/${packageId}`,
    );
    return Number(ethers.formatUnits(row?.total ?? "0", 18));
  } catch (error) {
    console.error(
      `Error fetching level income total for package ${packageId}:`,
      error,
    );
    return 0;
  }
}

export async function buyMatrixPackage(
  packageId: number,
  priceInUsdt: string,
  onStatusChange: (status: string) => void,
) {
  if (!window.ethereum) throw new Error("Please install a Web3 wallet");

  const readProvider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
  const readContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CORE_ABI,
    readProvider,
  );

  const usdtAddress = await readContract.usdt();
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const CONTRACT_ABI = [
    "function purchaseMatrixPackage(uint8 packageId) external",
  ];
  const USDT_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
  ];

  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const usdtContract = new ethers.Contract(usdtAddress, USDT_ABI, signer);

  const packagePriceRaw = ethers.parseUnits(
    priceInUsdt.replace(" USDT", "").trim(),
    18,
  );
  const userAddress = await signer.getAddress();

  const currentAllowance = await usdtContract.allowance(
    userAddress,
    CONTRACT_ADDRESS,
  );
  if (currentAllowance < packagePriceRaw) {
    onStatusChange("approving");
    // Infinite approval — see registerUser's approve call for why.
    const approveTx = await usdtContract.approve(
      CONTRACT_ADDRESS,
      ethers.MaxUint256,
    );
    await approveTx.wait();
  }

  onStatusChange("purchasing");
  const purchaseTx = await contract.purchaseMatrixPackage(packageId);
  await purchaseTx.wait();
}

// =========================================================================
// VERIFICATION FUNCTIONS
// =========================================================================

export async function verifySponsorId(sponsorId: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const sponsorAddress = await contract.memberByStringId(sponsorId);
    return sponsorAddress !== ethers.ZeroAddress;
  } catch (error: any) {
    console.error("Error verifying sponsor:", error);
    return false;
  }
}
export async function registerUser(
  sponsorStringId: string,
  onStatusChange: (status: string) => void,
) {
  if (!window.ethereum) throw new Error("Please install a Web3 wallet");
  const readProvider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
  const readContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CORE_ABI,
    readProvider,
  );

  let usdtAddress: string;
  try {
    usdtAddress = await readContract.usdt();
  } catch (error) {
    console.error("FATAL: Contract not found on Taaqo network!");
    throw new Error("Contract not found on network.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();

  // 1. Check if wallet is already registered
  const existingId = await readContract.memberId(userAddress);
  if (existingId > 0n) {
    throw new Error("This wallet address is already registered.");
  }

  // 2. Check sponsor validity
  const sponsorAddress = await readContract.memberByStringId(sponsorStringId);
  if (sponsorAddress === ethers.ZeroAddress) {
    throw new Error("Invalid sponsor ID. Please verify your sponsor ID.");
  }

  // 3. Check native gas balance
  const nativeBalance = await provider.getBalance(userAddress);
  if (nativeBalance === 0n) {
    throw new Error(
      "Insufficient gas fee. You need native network token (gas) in your wallet.",
    );
  }

  const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, signer);
  const usdtContract = new ethers.Contract(usdtAddress, USDT_ABI, signer);

  const packagePrice = ethers.parseUnits("75", 18);

  // 4. Check USDT balance
  const usdtBalance = await usdtContract.balanceOf(userAddress);
  if (usdtBalance < packagePrice) {
    const formattedBalance = ethers.formatUnits(usdtBalance, 18);
    throw new Error(
      `Insufficient USDT balance. You have ${formattedBalance} USDT, but 75 USDT is required.`,
    );
  }

  // 5. Check & approve allowance
  const currentAllowance = await usdtContract.allowance(
    userAddress,
    CONTRACT_ADDRESS,
  );

  if (currentAllowance < packagePrice) {
    onStatusChange("approving");
    // Infinite approval — every purchase/upgrade path re-checks allowance
    // against MaxUint256, so this is a one-time prompt, not one per package.
    const approveTx = await usdtContract.approve(
      CONTRACT_ADDRESS,
      ethers.MaxUint256,
    );
    await approveTx.wait();
  }

  // 6. Register member
  onStatusChange("registering");
  const registerTx = await contract.registerMember(sponsorStringId);
  await registerTx.wait();
}

export async function signInUser(walletAddress: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const id = await contract.memberId(walletAddress);

    if (id === 0n) {
      throw new Error("NOT_REGISTERED");
    }

    return true;
  } catch (error: any) {
    if (error.message === "NOT_REGISTERED") {
      throw new Error("Please register first. Wallet not found.");
    }
    console.error("Sign in error:", error);
    throw new Error("Network error. Try again.");
  }
}

export async function isWalletRegistered(
  walletAddress: string,
): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);
    const id = await contract.memberId(walletAddress);
    return id > 0n;
  } catch (error) {
    console.error("Error checking wallet registration:", error);
    return false;
  }
}

// =========================================================================
// COMPATIBILITY WRAPPERS
// =========================================================================

interface ProfileApiResponse {
  stringId: string;
  numericId: string;
  sponsor: string;
  sponsorStringId: string;
  totalDirects: string;
  joinDate: string;
  isActive: boolean;
  userName: string | null;
}

// Replaces the dead getUserProfile-based version — that getter no longer
// exists on the trimmed contract. Sourced from GET /users/:address/profile
// (live proxy for stringId/numericId/sponsor/joinDate, DB for userName).
export async function fetchDashboardData(walletAddress: string) {
  const profile = await apiGet<ProfileApiResponse>(
    `/users/${walletAddress}/profile`,
  );
  if (!profile) return null;

  const joinDateSeconds = Number(profile.joinDate);
  return {
    stringId: profile.stringId,
    numericId: profile.numericId,
    sponsorId: profile.sponsorStringId || "NONE",
    userName: profile.userName ?? "",
    activationDate:
      joinDateSeconds > 0 ? formatDate(joinDateSeconds) : "Pending",
  };
}

// PUT /users/:address/name — off-chain display name, stored directly in
// user_details.userName. See users.ts for why this isn't on-chain.
export async function updateUserName(
  walletAddress: string,
  name: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${walletAddress}/name`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.userName ?? null;
  } catch (error) {
    console.error("Error updating user name:", error);
    return null;
  }
}

export async function fetchCurrentPackage(
  walletAddress: string,
): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);
    const pkgs = await contract.getUserPackages(walletAddress);
    return Number(pkgs.currentLevelPackage) || 1;
  } catch (error) {
    console.error("Error fetching current package:", error);
    return 1;
  }
}

export async function fetchMaxActivePackage(
  walletAddress: string,
): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const [maxLevel, maxSponsor, maxMatrix] = await Promise.all([
      contract.maxLevelPackage(walletAddress).catch(() => 0),
      contract.maxSponsorPackage(walletAddress).catch(() => 0),
      contract.maxMatrixPackage(walletAddress).catch(() => 0),
    ]);

    const maxPkg = Math.max(
      Number(maxLevel || 0),
      Number(maxSponsor || 0),
      Number(maxMatrix || 0),
    );

    return maxPkg || 1;
  } catch (error) {
    console.error("Error fetching max active package:", error);
    return 1;
  }
}

export async function fetchMaxActiveMatrixPackage(
  walletAddress: string,
): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const maxMatrix = await contract
      .maxMatrixPackage(walletAddress)
      .catch(() => 0);

    return Number(maxMatrix || 0) || 1;
  } catch (error) {
    console.error("Error fetching max active matrix package:", error);
    return 1;
  }
}

export async function fetchUserNumericId(
  walletAddress: string,
): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);
    const id = await contract.memberId(walletAddress);
    return id.toString();
  } catch (error) {
    console.error("Error fetching user numeric ID:", error);
    return "...";
  }
}

export async function fetchUserStringId(
  walletAddress: string,
): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);
    const stringId = await contract.memberStringId(walletAddress);
    return stringId || "ID ...";
  } catch (error) {
    console.error("Error fetching user string ID:", error);
    return "ID ...";
  }
}

export async function buyPackage(
  packageId: number,
  priceInUsdt: string,
  onStatusChange: (status: string) => void,
) {
  return buyLevelPackage(packageId, priceInUsdt, onStatusChange);
}

// =========================================================================
// MATRIX MAGIC - ADDITIONAL FUNCTIONS
// =========================================================================

// Replaces the dead getMatrixTreeInfo/getCycleAndHoldStatus/
// getMagicGoldMatrixCycleCount/magicGoldMatrixStructure calls (all removed
// from the trimmed contract) — fully DB-sourced via the matrix-tree,
// magic-gold cycles/nodes, and matrix-income-total endpoints.
export async function fetchPackageMatrixDetails(
  walletAddress: string,
  packageId: number,
) {
  try {
    const [tree, cycles, incomeTotal] = await Promise.all([
      apiGet<{ matrixParent: string | null; directMatrixChildren: string[] }>(
        `/users/${walletAddress}/matrix-tree/${packageId}`,
      ),
      apiGet<{ count: number; roots: string[] }>(
        `/users/${walletAddress}/magic-gold/${packageId}/cycles`,
      ),
      apiGet<{ total: string }>(
        `/users/${walletAddress}/matrix-income-total/${packageId}`,
      ),
    ]);

    const cycleCount = cycles?.count ?? 0;
    const latestCycleIndex = Math.max(cycleCount - 1, 0);
    const latest = cycleCount
      ? await apiGet<{ root: string; nodes: (string | null)[] }>(
          `/users/${walletAddress}/magic-gold/${packageId}/${latestCycleIndex}`,
        )
      : null;

    const nodes = latest?.nodes ?? [];
    const visibleNodes = nodes.slice(0, 30);
    const toSlot = (address: string | null): MatrixSlotType =>
      address ? "direct" : "empty";
    const structureTree: MatrixSlotType[][] = [
      visibleNodes.slice(0, 2).map(toSlot),
      visibleNodes.slice(2, 6).map(toSlot),
      visibleNodes.slice(6, 14).map(toSlot),
      visibleNodes.slice(14, 30).map(toSlot),
    ];

    return {
      partnersCount: tree?.directMatrixChildren.length ?? 0,
      level5Count: visibleNodes.filter((address) => address).length,
      recycleCount: cycleCount,
      tree: structureTree,
      revenue: Number(ethers.formatUnits(incomeTotal?.total ?? "0", 18)),
    };
  } catch (error) {
    console.error(
      `Error fetching matrix details for package ${packageId}:`,
      error,
    );
    return { partnersCount: 0, level5Count: 0, recycleCount: 0, revenue: 0 };
  }
}

// Same shape as fetchPackageMatrixDetails x9, but one backend request instead
// of 9 x 4 — the browser caps concurrent requests per origin (~6), so firing
// 36+ in parallel from the frontend still queued in batches. Server does the
// fan-out against its own DB pool instead, where it's cheap.

export async function fetchMagicGoldMatrixSummary(walletAddress: string) {
  try {
    const data = await apiGet<{
      packages: {
        packageId: number;
        partnersCount: number;
        level5Count: number;
        cycleCount: number;
        nodes: ({
          address: string;
          isDirectPlacement: boolean;
          isInDownline: boolean;
        } | null)[];
        revenue: string;
      }[];
    }>(`/users/${walletAddress}/magic-gold-summary`);

    const toSlot = (
      node: {
        address: string;
        isDirectPlacement: boolean;
        isInDownline: boolean;
      } | null,
    ): MatrixSlotType => {
      if (!node) return "empty";
      if (node.isDirectPlacement) return "direct";
      return node.isInDownline ? "spilloverAbove" : "spilloverBelow";
    };

    const result: Record<
      number,
      {
        partnersCount: number;
        level5Count: number;
        recycleCount: number;
        tree: MatrixSlotType[][];
        revenue: number;
      }
    > = {};

    for (const pkg of data?.packages ?? []) {
      const visibleNodes = pkg.nodes.slice(0, 30);
      result[pkg.packageId] = {
        partnersCount: pkg.partnersCount,
        level5Count: pkg.level5Count,
        recycleCount: pkg.cycleCount,
        tree: [
          visibleNodes.slice(0, 2).map(toSlot),
          visibleNodes.slice(2, 6).map(toSlot),
          visibleNodes.slice(6, 14).map(toSlot),
          visibleNodes.slice(14, 30).map(toSlot),
        ],
        revenue: Number(ethers.formatUnits(pkg.revenue ?? "0", 18)),
      };
    }
    return result;
  } catch (error) {
    console.error("Error fetching magic gold matrix summary:", error);
    return {} as Record<
      number,
      {
        partnersCount: number;
        level5Count: number;
        recycleCount: number;
        tree: MatrixSlotType[][];
        revenue: number;
      }
    >;
  }
}

// export async function fetchMagicGoldMatrixSummary(walletAddress: string) {
//   try {
//     const data = await apiGet<{
//       packages: {
//         packageId: number;
//         partnersCount: number;
//         cycleCount: number;
//         nodes: (string | null)[];
//         revenue: string;
//       }[];
//     }>(`/users/${walletAddress}/magic-gold-summary`);

//     const toSlot = (address: string | null): MatrixSlotType =>
//       address ? "direct" : "empty";
//     const result: Record<
//       number,
//       {
//         partnersCount: number;
//         level5Count: number;
//         recycleCount: number;
//         tree: MatrixSlotType[][];
//         revenue: number;
//       }
//     > = {};

//     for (const pkg of data?.packages ?? []) {
//       const visibleNodes = pkg.nodes.slice(0, 30);
//       result[pkg.packageId] = {
//         partnersCount: pkg.partnersCount,
//         level5Count: visibleNodes.filter((address: string | null) => address)
//           .length,
//         recycleCount: pkg.cycleCount,
//         tree: [
//           visibleNodes.slice(0, 2).map(toSlot),
//           visibleNodes.slice(2, 6).map(toSlot),
//           visibleNodes.slice(6, 14).map(toSlot),
//           visibleNodes.slice(14, 30).map(toSlot),
//         ],
//         revenue: Number(ethers.formatUnits(pkg.revenue ?? "0", 18)),
//       };
//     }
//     return result;
//   } catch (error) {
//     console.error("Error fetching magic gold matrix summary:", error);
//     return {} as Record<
//       number,
//       {
//         partnersCount: number;
//         level5Count: number;
//         recycleCount: number;
//         tree: MatrixSlotType[][];
//         revenue: number;
//       }
//     >;
//   }
// }

/**
 * Get level 5 cycle status
 */
export async function getLevel5CycleStatus(
  walletAddress: string,
  packageId: number,
) {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      [
        "function level5MemberCountByPkg(uint8 packageId, address user) external view returns (uint256)",
      ],
      provider,
    );

    const count = await contract.level5MemberCountByPkg(
      packageId,
      walletAddress,
    );
    return { memberCount: Number(count) };
  } catch (error) {
    console.error("Error fetching level5 cycle status:", error);
    return { memberCount: 0 };
  }
}

// =========================================================================
// PREVIEW MODE FUNCTIONS
// =========================================================================

// DB-sourced (was a live read of the kept-but-flagged userLevelIncome
// accumulator mapping — see [[contract_gas_strip]]). Sums the unified
// transactions table for this receiver+level instead, same source every
// other income page on this table now uses.
export async function fetchUserLevelIncomeForLevel(
  walletAddress: string,
  level: number,
): Promise<string> {
  const rows = await apiGet<TransactionApiRow[]>(
    `/transactions/${walletAddress}?type=LEVEL_INCOME`,
  );
  const total = (rows ?? [])
    .filter((r) => r.level === level)
    .reduce((sum, r) => sum + BigInt(r.amount), 0n);
  return ethers.formatUnits(total, 18);
}

export interface TeamLevelDepthResult {
  uplineStringId: string;
  rows: TeamLevelRow[];
}

// Replaces the dead directReferrals-array-getter-based BFS (same dead mapping
// as fetchDirectPartners/fetchTeamAllLevels — see [[contract_gas_strip]]).
// Reuses the already-fixed fetchTeamAllLevels (same row shape, same
// GET /team/:address/team?maxLevel=N endpoint) and filters to the exact
// depth requested; uplineStringId comes from the already-fixed
// GET /users/:address/profile (sponsorStringId).
export async function fetchTeamLevelByDepth(
  walletAddress: string,
  depth: number,
): Promise<TeamLevelDepthResult> {
  const [profile, allLevels] = await Promise.all([
    apiGet<{ sponsorStringId: string }>(`/users/${walletAddress}/profile`),
    fetchTeamAllLevels(walletAddress, depth),
  ]);

  return {
    uplineStringId: profile?.sponsorStringId || "NONE",
    rows: allLevels.filter((r) => r.level === depth),
  };
}

interface LevelPurchaserApiRow {
  id: number;
  date: string;
  wallet: string;
  stringId: string;
  amount: string;
}

export interface LevelPurchasersResult {
  uplineStringId: string;
  rows: TeamLevelRow[];
  totalRevenue: string; // sum of what these members paid for this specific package, in USDT
}

// "Purchased this package" (historical, event-sourced), not "current package
// level equals X" — someone who's since upgraded past packageId still counts.
// GET /team/:address/level-purchasers/:depth/:packageId does the whole join
// server-side (recursive team-tree CTE + package_purchase_events).
export async function fetchLevelPurchasers(
  walletAddress: string,
  depth: number,
  packageId: number,
): Promise<LevelPurchasersResult> {
  const [profile, purchasers] = await Promise.all([
    apiGet<{ sponsorStringId: string }>(`/users/${walletAddress}/profile`),
    apiGet<LevelPurchaserApiRow[]>(
      `/team/${walletAddress}/level-purchasers/${depth}/${packageId}?track=LEVEL`,
    ),
  ]);

  const rows: TeamLevelRow[] = (purchasers ?? []).map((r) => {
    const dateSeconds = Math.floor(new Date(r.date).getTime() / 1000);
    return {
      id: r.id,
      date: formatDate(dateSeconds),
      wallet: `${r.wallet.slice(0, 6)}...${r.wallet.slice(-4)}`,
      fullWallet: r.wallet,
      refId: r.stringId,
      level: depth,
      packageId,
      totalBussiness: parseFloat(ethers.formatUnits(r.amount, 18)),
    };
  });

  const totalRevenue = (purchasers ?? []).reduce(
    (sum, r) => sum + BigInt(r.amount),
    0n,
  );

  return {
    uplineStringId: profile?.sponsorStringId || "NONE",
    rows,
    totalRevenue: ethers.formatUnits(totalRevenue, 18),
  };
}

type Income24hSummary = {
  matrixIncome24h: number;
  levelIncome24h: number;
  sponsorIncome24h: number;
  totalProfit24h: number;
};

const ONE_DAY_SECONDS = 24 * 60 * 60;

// ---- Matrix income (lightweight, no fromId/stringId resolution) ----
async function getMatrixIncome24h(
  contract: ethers.Contract,
  userAddress: string,
  cutoffTimestamp: number,
): Promise<number> {
  const matrixHist = await fetchUserMatrixIncomeList(contract, userAddress);
  if (!matrixHist || matrixHist.length === 0) return 0;

  let total = 0;

  for (const record of matrixHist) {
    const amountRaw = record.amount ?? record[2] ?? 0n;
    const amountValue = parseFloat(ethers.formatUnits(amountRaw, 18));
    if (amountValue < 0.01) continue;

    const childId = Number(record.childId ?? record[0]);
    const dateRaw = Number(record.date ?? record[3]);

    // Timestamp still needs resolving (matrix dates can be unreliable),
    // but skip resolving fromId/stringId — not needed for a sum.
    const date = await resolveItemTimestamp(
      contract,
      dateRaw,
      childId,
      userAddress,
      amountRaw,
    );

    if (date >= cutoffTimestamp) {
      total += amountValue;
    }
  }

  return total;
}

// ---- Level income (lightweight, no childId -> stringId resolution) ----
async function getLevelIncome24h(
  contract: ethers.Contract,
  walletAddress: string,
  cutoffTimestamp: number,
): Promise<number> {
  let total = 0;
  let i = 0;
  let hasMore = true;

  while (hasMore && i < 100) {
    try {
      const record = await contract.levelIncomeHistory(walletAddress, i);

      const amount = record.amount !== undefined ? record.amount : record[2];
      const date =
        record.date !== undefined ? Number(record.date) : Number(record[3]);

      if (date >= cutoffTimestamp) {
        total += parseFloat(ethers.formatUnits(amount, 18));
      }

      i++;
    } catch {
      hasMore = false;
      break;
    }
  }

  return total;
}

// ---- Sponsor income (lightweight, no memberAddress/stringId resolution) ----
// async function getSponsorIncome24h(
//   contract: ethers.Contract,
//   walletAddress: string,
//   cutoffTimestamp: number,
// ): Promise<number> {
//   let total = 0;
//   let i = 0;
//   let hasMore = true;

//   while (hasMore && i < 100) {
//     try {
//       const record = await contract.referralIncomeHistory(walletAddress, i);

//       const amount = record.amount !== undefined ? record.amount : record[1];
//       const date =
//         record.date !== undefined ? Number(record.date) : Number(record[3]);

//       if (amount === 0n || Number(amount) === 0) {
//         i++;
//         continue;
//       }

//       // Only fall back to activationDate if we actually need it for filtering.
//       // Skipping memberAddress/memberStringId calls entirely — not needed for sum.
//       if (date >= cutoffTimestamp) {
//         total += parseFloat(ethers.formatUnits(amount, 18));
//       }

//       i++;
//     } catch (error: any) {
//       if (
//         error?.message?.includes("out of bounds") ||
//         error?.message?.includes("index")
//       ) {
//         hasMore = false;
//         break;
//       }
//       hasMore = false;
//       break;
//     }
//   }

//   return total;
// }

const SPONSOR_ABI = [
  "function referralIncomeHistory(address user, uint256 index) external view returns (uint256 childId, uint256 amount, uint256 cycle, uint256 date)",
  "function memberStringId(address user) external view returns (string)",
  "function memberAddress(uint256 id) external view returns (address)",
  "function activationDate(address user) external view returns (uint256)",
];

async function getSponsorIncome24h(
  provider: ethers.JsonRpcProvider,
  walletAddress: string,
  cutoffTimestamp: number,
): Promise<number> {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, SPONSOR_ABI, provider);

  let total = 0;
  let i = 0;
  let hasMore = true;

  while (hasMore && i < 100) {
    try {
      const record = await contract.referralIncomeHistory(walletAddress, i);

      const childId =
        record.childId !== undefined
          ? Number(record.childId)
          : Number(record[0]);
      const amount = record.amount !== undefined ? record.amount : record[1];
      let date =
        record.date !== undefined ? Number(record.date) : Number(record[3]);

      if (amount === 0n || Number(amount) === 0) {
        i++;
        continue;
      }

      if (!date || date < 1000000000) {
        try {
          const childAddr = await contract.memberAddress(childId);
          if (childAddr && childAddr !== ethers.ZeroAddress) {
            const actDate = await contract.activationDate(childAddr);
            const actNum = Number(actDate);
            if (actNum > 1000000000) date = actNum;
          }
        } catch {
          /* ignore fallback */
        }
      }

      if (date >= cutoffTimestamp) {
        total += parseFloat(ethers.formatUnits(amount, 18));
      }

      i++;
    } catch (error: any) {
      if (
        error?.message?.includes("out of bounds") ||
        error?.message?.includes("index")
      ) {
        hasMore = false;
        break;
      }
      hasMore = false;
      break;
    }
  }

  return total;
}

// ---- Combined 24h income summary (single entry point, all 3 in parallel) ----
export async function fetchIncome24hSummary(
  walletAddress: string,
): Promise<Income24hSummary> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const cutoffTimestamp = nowInSeconds - ONE_DAY_SECONDS;

    const [matrixIncome24h, levelIncome24h, sponsorIncome24h] =
      await Promise.all([
        getMatrixIncome24h(contract, walletAddress, cutoffTimestamp),
        getLevelIncome24h(contract, walletAddress, cutoffTimestamp),
        getSponsorIncome24h(provider, walletAddress, cutoffTimestamp),
      ]);

    const totalProfit24h = matrixIncome24h + levelIncome24h + sponsorIncome24h;

    return {
      matrixIncome24h,
      levelIncome24h,
      sponsorIncome24h,
      totalProfit24h,
    };
  } catch (error) {
    console.error("Error fetching 24h income summary:", error);
    return {
      matrixIncome24h: 0,
      levelIncome24h: 0,
      sponsorIncome24h: 0,
      totalProfit24h: 0,
    };
  }
}

export interface TeamMembershipResult {
  valid: boolean;
  reason:
    | "EMPTY_INPUT"
    | "MEMBER_NOT_FOUND"
    | "CANNOT_PREVIEW_SELF"
    | "SELF"
    | "IN_TEAM"
    | "NOT_IN_TEAM"
    | "CHAIN_LOOKUP_FAILED"
    | "RESOLVE_FAILED";
  address?: string;
}

// Replaces the live-loop version (was up to 200 sequential contract.sponsor()
// calls). GET /team/:address/is-ancestor-of/:target is the same ancestor-chain
// check as a single DB query (recursive CTE over user_registrations).
// memberByStringId stays a live call — resolving a string ID to an address is
// a kept, cheap single-slot read, no DB equivalent needed for it.
export async function checkTeamMembership(
  myWalletAddress: string,
  targetStringId: string,
): Promise<TeamMembershipResult> {
  const ALLOW_SELF_PREVIEW = false;

  if (!targetStringId || !targetStringId.trim()) {
    return { valid: false, reason: "EMPTY_INPUT" };
  }

  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const targetAddress = await contract.memberByStringId(
      targetStringId.trim(),
    );

    if (!targetAddress || targetAddress === ethers.ZeroAddress) {
      return { valid: false, reason: "MEMBER_NOT_FOUND" };
    }

    if (targetAddress.toLowerCase() === myWalletAddress.toLowerCase()) {
      if (ALLOW_SELF_PREVIEW) {
        return { valid: true, reason: "SELF", address: targetAddress };
      }
      return { valid: false, reason: "CANNOT_PREVIEW_SELF" };
    }

    const result = await apiGet<{ isAncestor: boolean }>(
      `/team/${myWalletAddress}/is-ancestor-of/${targetAddress}`,
    );

    if (result?.isAncestor) {
      return { valid: true, reason: "IN_TEAM", address: targetAddress };
    }
    return { valid: false, reason: "NOT_IN_TEAM" };
  } catch (error) {
    console.error("Error checking team membership:", error);
    return { valid: false, reason: "CHAIN_LOOKUP_FAILED" };
  }
}

export async function getWalletAddressFromUserId(
  userId: string,
): Promise<string | null> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const address = await contract.memberByStringId(userId);

    if (!address || address === ethers.ZeroAddress) {
      return null;
    }

    return address;
  } catch (error) {
    console.error("Error resolving wallet address from userId:", error);
    return null;
  }
}

export async function PreviewModeApiCall<T, Args extends unknown[]>(
  userId: string,
  callback: (walletAddress: string, ...args: Args) => Promise<T>,
  ...args: Args
): Promise<T | null> {
  const walletAddress = await getWalletAddressFromUserId(userId);

  if (!walletAddress) {
    console.error(`No wallet address found for userId: ${userId}`);
    return null;
  }

  return await callback(walletAddress, ...args);
}

// Replaces the dead getUserProfile-based version — that getter no longer
// exists on the trimmed contract (see [[contract_gas_strip]]), so every call
// here reverted and the catch fallback (maxPkg=1 for all 3 tracks) always
// fired. That fallback feeds guardLevelAccess's beforeLoad redirect on
// /dashboard/$program/$level, so clicking any package >1 always silently
// bounced back to package 1 — 100% reproducible, not intermittent. Sourced
// from /users/:address/profile (stringId/numericId for the isRoot check) and
// /users/:address/packages (live max-package proxy per track, unaffected by
// the getUserProfile deletion), same endpoints fetchTrackPackageWithMax uses.
export async function UserMaxPackagesSummery(address: string) {
  try {
    const [profile, packages] = await Promise.all([
      apiGet<{ stringId: string; numericId: string }>(
        `/users/${address}/profile`,
      ),
      apiGet<{
        matrix: { current: string; max: string };
        sponsor: { current: string; max: string };
        level: { current: string; max: string };
      }>(`/users/${address}/packages`),
    ]);
    if (!profile || !packages) throw new Error("empty response");

    const cleanStrId = (profile.stringId || "")
      .replace(/^ID\s*/i, "")
      .trim()
      .toUpperCase();
    const isRoot =
      profile.numericId === "1" || cleanStrId === RootID || cleanStrId === "1";

    return {
      matrixMaxPkg: isRoot ? 9 : Number(packages.matrix.max) || 1,
      sponsorMaxPkg: isRoot ? 9 : Number(packages.sponsor.max) || 1,
      levelMaxPkg: isRoot ? 9 : Number(packages.level.max) || 1,
    };
  } catch (err) {
    console.error("Error fetching user max packages summary:", err);
    return {
      matrixMaxPkg: 1,
      sponsorMaxPkg: 1,
      levelMaxPkg: 1,
    };
  }
}
export interface MatrixIncomeItem {
  id: string;
  fromId: string; // kis se aayi (child ka string ID)
  fromAddress: string; // child ka wallet address
  level?: number; // kis level se aayi
  packageId?: number; // kis package number se aayi
  amount: string;
  rawDate: number;
  time: string;
}

interface MatrixIncomeApiRow extends TransactionApiRow {
  counterparty_address: string | null;
}

// Replaces the dead getUserMatrixIncomeHistory-based version (that mapping no
// longer exists on the trimmed contract — see [[contract_gas_strip]]).
// Sourced from the unified transactions table
// (GET /transactions/:address?type=MATRIX_INCOME), same endpoint
// fetchLevelIncomeHistory/fetchSponsorIncomeHistory use for their tracks.
// packageId now comes through for real — the contract's MatrixIncome event
// was extended to carry it natively (mirrors DirectIncome). Rows indexed from
// the pre-redeploy contract still come back with package_id null.
export async function fetchMatrixIncomeByAddress(
  userAddress: string,
  maxItems?: number,
): Promise<MatrixIncomeItem[]> {
  const rows = await apiGet<MatrixIncomeApiRow[]>(
    `/transactions/${userAddress}?type=MATRIX_INCOME`,
  );
  const items: MatrixIncomeItem[] = (rows ?? []).map((r, index) => {
    const dateSeconds = Math.floor(
      new Date(r.block_timestamp).getTime() / 1000,
    );
    const amountValue = parseFloat(ethers.formatUnits(r.amount, 18));
    return {
      id: `M-${dateSeconds}-${index}`,
      fromId: r.counterparty_string_id ?? "ID ...",
      fromAddress: r.counterparty_address ?? "",
      level: r.level ?? undefined,
      packageId: r.package_id ?? undefined,
      amount: `${amountValue.toLocaleString()} USDT`,
      rawDate: dateSeconds,
      time: formatDate(dateSeconds),
    };
  });

  return items
    .sort((a, b) => b.rawDate - a.rawDate)
    .slice(0, maxItems ?? undefined);
}
// =========================================================================
// PREVIEW MODE FUNCTIONS
// =========================================================================

export interface TeamCountByLevel {
  level: number;
  count: number;
}

// Replaces the dead getTeamByLevel-based version (was 7 separate calls, one
// per level, all now-deleted getters). GET /team/:address/levels returns
// every indexed level in one query, sourced from total_members_by_level.
export async function fetchTeamCountUpToLevel7(
  walletAddress: string,
): Promise<TeamCountByLevel[]> {
  const rows = await apiGet<{ level: number; count: string }[]>(
    `/team/${walletAddress}/levels`,
  );
  const byLevel = new Map((rows ?? []).map((r) => [r.level, Number(r.count)]));
  return [1, 2, 3, 4, 5, 6, 7].map((level) => ({
    level,
    count: byLevel.get(level) ?? 0,
  }));
}

export interface GlobalActivityItem {
  id: string;
  stringId: string;
  label: string;
  time: string;
  rawDate: number;
  type: "income" | "join";
}
export async function fetchGlobalRecentActivity(
  maxItems = 200,
  scanCount = 200,
): Promise<GlobalActivityItem[]> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    const total = Number(await contract.memberCounter());
    if (!total || total <= 0) return [];

    const startId = Math.max(1, total - scanCount + 1);
    const ids: number[] = [];
    for (let id = total; id >= startId; id--) ids.push(id);

    const rows: Array<GlobalActivityItem | null> = await Promise.all(
      ids.map(async (id) => {
        try {
          const addr = await contract.memberAddress(id);
          if (!addr || addr === ethers.ZeroAddress) return null;

          const [stringId, history] = await Promise.all([
            contract.memberStringId(addr).catch(() => `ID ${id}`),
            contract.getUserPackageHistory(addr).catch(() => []),
          ]);
          if (!history || history.length === 0) return null;

          const last = history[history.length - 1];
          const packageId = Number(
            last.packageId !== undefined ? last.packageId : last[0],
          );
          const amountRaw = last.amount !== undefined ? last.amount : last[1];
          const track = last.track !== undefined ? String(last.track) : "";
          const date = Number(last.date !== undefined ? last.date : last[3]);
          const amountValue = parseFloat(ethers.formatUnits(amountRaw, 18));
          const formattedAmount = `${amountValue.toLocaleString()} USDT`;
          const trackLabel = track
            ? `${track.charAt(0)}${track.slice(1).toLowerCase()}`
            : "Package";
          const idStr = stringId || `ID ${id}`;

          return {
            id: `${id}-${date}`,
            stringId: idStr,
            label: `${idStr} joined ${trackLabel} ${packageId} +${formattedAmount}`,
            time: formatDate(date),
            rawDate: date,
            type: "join" as const,
          };
        } catch {
          return null;
        }
      }),
    );

    return rows
      .filter((r): r is GlobalActivityItem => r !== null)
      .sort((a, b) => b.rawDate - a.rawDate)
      .slice(0, maxItems);
  } catch (error) {
    console.error("Error fetching global recent activity:", error);
    return [];
  }
}
export interface GlobalIncomeItem {
  id: string;
  receiverId: string;
  fromId: string;
  amount: string;
  rawDate: number;
  time: string;
  incomeType:
    "LEVEL" | "SPONSOR" | "MATRIX" | "PACKAGE_PURCHASE" | "AUTO_UPGRADE";
  level?: number;
  packageId?: number;
  track?: string;
}

async function resolveChildStringId(
  contract: ethers.Contract,
  childId: number,
): Promise<string> {
  try {
    const childAddr = await contract.memberAddress(childId);
    if (!childAddr || childAddr === ethers.ZeroAddress) return `ID ${childId}`;
    const sid = await contract.memberStringId(childAddr);
    return sid || `ID ${childId}`;
  } catch {
    return `ID ${childId}`;
  }
}

async function resolveItemTimestamp(
  contract: ethers.Contract,
  rawDateVal: number,
  childId?: number,
  userAddr?: string,
  incomeAmountRaw?: any,
): Promise<number> {
  let date = Number(rawDateVal || 0);
  if (date > 1000000000) return date;

  if (childId && childId > 0) {
    try {
      const childAddr = await contract.memberAddress(childId);
      if (childAddr && childAddr !== ethers.ZeroAddress) {
        const childPkgHist = await contract
          .getUserPackageHistory(childAddr)
          .catch(() => []);
        if (childPkgHist && childPkgHist.length > 0) {
          if (incomeAmountRaw && BigInt(incomeAmountRaw) > 0n) {
            const targetAmt = BigInt(incomeAmountRaw);
            for (let i = childPkgHist.length - 1; i >= 0; i--) {
              const pkg = childPkgHist[i];
              const pkgAmt =
                pkg.amount !== undefined
                  ? BigInt(pkg.amount)
                  : pkg[1]
                    ? BigInt(pkg[1])
                    : 0n;
              const pkgDate = Number(pkg.date ?? pkg[3] ?? 0);
              if (pkgDate > 1000000000 && pkgAmt > 0n) {
                const ratio = (targetAmt * 100n) / pkgAmt;
                if (pkgAmt === targetAmt || (ratio >= 85n && ratio <= 105n)) {
                  return pkgDate;
                }
              }
            }
          }

          const lastPkg = childPkgHist[childPkgHist.length - 1];
          const lastPkgDate = Number(lastPkg.date ?? lastPkg[3] ?? 0);
          if (lastPkgDate > 1000000000) return lastPkgDate;
        }

        const actDate = Number(
          await contract.activationDate(childAddr).catch(() => 0),
        );
        if (actDate > 1000000000) return actDate;
      }
    } catch {
      /* ignore fallback */
    }
  }

  if (userAddr && userAddr !== ethers.ZeroAddress) {
    try {
      const actDate = Number(
        await contract.activationDate(userAddr).catch(() => 0),
      );
      if (actDate > 1000000000) return actDate;
    } catch {
      /* ignore fallback */
    }
  }

  return Math.floor(Date.now() / 1000);
}

async function fetchUserMatrixIncomeList(
  contract: ethers.Contract,
  addr: string,
): Promise<any[]> {
  const records: any[] = [];

  try {
    const list = await contract.getUserMatrixIncomeHistory(addr);
    if (list && list.length > 0) {
      for (const item of list) {
        const amt = item.amount !== undefined ? item.amount : (item[2] ?? 0n);
        if (amt && BigInt(amt) > 0n) {
          records.push(item);
        }
      }
    }
  } catch {
    /* ignore */
  }

  let i = 0;
  let consecutiveErrors = 0;
  while (i < 50 && consecutiveErrors < 3) {
    try {
      const record = await contract.matrixIncomeHistory(addr, i);
      consecutiveErrors = 0;
      const amount = record.amount !== undefined ? record.amount : record[2];
      if (amount && BigInt(amount) > 0n) {
        const childId =
          record.childId !== undefined ? record.childId : record[0];
        const cycle = record.cycle !== undefined ? record.cycle : record[1];
        const exists = records.some((r) => {
          const rChild = r.childId !== undefined ? r.childId : r[0];
          const rCyc = r.cycle !== undefined ? r.cycle : r[1];
          const rAmt = r.amount !== undefined ? r.amount : r[2];
          return (
            String(rChild) === String(childId) &&
            String(rCyc) === String(cycle) &&
            String(rAmt) === String(amount)
          );
        });
        if (!exists) {
          records.push(record);
        }
      }
    } catch {
      consecutiveErrors++;
    }
    i++;
  }

  return records;
}

export async function fetchGlobalIncomeActivity(
  maxItems?: number,
): Promise<GlobalIncomeItem[]> {
  const rows = await apiGet<
    {
      id: string;
      receiverId: string;
      fromId: string;
      amount: string;
      rawDate: number;
      incomeType:
        "LEVEL" | "SPONSOR" | "MATRIX" | "PACKAGE_PURCHASE" | "AUTO_UPGRADE";
      level?: number;
      packageId?: number;
      track?: string;
    }[]
  >(`/transactions?limit=${maxItems ?? 50}`);

  return (rows ?? []).map((r) => ({
    ...r,
    amount: `${parseFloat(ethers.formatUnits(r.amount, 18)).toLocaleString()} USDT`,
    time: formatDate(r.rawDate),
  }));
}

export interface Platform24hStats {
  membersChange: string;
  transactionsChange: string;
  turnoverChange: string;
}

export async function fetchPlatform24hStats(): Promise<Platform24hStats> {
  const stats = await apiGet<{
    todayMembers: string;
    todayUsdtInvested: string;
  }>("/system/stats/today");
  if (!stats)
    return { membersChange: "0", transactionsChange: "0", turnoverChange: "0" };
  return {
    membersChange: stats.todayMembers,
    transactionsChange: "0",
    turnoverChange: ethers.formatUnits(stats.todayUsdtInvested, 18),
  };
}

// =========================================================================
// TEAM BY LEVEL - BFS via directReferrals
// =========================================================================

export interface TeamLevelRow {
  id: number;
  date: string;
  wallet: string;
  fullWallet: string;
  refId: string;
  level: number;
  packageId: number;
  totalBussiness: number;
}

interface TeamApiRow {
  id: number;
  date: string;
  wallet: string;
  stringId: string;
  level: number;
  packageId: number;
  totalBussiness: string;
}

// Replaces the dead directReferrals-array-getter-based BFS (that mapping no
// longer exists on the trimmed contract). GET /team/:address/team does the
// whole recursive walk server-side in one call.
export async function fetchTeamAllLevels(
  walletAddress: string,
  maxLevel = 10,
): Promise<TeamLevelRow[]> {
  const rows = await apiGet<TeamApiRow[]>(
    `/team/${walletAddress}/team?maxLevel=${maxLevel}`,
  );
  return (rows ?? []).map((r) => {
    const dateSeconds = Math.floor(new Date(r.date).getTime() / 1000);
    return {
      id: r.id,
      date: dateSeconds > 1000000000 ? formatDate(dateSeconds) : "Pending",
      wallet: `${r.wallet.slice(0, 6)}...${r.wallet.slice(-4)}`,
      fullWallet: r.wallet,
      refId: r.stringId,
      level: r.level,
      packageId: r.packageId,
      totalBussiness: Number(ethers.formatUnits(r.totalBussiness, 18)),
    };
  });
}

export async function fetchTeamCountLast24h(
  walletAddress: string,
  maxLevel = 10,
  maxPerNode = 500,
): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);

    async function getChildren(addr: string): Promise<string[]> {
      const kids: string[] = [];
      for (let i = 0; i < maxPerNode; i++) {
        let child: string;
        try {
          child = await contract.directReferrals(addr, i);
        } catch {
          break;
        }
        if (!child || child === ethers.ZeroAddress) break;
        kids.push(child);
      }
      return kids;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const cutoffTimestamp = nowInSeconds - 24 * 60 * 60;

    let frontier: string[] = [walletAddress];
    let count = 0;

    for (let depth = 1; depth <= maxLevel; depth++) {
      const nextLayer = await Promise.all(frontier.map(getChildren));
      frontier = nextLayer.flat();
      if (frontier.length === 0) break;

      const activationResults = await Promise.all(
        frontier.map((addr) => contract.activationDate(addr).catch(() => 0)),
      );

      for (const activationTs of activationResults) {
        const dateNum = Number(activationTs);
        if (dateNum >= cutoffTimestamp) {
          count++;
        }
      }
    }

    return count;
  } catch (error) {
    console.error("Error fetching last 24h team count:", error);
    return 0;
  }
}

export interface GlobalLeaderRow {
  place: number;
  name: string;
  userId: string;
  fullWallet: string;
  partners: number;
  profit: number;
}

interface LeaderboardApiRow {
  place: number;
  userId: string;
  userName: string | null;
  fullWallet: string;
  partners: number;
  totalIncome: string;
}

// Replaces the memberCounter-scan-plus-2-dead-getters-per-member version.
// The contract never had on-chain leaderboard storage (checked: no
// "leaderboard"/"rank" anywhere in contract.sol). GET /system/leaderboard is
// one DB query — income.totalIncome DESC, same sort key the original used.
// `name` is the real display name (user_details.userName) when set, empty
// otherwise — the page falls back to `userId` when `name` is empty.
export async function fetchGlobalLeaderboard(
  limit = 100,
): Promise<GlobalLeaderRow[]> {
  const rows = await apiGet<LeaderboardApiRow[]>(
    `/system/leaderboard?limit=${limit}`,
  );
  return (rows ?? []).map((r) => ({
    place: r.place,
    name: r.userName ?? "",
    userId: r.userId,
    fullWallet: r.fullWallet,
    partners: r.partners,
    profit: parseFloat(ethers.formatUnits(r.totalIncome, 18)),
  }));
}
// =========================================================================
// DISPLAY NAME FUNCTIONS
// =========================================================================

/**
 * Fetch a user's display name from the contract
 */
export async function fetchDisplayName(walletAddress: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(TAAQO_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, provider);
    const name = await contract.displayName(walletAddress);
    return name || "";
  } catch (error) {
    console.error("Error fetching display name:", error);
    return "";
  }
}

/**
 * Set/update the caller's display name (requires wallet signature, gas fee)
 */
export async function setDisplayNameOnChain(
  newName: string,
  onStatusChange: (status: string) => void,
) {
  if (!window.ethereum) throw new Error("Please install a Web3 wallet");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const contract = new ethers.Contract(CONTRACT_ADDRESS, CORE_ABI, signer);

  onStatusChange("updating");
  const tx = await contract.setDisplayName(newName);
  await tx.wait();
}

// dev-mukesh ------------------

export async function fetchProgramMaxLevels(walletAddress: string) {
  const data = await apiGet<{
    matrix: { current: string; max: string };
    sponsor: { current: string; max: string };
    level: { current: string; max: string };
  }>(`/users/${walletAddress}/packages`);

  return {
    matrixMax: Number(data?.matrix.max) || 0,
    sponsorMax: Number(data?.sponsor.max) || 0,
    levelMax: Number(data?.level.max) || 0,
  };
}
