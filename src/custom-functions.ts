import { DIDCommMessageMediaType, IDIDCommMessage, IPackedDIDCommMessage, _ExtendedIKey, _NormalizedVerificationMethod } from '@veramo/did-comm';
import { agent } from './veramo/setup'
import {ECDH,Encrypter,createAuthEncrypter,createAnonEncrypter,createJWE} from 'did-jwt'
import { DIDDocument, DIDDocumentSection, IAgentContext, IDIDManager, IIdentifier, IKeyManager, IResolver } from '@veramo/core';
import * as u8a from 'uint8arrays'
import { resolveDidOrThrow, dereferenceDidKeys, isDefined, convertIdentifierEncryptionKeys, compressIdentifierSecp256k1Keys, createEcdhWrapper } from './veramo/did-comm/utils';

async function mapIdentifierKeysToDoc(
    identifier: IIdentifier,
    section: DIDDocumentSection = 'keyAgreement',
    context: IAgentContext<IResolver>,
  ): Promise<_ExtendedIKey[]> {
    const didDocument = await resolveDidOrThrow(identifier.did, context)
  
    // dereference all key agreement keys from DID document and normalize
    const keyAgreementKeys: _NormalizedVerificationMethod[] = await dereferenceDidKeys(
      didDocument,
      section,
      context,
    )
  
    let localKeys = identifier.keys.filter(isDefined)
    if (section === 'keyAgreement') {
      localKeys = convertIdentifierEncryptionKeys(identifier)
    } else {
      localKeys = compressIdentifierSecp256k1Keys(identifier)
    }
    // finally map the didDocument keys to the identifier keys by comparing `publicKeyHex`
    const extendedKeys: _ExtendedIKey[] = keyAgreementKeys
      .map((verificationMethod) => {
        const localKey = localKeys.find((localKey) => localKey.publicKeyHex === verificationMethod.publicKeyHex)
        if (localKey) {
          const { meta, ...localProps } = localKey
          return { ...localProps, meta: { ...meta, verificationMethod } }
        } else {
          return null
        }
      })
      .filter(isDefined)
  
    return extendedKeys

}
  
export interface IDIDCommMessageLight extends IDIDCommMessage {

    packing: string;
    toDID: DIDDocument;

}

export async function packLight(
    
        args: IDIDCommMessageLight,
        context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
    
    ): Promise<IPackedDIDCommMessage> {


    // 1. check if args.packing requires authentication and map sender key to skid
    let senderECDH: ECDH | null = null

        // let keyRef: string | undefined = args.keyRef
        let protectedHeader: {
        skid?: string
        typ: string
        } = {
        typ: DIDCommMessageMediaType.ENCRYPTED,
        }

      if (!args?.from) {
        throw new Error(
          `invalid_argument: cannot create authenticated did-comm message without a 'from' field`,
        )
      }
      //    1.1 check that args.message.from is a managed DID
      const sender: IIdentifier = await agent.didManagerGet({ did: args?.from })
      //    1.2 match key agreement keys from DID to managed keys
      const senderKeys: _ExtendedIKey[] = await mapIdentifierKeysToDoc(sender, 'keyAgreement', context)
      // try to find a sender key by keyRef, otherwise pick the first one
      let senderKey
      senderKey = senderKeys[0]
      //    1.3 use kid from DID doc(skid) + local IKey to bundle a sender key
      if (senderKey) {
        senderECDH = createEcdhWrapper(senderKey.kid, context)
        protectedHeader = { ...protectedHeader, skid: senderKey.meta.verificationMethod.id }
      } else {
        throw new Error(`key_not_found: could not map an agent key to an skid for ${args?.from}`)
      }
      

    // 2. resolve DID for args.message.to
    const didDocument = args.toDID

    // 2.1 extract all recipient key agreement keys and normalize them
    const keyAgreementKeys: _NormalizedVerificationMethod[] = await dereferenceDidKeys(
      didDocument,
      'keyAgreement',
      context,
    )

    if (keyAgreementKeys.length === 0) {
      throw new Error(`key_not_found: no key agreement keys found for recipient ${args?.to}`)
    }

    // 2.2 get public key bytes and key IDs for supported recipient keys
    const recipients: { kid: string; publicKeyBytes: Uint8Array }[] = keyAgreementKeys
      .map((pk) => ({ kid: pk.id, publicKeyBytes: u8a.fromString(pk.publicKeyHex!, 'base16') }))
      .filter(isDefined)

    if (recipients.length === 0) {
      throw new Error(`not_supported: no compatible key agreement keys found for recipient ${args?.to}`)
    }

    // 3. create Encrypter for each recipient
    const encrypters: Encrypter[] = recipients.map((recipient) => {
      if (args.packing === 'authcrypt') {
        return createAuthEncrypter(recipient.publicKeyBytes, <ECDH>senderECDH, { kid: recipient.kid })
      } else {
        return createAnonEncrypter(recipient.publicKeyBytes, { kid: recipient.kid })
      }
    }).filter(isDefined)

    if (encrypters.length === 0) {
      throw new Error(`not_supported: could not create suitable encryption for recipient ${args?.to}`)
    }

    // 4. createJWE
    const messageBytes = u8a.fromString(JSON.stringify(args), 'utf-8')
    const jwe = await createJWE(messageBytes, encrypters, protectedHeader)
    const message = JSON.stringify(jwe)
    return { message }

}