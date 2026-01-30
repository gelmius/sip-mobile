/**
 * Type declarations for @solana-mobile/seed-vault-lib
 *
 * This file resolves the package.json "exports" vs "types" conflict
 * by re-exporting the module's types.
 */

declare module "@solana-mobile/seed-vault-lib" {
  import type { Permission } from "react-native"

  // Errors
  export interface SeedVaultError {
    message: string
  }
  export type ActionFailedError = SeedVaultError
  export type NotModifiedError = SeedVaultError

  // Event Types
  export const SeedVaultEventType: {
    readonly AuthorizeSeedAccess: "SeedAuthorized"
    readonly CreateNewSeed: "NewSeedCreated"
    readonly ImportExistingSeed: "ExistingSeedImported"
    readonly PayloadsSigned: "PayloadsSigned"
    readonly GetPublicKeys: "PublicKeysEvent"
    readonly ContentChange: "SeedVaultContentChange"
    readonly SeedSettingsShown: "SeedSettingsShown"
  }
  export type SeedVaultEventType =
    (typeof SeedVaultEventType)[keyof typeof SeedVaultEventType]

  export interface ISeedVaultEvent {
    __type: SeedVaultEventType
  }

  // Authorize Seed Access
  export type SeedAccessAuthorizedEvent = Readonly<{
    __type: typeof SeedVaultEventType.AuthorizeSeedAccess
    authToken: string
  }> &
    ISeedVaultEvent
  export type AuthorizeSeedAccessEvent =
    | SeedAccessAuthorizedEvent
    | ActionFailedError

  // Create New Seed
  export type NewSeedCreatedEvent = Readonly<{
    __type: typeof SeedVaultEventType.CreateNewSeed
    authToken: string
  }> &
    ISeedVaultEvent
  export type CreateNewSeedEvent = NewSeedCreatedEvent | ActionFailedError

  // Import Existing Seed
  export type ExistingSeedImportedEvent = Readonly<{
    __type: typeof SeedVaultEventType.ImportExistingSeed
    authToken: string
  }> &
    ISeedVaultEvent
  export type ImportExistingSeedEvent =
    | ExistingSeedImportedEvent
    | ActionFailedError

  export type SeedEvent =
    | AuthorizeSeedAccessEvent
    | CreateNewSeedEvent
    | ImportExistingSeedEvent

  // Sign Payloads
  export type SigningResponse = Readonly<{
    signatures: [[]]
    resolvedDerivationPaths: string[]
  }>
  export type PayloadsSignedEvent = Readonly<{
    __type: typeof SeedVaultEventType.PayloadsSigned
    result: SigningResponse[]
  }> &
    ISeedVaultEvent
  export type SignPayloadsEvent = PayloadsSignedEvent | ActionFailedError

  // Get Public Keys
  export type PublicKeyResponse = Readonly<{
    publicKey: []
    publicKeyEncoded: string
    resolvedDerivationPath: string
  }>
  export type GotPublicKeyEvent = Readonly<{
    __type: typeof SeedVaultEventType.GetPublicKeys
    result: PublicKeyResponse[]
  }> &
    ISeedVaultEvent
  export type PublicKeyEvent = GotPublicKeyEvent | ActionFailedError

  // Content Change
  export type SeedVaultContentChangeNotification = Readonly<{
    __type: typeof SeedVaultEventType.ContentChange
    uris: string[]
  }> &
    ISeedVaultEvent
  export type SeedVaultContentChange = SeedVaultContentChangeNotification

  // Show Seed Settings
  export type SeedSettingsShownNotification = Readonly<{
    __type: typeof SeedVaultEventType.SeedSettingsShown
  }> &
    ISeedVaultEvent
  export type SeedSettingsShown = SeedSettingsShownNotification

  export type SeedVaultEvent =
    | AuthorizeSeedAccessEvent
    | CreateNewSeedEvent
    | ImportExistingSeedEvent
    | SignPayloadsEvent
    | PublicKeyEvent
    | SeedSettingsShown

  // Core Types
  export type AuthToken = number
  export type Base64EncodedAddress = string
  export type Base64EncodedSignature = string
  export type Base64EncodedPayload = string
  export type Base64EncodedMessage = Base64EncodedPayload
  export type Base64EncodedTransaction = Base64EncodedPayload
  export type DerivationPath = string

  export type Account = Readonly<{
    id: number
    name: string
    derivationPath: DerivationPath
    publicKeyEncoded: Base64EncodedAddress
  }>

  export const SeedPurpose: {
    readonly SignSolanaTransaction: 0
  }
  export type SeedPurpose = (typeof SeedPurpose)[keyof typeof SeedPurpose]

  export type Seed = Readonly<{
    authToken: AuthToken
    name: string
    purpose: SeedPurpose
  }>

  export type SeedPublicKey = Readonly<{
    publicKey: Uint8Array
    publicKeyEncoded: Base64EncodedAddress
    resolvedDerivationPath: DerivationPath
  }>

  export type SigningRequest = Readonly<{
    payload: Base64EncodedPayload
    requestedSignatures: DerivationPath[]
  }>

  export type SigningResult = Readonly<{
    signatures: Base64EncodedSignature[]
    resolvedDerivationPaths: DerivationPath[]
  }>

  // API Interfaces
  export interface AuthorizeSeedAPI {
    hasUnauthorizedSeeds(): Promise<boolean>
    hasUnauthorizedSeedsForPurpose(purpose: SeedPurpose): Promise<boolean>
    getAuthorizedSeeds(): Promise<Seed[]>
    authorizeNewSeed(): Promise<{ authToken: AuthToken }>
    deauthorizeSeed(authToken: AuthToken): void
  }

  export interface AccountAPI {
    getAccounts(
      authToken: AuthToken,
      filterOnColumn: string,
      value: unknown
    ): Promise<Account[]>
    getUserWallets(authToken: AuthToken): Promise<Account[]>
    updateAccountName(
      authToken: AuthToken,
      accountId: number,
      name?: string
    ): void
    updateAccountIsUserWallet(
      authToken: AuthToken,
      accountId: number,
      isUserWallet: boolean
    ): void
    updateAccountIsValid(
      authToken: AuthToken,
      accountId: number,
      isValid: boolean
    ): void
  }

  export interface CreateNewSeedAPI {
    createNewSeed(): Promise<{ authToken: AuthToken }>
  }

  export interface ImportExistingSeedAPI {
    importExistingSeed(): Promise<{ authToken: AuthToken }>
  }

  export interface PublicKeyAPI {
    getPublicKey(
      authToken: AuthToken,
      derivationPath: DerivationPath
    ): Promise<SeedPublicKey>
    getPublicKeys(
      authToken: AuthToken,
      derivationPaths: DerivationPath[]
    ): Promise<SeedPublicKey[]>
    resolveDerivationPath(derivationPath: DerivationPath): Promise<DerivationPath>
    resolveDerivationPathForPurpose(
      derivationPath: DerivationPath,
      purpose: SeedPurpose
    ): Promise<DerivationPath>
  }

  export interface SignMessagesAPI {
    signMessage(
      authToken: AuthToken,
      derivationPath: DerivationPath,
      message: Base64EncodedMessage
    ): Promise<SigningResult>
    signMessages(
      authToken: AuthToken,
      signingRequests: SigningRequest[]
    ): Promise<SigningResult[]>
  }

  export interface SignTransactionsAPI {
    signTransaction(
      authToken: AuthToken,
      derivationPath: DerivationPath,
      transaction: Base64EncodedTransaction
    ): Promise<SigningResult>
    signTransactions(
      authToken: AuthToken,
      signingRequests: SigningRequest[]
    ): Promise<SigningResult[]>
  }

  export interface SeedVaultAvailabilityAPI {
    isSeedVaultAvailable(allowSimulated: boolean): Promise<boolean>
  }

  export interface ShowSeedSettingsAPI {
    showSeedSettings(authToken: AuthToken): Promise<void>
  }

  export interface SeedVaultAPI
    extends AuthorizeSeedAPI,
      AccountAPI,
      CreateNewSeedAPI,
      ImportExistingSeedAPI,
      PublicKeyAPI,
      SeedVaultAvailabilityAPI,
      SignMessagesAPI,
      SignTransactionsAPI,
      ShowSeedSettingsAPI {}

  // Exports
  export const SeedVaultPermissionAndroid: Permission
  export const SeedVaultPrivilegedPermissionAndroid: Permission
  export function useSeedVault(
    handleSeedVaultEvent: (event: SeedVaultEvent) => void,
    handleContentChange: (event: SeedVaultContentChange) => void
  ): void
  export const SeedVault: SeedVaultAPI
}
