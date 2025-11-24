import baseConfig from "./app.base.json";
import "dotenv/config";

export default ({ config }) => ({
  ...baseConfig,
  expo: {
    ...baseConfig.expo,
    extra: {
      xdripUrl: process.env.XDRIP_URL,
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      measurementId: process.env.MEASUREMENT_ID,
      cloudFunctionsHost: process.env.CLOUD_FUNCTIONS_HOST,
    },
  },
});
