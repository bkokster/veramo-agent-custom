"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ed25519_1 = require("@stablelib/ed25519");
const signing_key_1 = require("@ethersproject/signing-key");
const did_resolver_1 = require("did-resolver");
const u8a = __importStar(require("uint8arrays"));
function bytesToBase64url(b) {
    return u8a.toString(b, 'base64url');
}
exports.bytesToBase64url = bytesToBase64url;
function base64ToBytes(s) {
    const inputBase64Url = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return u8a.fromString(inputBase64Url, 'base64url');
}
exports.base64ToBytes = base64ToBytes;
function bytesToBase64(b) {
    return u8a.toString(b, 'base64pad');
}
exports.bytesToBase64 = bytesToBase64;
function encodeBase64url(s) {
    return bytesToBase64url(u8a.fromString(s));
}
exports.encodeBase64url = encodeBase64url;
function decodeBase64url(s) {
    return u8a.toString(base64ToBytes(s));
}
exports.decodeBase64url = decodeBase64url;
function encodeJoseBlob(payload) {
    return u8a.toString(u8a.fromString(JSON.stringify(payload), 'utf-8'), 'base64url');
}
exports.encodeJoseBlob = encodeJoseBlob;
function decodeJoseBlob(blob) {
    return JSON.parse(u8a.toString(u8a.fromString(blob, 'base64url'), 'utf-8'));
}
exports.decodeJoseBlob = decodeJoseBlob;
function isDefined(arg) {
    return arg && typeof arg !== 'undefined';
}
exports.isDefined = isDefined;
function createEcdhWrapper(secretKeyRef, context) {
    return async (theirPublicKey) => {
        if (theirPublicKey.length !== 32) {
            throw new Error('invalid_argument: incorrect publicKey key length for X25519');
        }
        const publicKey = { type: 'X25519', publicKeyHex: u8a.toString(theirPublicKey, 'base16') };
        const shared = await context.agent.keyManagerSharedSecret({ secretKeyRef, publicKey });
        return u8a.fromString(shared, 'base16');
    };
}
exports.createEcdhWrapper = createEcdhWrapper;
async function extractSenderEncryptionKey(jwe, context) {
    let senderKey = null;
    const protectedHeader = decodeJoseBlob(jwe.protected);
    if (typeof protectedHeader.skid === 'string') {
        const senderDoc = await resolveDidOrThrow(protectedHeader.skid, context);
        const sKey = (await context.agent.getDIDComponentById({
            didDocument: senderDoc,
            didUrl: protectedHeader.skid,
            section: 'keyAgreement',
        }));
        if (!['Ed25519VerificationKey2018', 'X25519KeyAgreementKey2019'].includes(sKey.type)) {
            throw new Error(`not_supported: sender key of type ${sKey.type} is not supported`);
        }
        let publicKeyHex = convertToPublicKeyHex(sKey, true);
        senderKey = u8a.fromString(publicKeyHex, 'base16');
    }
    return senderKey;
}
exports.extractSenderEncryptionKey = extractSenderEncryptionKey;
async function extractManagedRecipients(jwe, context) {
    const parsedDIDs = (jwe.recipients || [])
        .map((recipient) => {
        var _a, _b;
        const kid = (_a = recipient === null || recipient === void 0 ? void 0 : recipient.header) === null || _a === void 0 ? void 0 : _a.kid;
        const did = (_b = did_resolver_1.parse(kid || '')) === null || _b === void 0 ? void 0 : _b.did;
        if (kid && did) {
            return { recipient, kid, did };
        }
        else {
            return null;
        }
    })
        .filter(isDefined);
    let managedRecipients = (await Promise.all(parsedDIDs.map(async ({ recipient, kid, did }) => {
        try {
            const identifier = await context.agent.didManagerGet({ did });
            return { recipient, kid, identifier };
        }
        catch (e) {
            return null;
        }
    }))).filter(isDefined);
    return managedRecipients;
}
exports.extractManagedRecipients = extractManagedRecipients;
function convertIdentifierEncryptionKeys(identifier) {
    return identifier.keys
        .map((key) => {
        if (key.type === 'Ed25519') {
            const publicBytes = u8a.fromString(key.publicKeyHex, 'base16');
            key.publicKeyHex = u8a.toString(ed25519_1.convertPublicKeyToX25519(publicBytes), 'base16');
            if (key.privateKeyHex) {
                const privateBytes = u8a.fromString(key.privateKeyHex);
                key.privateKeyHex = u8a.toString(ed25519_1.convertSecretKeyToX25519(privateBytes), 'base16');
            }
            key.type = 'X25519';
        }
        else if (key.type !== 'X25519') {
            return null;
        }
        return key;
    })
        .filter(isDefined);
}
exports.convertIdentifierEncryptionKeys = convertIdentifierEncryptionKeys;
function compressIdentifierSecp256k1Keys(identifier) {
    return identifier.keys
        .map((key) => {
        if (key.type === 'Secp256k1') {
            const publicBytes = u8a.fromString(key.publicKeyHex, 'base16');
            const compressedKey = signing_key_1.computePublicKey(publicBytes, true).substring(2);
            key.publicKeyHex = compressedKey;
        }
        return key;
    })
        .filter(isDefined);
}
exports.compressIdentifierSecp256k1Keys = compressIdentifierSecp256k1Keys;
async function mapRecipientsToLocalKeys(managedKeys, context) {
    const potentialKeys = await Promise.all(managedKeys.map(async ({ recipient, kid, identifier }) => {
        const identifierKeys = await mapIdentifierKeysToDoc(identifier, 'keyAgreement', context);
        const localKey = identifierKeys.find((key) => key.meta.verificationMethod.id === kid);
        if (localKey) {
            return { localKeyRef: localKey.kid, recipient };
        }
        else {
            return null;
        }
    }));
    const localKeys = potentialKeys.filter(isDefined);
    return localKeys;
}
exports.mapRecipientsToLocalKeys = mapRecipientsToLocalKeys;
async function mapIdentifierKeysToDoc(identifier, section = 'keyAgreement', context) {
    const didDocument = await resolveDidOrThrow(identifier.did, context);
    const keyAgreementKeys = await dereferenceDidKeys(didDocument, section, context);
    let localKeys = identifier.keys.filter(isDefined);
    if (section === 'keyAgreement') {
        localKeys = convertIdentifierEncryptionKeys(identifier);
    }
    else {
        localKeys = compressIdentifierSecp256k1Keys(identifier);
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
        .filter(isDefined);
    return extendedKeys;
}
exports.mapIdentifierKeysToDoc = mapIdentifierKeysToDoc;
async function resolveDidOrThrow(didUrl, context) {
    var _a, _b;
    const docResult = await context.agent.resolveDid({ didUrl: didUrl });
    const err = (_a = docResult === null || docResult === void 0 ? void 0 : docResult.didResolutionMetadata) === null || _a === void 0 ? void 0 : _a.error;
    const msg = (_b = docResult === null || docResult === void 0 ? void 0 : docResult.didResolutionMetadata) === null || _b === void 0 ? void 0 : _b.message;
    const didDocument = docResult.didDocument;
    if (!isDefined(didDocument) || err) {
        throw new Error(`not_found: could not resolve DID document for '${didUrl}': ${err} ${msg}`);
    }
    return didDocument;
}
exports.resolveDidOrThrow = resolveDidOrThrow;
async function dereferenceDidKeys(didDocument, section = 'keyAgreement', context) {
    const convert = section === 'keyAgreement';
    if (section === 'service') {
        return [];
    }
    return (await Promise.all((didDocument[section] || []).map(async (key) => {
        if (typeof key === 'string') {
            try {
                return (await context.agent.getDIDComponentById({
                    didDocument,
                    didUrl: key,
                    section,
                }));
            }
            catch (e) {
                return null;
            }
        }
        else {
            return key;
        }
    })))
        .filter(isDefined)
        .map((key) => {
        const hexKey = convertToPublicKeyHex(key, convert);
        const { publicKeyHex, publicKeyBase58, publicKeyBase64, publicKeyJwk, ...keyProps } = key;
        const newKey = { ...keyProps, publicKeyHex: hexKey };
        if (convert && 'Ed25519VerificationKey2018' === newKey.type) {
            newKey.type = 'X25519KeyAgreementKey2019';
        }
        return newKey;
    })
        .filter((key) => key.publicKeyHex.length > 0);
}
exports.dereferenceDidKeys = dereferenceDidKeys;
function convertToPublicKeyHex(pk, convert) {
    let keyBytes;
    if (pk.publicKeyHex) {
        keyBytes = u8a.fromString(pk.publicKeyHex, 'base16');
    }
    else if (pk.publicKeyBase58) {
        keyBytes = u8a.fromString(pk.publicKeyBase58, 'base58btc');
    }
    else if (pk.publicKeyBase64) {
        keyBytes = u8a.fromString(pk.publicKeyBase64, 'base64pad');
    }
    else
        return '';
    if (convert) {
        if (['Ed25519', 'Ed25519VerificationKey2018'].includes(pk.type)) {
            keyBytes = ed25519_1.convertPublicKeyToX25519(keyBytes);
        }
        else if (!['X25519', 'X25519KeyAgreementKey2019'].includes(pk.type)) {
            return '';
        }
    }
    return u8a.toString(keyBytes, 'base16');
}
