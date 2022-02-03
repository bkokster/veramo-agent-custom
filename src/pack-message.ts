import { DIDDocument, IAgentContext, IDIDManager, IKeyManager, IResolver } from '@veramo/core'
import { IPackDIDCommMessageArgs } from '@veramo/did-comm'
import { IDIDCommMessageLight, packLight } from './custom-functions'
import { resolveDidOrThrow } from './veramo/did-comm/utils'
import { agent } from './veramo/setup'

async function main() {

  const context : IAgentContext<IDIDManager & IKeyManager & IResolver> = {agent: agent}
  const didDocument: DIDDocument = await resolveDidOrThrow('did:key:z6MkrYivju3WXZFQzs4DWTqbwyfP7gMxiK4EgTAFpPEDQNcb', context)

  const lightMessage : IDIDCommMessageLight = {
      
    packing:'authcrypt',  
    type: 'test',
    to: 'did:key:z6MkrYivju3WXZFQzs4DWTqbwyfP7gMxiK4EgTAFpPEDQNcb',
    from: 'did:key:z6MkiaUurwGLk7pPs5jCDc7ihwNumETanwasAPcsim8JEGiK',
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

  // console.log(`Light Packed Message`)
  // console.log(packedMessage)

  console.log(`Unpacked Message Light`)
  console.log(unpackedMessageLight)

  console.log(`Unpacked Message`)
  console.log(unpackedMessage)

}

main().catch(console.log)