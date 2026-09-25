const { json } = require('./_lib/auth');

exports.handler = async () => {
  return json(200, {
    googleClientId: process.env.GOOGLE_CLIENT_ID || ''
  });
};
