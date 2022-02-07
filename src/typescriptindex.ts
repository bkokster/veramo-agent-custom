import { TAgent, IDIDManager, TKeyType, DIDDocument, IAgentContext, IKeyManager, IResolver } from '@veramo/core';
import { VerificationMethod } from 'did-resolver';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path'
import { json } from 'stream/consumers';
import { agent } from '../src/veramo/setup'
import {main as createkeys} from  './create-key-identifier'
import {packDIDCommMessageLight} from './pack-message'

const app = express();
const PORT = process.env.PORT || 3001
app.use(express.static(path.resolve(__dirname, '../typescriptclient/build')));

interface LocationWithTimezone {
    location: string;
    timezoneName: string;
    timezoneAbbr: string;
    utcOffset: number;
  };
      
interface CreateDefaultDidOptions {
  agent: TAgent<IDIDManager>
  baseUrl: string
  messagingServiceEndpoint?: string
}

async function main(){
  
  // veramo initialisations 

  const createOptions : CreateDefaultDidOptions = {agent:agent,baseUrl:'trustfront.herokuapp.com'}
  const serverIdentifier = await createOptions?.agent?.didManagerGetOrCreate({
    provider: 'did:web',
    alias : 'trustfront.herokuapp.com',
    options: {
      keyType: <TKeyType>'Ed25519',
    },
  })  
  const identifiers = await agent.didManagerFind();  
  const siteIdentifier = await agent.didManagerFind({
    alias: 'trustfront.herokuapp.com'
  })
  const verificationMethod : VerificationMethod[] =  siteIdentifier[0].keys.map(key =>({
      
    id : siteIdentifier[0].did+'#'+key.kid
    ,controller: siteIdentifier[0].did
    ,type : key.type.toString()
    ,publicKeyHex : key.publicKeyHex
           
  }))
  const keyAgreement = siteIdentifier[0].keys.map(key =>({
      
    id : siteIdentifier[0].did+'#'+key.kid
    ,controller: siteIdentifier[0].did
    ,type : 'X25519KeyAgreementKey2019'
    ,publicKeyHex : key.publicKeyHex
           
  })
  
  )

  const didDocument : DIDDocument = {

    '@context' : "https://www.w3.org/ns/did/v1",
    id: siteIdentifier[0].did,
    service: siteIdentifier[0].services,    
    controller: siteIdentifier[0].did,
    verificationMethod: verificationMethod,
    keyAgreement: keyAgreement

  }

  // const packedMessage = await packDIDCommMessageLight();

  app.get("/api", (req, res) => {
    // console.log(packedMessage)
    res.json({ message: didDocument });
  });

  app.get("/.well-known/did.json", (req, res) => {
    res.json({message: didDocument});
  });

  // All other GET requests not handled before will return our React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../typescriptclient/build', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Timezones by location application is running on port ${PORT}.`);
  });

}

main().catch(console.log)

// import express from 'express';
// import path from 'path';

// const PORT = process.env.PORT || 3001

// express()
//   .use(express.static(path.join(__dirname, '../typescriptclient/build')))
//   // .set('views', path.join(__dirname, '../views'))
//   // .set('view engine', 'ejs')
//   .get("/api", (req, res) => {
//         res.json({ message: "Hello from server updated!" });
//       })
//   .get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, '../typescriptclient/build', 'index.html'));
//       })      
//   // .get('/', (req, res) => res.render('pages/index'))
//   .listen(PORT, () => console.log(`Listening on ${PORT}`));
