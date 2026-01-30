/**
 * Token Metadata Fetcher
 *
 * Fetches SPL token metadata from Solana blockchain.
 * Uses getMint for decimals and Metaplex metadata for name/symbol.
 */

import { PublicKey } from "@solana/web3.js"
import { getRpcClient, type RpcConfig } from "./rpc"
import type { TokenInfo } from "@/types"

// ============================================================================
// CONSTANTS
// ============================================================================

/** Metaplex Token Metadata Program ID */
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
)

/** Token Program ID */
const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
)

/** Token-2022 Program ID */
const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
)

// ============================================================================
// TYPES
// ============================================================================

export interface FetchTokenResult {
  success: boolean
  token?: TokenInfo
  error?: string
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Validate a Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

/**
 * Derive the metadata PDA for a mint
 */
function getMetadataPDA(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )
  return pda
}

/**
 * Parse Metaplex metadata from account data
 */
function parseMetadata(data: Buffer): { name: string; symbol: string; uri: string } | null {
  try {
    // Metaplex metadata structure (simplified):
    // [0]: key (1 byte)
    // [1-32]: update authority (32 bytes)
    // [33-64]: mint (32 bytes)
    // [65-68]: name length (4 bytes, little endian)
    // [69-...]: name string
    // Then symbol length + symbol
    // Then uri length + uri

    let offset = 1 + 32 + 32 // Skip key, update authority, mint

    // Read name
    const nameLength = data.readUInt32LE(offset)
    offset += 4
    const name = data.slice(offset, offset + nameLength).toString("utf8").replace(/\0/g, "").trim()
    offset += nameLength

    // Read symbol
    const symbolLength = data.readUInt32LE(offset)
    offset += 4
    const symbol = data.slice(offset, offset + symbolLength).toString("utf8").replace(/\0/g, "").trim()
    offset += symbolLength

    // Read URI
    const uriLength = data.readUInt32LE(offset)
    offset += 4
    const uri = data.slice(offset, offset + uriLength).toString("utf8").replace(/\0/g, "").trim()

    return { name, symbol, uri }
  } catch {
    return null
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Fetch token metadata from the Solana blockchain
 *
 * @param mintAddress - The token mint address
 * @param rpcConfig - RPC configuration
 * @returns Token info or error
 */
export async function fetchTokenMetadata(
  mintAddress: string,
  rpcConfig: RpcConfig
): Promise<FetchTokenResult> {
  // Validate address
  if (!isValidSolanaAddress(mintAddress)) {
    return {
      success: false,
      error: "Invalid token address",
    }
  }

  try {
    const mint = new PublicKey(mintAddress)
    const rpcClient = getRpcClient(rpcConfig)
    const connection = rpcClient.getConnection()

    // Fetch mint account to get decimals
    const mintAccountInfo = await connection.getAccountInfo(mint)

    if (!mintAccountInfo) {
      return {
        success: false,
        error: "Token not found on chain",
      }
    }

    // Check if it's a valid token mint (owned by Token or Token-2022 program)
    const owner = mintAccountInfo.owner.toBase58()
    if (owner !== TOKEN_PROGRAM_ID.toBase58() && owner !== TOKEN_2022_PROGRAM_ID.toBase58()) {
      return {
        success: false,
        error: "Address is not a valid SPL token",
      }
    }

    // Parse mint data to get decimals
    // Mint layout: [36 bytes of other data, then decimals at offset 44]
    const decimals = mintAccountInfo.data[44]

    // Try to fetch Metaplex metadata
    let name = `Unknown Token`
    let symbol = mintAddress.slice(0, 4).toUpperCase()
    let logoUri: string | undefined

    try {
      const metadataPDA = getMetadataPDA(mint)
      const metadataAccountInfo = await connection.getAccountInfo(metadataPDA)

      if (metadataAccountInfo) {
        const metadata = parseMetadata(metadataAccountInfo.data as Buffer)
        if (metadata) {
          name = metadata.name || name
          symbol = metadata.symbol || symbol

          // Try to fetch logo from metadata URI
          if (metadata.uri && metadata.uri.startsWith("http")) {
            try {
              const response = await fetch(metadata.uri, {
                headers: { Accept: "application/json" },
              })
              if (response.ok) {
                const json = await response.json()
                if (json.image) {
                  logoUri = json.image
                }
              }
            } catch {
              // Ignore URI fetch errors
            }
          }
        }
      }
    } catch {
      // Metaplex metadata not found, use defaults
    }

    const token: TokenInfo = {
      symbol,
      name,
      mint: mintAddress,
      decimals,
      logoUri,
    }

    return {
      success: true,
      token,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch token",
    }
  }
}
