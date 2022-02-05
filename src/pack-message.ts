import { DIDDocument, IAgentContext, IDIDManager, IKeyManager, IResolver } from '@veramo/core'
import { IPackDIDCommMessageArgs } from '@veramo/did-comm'
import { createDefaultDid, IDIDCommMessageLight, packLight } from './custom-functions'
import { resolveDidOrThrow } from './veramo/did-comm/utils'
import { agent } from './veramo/setup'

export async function packDIDCommMessageLight() {

  const context : IAgentContext<IDIDManager & IKeyManager & IResolver> = {agent: agent}
  const didDocument: DIDDocument = await resolveDidOrThrow('did:key:z6MkrYivju3WXZFQzs4DWTqbwyfP7gMxiK4EgTAFpPEDQNcb', context)

  const lightMessage : IDIDCommMessageLight = {
      
    packing:'authcrypt',  
    type: 'test',
    to: 'did:key:z6MkrYivju3WXZFQzs4DWTqbwyfP7gMxiK4EgTAFpPEDQNcb',
    from: 'did:web:trustfront.herokuapp.com',
    id: 'test',
    body: { hello: 'world' },
    toDID: didDocument

  }

  const message : IPackDIDCommMessageArgs = {

    message: lightMessage,
    packing: 'authcrypt'

  }
  
  const packedMessageLight = await packLight(lightMessage,context)
  const packedMessage = await agent.packDIDCommMessage(message)

  const unpackedMessageLight = await agent.unpackDIDCommMessage(packedMessageLight)
  const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)

  return packedMessageLight;



  // console.log(`Light Packed Message`)
  // console.log(packedMessage)

  // console.log(`Unpacked Message Light`)
  // console.log(unpackedMessageLight)

  // console.log(`Unpacked Message`)
  // console.log(unpackedMessage)

}

// packDIDCommMessageLight().catch(console.log)