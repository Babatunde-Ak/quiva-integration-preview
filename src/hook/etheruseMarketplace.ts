'use client';

import { useState } from "react";
import { ethers } from "ethers";
import { useWalletClient } from "wagmi";

// ─── Contract Addresses ────────────────────────────────────────────────────────
// Converts Hedera shard.realm.num → EVM 0x address
const toEvmAddress = (hederaId: string): string => {
  const num = parseInt(hederaId.split(".")[2], 10);
  return "0x" + num.toString(16).padStart(40, "0");
};

const CONTRACTS = {
  COMIC_CORE:        toEvmAddress("0.0.7806656"),
  COMIC_SALES:       toEvmAddress("0.0.7829668"),
  COMIC_MARKETPLACE: toEvmAddress("0.0.7829656"),
};

// ─── Hedera Network Config ─────────────────────────────────────────────────────
const MIRROR_BASE   = "https://testnet.mirrornode.hedera.com";
const HASHIO_RPC    = "https://testnet.hashio.io/api";

// ─── ABIs (derived directly from the .sol files) ──────────────────────────────

const COMIC_CORE_ABI = [
    {
        "type": "constructor",
        "stateMutability": "undefined",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "_feeCollector"
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "CallResponseEvent",
        "inputs": [
            {
                "type": "bool",
                "name": "",
                "indexed": false
            },
            {
                "type": "bytes",
                "name": "",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "CollectionCreated",
        "inputs": [
            {
                "type": "string",
                "name": "episodeId",
                "indexed": true
            },
            {
                "type": "address",
                "name": "tokenAddress",
                "indexed": true
            },
            {
                "type": "address",
                "name": "creator",
                "indexed": true
            },
            {
                "type": "string",
                "name": "name",
                "indexed": false
            },
            {
                "type": "int64",
                "name": "maxSupply",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "ReadingAccessGranted",
        "inputs": [
            {
                "type": "string",
                "name": "episodeId",
                "indexed": true
            },
            {
                "type": "address",
                "name": "tokenAddress",
                "indexed": true
            },
            {
                "type": "address",
                "name": "user",
                "indexed": true
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "ReadingAccessRevoked",
        "inputs": [
            {
                "type": "string",
                "name": "episodeId",
                "indexed": true
            },
            {
                "type": "address",
                "name": "tokenAddress",
                "indexed": true
            },
            {
                "type": "address",
                "name": "user",
                "indexed": true
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "SupplyUpdated",
        "inputs": [
            {
                "type": "string",
                "name": "episodeId",
                "indexed": true
            },
            {
                "type": "int64",
                "name": "newSupply",
                "indexed": false
            }
        ]
    },
    {
        "type": "function",
        "name": "ROYALTY_DENOMINATOR",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "canReadByToken",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "tokenAddress"
            },
            {
                "type": "address",
                "name": "user"
            }
        ],
        "outputs": [
            {
                "type": "bool",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "canReadComic",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "string",
                "name": "episodeId"
            },
            {
                "type": "address",
                "name": "user"
            }
        ],
        "outputs": [
            {
                "type": "bool",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "createComicCollection",
        "constant": false,
        "stateMutability": "payable",
        "payable": true,
        "inputs": [
            {
                "type": "string",
                "name": "episodeId"
            },
            {
                "type": "string",
                "name": "name"
            },
            {
                "type": "string",
                "name": "symbol"
            },
            {
                "type": "string",
                "name": "memo"
            },
            {
                "type": "int64",
                "name": "maxSupply"
            },
            {
                "type": "int64",
                "name": "autoRenewPeriod"
            }
        ],
        "outputs": [
            {
                "type": "address",
                "name": "tokenAddress"
            }
        ]
    },
    {
        "type": "function",
        "name": "creatorEpisodes",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": ""
            },
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "outputs": [
            {
                "type": "string",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "creatorRoyaltyNumerator",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "episodes",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "string",
                "name": ""
            }
        ],
        "outputs": [
            {
                "type": "address",
                "name": "tokenAddress"
            },
            {
                "type": "address",
                "name": "creator"
            },
            {
                "type": "string",
                "name": "episodeId"
            },
            {
                "type": "string",
                "name": "name"
            },
            {
                "type": "int64",
                "name": "maxSupply"
            },
            {
                "type": "int64",
                "name": "currentSupply"
            },
            {
                "type": "bool",
                "name": "exists"
            }
        ]
    },
    {
        "type": "function",
        "name": "getCreator",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "string",
                "name": "episodeId"
            }
        ],
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getCreatorEpisodes",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "creator"
            }
        ],
        "outputs": [
            {
                "type": "string[]",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "getEpisode",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "string",
                "name": "episodeId"
            }
        ],
        "outputs": [
            {
                "type": "address",
                "name": "tokenAddress"
            },
            {
                "type": "address",
                "name": "creator"
            },
            {
                "type": "string",
                "name": "name"
            },
            {
                "type": "int64",
                "name": "maxSupply"
            },
            {
                "type": "int64",
                "name": "currentSupply"
            },
            {
                "type": "bool",
                "name": "exists"
            }
        ]
    },
    {
        "type": "function",
        "name": "getTokenAddress",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "string",
                "name": "episodeId"
            }
        ],
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "grantReadingAccess",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "tokenAddress"
            },
            {
                "type": "address",
                "name": "user"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "hasReadingAccess",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": ""
            },
            {
                "type": "address",
                "name": ""
            }
        ],
        "outputs": [
            {
                "type": "bool",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "isCreator",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "string",
                "name": "episodeId"
            },
            {
                "type": "address",
                "name": "creator"
            }
        ],
        "outputs": [
            {
                "type": "bool",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "marketplaceContract",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "mintNFTs",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "tokenAddress"
            },
            {
                "type": "bytes[]",
                "name": "metadata"
            }
        ],
        "outputs": [
            {
                "type": "int64[]",
                "name": "serials"
            }
        ]
    },
    {
        "type": "function",
        "name": "owner",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "platformRoyaltyNumerator",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "redirectForToken",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "token"
            },
            {
                "type": "bytes",
                "name": "encodedFunctionSelector"
            }
        ],
        "outputs": [
            {
                "type": "int256",
                "name": "responseCode"
            },
            {
                "type": "bytes",
                "name": "response"
            }
        ]
    },
    {
        "type": "function",
        "name": "revokeReadingAccess",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "tokenAddress"
            },
            {
                "type": "address",
                "name": "user"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "salesContract",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "setMarketplaceContract",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "_marketplace"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "setSalesContract",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "_sales"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "tokenToEpisode",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": ""
            }
        ],
        "outputs": [
            {
                "type": "string",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "transferFrom",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "token"
            },
            {
                "type": "address",
                "name": "from"
            },
            {
                "type": "address",
                "name": "to"
            },
            {
                "type": "uint256",
                "name": "amount"
            }
        ],
        "outputs": [
            {
                "type": "int64",
                "name": "responseCode"
            }
        ]
    },
    {
        "type": "function",
        "name": "transferFromNFT",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "token"
            },
            {
                "type": "address",
                "name": "from"
            },
            {
                "type": "address",
                "name": "to"
            },
            {
                "type": "uint256",
                "name": "serialNumber"
            }
        ],
        "outputs": [
            {
                "type": "int64",
                "name": "responseCode"
            }
        ]
    },
    {
        "type": "function",
        "name": "transferNFTsToRecipient",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "tokenAddress"
            },
            {
                "type": "address",
                "name": "recipient"
            },
            {
                "type": "int64[]",
                "name": "serials"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "newOwner"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "updateRoyalties",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "newCreatorRoyalty"
            },
            {
                "type": "uint256",
                "name": "newPlatformRoyalty"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "withdrawFees",
        "constant": false,
        "payable": false,
        "inputs": [],
        "outputs": []
    },
    {
        "type": "receive",
        "stateMutability": "payable"
    }
]
 

const COMIC_SALES_ABI = [
    {
        "type": "constructor",
        "stateMutability": "undefined",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "_comicCore"
            },
            {
                "type": "address",
                "name": "_feeCollector"
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "CallResponseEvent",
        "inputs": [
            {
                "type": "bool",
                "name": "",
                "indexed": false
            },
            {
                "type": "bytes",
                "name": "",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "CampaignCreated",
        "inputs": [
            {
                "type": "uint256",
                "name": "campaignId",
                "indexed": true
            },
            {
                "type": "string",
                "name": "episodeId",
                "indexed": true
            },
            {
                "type": "uint8",
                "name": "campaignType",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "mintPrice",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "maxSupply",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "DirectListingCreated",
        "inputs": [
            {
                "type": "uint256",
                "name": "listingId",
                "indexed": true
            },
            {
                "type": "string",
                "name": "episodeId",
                "indexed": true
            },
            {
                "type": "address",
                "name": "creator",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "quantity",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "pricePerNFT",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "DirectSale",
        "inputs": [
            {
                "type": "uint256",
                "name": "listingId",
                "indexed": true
            },
            {
                "type": "address",
                "name": "buyer",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "quantity",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "totalPrice",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "NFTMinted",
        "inputs": [
            {
                "type": "uint256",
                "name": "campaignId",
                "indexed": true
            },
            {
                "type": "address",
                "name": "minter",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "quantity",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "totalPrice",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "PhaseAdded",
        "inputs": [
            {
                "type": "uint256",
                "name": "campaignId",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "phaseId",
                "indexed": true
            },
            {
                "type": "uint8",
                "name": "phaseType",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "startTime",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "endTime",
                "indexed": false
            }
        ]
    },
    {
        "type": "function",
        "name": "FEE_DENOMINATOR",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "addPhase",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "campaignId"
            },
            {
                "type": "uint8",
                "name": "phaseType"
            },
            {
                "type": "uint256",
                "name": "startTime"
            },
            {
                "type": "uint256",
                "name": "endTime"
            },
            {
                "type": "uint256",
                "name": "mintPrice"
            },
            {
                "type": "uint256",
                "name": "maxPerWallet"
            },
            {
                "type": "uint256",
                "name": "phaseSupply"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": "phaseId"
            }
        ]
    },
    {
        "type": "function",
        "name": "addToWhitelist",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "campaignId"
            },
            {
                "type": "address[]",
                "name": "addresses"
            },
            {
                "type": "uint256[]",
                "name": "allocations"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "addToWhitelistForPhase",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "campaignId"
            },
            {
                "type": "uint256",
                "name": "phaseId"
            },
            {
                "type": "address[]",
                "name": "addresses"
            },
            {
                "type": "uint256[]",
                "name": "allocations"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "campaignCounter",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "campaigns",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "outputs": [
            {
                "type": "string",
                "name": "episodeId"
            },
            {
                "type": "address",
                "name": "tokenAddress"
            },
            {
                "type": "address",
                "name": "creator"
            },
            {
                "type": "uint8",
                "name": "campaignType"
            },
            {
                "type": "uint256",
                "name": "mintPrice"
            },
            {
                "type": "uint256",
                "name": "maxSupply"
            },
            {
                "type": "uint256",
                "name": "maxPerWallet"
            },
            {
                "type": "uint256",
                "name": "totalMinted"
            },
            {
                "type": "bool",
                "name": "isActive"
            },
            {
                "type": "bytes",
                "name": "metadata"
            },
            {
                "type": "uint256",
                "name": "phaseCount"
            }
        ]
    },
    {
        "type": "function",
        "name": "comicCore",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "createCampaign",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "string",
                "name": "episodeId"
            },
            {
                "type": "uint8",
                "name": "campaignType"
            },
            {
                "type": "uint256",
                "name": "mintPrice"
            },
            {
                "type": "uint256",
                "name": "maxSupply"
            },
            {
                "type": "uint256",
                "name": "maxPerWallet"
            },
            {
                "type": "bytes",
                "name": "metadata"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": "campaignId"
            }
        ]
    },
    {
        "type": "function",
        "name": "createDirectListing",
        "constant": false,
        "stateMutability": "payable",
        "payable": true,
        "inputs": [
            {
                "type": "string",
                "name": "episodeId"
            },
            {
                "type": "uint256",
                "name": "quantity"
            },
            {
                "type": "uint256",
                "name": "pricePerNFT"
            },
            {
                "type": "bytes",
                "name": "metadata"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": "listingId"
            }
        ]
    },
    {
        "type": "function",
        "name": "directListingCounter",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "directListings",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "outputs": [
            {
                "type": "string",
                "name": "episodeId"
            },
            {
                "type": "address",
                "name": "tokenAddress"
            },
            {
                "type": "address",
                "name": "creator"
            },
            {
                "type": "uint256",
                "name": "pricePerNFT"
            },
            {
                "type": "uint256",
                "name": "totalListed"
            },
            {
                "type": "uint256",
                "name": "totalSold"
            },
            {
                "type": "bool",
                "name": "isActive"
            }
        ]
    },
    {
        "type": "function",
        "name": "getCampaign",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "campaignId"
            }
        ],
        "outputs": [
            {
                "type": "string",
                "name": "episodeId"
            },
            {
                "type": "address",
                "name": "creator"
            },
            {
                "type": "uint8",
                "name": "campaignType"
            },
            {
                "type": "uint256",
                "name": "mintPrice"
            },
            {
                "type": "uint256",
                "name": "maxSupply"
            },
            {
                "type": "uint256",
                "name": "totalMinted"
            },
            {
                "type": "bool",
                "name": "isActive"
            }
        ]
    },
    {
        "type": "function",
        "name": "getCurrentPhase",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "campaignId"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": "phaseId"
            },
            {
                "type": "bool",
                "name": "exists"
            }
        ]
    },
    {
        "type": "function",
        "name": "getDirectListing",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "listingId"
            }
        ],
        "outputs": [
            {
                "type": "string",
                "name": "episodeId"
            },
            {
                "type": "address",
                "name": "creator"
            },
            {
                "type": "uint256",
                "name": "pricePerNFT"
            },
            {
                "type": "uint256",
                "name": "available"
            },
            {
                "type": "bool",
                "name": "isActive"
            }
        ]
    },
    {
        "type": "function",
        "name": "mint",
        "constant": false,
        "stateMutability": "payable",
        "payable": true,
        "inputs": [
            {
                "type": "uint256",
                "name": "campaignId"
            },
            {
                "type": "uint256",
                "name": "phaseId"
            },
            {
                "type": "uint256",
                "name": "quantity"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "mintedPerWallet",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": ""
            },
            {
                "type": "uint256",
                "name": ""
            },
            {
                "type": "address",
                "name": ""
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "owner",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "phases",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": ""
            },
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "outputs": [
            {
                "type": "uint8",
                "name": "phaseType"
            },
            {
                "type": "uint256",
                "name": "startTime"
            },
            {
                "type": "uint256",
                "name": "endTime"
            },
            {
                "type": "uint256",
                "name": "mintPrice"
            },
            {
                "type": "uint256",
                "name": "maxPerWallet"
            },
            {
                "type": "uint256",
                "name": "phaseSupply"
            },
            {
                "type": "uint256",
                "name": "phaseMinted"
            },
            {
                "type": "bool",
                "name": "isActive"
            }
        ]
    },
    {
        "type": "function",
        "name": "platformFeePercent",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "purchaseFromListing",
        "constant": false,
        "stateMutability": "payable",
        "payable": true,
        "inputs": [
            {
                "type": "uint256",
                "name": "listingId"
            },
            {
                "type": "uint256",
                "name": "quantity"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "redirectForToken",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "token"
            },
            {
                "type": "bytes",
                "name": "encodedFunctionSelector"
            }
        ],
        "outputs": [
            {
                "type": "int256",
                "name": "responseCode"
            },
            {
                "type": "bytes",
                "name": "response"
            }
        ]
    },
    {
        "type": "function",
        "name": "setComicCore",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "_comicCore"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "transferFrom",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "token"
            },
            {
                "type": "address",
                "name": "from"
            },
            {
                "type": "address",
                "name": "to"
            },
            {
                "type": "uint256",
                "name": "amount"
            }
        ],
        "outputs": [
            {
                "type": "int64",
                "name": "responseCode"
            }
        ]
    },
    {
        "type": "function",
        "name": "transferFromNFT",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "token"
            },
            {
                "type": "address",
                "name": "from"
            },
            {
                "type": "address",
                "name": "to"
            },
            {
                "type": "uint256",
                "name": "serialNumber"
            }
        ],
        "outputs": [
            {
                "type": "int64",
                "name": "responseCode"
            }
        ]
    },
    {
        "type": "function",
        "name": "updatePlatformFee",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "newFee"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "whitelist",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": ""
            },
            {
                "type": "uint256",
                "name": ""
            },
            {
                "type": "address",
                "name": ""
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "withdrawFees",
        "constant": false,
        "payable": false,
        "inputs": [],
        "outputs": []
    },
    {
        "type": "receive",
        "stateMutability": "payable"
    }
]

const COMIC_MARKETPLACE_ABI = [
    {
        "type": "constructor",
        "stateMutability": "undefined",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "_comicCore"
            },
            {
                "type": "address",
                "name": "_feeCollector"
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "BatchNFTsListed",
        "inputs": [
            {
                "type": "address",
                "name": "seller",
                "indexed": true
            },
            {
                "type": "address",
                "name": "tokenAddress",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "count",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "BatchNFTsPurchased",
        "inputs": [
            {
                "type": "address",
                "name": "buyer",
                "indexed": true
            },
            {
                "type": "uint256[]",
                "name": "listingIds"
            },
            {
                "type": "uint256",
                "name": "totalPrice",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "CallResponseEvent",
        "inputs": [
            {
                "type": "bool",
                "name": "",
                "indexed": false
            },
            {
                "type": "bytes",
                "name": "",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "ListingCancelled",
        "inputs": [
            {
                "type": "uint256",
                "name": "listingId",
                "indexed": true
            },
            {
                "type": "address",
                "name": "seller",
                "indexed": true
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "NFTListed",
        "inputs": [
            {
                "type": "uint256",
                "name": "listingId",
                "indexed": true
            },
            {
                "type": "address",
                "name": "tokenAddress",
                "indexed": true
            },
            {
                "type": "int64",
                "name": "serialNumber",
                "indexed": false
            },
            {
                "type": "address",
                "name": "seller",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "price",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "NFTSold",
        "inputs": [
            {
                "type": "uint256",
                "name": "listingId",
                "indexed": true
            },
            {
                "type": "address",
                "name": "buyer",
                "indexed": true
            },
            {
                "type": "address",
                "name": "seller",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "price",
                "indexed": false
            }
        ]
    },
    {
        "type": "function",
        "name": "FEE_DENOMINATOR",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "batchCancelListings",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256[]",
                "name": "listingIds"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "batchDepositAndListForResale",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "tokenAddress"
            },
            {
                "type": "int64[]",
                "name": "serialNumbers"
            },
            {
                "type": "uint256[]",
                "name": "prices"
            }
        ],
        "outputs": [
            {
                "type": "uint256[]",
                "name": "listingIds"
            }
        ]
    },
    {
        "type": "function",
        "name": "batchPurchaseNFTs",
        "constant": false,
        "stateMutability": "payable",
        "payable": true,
        "inputs": [
            {
                "type": "uint256[]",
                "name": "listingIds"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "cancelListing",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "listingId"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "comicCore",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "depositAndListForResale",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "tokenAddress"
            },
            {
                "type": "int64",
                "name": "serialNumber"
            },
            {
                "type": "uint256",
                "name": "price"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": "listingId"
            }
        ]
    },
    {
        "type": "function",
        "name": "getBatchListings",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256[]",
                "name": "listingIds"
            }
        ],
        "outputs": [
            {
                "type": "address[]",
                "name": "tokenAddresses"
            },
            {
                "type": "int64[]",
                "name": "serialNumbers"
            },
            {
                "type": "address[]",
                "name": "sellers"
            },
            {
                "type": "uint256[]",
                "name": "prices"
            },
            {
                "type": "bool[]",
                "name": "isActives"
            }
        ]
    },
    {
        "type": "function",
        "name": "getListing",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "listingId"
            }
        ],
        "outputs": [
            {
                "type": "address",
                "name": "tokenAddress"
            },
            {
                "type": "int64",
                "name": "serialNumber"
            },
            {
                "type": "address",
                "name": "seller"
            },
            {
                "type": "uint256",
                "name": "price"
            },
            {
                "type": "bool",
                "name": "isActive"
            }
        ]
    },
    {
        "type": "function",
        "name": "listingCounter",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "listings",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "outputs": [
            {
                "type": "address",
                "name": "tokenAddress"
            },
            {
                "type": "int64",
                "name": "serialNumber"
            },
            {
                "type": "address",
                "name": "seller"
            },
            {
                "type": "uint256",
                "name": "price"
            },
            {
                "type": "bool",
                "name": "isActive"
            }
        ]
    },
    {
        "type": "function",
        "name": "nftOwner",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": ""
            },
            {
                "type": "int64",
                "name": ""
            }
        ],
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "owner",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "platformFeePercent",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    {
        "type": "function",
        "name": "purchaseNFT",
        "constant": false,
        "stateMutability": "payable",
        "payable": true,
        "inputs": [
            {
                "type": "uint256",
                "name": "listingId"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "redirectForToken",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "token"
            },
            {
                "type": "bytes",
                "name": "encodedFunctionSelector"
            }
        ],
        "outputs": [
            {
                "type": "int256",
                "name": "responseCode"
            },
            {
                "type": "bytes",
                "name": "response"
            }
        ]
    },
    {
        "type": "function",
        "name": "setComicCore",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "_comicCore"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "transferFrom",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "token"
            },
            {
                "type": "address",
                "name": "from"
            },
            {
                "type": "address",
                "name": "to"
            },
            {
                "type": "uint256",
                "name": "amount"
            }
        ],
        "outputs": [
            {
                "type": "int64",
                "name": "responseCode"
            }
        ]
    },
    {
        "type": "function",
        "name": "transferFromNFT",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "token"
            },
            {
                "type": "address",
                "name": "from"
            },
            {
                "type": "address",
                "name": "to"
            },
            {
                "type": "uint256",
                "name": "serialNumber"
            }
        ],
        "outputs": [
            {
                "type": "int64",
                "name": "responseCode"
            }
        ]
    },
    {
        "type": "function",
        "name": "updateListingPrice",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "listingId"
            },
            {
                "type": "uint256",
                "name": "newPrice"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "updatePlatformFee",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "newFee"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "withdrawFees",
        "constant": false,
        "payable": false,
        "inputs": [],
        "outputs": []
    },
    {
        "type": "receive",
        "stateMutability": "payable"
    }
]
  


// ─── Types ─────────────────────────────────────────────────────────────────────

export enum CampaignType {
  PUBLIC    = 0,
  WHITELIST = 1,
  SCHEDULED = 2,
}

export enum PhaseType {
  WHITELIST = 0,
  PUBLIC    = 1,
}

export type TxStatus = "idle" | "processing" | "done" | "error";

export interface EpisodeInfo {
  tokenAddress:  string;
  creator:       string;
  name:          string;
  maxSupply:     number;
  currentSupply: number;
  exists:        boolean;
}

export interface DirectListingInfo {
  episodeId:  string;
  creator:    string;
  pricePerNFT: string; // in wei (tinybars)
  available:  string;
  isActive:   boolean;
}

export interface CampaignInfo {
  episodeId:    string;
  creator:      string;
  campaignType: CampaignType;
  mintPrice:    string;
  maxSupply:    string;
  totalMinted:  string;
  isActive:     boolean;
}

export interface PhaseInfo {
  phaseType:    PhaseType;
  startTime:    number;
  endTime:      number;
  mintPrice:    string;
  maxPerWallet: string;
  phaseSupply:  string;
  phaseMinted:  string;
  isActive:     boolean;
}

export interface MarketListingInfo {
  tokenAddress: string;
  serialNumber: number;
  seller:       string;
  price:        string;
  isActive:     boolean;
}

export interface BatchListingsInfo {
  tokenAddresses: string[];
  serialNumbers:  number[];
  sellers:        string[];
  prices:         string[];
  isActives:      boolean[];
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useComicPlatform() {
  const { data: walletClient } = useWalletClient();

  const [status,        setStatus]        = useState<TxStatus>("idle");
  const [error,         setError]         = useState<string | null>(null);
  const [txHash,        setTxHash]        = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [mintProgress,  setMintProgress]  = useState<number>(0);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  /**
   * 1 HBAR = 1e18 on Hedera EVM (treated like ETH/wei).
   * All prices in your contracts are stored as tinybars (uint256).
   * ethers.parseUnits("10", 18) correctly encodes 10 HBAR for msg.value.
   */
  const hbarToWei = (hbar: number): bigint =>
    ethers.parseUnits(hbar.toFixed(8), 18);

  /**
   * Returns a read-only provider using Hedera's public Hashio JSON-RPC relay.
   * Used for all view/pure calls — no wallet required.
   */
  const getReadProvider = (): ethers.JsonRpcProvider =>
    new ethers.JsonRpcProvider(HASHIO_RPC);

  /**
   * Wraps the wagmi walletClient into an ethers v6 Signer.
   * HashPack connects via WalletConnect; RainbowKit exposes it as walletClient.
   */
  const getSigner = async (): Promise<ethers.Signer> => {
    if (!walletClient) throw new Error("Wallet not connected. Please connect HashPack first.");
    // walletClient is a viem WalletClient; ethers BrowserProvider can wrap
    // any EIP-1193 provider, and wagmi's walletClient exposes one via .transport
    const provider = new ethers.BrowserProvider(walletClient as any);
    return provider.getSigner();
  };

  // ── Contract factories ────────────────────────────────────────────────────────

  /** Write-capable contract instances (require signer) */
  const coreWrite = async () =>
    new ethers.Contract(CONTRACTS.COMIC_CORE, COMIC_CORE_ABI, await getSigner());

  const salesWrite = async () =>
    new ethers.Contract(CONTRACTS.COMIC_SALES, COMIC_SALES_ABI, await getSigner());

  const mktWrite = async () =>
    new ethers.Contract(CONTRACTS.COMIC_MARKETPLACE, COMIC_MARKETPLACE_ABI, await getSigner());

  /** Read-only contract instances (no signer needed) */
  const coreRead = () =>
    new ethers.Contract(CONTRACTS.COMIC_CORE, COMIC_CORE_ABI, getReadProvider());

  const salesRead = () =>
    new ethers.Contract(CONTRACTS.COMIC_SALES, COMIC_SALES_ABI, getReadProvider());

  const mktRead = () =>
    new ethers.Contract(CONTRACTS.COMIC_MARKETPLACE, COMIC_MARKETPLACE_ABI, getReadProvider());

  // ── Mirror Node TX confirmation ───────────────────────────────────────────────

  /**
   * Polls Mirror Node for the contract result of a tx hash until it's indexed
   * or we time out. This replaces waiting for an ethers receipt, which can be
   * unreliable on Hedera's JSON-RPC relay.
   */
  const waitForTx = async (
    hash: string,
    maxAttempts = 40,
    intervalMs  = 3000
  ): Promise<void> => {
    const url = `${MIRROR_BASE}/api/v1/contracts/results/${hash}`;
    for (let i = 1; i <= maxAttempts; i++) {
      setStatusMessage(`Confirming on-chain... (${i}/${maxAttempts})`);
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data?.result === "SUCCESS") return;
          if (data?.error_message) {
            throw new Error(`Contract reverted: ${data.error_message}`);
          }
        }
      } catch (e: any) {
        if (e.message?.includes("reverted")) throw e;
      }
      await delay(intervalMs);
    }
    throw new Error("Transaction confirmation timed out after Mirror Node polling.");
  };

  /**
   * Parses a uint256 return value from a contract tx receipt log.
   * Used to extract IDs (listingId, campaignId, phaseId) returned by write functions.
   */
  const extractUint256Return = (receipt: ethers.TransactionReceipt, eventName: string, argName: string): string | undefined => {
    try {
      const iface = new ethers.Interface([
        ...COMIC_SALES_ABI,
        ...COMIC_MARKETPLACE_ABI,
      ]);
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed?.name === eventName && parsed.args[argName] !== undefined) {
            return parsed.args[argName].toString();
          }
        } catch { /* not this log */ }
      }
    } catch { /* parsing failed */ }
    return undefined;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // COMIC CORE — WRITE FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create an NFT collection for a comic episode.
   * Costs ~30 HBAR on Hedera testnet for token creation.
   * Emits: CollectionCreated(episodeId, tokenAddress, creator, name, maxSupply)
   */
  const createComicCollection = async ({
    episodeId,
    name,
    symbol,
    maxSupply,
    hbarDeposit = 30,
    autoRenewPeriod = 7000000,
  }: {
    episodeId:       string;
    name:            string;
    symbol:          string;
    maxSupply:       number;
    hbarDeposit?:    number; // HBAR attached for HTS token creation fee
    autoRenewPeriod?: number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approve collection creation in HashPack…");

      const contract = await coreWrite();
      const tx = await contract.createComicCollection(
        episodeId,
        name,
        symbol,
        `${name} Collection`,
        maxSupply,
        autoRenewPeriod,
        {
          value:    hbarToWei(hbarDeposit),
          gasLimit: 15_000_000,
        }
      );

      setTxHash(tx.hash);
      setStatusMessage("Waiting for on-chain confirmation…");
      await waitForTx(tx.hash);

      // Fetch created token address from Mirror Node event logs
      let tokenAddress: string | undefined;
      try {
        const logsUrl = `${MIRROR_BASE}/api/v1/contracts/results/${tx.hash}/logs?order=asc&limit=5`;
        const logsRes = await fetch(logsUrl);
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          const iface    = new ethers.Interface(COMIC_CORE_ABI);
          for (const log of logsData.logs ?? []) {
            try {
              const parsed = iface.parseLog({ topics: log.topics, data: log.data });
              if (parsed?.name === "CollectionCreated") {
                tokenAddress = parsed.args.tokenAddress;
                break;
              }
            } catch { /* not this log */ }
          }
        }
      } catch { /* token address is optional bonus info */ }

      setStatus("done");
      setStatusMessage("✅ Collection created!");

      return { txHash: tx.hash, status: "SUCCESS", tokenAddress };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Admin: set the address of the deployed ComicSales contract inside ComicCore.
   * Only callable by the ComicCore owner.
   */
  const setSalesContract = async (salesAddress: string) => {
    try {
      setStatus("processing");
      setStatusMessage("Setting sales contract address…");
      const contract = await coreWrite();
      const tx = await contract.setSalesContract(salesAddress, { gasLimit: 200_000 });
      setTxHash(tx.hash);
      await waitForTx(tx.hash);
      setStatus("done");
      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message); setStatus("error"); throw err;
    }
  };

  /**
   * Admin: set the address of the deployed ComicMarketplace contract inside ComicCore.
   */
  const setMarketplaceContract = async (marketplaceAddress: string) => {
    try {
      setStatus("processing");
      setStatusMessage("Setting marketplace contract address…");
      const contract = await coreWrite();
      const tx = await contract.setMarketplaceContract(marketplaceAddress, { gasLimit: 200_000 });
      setTxHash(tx.hash);
      await waitForTx(tx.hash);
      setStatus("done");
      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message); setStatus("error"); throw err;
    }
  };

  /**
   * Admin: update the creator/platform royalty rates.
   * Numerators are out of 1000 (e.g. 100 = 10%).
   * Max creator: 200 (20%), max platform: 100 (10%).
   */
  const updateRoyalties = async ({
    creatorRoyalty,
    platformRoyalty,
  }: {
    creatorRoyalty:  number;
    platformRoyalty: number;
  }) => {
    try {
      setStatus("processing");
      setStatusMessage("Updating royalty rates…");
      const contract = await coreWrite();
      const tx = await contract.updateRoyalties(creatorRoyalty, platformRoyalty, { gasLimit: 200_000 });
      setTxHash(tx.hash);
      await waitForTx(tx.hash);
      setStatus("done");
      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message); setStatus("error"); throw err;
    }
  };

  /**
   * Admin: withdraw accumulated HBAR fees from ComicCore.
   */
  const withdrawCorefees = async () => {
    try {
      setStatus("processing");
      const contract = await coreWrite();
      const tx = await contract.withdrawFees({ gasLimit: 200_000 });
      setTxHash(tx.hash);
      await waitForTx(tx.hash);
      setStatus("done");
      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message); setStatus("error"); throw err;
    }
  };

  /**
   * Admin: transfer ownership of ComicCore to a new address.
   */
  const transferCoreOwnership = async (newOwner: string) => {
    try {
      setStatus("processing");
      const contract = await coreWrite();
      const tx = await contract.transferOwnership(newOwner, { gasLimit: 200_000 });
      setTxHash(tx.hash);
      await waitForTx(tx.hash);
      setStatus("done");
      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message); setStatus("error"); throw err;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // COMIC SALES — WRITE FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Creator: mint NFTs and immediately list them for sale at a fixed price.
   * Because Hedera limits a single mint tx to ~10 NFTs, this batches automatically.
   * 
   * @param episodeId   - Must match the registered episode in ComicCore.
   * @param quantity    - Total NFTs to mint and list.
   * @param pricePerNFT - Price in HBAR per NFT.
   * @param metadata    - Metadata string (e.g. "hcs://1/<topicId>").
   * 
   * Emits: DirectListingCreated(listingId, episodeId, creator, quantity, pricePerNFT)
   */
  const createDirectListing = async ({
    episodeId,
    quantity,
    pricePerNFT,
    metadata,
  }: {
    episodeId:  string;
    quantity:   number;
    pricePerNFT: number; // in HBAR
    metadata:   string;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setMintProgress(0);

      // Convert pricePerNFT from HBAR to tinybars (the contract stores uint256 tinybars)
      const priceInTinybars = hbarToWei(pricePerNFT);

      const BATCH_SIZE   = 10; // Hedera HTS limit per mint tx
      const totalBatches = Math.ceil(quantity / BATCH_SIZE);
      let   lastTxHash   = "";
      let   lastListingId: string | undefined;
      let   completedBatches = 0;

      for (let batchStart = 0; batchStart < quantity; batchStart += BATCH_SIZE) {
        const batchEnd      = Math.min(batchStart + BATCH_SIZE, quantity);
        const batchQty      = batchEnd - batchStart;
        const currentBatch  = completedBatches + 1;

        setStatusMessage(`Batch ${currentBatch}/${totalBatches}: Approve in HashPack…`);

        const contract = await salesWrite();
        const tx = await contract.createDirectListing(
          episodeId,
          batchQty,
          priceInTinybars,
          ethers.toUtf8Bytes(metadata),
          {
            gasLimit: 5_000_000 + batchQty * 500_000,
          }
        );

        setTxHash(tx.hash);
        lastTxHash = tx.hash;
        await waitForTx(tx.hash);

        // Extract listingId from the DirectListingCreated event
        try {
          const receipt = await getReadProvider().getTransactionReceipt(tx.hash);
          if (receipt) {
            const id = extractUint256Return(receipt, "DirectListingCreated", "listingId");
            if (id) lastListingId = id;
          }
        } catch { /* listing ID is optional */ }

        completedBatches++;
        setMintProgress((completedBatches / totalBatches) * 100);

        if (batchEnd < quantity) {
          await delay(3000); // avoid rate-limiting between batches
        }
      }

      setMintProgress(100);
      setStatus("done");
      setStatusMessage("✅ Direct listing created!");

      return {
        txHash:     lastTxHash,
        status:     "SUCCESS",
        listingId:  lastListingId,
        totalMinted: quantity,
        batches:    totalBatches,
      };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Buyer: purchase one or more NFTs from a direct listing.
   * Attaches the correct HBAR value (pricePerNFT × quantity).
   * 
   * Emits: DirectSale(listingId, buyer, quantity, totalPrice)
   */
  const purchaseFromListing = async ({
    listingId,
    quantity,
    pricePerNFT,
  }: {
    listingId:   number;
    quantity:    number;
    pricePerNFT: number; // in HBAR
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approve purchase in HashPack…");

      const totalHbar = pricePerNFT * quantity;
      const contract  = await salesWrite();
      const tx = await contract.purchaseFromListing(listingId, quantity, {
        value:    hbarToWei(totalHbar),
        gasLimit: 5_000_000 + quantity * 500_000,
      });

      setTxHash(tx.hash);
      setStatusMessage("Confirming purchase…");
      await waitForTx(tx.hash);

      setStatus("done");
      setStatusMessage("✅ Purchase successful! You can now read this comic.");

      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Creator: create a mint campaign (Public / Whitelist / Scheduled).
   * 
   * @param campaignType - CampaignType enum: 0=PUBLIC, 1=WHITELIST, 2=SCHEDULED
   * @param mintPrice    - Per-NFT mint price in HBAR.
   * @param maxPerWallet - 0 means unlimited.
   * 
   * Emits: CampaignCreated(campaignId, episodeId, campaignType, mintPrice, maxSupply)
   */
  const createCampaign = async ({
    episodeId,
    campaignType,
    mintPrice,
    maxSupply,
    maxPerWallet,
    metadata,
  }: {
    episodeId:    string;
    campaignType: CampaignType;
    mintPrice:    number; // in HBAR
    maxSupply:    number;
    maxPerWallet: number;
    metadata:     string;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approve campaign creation in HashPack…");

      const priceInTinybars = hbarToWei(mintPrice);
      const contract        = await salesWrite();

      const tx = await contract.createCampaign(
        episodeId,
        campaignType,
        priceInTinybars,
        maxSupply,
        maxPerWallet,
        ethers.toUtf8Bytes(metadata),
        { gasLimit: 4_000_000 }
      );

      setTxHash(tx.hash);
      setStatusMessage("Confirming campaign creation…");
      await waitForTx(tx.hash);

      // Extract campaignId from CampaignCreated event
      let campaignId: string | undefined;
      try {
        const receipt = await getReadProvider().getTransactionReceipt(tx.hash);
        if (receipt) {
          campaignId = extractUint256Return(receipt, "CampaignCreated", "campaignId");
        }
      } catch { /* campaignId is optional */ }

      setStatus("done");
      setStatusMessage("✅ Campaign created!");

      return { txHash: tx.hash, status: "SUCCESS", campaignId };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Creator: add wallet addresses to the whitelist for a WHITELIST campaign.
   * `addresses` and `allocations` must have the same length.
   * Each allocation is the max number of NFTs that address can mint.
   */
  const addToWhitelist = async ({
    campaignId,
    addresses,
    allocations,
  }: {
    campaignId:  number;
    addresses:   string[];
    allocations: number[];
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approving whitelist update in HashPack…");

      if (addresses.length !== allocations.length) {
        throw new Error("addresses and allocations arrays must have the same length");
      }

      const contract = await salesWrite();
      const tx = await contract.addToWhitelist(
        campaignId,
        addresses,
        allocations,
        { gasLimit: 1_000_000 + addresses.length * 100_000 }
      );

      setTxHash(tx.hash);
      await waitForTx(tx.hash);
      setStatus("done");
      setStatusMessage("✅ Whitelist updated!");

      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Creator: add whitelist for a specific phase inside a SCHEDULED campaign.
   * The target phase must have phaseType = WHITELIST (0).
   */
  const addToWhitelistForPhase = async ({
    campaignId,
    phaseId,
    addresses,
    allocations,
  }: {
    campaignId:  number;
    phaseId:     number;
    addresses:   string[];
    allocations: number[];
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approving phase whitelist in HashPack…");

      const contract = await salesWrite();
      const tx = await contract.addToWhitelistForPhase(
        campaignId,
        phaseId,
        addresses,
        allocations,
        { gasLimit: 1_000_000 + addresses.length * 100_000 }
      );

      setTxHash(tx.hash);
      await waitForTx(tx.hash);
      setStatus("done");
      setStatusMessage("✅ Phase whitelist updated!");

      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Creator: add a mint phase to a SCHEDULED campaign.
   * startTime and endTime are Unix timestamps (seconds).
   * 
   * Emits: PhaseAdded(campaignId, phaseId, phaseType, startTime, endTime)
   */
  const addPhase = async ({
    campaignId,
    phaseType,
    startTime,
    endTime,
    mintPrice,
    maxPerWallet,
    phaseSupply,
  }: {
    campaignId:   number;
    phaseType:    PhaseType;
    startTime:    number; // Unix timestamp in seconds
    endTime:      number;
    mintPrice:    number; // in HBAR
    maxPerWallet: number;
    phaseSupply:  number; // 0 = unlimited within campaign maxSupply
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approving phase creation in HashPack…");

      const priceInTinybars = hbarToWei(mintPrice);
      const contract        = await salesWrite();

      const tx = await contract.addPhase(
        campaignId,
        phaseType,
        startTime,
        endTime,
        priceInTinybars,
        maxPerWallet,
        phaseSupply,
        { gasLimit: 2_000_000 }
      );

      setTxHash(tx.hash);
      await waitForTx(tx.hash);

      // Extract phaseId from PhaseAdded event
      let phaseId: string | undefined;
      try {
        const receipt = await getReadProvider().getTransactionReceipt(tx.hash);
        if (receipt) {
          phaseId = extractUint256Return(receipt, "PhaseAdded", "phaseId");
        }
      } catch { /* phaseId is optional */ }

      setStatus("done");
      setStatusMessage("✅ Phase added!");

      return { txHash: tx.hash, status: "SUCCESS", phaseId };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Buyer: mint from a campaign.
   * Works for PUBLIC, WHITELIST and SCHEDULED campaign types.
   * For SCHEDULED campaigns, pass the specific phaseId; for others pass 0.
   * 
   * Emits: NFTMinted(campaignId, minter, quantity, totalPrice)
   */
  const mintFromCampaign = async ({
    campaignId,
    phaseId = 0,
    quantity,
    mintPrice,
  }: {
    campaignId: number;
    phaseId?:   number; // 0 for PUBLIC/WHITELIST, specific phaseId for SCHEDULED
    quantity:   number;
    mintPrice:  number; // in HBAR per NFT
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approve mint in HashPack…");

      const totalHbar = mintPrice * quantity;
      const contract  = await salesWrite();

      const tx = await contract.mint(campaignId, phaseId, quantity, {
        value:    hbarToWei(totalHbar),
        gasLimit: 4_000_000 + quantity * 500_000,
      });

      setTxHash(tx.hash);
      setStatusMessage("Confirming mint…");
      await waitForTx(tx.hash);

      setStatus("done");
      setStatusMessage("✅ Mint successful! You can now read this comic.");

      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Admin: update the platform fee for ComicSales.
   * Max 3000 (30%). Expressed as basis points out of 10000.
   */
  const updateSalesPlatformFee = async (newFeePercent: number) => {
    try {
      setStatus("processing");
      const contract = await salesWrite();
      const tx = await contract.updatePlatformFee(newFeePercent, { gasLimit: 200_000 });
      setTxHash(tx.hash);
      await waitForTx(tx.hash);
      setStatus("done");
      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message); setStatus("error"); throw err;
    }
  };

  /**
   * Admin: withdraw accumulated HBAR fees from ComicSales.
   */
  const withdrawSalesFees = async () => {
    try {
      setStatus("processing");
      const contract = await salesWrite();
      const tx = await contract.withdrawFees({ gasLimit: 200_000 });
      setTxHash(tx.hash);
      await waitForTx(tx.hash);
      setStatus("done");
      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message); setStatus("error"); throw err;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // COMIC MARKETPLACE — WRITE FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Seller: deposit a single NFT into the marketplace and create a resale listing.
   * The NFT is transferred from the seller to the marketplace contract.
   * 
   * @param tokenAddress - EVM address of the HTS NFT token (not Hedera 0.0.xxx ID).
   * @param serialNumber - NFT serial number (from your mint receipt).
   * @param priceInHbar  - Listing price in HBAR.
   * 
   * Emits: NFTListed(listingId, tokenAddress, serialNumber, seller, price)
   */
  const depositAndListForResale = async ({
    tokenAddress,
    serialNumber,
    priceInHbar,
  }: {
    tokenAddress: string;
    serialNumber: number;
    priceInHbar:  number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approve listing in HashPack…");

      const priceInTinybars = hbarToWei(priceInHbar);
      const contract        = await mktWrite();

      const tx = await contract.depositAndListForResale(
        tokenAddress,
        serialNumber,
        priceInTinybars,
        { gasLimit: 5_000_000 }
      );

      setTxHash(tx.hash);
      await waitForTx(tx.hash);

      // Extract listingId from NFTListed event
      let listingId: string | undefined;
      try {
        const receipt = await getReadProvider().getTransactionReceipt(tx.hash);
        if (receipt) {
          listingId = extractUint256Return(receipt, "NFTListed", "listingId");
        }
      } catch { /* listingId is optional */ }

      setStatus("done");
      setStatusMessage("✅ NFT listed for resale!");

      return { txHash: tx.hash, status: "SUCCESS", listingId };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Seller: batch deposit multiple NFTs from the same collection and list them.
   * `serialNumbers` and `prices` must have matching lengths.
   * 
   * Emits: NFTListed × n, BatchNFTsListed
   */
  const batchDepositAndListForResale = async ({
    tokenAddress,
    serialNumbers,
    pricesInHbar,
  }: {
    tokenAddress:  string;
    serialNumbers: number[];
    pricesInHbar:  number[];
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approve batch listing in HashPack…");

      if (serialNumbers.length !== pricesInHbar.length) {
        throw new Error("serialNumbers and pricesInHbar must have the same length");
      }

      const pricesInTinybars = pricesInHbar.map((p) => hbarToWei(p));
      const contract         = await mktWrite();

      const tx = await contract.batchDepositAndListForResale(
        tokenAddress,
        serialNumbers,
        pricesInTinybars,
        { gasLimit: 3_000_000 + serialNumbers.length * 300_000 }
      );

      setTxHash(tx.hash);
      await waitForTx(tx.hash);

      setStatus("done");
      setStatusMessage(`✅ ${serialNumbers.length} NFTs listed for resale!`);

      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Buyer: purchase a single NFT from the marketplace.
   * Automatically transfers reading access from seller to buyer.
   * Attaches the exact listing price as HBAR value.
   * 
   * Emits: NFTSold(listingId, buyer, seller, price)
   */
  const purchaseNFT = async ({
    listingId,
    priceInHbar,
  }: {
    listingId:   number;
    priceInHbar: number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approve NFT purchase in HashPack…");

      const contract = await mktWrite();
      const tx = await contract.purchaseNFT(listingId, {
        value:    hbarToWei(priceInHbar),
        gasLimit: 5_000_000,
      });

      setTxHash(tx.hash);
      setStatusMessage("Confirming purchase…");
      await waitForTx(tx.hash);

      setStatus("done");
      setStatusMessage("✅ Purchase successful! Reading access transferred.");

      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Buyer: batch purchase multiple NFTs from the marketplace in a single tx.
   * Pass the total HBAR value (sum of all listing prices).
   * 
   * Emits: NFTSold × n, BatchNFTsPurchased
   */
  const batchPurchaseNFTs = async ({
    listingIds,
    totalPriceInHbar,
  }: {
    listingIds:       number[];
    totalPriceInHbar: number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approve batch purchase in HashPack…");

      const contract = await mktWrite();
      const tx = await contract.batchPurchaseNFTs(listingIds, {
        value:    hbarToWei(totalPriceInHbar),
        gasLimit: 5_000_000 * listingIds.length,
      });

      setTxHash(tx.hash);
      setStatusMessage("Confirming batch purchase…");
      await waitForTx(tx.hash);

      setStatus("done");
      setStatusMessage(`✅ ${listingIds.length} NFTs purchased!`);

      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Seller / Admin: cancel a single listing and return the NFT to the seller.
   * 
   * Emits: ListingCancelled(listingId, seller)
   */
  const cancelListing = async (listingId: number) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approve cancellation in HashPack…");

      const contract = await mktWrite();
      const tx = await contract.cancelListing(listingId, { gasLimit: 2_000_000 });

      setTxHash(tx.hash);
      await waitForTx(tx.hash);

      setStatus("done");
      setStatusMessage("✅ Listing cancelled. NFT returned to your wallet.");

      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Seller / Admin: batch cancel multiple listings.
   */
  const batchCancelListings = async (listingIds: number[]) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approving batch cancel in HashPack…");

      const contract = await mktWrite();
      const tx = await contract.batchCancelListings(listingIds, {
        gasLimit: 2_000_000 * listingIds.length,
      });

      setTxHash(tx.hash);
      await waitForTx(tx.hash);

      setStatus("done");
      setStatusMessage(`✅ ${listingIds.length} listings cancelled.`);

      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Seller: update the price of an active listing.
   */
  const updateListingPrice = async ({
    listingId,
    newPriceInHbar,
  }: {
    listingId:     number;
    newPriceInHbar: number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setStatusMessage("Approving price update in HashPack…");

      const newPriceTinybars = hbarToWei(newPriceInHbar);
      const contract         = await mktWrite();
      const tx = await contract.updateListingPrice(listingId, newPriceTinybars, { gasLimit: 200_000 });

      setTxHash(tx.hash);
      await waitForTx(tx.hash);

      setStatus("done");
      setStatusMessage("✅ Price updated!");

      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  /**
   * Admin: update the platform fee for ComicMarketplace.
   * Max 1000 (10%). Expressed as basis points out of 10000.
   */
  const updateMarketplacePlatformFee = async (newFeePercent: number) => {
    try {
      setStatus("processing");
      const contract = await mktWrite();
      const tx = await contract.updatePlatformFee(newFeePercent, { gasLimit: 200_000 });
      setTxHash(tx.hash);
      await waitForTx(tx.hash);
      setStatus("done");
      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message); setStatus("error"); throw err;
    }
  };

  /**
   * Admin: withdraw accumulated HBAR fees from ComicMarketplace.
   */
  const withdrawMarketplaceFees = async () => {
    try {
      setStatus("processing");
      const contract = await mktWrite();
      const tx = await contract.withdrawFees({ gasLimit: 200_000 });
      setTxHash(tx.hash);
      await waitForTx(tx.hash);
      setStatus("done");
      return { txHash: tx.hash, status: "SUCCESS" };
    } catch (err: any) {
      setError(err.message); setStatus("error"); throw err;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // READ-ONLY QUERIES — all via Hashio JSON-RPC, no wallet required
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Check whether a user has been granted reading access to a comic episode.
   * The backend should call this before serving protected content.
   */
  const canReadComic = async (episodeId: string, userAddress: string): Promise<boolean> => {
    try {
      const result = await coreRead().canReadComic(episodeId, userAddress);
      return result as boolean;
    } catch (err) {
      console.error("canReadComic failed:", err);
      return false;
    }
  };

  /**
   * Check reading access by token address directly.
   */
  const canReadByToken = async (tokenAddress: string, userAddress: string): Promise<boolean> => {
    try {
      return await coreRead().canReadByToken(tokenAddress, userAddress);
    } catch {
      return false;
    }
  };

  /**
   * Get full episode/collection details from ComicCore.
   */
  const getEpisode = async (episodeId: string): Promise<EpisodeInfo> => {
    const r = await coreRead().getEpisode(episodeId);
    return {
      tokenAddress:  r[0],
      creator:       r[1],
      name:          r[2],
      maxSupply:     Number(r[3]),
      currentSupply: Number(r[4]),
      exists:        r[5],
    };
  };

  /**
   * Get the HTS token address for an episode.
   */
  const getTokenAddress = async (episodeId: string): Promise<string> => {
    return coreRead().getTokenAddress(episodeId);
  };

  /**
   * Get the creator address of an episode.
   */
  const getCreator = async (episodeId: string): Promise<string> => {
    return coreRead().getCreator(episodeId);
  };

  /**
   * Get all episode IDs created by a given creator address.
   */
  const getCreatorEpisodes = async (creatorAddress: string): Promise<string[]> => {
    return coreRead().getCreatorEpisodes(creatorAddress);
  };

  /**
   * Check whether an address is the creator of an episode.
   */
  const isCreator = async (episodeId: string, address: string): Promise<boolean> => {
    return coreRead().isCreator(episodeId, address);
  };

  /**
   * Get details of a direct listing from ComicSales.
   * pricePerNFT is returned as a string (wei/tinybars). Divide by 1e18 for HBAR.
   */
  const getDirectListing = async (listingId: number): Promise<DirectListingInfo> => {
    const r = await salesRead().getDirectListing(listingId);
    return {
      episodeId:   r[0],
      creator:     r[1],
      pricePerNFT: r[2].toString(),
      available:   r[3].toString(),
      isActive:    r[4],
    };
  };

  /**
   * Get details of a campaign from ComicSales.
   * mintPrice is returned as a string (wei/tinybars).
   */
  const getCampaign = async (campaignId: number): Promise<CampaignInfo> => {
    const r = await salesRead().getCampaign(campaignId);
    const campaignTypeMap: Record<number, CampaignType> = {
      0: CampaignType.PUBLIC,
      1: CampaignType.WHITELIST,
      2: CampaignType.SCHEDULED,
    };
    return {
      episodeId:    r[0],
      creator:      r[1],
      campaignType: campaignTypeMap[Number(r[2])] ?? CampaignType.PUBLIC,
      mintPrice:    r[3].toString(),
      maxSupply:    r[4].toString(),
      totalMinted:  r[5].toString(),
      isActive:     r[6],
    };
  };

  /**
   * Get the currently active phase for a SCHEDULED campaign.
   * Returns exists=false if the campaign is not SCHEDULED or no phase is active now.
   */
  const getCurrentPhase = async (campaignId: number): Promise<{ phaseId: number; exists: boolean }> => {
    const r = await salesRead().getCurrentPhase(campaignId);
    return { phaseId: Number(r[0]), exists: r[1] };
  };

  /**
   * Get details of a specific phase in a SCHEDULED campaign.
   * mintPrice is in wei/tinybars — divide by 1e18 for HBAR display.
   */
  const getPhase = async (campaignId: number, phaseId: number): Promise<PhaseInfo> => {
    const r = await salesRead().phases(campaignId, phaseId);
    const phaseTypeMap: Record<number, PhaseType> = {
      0: PhaseType.WHITELIST,
      1: PhaseType.PUBLIC,
    };
    return {
      phaseType:    phaseTypeMap[Number(r[0])] ?? PhaseType.PUBLIC,
      startTime:    Number(r[1]),
      endTime:      Number(r[2]),
      mintPrice:    r[3].toString(),
      maxPerWallet: r[4].toString(),
      phaseSupply:  r[5].toString(),
      phaseMinted:  r[6].toString(),
      isActive:     r[7],
    };
  };

  /**
   * Check how many NFTs an address is whitelisted to mint.
   * For WHITELIST campaigns: phaseId = 0.
   * For SCHEDULED campaigns: use the specific phaseId.
   */
  const getWhitelistAllocation = async (
    campaignId: number,
    phaseId: number,
    userAddress: string
  ): Promise<number> => {
    const result = await salesRead().whitelist(campaignId, phaseId, userAddress);
    return Number(result);
  };

  /**
   * Check how many NFTs an address has already minted in a campaign/phase.
   */
  const getMintedPerWallet = async (
    campaignId: number,
    phaseId: number,
    userAddress: string
  ): Promise<number> => {
    const result = await salesRead().mintedPerWallet(campaignId, phaseId, userAddress);
    return Number(result);
  };

  /**
   * Get the total number of direct listings ever created (including inactive).
   */
  const getDirectListingCount = async (): Promise<number> => {
    return Number(await salesRead().directListingCounter());
  };

  /**
   * Get the total number of campaigns ever created (including inactive).
   */
  const getCampaignCount = async (): Promise<number> => {
    return Number(await salesRead().campaignCounter());
  };

  /**
   * Get a single marketplace (resale) listing.
   * price is in wei/tinybars — divide by 1e18 for HBAR display.
   */
  const getListing = async (listingId: number): Promise<MarketListingInfo> => {
    const r = await mktRead().getListing(listingId);
    return {
      tokenAddress: r[0],
      serialNumber: Number(r[1]),
      seller:       r[2],
      price:        r[3].toString(),
      isActive:     r[4],
    };
  };

  /**
   * Get multiple marketplace listings in a single call.
   */
  const getBatchListings = async (listingIds: number[]): Promise<BatchListingsInfo> => {
    const r = await mktRead().getBatchListings(listingIds);
    return {
      tokenAddresses: r[0] as string[],
      serialNumbers:  (r[1] as bigint[]).map(Number),
      sellers:        r[2] as string[],
      prices:         (r[3] as bigint[]).map((p) => p.toString()),
      isActives:      r[4] as boolean[],
    };
  };

  /**
   * Get the total number of marketplace listings ever created.
   */
  const getListingCount = async (): Promise<number> => {
    return Number(await mktRead().listingCounter());
  };

  /**
   * Get the current owner of an NFT inside the marketplace escrow.
   * Returns the original depositor's address (or zero if not tracked).
   */
  const getNftOwnerInEscrow = async (tokenAddress: string, serialNumber: number): Promise<string> => {
    return mktRead().nftOwner(tokenAddress, serialNumber);
  };

  /**
   * Convenience: convert tinybars (wei-equivalent) to HBAR for display.
   */
  const tinybarsToHbar = (tinybars: string | bigint): string => {
    return ethers.formatUnits(tinybars.toString(), 18);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // UTILS
  // ─────────────────────────────────────────────────────────────────────────────

  const resetState = () => {
    setStatus("idle");
    setError(null);
    setTxHash(null);
    setStatusMessage("");
    setMintProgress(0);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // EXPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  return {
    // ── Comic Core ─────────────────────────────────────────────────────────────
    createComicCollection,
    setSalesContract,
    setMarketplaceContract,
    updateRoyalties,
    withdrawCorefees,
    transferCoreOwnership,

    // ── Comic Sales ────────────────────────────────────────────────────────────
    createDirectListing,
    purchaseFromListing,
    createCampaign,
    addToWhitelist,
    addToWhitelistForPhase,
    addPhase,
    mintFromCampaign,
    updateSalesPlatformFee,
    withdrawSalesFees,

    // ── Comic Marketplace ──────────────────────────────────────────────────────
    depositAndListForResale,
    batchDepositAndListForResale,
    purchaseNFT,
    batchPurchaseNFTs,
    cancelListing,
    batchCancelListings,
    updateListingPrice,
    updateMarketplacePlatformFee,
    withdrawMarketplaceFees,

    // ── Read-only Queries ──────────────────────────────────────────────────────
    canReadComic,
    canReadByToken,
    getEpisode,
    getTokenAddress,
    getCreator,
    getCreatorEpisodes,
    isCreator,
    getDirectListing,
    getCampaign,
    getCurrentPhase,
    getPhase,
    getWhitelistAllocation,
    getMintedPerWallet,
    getDirectListingCount,
    getCampaignCount,
    getListing,
    getBatchListings,
    getListingCount,
    getNftOwnerInEscrow,

    // ── Utilities ──────────────────────────────────────────────────────────────
    tinybarsToHbar,
    hbarToWei,
    resetState,

    // ── State ──────────────────────────────────────────────────────────────────
    status,
    error,
    txHash,
    statusMessage,
    mintProgress,
  };
}

export default useComicPlatform;