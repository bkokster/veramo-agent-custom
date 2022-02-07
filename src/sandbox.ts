import { IIdentifier } from "@veramo/core";
import { _ExtendedIKey } from "@veramo/did-comm";
import { send } from "process";
import { agent } from "./veramo/setup";
import {packDIDCommMessageLight} from './pack-message'

async function main(){

  // const id = await agent.didManagerGet({did:'did:web:trustfront.herokuapp.com'})


  // const identifiers = await agent.resolveDid({didUrl:'did:key:z6MkrYivju3WXZFQzs4DWTqbwyfP7gMxiK4EgTAFpPEDQNcb'})
  // console.log('DID Doc')
  // console.log(identifiers.didDocument);

  // const id = await agent.didManagerGet({did:'did:key:z6MkrYivju3WXZFQzs4DWTqbwyfP7gMxiK4EgTAFpPEDQNcb'})
  // console.log('Keys')
  // console.log(id.keys);

    // const d = await agent.didManagerGetOrCreate({'alias':'secondkey'});
    // console.log(d.did)

    // const dummyKey = await agent.keyManagerCreate({
    //   kms: 'local',
    //   type: 'Secp256k1',
    // })

    // const result = await agent.didManagerAddKey({did:'did:web:trustfront.herokuapp.com',key: dummyKey})

//    1.1 check that args.message.from is a managed DID

  // const sender: IIdentifier = await agent.didManagerGet({ did: 'did:web:trustfront.herokuapp.com'  })
  // console.log(sender.keys);

//    1.2 match key agreement keys from DID to managed keys
// const senderKeys: _ExtendedIKey[] = await mapIdentifierKeysToDoc(sender, 'keyAgreement', context)
// try to find a sender key by keyRef, otherwise pick the first one
// let senderKey
// senderKey = senderKeys[0]

      // const didOptions: CreateDefaultDidOptions = {

    //     agent: agent,
    //     baseUrl : 'trustfront.herokuapp.com'

    // }
    // createDefaultDid(didOptions);

  // const did = await agent.didManagerGetByAlias({alias:'trustfront.herokuapp.com'})
  // const did = await agent.didManagerGetOrCreate({'alias':'secondkey'});
//   import { agent } from './veramo/setup';
// import {createDefaultDid, CreateDefaultDidOptions} from './custom-functions'

const packedMessage = await packDIDCommMessageLight();


}
main().catch(console.log)
