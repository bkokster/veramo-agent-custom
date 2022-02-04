import { agent } from "./veramo/setup";

async function main(){

    const d = await agent.didManagerGetOrCreate({'alias':'secondkey'});
    console.log(d.did)


      // const didOptions: CreateDefaultDidOptions = {

    //     agent: agent,
    //     baseUrl : 'trustfront.herokuapp.com'

    // }
    // createDefaultDid(didOptions);

  // const did = await agent.didManagerGetByAlias({alias:'trustfront.herokuapp.com'})
  // const did = await agent.didManagerGetOrCreate({'alias':'secondkey'});
//   import { agent } from './veramo/setup';
// import {createDefaultDid, CreateDefaultDidOptions} from './custom-functions'

}


main().catch(console.log)
