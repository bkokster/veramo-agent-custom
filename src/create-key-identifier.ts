import { TKeyType } from '@veramo/core'
import { agent } from './veramo/setup'

export async function main() {

  const identity = await agent.didManagerCreate({alias : "firstkey", provider : "did:key", kms : "local", options: {keyType: <TKeyType>'Ed25519',}})
  console.log(`New identity created`)
  console.log(identity)

  const identity2 = await agent.didManagerCreate({alias : "secondkey", provider : "did:key", kms : "local", options: {keyType: <TKeyType>'Ed25519',}})
  console.log(`New identity created`)
  console.log(identity2)

}

main().catch(console.log)