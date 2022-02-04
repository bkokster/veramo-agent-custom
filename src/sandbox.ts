import { agent } from "./veramo/setup";

async function main(){

    const d = await agent.didManagerGetOrCreate({'alias':'secondkey'});
    console.log(d.did)


}


main().catch(console.log)
