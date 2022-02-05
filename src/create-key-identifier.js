"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("./veramo/setup");
async function main() {
    const identity = await setup_1.agent.didManagerCreate({ alias: "firstkey", provider: "did:key", kms: "local", options: { keyType: 'Ed25519', } });
    console.log(`New identity created`);
    console.log(identity);
    const identity2 = await setup_1.agent.didManagerCreate({ alias: "secondkey", provider: "did:key", kms: "local", options: { keyType: 'Ed25519', } });
    console.log(`New identity created`);
    console.log(identity2);
}
exports.main = main;
main().catch(console.log);
