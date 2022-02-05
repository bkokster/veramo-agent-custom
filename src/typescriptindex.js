"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const setup_1 = require("../src/veramo/setup");
const pack_message_1 = require("./pack-message");
const app = express_1.default();
const PORT = process.env.PORT || 3001;
app.use(express_1.default.static(path_1.default.resolve(__dirname, '../typescriptclient/build')));
;
async function main() {
    var _a;
    const createOptions = {
        agent: setup_1.agent,
        baseUrl: 'trustfront.herokuapp.com'
    };
    const serverIdentifier = await ((_a = createOptions === null || createOptions === void 0 ? void 0 : createOptions.agent) === null || _a === void 0 ? void 0 : _a.didManagerGetOrCreate({
        provider: 'did:web',
        alias: 'trustfront.herokuapp.com',
        options: {
            keyType: 'Ed25519',
        },
    }));
    const getLocationsWithTimezones = (request, response, next) => {
        let locations = [
            {
                location: 'Germany',
                timezoneName: 'Central European Time',
                timezoneAbbr: 'CET',
                utcOffset: 1
            },
            {
                location: 'China',
                timezoneName: 'China Standard Time',
                timezoneAbbr: 'CST',
                utcOffset: 8
            },
            {
                location: 'Argentina',
                timezoneName: 'Argentina Time',
                timezoneAbbr: 'ART',
                utcOffset: -3
            },
            {
                location: 'Japan',
                timezoneName: 'Japan Standard Time',
                timezoneAbbr: 'JST',
                utcOffset: 9
            }
        ];
        response.status(200).json(locations);
    };
    const siteIdentifier = await setup_1.agent.didManagerFind({
        alias: 'trustfront.herokuapp.com'
    });
    const verificationMethod = siteIdentifier[0].keys.map(key => ({
        id: key.kid,
        controller: siteIdentifier[0].controllerKeyId,
        type: key.type.toString(),
        publicKeyHex: key.publicKeyHex
    }));
    const didDocument = {
        '@context': "https://www.w3.org/ns/did/v1",
        id: siteIdentifier[0].did,
        service: siteIdentifier[0].services,
        controller: siteIdentifier[0].controllerKeyId,
        verificationMethod: verificationMethod,
    };
    const packedMessage = await pack_message_1.packDIDCommMessageLight();
    app.get("/api", (req, res) => {
        console.log(packedMessage);
        res.json({ message: packedMessage });
    });
    app.get("/.well-known/did.json", (req, res) => {
        res.json(didDocument);
    });
    app.get('/timezones', getLocationsWithTimezones);
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.resolve(__dirname, '../typescriptclient/build', 'index.html'));
    });
    app.listen(PORT, () => {
        console.log(`Timezones by location application is running on port ${PORT}.`);
    });
}
main().catch(console.log);
