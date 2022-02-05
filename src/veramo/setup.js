"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@veramo/core");
const did_manager_1 = require("@veramo/did-manager");
const did_provider_ethr_1 = require("@veramo/did-provider-ethr");
const did_provider_web_1 = require("@veramo/did-provider-web");
const did_provider_key_1 = require("@veramo/did-provider-key");
const key_manager_1 = require("@veramo/key-manager");
const kms_local_1 = require("@veramo/kms-local");
const did_resolver_1 = require("@veramo/did-resolver");
const did_resolver_2 = require("did-resolver");
const ethr_did_resolver_1 = require("ethr-did-resolver");
const web_did_resolver_1 = require("web-did-resolver");
const key_did_resolver_1 = require("key-did-resolver");
const data_store_1 = require("@veramo/data-store");
const typeorm_1 = require("typeorm");
const DATABASE_FILE = 'database.sqlite';
const INFURA_PROJECT_ID = 'b721974ba86542ffaffc0fae2de71c6f';
const KMS_SECRET_KEY = 'abda812ffc49b48b3f6a7fd335b43fcb6ef1dcfb4cd5ababca5a7ae3a2c3fcad';
const did_comm_1 = require("@veramo/did-comm");
const dbConnection = typeorm_1.createConnection({
    type: 'sqlite',
    database: DATABASE_FILE,
    synchronize: false,
    migrations: data_store_1.migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: data_store_1.Entities,
});
exports.agent = core_1.createAgent({
    plugins: [
        new key_manager_1.KeyManager({
            store: new data_store_1.KeyStore(dbConnection),
            kms: {
                local: new kms_local_1.KeyManagementSystem(new data_store_1.PrivateKeyStore(dbConnection, new kms_local_1.SecretBox(KMS_SECRET_KEY))),
            },
        }),
        new did_manager_1.DIDManager({
            store: new data_store_1.DIDStore(dbConnection),
            defaultProvider: 'did:ethr:rinkeby',
            providers: {
                'did:ethr:rinkeby': new did_provider_ethr_1.EthrDIDProvider({
                    defaultKms: 'local',
                    network: 'rinkeby',
                    rpcUrl: 'https://rinkeby.infura.io/v3/' + INFURA_PROJECT_ID,
                }),
                'did:web': new did_provider_web_1.WebDIDProvider({
                    defaultKms: 'local',
                }),
                'did:key': new did_provider_key_1.KeyDIDProvider({
                    defaultKms: 'local',
                }),
            },
        }),
        new did_resolver_1.DIDResolverPlugin({
            resolver: new did_resolver_2.Resolver({
                ...ethr_did_resolver_1.getResolver({ infuraProjectId: INFURA_PROJECT_ID }),
                ...web_did_resolver_1.getResolver(),
                ...key_did_resolver_1.getResolver()
            }),
        }),
        new did_comm_1.DIDComm()
    ],
});
