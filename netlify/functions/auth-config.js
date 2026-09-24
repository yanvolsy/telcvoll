const { json } = require('./_lib/auth');

// OAuth client ID is public by design. Keep the client secret server-side only.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '23326277113-emvmidaut2b6evuthtitlddckqveg4gt.apps.googleusercontent.com';

exports.handler = async () => {
  return json(200, {
    googleClientId: GOOGLE_CLIENT_ID
  });
};
