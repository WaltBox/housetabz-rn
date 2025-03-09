require('dotenv').config();


module.exports = {
  expo: {
    name: "housetabz-rn",
    slug: "housetabz-rn",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.housetabz.mobile",
      merchantId: "merchant.com.housetabz" // Add this for Apple Pay
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.housetabz.mobile"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "@stripe/stripe-react-native",
        {
          merchantIdentifier: "merchant.com.housetabz",
          enableGooglePay: true
        }
      ]
    ],
    extra: {
      STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      eas: {
        projectId: "aae99200-eb44-443e-a686-cdd129fd944b"
      }
    }
  }
};