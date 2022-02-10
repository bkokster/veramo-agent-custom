// Core interfaces
import { createAgent, IDIDManager, IResolver, IDataStore, IKeyManager } from '@veramo/core'

// Core identity manager plugin
import { DIDManager } from '@veramo/did-manager'

// Ethr did identity provider
import { EthrDIDProvider } from '@veramo/did-provider-ethr'

// Web did identity provider
import { WebDIDProvider } from '@veramo/did-provider-web'

import {KeyDIDProvider}  from '@veramo/did-provider-key'

// Core key manager plugin
import { KeyManager } from '@veramo/key-manager'

// Custom key management system for RN
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'

// Custom resolvers
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import { getResolver as keyDidResolver } from 'key-did-resolver'


// Storage plugin using TypeOrm
import { Entities, KeyStore, DIDStore, IDataStoreORM, PrivateKeyStore, migrations } from '@veramo/data-store'

// TypeORM is installed with `@veramo/data-store`
import { createConnection } from 'typeorm'

// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = 'database.veramo2'

// You will need to get a project ID from infura https://www.infura.io
const INFURA_PROJECT_ID = 'b721974ba86542ffaffc0fae2de71c6f'

// This will be the secret key for the KMS
const KMS_SECRET_KEY = 'abda812ffc49b48b3f6a7fd335b43fcb6ef1dcfb4cd5ababca5a7ae3a2c3fcad'

import {IDIDComm, DIDComm} from '@veramo/did-comm'

// const dbConnection = createConnection({
//   type: 'react-native',
//   database: 'veramo.sqlite',
//   location: 'default',
//   migrations: migrations,
//   migrationsRun: true,
//   logging: ['error', 'info', 'warn'],
//   entities: Entities,
// })
const dbConnection = createConnection({
  type: 'sqlite',
  database: DATABASE_FILE,
  synchronize: false,
  migrations,
  migrationsRun: true,
  logging: ['error', 'info', 'warn'],
  entities: Entities,
})
export const agent = createAgent<IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver &IDIDComm>({
  plugins: [
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))),
      },
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: 'did:ethr',
      providers: {
        'did:ethr': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'mainnet',
          rpcUrl: 'https://mainnet.infura.io/v3/' + INFURA_PROJECT_ID,
        }),
        'did:ethr:rinkeby': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'rinkeby',
          rpcUrl: 'https://rinkeby.infura.io/v3/' + INFURA_PROJECT_ID,
        }),
        'did:web': new WebDIDProvider({
          defaultKms: 'local',
        }),
        'did:key': new KeyDIDProvider({
          defaultKms: 'local',
        }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...webDidResolver(),
        ...keyDidResolver()
      }),
    }),
    new DIDComm()
  ],
})