"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const custom_functions_1 = require("./custom-functions");
const utils_1 = require("./veramo/did-comm/utils");
const setup_1 = require("./veramo/setup");
async function packDIDCommMessageLight() {
    const context = { agent: setup_1.agent };
    const didDocument = await utils_1.resolveDidOrThrow('did:key:z6MkrYivju3WXZFQzs4DWTqbwyfP7gMxiK4EgTAFpPEDQNcb', context);
    const lightMessage = {
        packing: 'authcrypt',
        type: 'test',
        to: 'did:key:z6MkrYivju3WXZFQzs4DWTqbwyfP7gMxiK4EgTAFpPEDQNcb',
        from: 'did:web:trustfront.herokuapp.com',
        id: 'test',
        body: { hello: 'world' },
        toDID: didDocument
    };
    const message = {
        message: lightMessage,
        packing: 'authcrypt'
    };
    const packedMessageLight = await custom_functions_1.packLight(lightMessage, context);
    const packedMessage = await setup_1.agent.packDIDCommMessage(message);
    const unpackedMessageLight = await setup_1.agent.unpackDIDCommMessage(packedMessageLight);
    const unpackedMessage = await setup_1.agent.unpackDIDCommMessage(packedMessage);
    return packedMessageLight;
}
exports.packDIDCommMessageLight = packDIDCommMessageLight;
