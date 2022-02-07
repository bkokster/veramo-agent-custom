import { agent } from './veramo/setup'

async function main() {
    
  // const identifiers = await agent.resolveDid({didUrl:'did:web:trustfront.herokuapp.com'})
  const identifiers = await agent.resolveDid({didUrl:'did:key:z6MkiaUurwGLk7pPs5jCDc7ihwNumETanwasAPcsim8JEGiK'})
  console.log(identifiers.didDocument);

}

main().catch(console.log)