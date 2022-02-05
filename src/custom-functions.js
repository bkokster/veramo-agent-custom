"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const did_comm_1 = require("@veramo/did-comm");
const setup_1 = require("./veramo/setup");
const did_jwt_1 = require("did-jwt");
const u8a = __importStar(require("uint8arrays"));
const utils_1 = require("./veramo/did-comm/utils");
async function mapIdentifierKeysToDoc(identifier, section = 'keyAgreement', context) {
    const didDocument = await utils_1.resolveDidOrThrow(identifier.did, context);
    const keyAgreementKeys = await utils_1.dereferenceDidKeys(didDocument, section, context);
    let localKeys = identifier.keys.filter(utils_1.isDefined);
    if (section === 'keyAgreement') {
        localKeys = utils_1.convertIdentifierEncryptionKeys(identifier);
    }
    else {
        localKeys = utils_1.compressIdentifierSecp256k1Keys(identifier);
    }
    const extendedKeys = keyAgreementKeys
        .map((verificationMethod) => {
        const localKey = localKeys.find((localKey) => localKey.publicKeyHex === verificationMethod.publicKeyHex);
        if (localKey) {
            const { meta, ...localProps } = localKey;
            return { ...localProps, meta: { ...meta, verificationMethod } };
        }
        else {
            return null;
        }
    })
        .filter(utils_1.isDefined);
    return extendedKeys;
}
async function packLight(args, context) {
    let senderECDH = null;
    let protectedHeader = {
        typ: did_comm_1.DIDCommMessageMediaType.ENCRYPTED,
    };
    if (!(args === null || args === void 0 ? void 0 : args.from)) {
        throw new Error(`invalid_argument: cannot create authenticated did-comm message without a 'from' field`);
    }
    const sender = await setup_1.agent.didManagerGet({ did: args === null || args === void 0 ? void 0 : args.from });
    const senderKeys = await mapIdentifierKeysToDoc(sender, 'keyAgreement', context);
    let senderKey;
    senderKey = senderKeys[0];
    if (senderKey) {
        senderECDH = utils_1.createEcdhWrapper(senderKey.kid, context);
        protectedHeader = { ...protectedHeader, skid: senderKey.meta.verificationMethod.id };
    }
    else {
        throw new Error(`key_not_found: could not map an agent key to an skid for ${args === null || args === void 0 ? void 0 : args.from}`);
    }
    const didDocument = args.toDID;
    const keyAgreementKeys = await utils_1.dereferenceDidKeys(didDocument, 'keyAgreement', context);
    if (keyAgreementKeys.length === 0) {
        throw new Error(`key_not_found: no key agreement keys found for recipient ${args === null || args === void 0 ? void 0 : args.to}`);
    }
    const recipients = keyAgreementKeys
        .map((pk) => ({ kid: pk.id, publicKeyBytes: u8a.fromString(pk.publicKeyHex, 'base16') }))
        .filter(utils_1.isDefined);
    if (recipients.length === 0) {
        throw new Error(`not_supported: no compatible key agreement keys found for recipient ${args === null || args === void 0 ? void 0 : args.to}`);
    }
    const encrypters = recipients.map((recipient) => {
        if (args.packing === 'authcrypt') {
            return did_jwt_1.createAuthEncrypter(recipient.publicKeyBytes, senderECDH, { kid: recipient.kid });
        }
        else {
            return did_jwt_1.createAnonEncrypter(recipient.publicKeyBytes, { kid: recipient.kid });
        }
    }).filter(utils_1.isDefined);
    if (encrypters.length === 0) {
        throw new Error(`not_supported: could not create suitable encryption for recipient ${args === null || args === void 0 ? void 0 : args.to}`);
    }
    const messageBytes = u8a.fromString(JSON.stringify(args), 'utf-8');
    const jwe = await did_jwt_1.createJWE(messageBytes, encrypters, protectedHeader);
    const message = JSON.stringify(jwe);
    return { message };
}
exports.packLight = packLight;
var parse = require('url-parse');
async function createDefaultDid(options) {
    var _a, _b, _c;
    if (!options.agent)
        throw Error('[createDefaultDid] Agent is required');
    if (!options.baseUrl)
        throw Error('[createDefaultDid] baseUrl is required');
    const hostname = parse(options.baseUrl).hostname;
    const serverIdentifier = await ((_a = options === null || options === void 0 ? void 0 : options.agent) === null || _a === void 0 ? void 0 : _a.didManagerGetOrCreate({
        provider: 'did:web',
        alias: hostname,
        options: {
            keyType: 'Ed25519',
        },
    }));
    console.log('🆔', serverIdentifier === null || serverIdentifier === void 0 ? void 0 : serverIdentifier.did);
    if (serverIdentifier && options.messagingServiceEndpoint) {
        const messagingServiceEndpoint = options.baseUrl + options.messagingServiceEndpoint;
        console.log('📨 Messaging endpoint', messagingServiceEndpoint);
        await ((_b = options === null || options === void 0 ? void 0 : options.agent) === null || _b === void 0 ? void 0 : _b.didManagerAddService({
            did: serverIdentifier.did,
            service: {
                id: serverIdentifier.did + '#msg',
                type: 'Messaging',
                description: 'Handles incoming POST messages',
                serviceEndpoint: messagingServiceEndpoint,
            },
        }));
        await ((_c = options === null || options === void 0 ? void 0 : options.agent) === null || _c === void 0 ? void 0 : _c.didManagerAddService({
            did: serverIdentifier.did,
            service: {
                id: serverIdentifier.did + '#msg-didcomm',
                type: 'DIDCommMessaging',
                description: 'Handles incoming DIDComm messages',
                serviceEndpoint: messagingServiceEndpoint,
            },
        }));
    }
}
exports.createDefaultDid = createDefaultDid;
