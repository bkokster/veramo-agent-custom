import {agent} from './veramo/setup'

export async function main(){

    var argv = require('minimist')(process.argv.slice(2));
    console.dir(argv);
    console.log(argv.did);

    const newKey = await agent.keyManagerCreate({
        kms: 'local',
        type: 'X25519',
      })

    const result = await agent.didManagerAddKey({
    did: 'did:ethr:0x02bfaf8b44eb0b86c1c0559e0c95787c214934e794cc17e98bb0ede9d95fdc5b60',
    key: newKey,
    })

    console.log('-------------Key Add Result--------------------')
    console.log(result)
    console.log('-------------Key Add Result--------------------')
}
main()