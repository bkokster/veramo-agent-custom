import { agent } from './veramo/setup'

async function main() {
    

  var argv = require('minimist')(process.argv.slice(2));
  console.dir(argv);
  console.log(argv.did);
  // const identifiers = await agent.resolveDid({didUrl:'did:web:trustfront.herokuapp.com'})
  const identifiers = await agent.resolveDid({didUrl:argv.did})
  console.log(identifiers.didDocument);

}

main().catch(console.log)