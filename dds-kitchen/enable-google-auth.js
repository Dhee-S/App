const { GoogleAuth } = require('google-auth-library');

async function main() {
  try {
    const auth = new GoogleAuth({
      keyFile: 'd:\\Code\\App\\dd-s-032312-firebase-adminsdk-fbsvc-33309f672c.json',
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const projectId = 'dd-s-032312';

    // Enable Google provider
    const res = await client.request({
      url: `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=signIn.google`,
      method: 'PATCH',
      data: {
        signIn: {
          google: {
            enabled: true,
          }
        }
      }
    });

    console.log('Successfully enabled Google Auth Provider:', res.data.signIn.google);

    // Also need to enable email/password
    const resEmail = await client.request({
      url: `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=signIn.email`,
      method: 'PATCH',
      data: {
        signIn: {
          email: {
            enabled: true,
            passwordRequired: true
          }
        }
      }
    });
    console.log('Successfully enabled Email/Password Auth Provider:', resEmail.data.signIn.email);

  } catch (error) {
    console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error);
  }
}

main();
