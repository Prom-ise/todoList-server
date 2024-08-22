const admin = require('firebase-admin');
// const serviceAccount = require('./TodoListAppKey.json');
require('dotenv').config();
// const authenticate = async (req, res) => {
//   try {
//     const { token } = req.body;

//     // Verify the token using Firebase Admin SDK
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     const uid = decodedToken.uid;
    
//     // Find or create the user in your database
//     let user = await userMode.findOne({ uid });

//     if (!user) {
//       user = new user({ uid, email: decodedToken.email });
//       await user.save();
//     }

//     // Generate a JWT for your application (optional)
//     const appToken = jwt.sign({ id: user._id }, secretKey, {
//       expiresIn: '1h',
//     });

//     res.json({ success: true, token: appToken });
//   } catch (error) {
//     console.error("Error authenticating user:", error);
//     res.status(401).json({ success: false, message: "Unauthorized" });
//   }
// };

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  }),
});
module.exports = {admin};
