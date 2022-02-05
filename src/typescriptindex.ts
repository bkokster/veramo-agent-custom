import { TAgent, IDIDManager, TKeyType, DIDDocument, IAgentContext, IKeyManager, IResolver } from '@veramo/core';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path'
import { agent } from '../src/veramo/setup'
import {main as createkeys} from  './create-key-identifier'

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
  
  const createOptions : CreateDefaultDidOptions = {

    agent:agent,
    baseUrl:'trustfront.herokuapp.com'

  }

  const serverIdentifier = await createOptions?.agent?.didManagerGetOrCreate({
    provider: 'did:web',
    alias : 'trustfront.herokuapp.com',
    options: {
      keyType: <TKeyType>'Ed25519',
    },
  })
  
  // const identifiers = await agent.didManagerFind();
  // console.log("Identifiers are being Logged")

  // console.log("Identifiers: " + JSON.stringify(identifiers))

  const getLocationsWithTimezones = (request: Request, response: Response, next: NextFunction) => {
    let locations: LocationWithTimezone[] = [
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
 
  app.get("/api", (req, res) => {
    res.json({ message: 'Howzit' });
  });

  
  const siteIdentifier = await agent.didManagerFind({
    alias: 'trustfront.herokuapp.com'
  })

  const didDocument: DIDDocument = {

    '@context' : "https://www.w3.org/ns/did/v1",
    id: siteIdentifier[0].did,
    service: siteIdentifier[0].services,    
    controller: siteIdentifier[0].controllerKeyId

  };
  

  // [{"did":"did:web:trustfront.herokuapp.com","provider":"did:web","alias":"trustfront.herokuapp.com","controllerKeyId":"849256a336e1f37947d5f1753ec6951353b10defa64c8313466875d7a859d647","keys":[{"kid":"849256a336e1f37947d5f1753ec6951353b10defa64c8313466875d7a859d647","kms":"local","type":"Ed25519","publicKeyHex":"849256a336e1f37947d5f1753ec6951353b10defa64c8313466875d7a859d647","meta":{"algorithms":["Ed25519","EdDSA"]}}],"services":[]}]}


  app.get("/.well-known/did.json", (req, res) => {
    res.json(didDocument);
  });

  app.get('/timezones', getLocationsWithTimezones);

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
