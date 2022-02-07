import { agent } from './veramo/setup'

async function main() {
    
  // const identifiers = await agent.resolveDid({didUrl:'did:web:trustfront.herokuapp.com'})
  const identifiers = await agent.resolveDid({didUrl:'did:web:trustfront.herokuapp.com'})
  console.log(identifiers.didDocument);

}

main().catch(console.log)