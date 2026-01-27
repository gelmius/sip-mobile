/**
 * SIP Privacy Program Client
 *
 * Client for interacting with the sip-privacy program.
 * Handles shielded transfers with Pedersen commitments and stealth addresses.
 */

import { web3 } from "@coral-xyz/anchor"
import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js"
import {
  SIP_PRIVACY_PROGRAM_ID,
  getConfigPda,
  getTransferRecordPda,
  type Config,
  type ShieldedTransferArgs,
} from "./types"
import {
  createCommitment,
  encryptAmount,
  computeViewingKeyHash,
  deriveSharedSecret,
  generateMockProof,
  generateEphemeralKeyPair,
} from "./crypto"

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ShieldedTransferParams {
  /** Amount in SOL */
  amount: number
  /** Stealth recipient address (ed25519 public key) */
  stealthPubkey: PublicKey
  /** Recipient's spending public key (for shared secret derivation) */
  recipientSpendingKey: Uint8Array
  /** Recipient's viewing public key */
  recipientViewingKey: Uint8Array
  /** Optional memo (not used in current implementation) */
  memo?: string
}

export interface ShieldedTransferResult {
  /** Transaction signature */
  signature: string
  /** Transfer record PDA */
  transferRecord: PublicKey
  /** Ephemeral public key (for recipient to derive shared secret) */
  ephemeralPubkey: Uint8Array
}

export interface ProgramState {
  config: Config | null
  isInitialized: boolean
  totalTransfers: bigint
  feeBps: number
  authority: PublicKey | null
}

// ─── Client Class ──────────────────────────────────────────────────────────

export class SipPrivacyClient {
  private connection: Connection
  private programId: PublicKey

  constructor(
    connection: Connection,
    programId: PublicKey = SIP_PRIVACY_PROGRAM_ID
  ) {
    this.connection = connection
    this.programId = programId
  }

  /**
   * Fetch the program config account
   */
  async fetchConfig(): Promise<Config | null> {
    try {
      const [configPda] = getConfigPda(this.programId)
      const accountInfo = await this.connection.getAccountInfo(configPda)

      if (!accountInfo) {
        console.log("Config account not found")
        return null
      }

      // Parse the account data
      // Skip the 8-byte discriminator
      const data = accountInfo.data.slice(8)

      // Parse fields according to the IDL struct layout:
      // authority: pubkey (32 bytes)
      // fee_bps: u16 (2 bytes)
      // paused: bool (1 byte)
      // total_transfers: u64 (8 bytes)
      // bump: u8 (1 byte)
      // Total: 44 bytes

      const authority = new PublicKey(data.slice(0, 32))
      const feeBps = data.readUInt16LE(32)
      const paused = data[34] === 1
      const totalTransfers = data.readBigUInt64LE(35)
      const bump = data[43]

      return {
        authority,
        feeBps,
        paused,
        totalTransfers,
        bump,
      }
    } catch (err) {
      console.error("Failed to fetch config:", err)
      return null
    }
  }

  /**
   * Get program state summary
   */
  async getState(): Promise<ProgramState> {
    const config = await this.fetchConfig()

    return {
      config,
      isInitialized: config !== null,
      totalTransfers: config?.totalTransfers ?? 0n,
      feeBps: config?.feeBps ?? 0,
      authority: config?.authority ?? null,
    }
  }

  /**
   * Build a shielded transfer instruction
   *
   * This creates the instruction data but does NOT sign or send the transaction.
   * The caller is responsible for signing with the sender's wallet.
   */
  async buildShieldedTransfer(
    sender: PublicKey,
    params: ShieldedTransferParams
  ): Promise<{
    transaction: Transaction
    transferRecord: PublicKey
    ephemeralPubkey: Uint8Array
  }> {
    // Fetch current config to get totalTransfers
    const config = await this.fetchConfig()
    if (!config) {
      throw new Error("Program not initialized - config account not found")
    }

    if (config.paused) {
      throw new Error("Program is paused")
    }

    // Convert SOL to lamports
    const lamports = BigInt(Math.floor(params.amount * LAMPORTS_PER_SOL))

    // Generate ephemeral keypair
    const ephemeralKeyPair = await generateEphemeralKeyPair()

    // Derive shared secret for amount encryption
    const sharedSecret = deriveSharedSecret(
      ephemeralKeyPair.privateKey,
      params.recipientSpendingKey
    )

    // Create Pedersen commitment for the amount
    const { commitment, blindingFactor } = await createCommitment(lamports)

    // Encrypt the amount for the recipient
    const encryptedAmount = await encryptAmount(lamports, sharedSecret)

    // Compute viewing key hash
    const viewingKeyHash = computeViewingKeyHash(params.recipientViewingKey)

    // Generate mock proof (real implementation would use Noir)
    const proof = await generateMockProof(commitment, blindingFactor, lamports)

    // Derive PDAs
    const [configPda] = getConfigPda(this.programId)
    const [transferRecordPda] = getTransferRecordPda(
      sender,
      config.totalTransfers,
      this.programId
    )

    // Build instruction data
    // For simplicity without full Anchor, we'll create a raw instruction
    const instructionData = this.encodeShieldedTransferData({
      amountCommitment: Array.from(commitment),
      stealthPubkey: params.stealthPubkey,
      ephemeralPubkey: Array.from(ephemeralKeyPair.publicKey),
      viewingKeyHash: Array.from(viewingKeyHash),
      encryptedAmount: Buffer.concat([
        encryptedAmount.nonce,
        encryptedAmount.ciphertext,
      ]),
      proof: Buffer.from(proof),
      actualAmount: lamports,
    })

    // Fee collector is the authority address (treasury)
    // For devnet, fees go to the program authority
    const feeCollector = config.authority

    // Create the instruction
    const instruction = new web3.TransactionInstruction({
      keys: [
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: transferRecordPda, isSigner: false, isWritable: true },
        { pubkey: sender, isSigner: true, isWritable: true },
        { pubkey: params.stealthPubkey, isSigner: false, isWritable: true },
        { pubkey: feeCollector, isSigner: false, isWritable: true },
        { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: instructionData,
    })

    // Build transaction
    const transaction = new Transaction().add(instruction)

    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = sender

    return {
      transaction,
      transferRecord: transferRecordPda,
      ephemeralPubkey: ephemeralKeyPair.publicKey,
    }
  }

  /**
   * Encode shielded transfer instruction data
   *
   * Layout:
   * - 8 bytes: instruction discriminator (from IDL)
   * - 33 bytes: amount_commitment
   * - 32 bytes: stealth_pubkey
   * - 33 bytes: ephemeral_pubkey
   * - 32 bytes: viewing_key_hash
   * - 4 bytes: encrypted_amount length (u32 LE)
   * - variable: encrypted_amount
   * - 4 bytes: proof length (u32 LE)
   * - variable: proof
   * - 8 bytes: actual_amount (u64 LE)
   */
  private encodeShieldedTransferData(args: ShieldedTransferArgs): Buffer {
    // Discriminator from IDL: [191, 130, 5, 127, 124, 187, 238, 188]
    const discriminator = Buffer.from([
      0xbf, 0x82, 0x05, 0x7f, 0x7c, 0xbb, 0xee, 0xbc,
    ])

    // Calculate total buffer size
    const encryptedAmountLen = args.encryptedAmount.length
    const proofLen = args.proof.length
    const totalSize =
      8 + // discriminator
      33 + // amount_commitment
      32 + // stealth_pubkey
      33 + // ephemeral_pubkey
      32 + // viewing_key_hash
      4 + encryptedAmountLen + // encrypted_amount (length prefix + data)
      4 + proofLen + // proof (length prefix + data)
      8 // actual_amount

    const buffer = Buffer.alloc(totalSize)
    let offset = 0

    // Write discriminator
    discriminator.copy(buffer, offset)
    offset += 8

    // Write amount_commitment (33 bytes)
    Buffer.from(args.amountCommitment).copy(buffer, offset)
    offset += 33

    // Write stealth_pubkey (32 bytes)
    args.stealthPubkey.toBuffer().copy(buffer, offset)
    offset += 32

    // Write ephemeral_pubkey (33 bytes)
    Buffer.from(args.ephemeralPubkey).copy(buffer, offset)
    offset += 33

    // Write viewing_key_hash (32 bytes)
    Buffer.from(args.viewingKeyHash).copy(buffer, offset)
    offset += 32

    // Write encrypted_amount (length-prefixed)
    buffer.writeUInt32LE(encryptedAmountLen, offset)
    offset += 4
    args.encryptedAmount.copy(buffer, offset)
    offset += encryptedAmountLen

    // Write proof (length-prefixed)
    buffer.writeUInt32LE(proofLen, offset)
    offset += 4
    args.proof.copy(buffer, offset)
    offset += proofLen

    // Write actual_amount (u64 LE)
    buffer.writeBigUInt64LE(args.actualAmount, offset)

    return buffer
  }

  /**
   * Send a signed transaction
   */
  async sendTransaction(signedTransaction: Transaction): Promise<string> {
    const signature = await this.connection.sendRawTransaction(
      signedTransaction.serialize()
    )

    // Wait for confirmation using new API
    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash()
    await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    })

    return signature
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(transaction: Transaction): Promise<number> {
    const { value } = await this.connection.getFeeForMessage(
      transaction.compileMessage()
    )
    return value ?? 5000 // Default to 5000 lamports if estimation fails
  }

  /**
   * Calculate protocol fee for an amount
   */
  calculateProtocolFee(amount: number, feeBps: number): number {
    return (amount * feeBps) / 10000
  }
}

// ─── Factory Function ──────────────────────────────────────────────────────

let clientInstance: SipPrivacyClient | null = null

/**
 * Get or create the SIP Privacy client
 */
export function getSipPrivacyClient(
  connection: Connection,
  programId?: PublicKey
): SipPrivacyClient {
  if (!clientInstance) {
    clientInstance = new SipPrivacyClient(connection, programId)
  }
  return clientInstance
}

/**
 * Reset the client (useful when changing networks)
 */
export function resetSipPrivacyClient(): void {
  clientInstance = null
}
