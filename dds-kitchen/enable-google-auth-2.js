const { GoogleAuth } = require('google-auth-library');

async function main() {
  try {
    const auth = new GoogleAuth({
      keyFile: 'd:\\Code\\App\\dd-s-032312-firebase-adminsdk-fbsvc-33309f672c.json',
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const projectId = 'dd-s-032312';

    // Get current IDPs
    try {
        const listRes = await client.request({
        url: `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/defaultSupportedIdpConfigs`,
        method: 'GET'
        });
        console.log('Current IDPs:', JSON.stringify(listRes.data, null, 2));
    } catch (e) {
        console.log('Could not list IDPs', e.message);
    }

    // Try to create/enable google.com
    const res = await client.request({
      url: `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/defaultSupportedIdpConfigs?idpId=google.com`,
      method: 'POST',
      data: {
        name: `projects/${projectId}/defaultSupportedIdpConfigs/google.com`,
        enabled: true,
        clientId: 'fake-client-id.apps.googleusercontent.com', // Google usually requires OAuth client ID, but Firebase provisions one automatically in the console...
      }
    });

    console.log('Successfully enabled Google:', res.data);

  } catch (error) {
    console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error);
  }
}

main();
