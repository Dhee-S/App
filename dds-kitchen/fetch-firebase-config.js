const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');

async function main() {
  try {
    const auth = new GoogleAuth({
      keyFile: 'd:\\Code\\App\\dd-s-032312-firebase-adminsdk-fbsvc-33309f672c.json',
      scopes: ['https://www.googleapis.com/auth/firebase', 'https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const projectId = 'dd-s-032312';

    // Get list of web apps
    let listRes = await client.request({
      url: `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`,
      method: 'GET'
    });

    let apps = listRes.data.apps;
    let appId;

    if (!apps || apps.length === 0) {
      console.log('No web apps found. Creating one...');
      const createRes = await client.request({
        url: `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`,
        method: 'POST',
        data: {
          displayName: 'dds-kitchen'
        }
      });
      console.log('Creation initiated:', createRes.data);
      
      // The creation is a long-running operation. We'll extract appId from the operation metadata if possible, or wait.
      // Wait for a few seconds to let the creation complete
      console.log('Waiting for app creation to complete...');
      await new Promise(r => setTimeout(r, 5000));
      
      listRes = await client.request({
        url: `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`,
        method: 'GET'
      });
      apps = listRes.data.apps;
      
      if (!apps || apps.length === 0) {
          console.error("App creation didn't finish fast enough, please run again.");
          return;
      }
    }

    appId = apps[0].appId;
    console.log(`Found Web App: ${appId}`);

    // Get config for the web app
    const configRes = await client.request({
      url: `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps/${appId}/config`,
      method: 'GET'
    });

    console.log('--- FIREBASE CONFIG ---');
    console.log(JSON.stringify(configRes.data, null, 2));

    // Append to .env.local
    let envContent = `
NEXT_PUBLIC_FIREBASE_API_KEY=${configRes.data.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${configRes.data.authDomain || `${projectId}.firebaseapp.com`}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${configRes.data.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${configRes.data.storageBucket || `${projectId}.appspot.com`}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${configRes.data.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${configRes.data.appId}
`;
    fs.appendFileSync('.env.local', envContent);
    console.log('Successfully appended to .env.local!');
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error);
  }
}

main();
