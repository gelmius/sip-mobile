/**
 * Anchor Types Tests
 *
 * Tests for PDA derivation and type definitions.
 */

import { describe, it, expect } from "vitest"
import { PublicKey } from "@solana/web3.js"
import {
  SIP_PRIVACY_PROGRAM_ID,
  getConfigPda,
  getTransferRecordPda,
  getNullifierPda,
} from "@/lib/anchor/types"

describe("Anchor Types", () => {
  describe("SIP_PRIVACY_PROGRAM_ID", () => {
    it("should be a valid PublicKey", () => {
      expect(SIP_PRIVACY_PROGRAM_ID).toBeInstanceOf(PublicKey)
    })

    it("should match expected program ID", () => {
      expect(SIP_PRIVACY_PROGRAM_ID.toBase58()).toBe(
        "S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at"
      )
    })
  })

  describe("getConfigPda", () => {
    it("should derive a valid PDA", () => {
      const [pda, bump] = getConfigPda(SIP_PRIVACY_PROGRAM_ID)

      expect(pda).toBeInstanceOf(PublicKey)
      expect(typeof bump).toBe("number")
      expect(bump).toBeGreaterThanOrEqual(0)
      expect(bump).toBeLessThanOrEqual(255)
    })

    it("should be deterministic", () => {
      const [pda1, bump1] = getConfigPda(SIP_PRIVACY_PROGRAM_ID)
      const [pda2, bump2] = getConfigPda(SIP_PRIVACY_PROGRAM_ID)

      expect(pda1.toBase58()).toBe(pda2.toBase58())
      expect(bump1).toBe(bump2)
    })

    it("should derive different PDAs for different programs", () => {
      const program1 = SIP_PRIVACY_PROGRAM_ID
      const program2 = new PublicKey("11111111111111111111111111111111")

      const [pda1] = getConfigPda(program1)
      const [pda2] = getConfigPda(program2)

      expect(pda1.toBase58()).not.toBe(pda2.toBase58())
    })

    it("should match expected config PDA for devnet", () => {
      const [pda] = getConfigPda(SIP_PRIVACY_PROGRAM_ID)
      // This is the actual config PDA on devnet
      expect(pda.toBase58()).toBe("BVawZkppFewygA5nxdrLma4ThKx8Th7bW4KTCkcWTZwZ")
    })
  })

  describe("getTransferRecordPda", () => {
    const sender = new PublicKey("S1P6j1yeTm6zkewQVeihrTZvmfoHABRkHDhabWTuWMd")

    it("should derive a valid PDA", () => {
      const [pda, bump] = getTransferRecordPda(sender, 0n, SIP_PRIVACY_PROGRAM_ID)

      expect(pda).toBeInstanceOf(PublicKey)
      expect(typeof bump).toBe("number")
      expect(bump).toBeGreaterThanOrEqual(0)
      expect(bump).toBeLessThanOrEqual(255)
    })

    it("should be deterministic for same inputs", () => {
      const [pda1, bump1] = getTransferRecordPda(sender, 5n, SIP_PRIVACY_PROGRAM_ID)
      const [pda2, bump2] = getTransferRecordPda(sender, 5n, SIP_PRIVACY_PROGRAM_ID)

      expect(pda1.toBase58()).toBe(pda2.toBase58())
      expect(bump1).toBe(bump2)
    })

    it("should derive different PDAs for different transfer indices", () => {
      const [pda1] = getTransferRecordPda(sender, 0n, SIP_PRIVACY_PROGRAM_ID)
      const [pda2] = getTransferRecordPda(sender, 1n, SIP_PRIVACY_PROGRAM_ID)
      const [pda3] = getTransferRecordPda(sender, 100n, SIP_PRIVACY_PROGRAM_ID)

      expect(pda1.toBase58()).not.toBe(pda2.toBase58())
      expect(pda2.toBase58()).not.toBe(pda3.toBase58())
      expect(pda1.toBase58()).not.toBe(pda3.toBase58())
    })

    it("should derive different PDAs for different senders", () => {
      const sender2 = new PublicKey("S1P9WhBSbAGGatvrVE4TRBZfWpbG96U26zksy2TQj8q")

      const [pda1] = getTransferRecordPda(sender, 0n, SIP_PRIVACY_PROGRAM_ID)
      const [pda2] = getTransferRecordPda(sender2, 0n, SIP_PRIVACY_PROGRAM_ID)

      expect(pda1.toBase58()).not.toBe(pda2.toBase58())
    })

    it("should handle large transfer indices", () => {
      const largeIndex = BigInt("18446744073709551615") // max u64

      const [pda, bump] = getTransferRecordPda(sender, largeIndex, SIP_PRIVACY_PROGRAM_ID)

      expect(pda).toBeInstanceOf(PublicKey)
      expect(bump).toBeGreaterThanOrEqual(0)
    })
  })

  describe("getNullifierPda", () => {
    it("should derive a valid PDA from nullifier hash", () => {
      const nullifier = new Uint8Array(32).fill(0xab)

      const [pda, bump] = getNullifierPda(nullifier, SIP_PRIVACY_PROGRAM_ID)

      expect(pda).toBeInstanceOf(PublicKey)
      expect(typeof bump).toBe("number")
      expect(bump).toBeGreaterThanOrEqual(0)
      expect(bump).toBeLessThanOrEqual(255)
    })

    it("should be deterministic for same nullifier", () => {
      const nullifier = new Uint8Array(32).fill(0xcd)

      const [pda1, bump1] = getNullifierPda(nullifier, SIP_PRIVACY_PROGRAM_ID)
      const [pda2, bump2] = getNullifierPda(nullifier, SIP_PRIVACY_PROGRAM_ID)

      expect(pda1.toBase58()).toBe(pda2.toBase58())
      expect(bump1).toBe(bump2)
    })

    it("should derive different PDAs for different nullifiers", () => {
      const nullifier1 = new Uint8Array(32).fill(0x01)
      const nullifier2 = new Uint8Array(32).fill(0x02)

      const [pda1] = getNullifierPda(nullifier1, SIP_PRIVACY_PROGRAM_ID)
      const [pda2] = getNullifierPda(nullifier2, SIP_PRIVACY_PROGRAM_ID)

      expect(pda1.toBase58()).not.toBe(pda2.toBase58())
    })

    it("should handle all-zero nullifier", () => {
      const nullifier = new Uint8Array(32).fill(0)

      const [pda, bump] = getNullifierPda(nullifier, SIP_PRIVACY_PROGRAM_ID)

      expect(pda).toBeInstanceOf(PublicKey)
      expect(bump).toBeGreaterThanOrEqual(0)
    })

    it("should handle all-ones nullifier", () => {
      const nullifier = new Uint8Array(32).fill(0xff)

      const [pda, bump] = getNullifierPda(nullifier, SIP_PRIVACY_PROGRAM_ID)

      expect(pda).toBeInstanceOf(PublicKey)
      expect(bump).toBeGreaterThanOrEqual(0)
    })
  })

  describe("PDA uniqueness", () => {
    it("should generate unique PDAs across different derivation functions", () => {
      const sender = new PublicKey("S1P6j1yeTm6zkewQVeihrTZvmfoHABRkHDhabWTuWMd")
      const nullifier = new Uint8Array(32).fill(0x42)

      const [configPda] = getConfigPda(SIP_PRIVACY_PROGRAM_ID)
      const [transferPda] = getTransferRecordPda(sender, 0n, SIP_PRIVACY_PROGRAM_ID)
      const [nullifierPda] = getNullifierPda(nullifier, SIP_PRIVACY_PROGRAM_ID)

      const pdaSet = new Set([
        configPda.toBase58(),
        transferPda.toBase58(),
        nullifierPda.toBase58(),
      ])

      expect(pdaSet.size).toBe(3) // All unique
    })
  })
})
