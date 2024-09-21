* HouseTabz React Native Application
This repository contains the React Native mobile app for HouseTabz. The app is currently being developed using Expo, React Native, React Navigation, and react-native-svg for displaying components like the circular progress bar.

** Getting Started
Follow these instructions to set up the project on your local machine and get it running on your mobile device using Expo Go.

*** Prerequisites
1. Node.js & npm
  - You will need Node.js installed to use npm (Node Package Manager).
  - Download and install Node.js.

2. Expo Go App:
   - Download the Expo Go app on your mobile device
  
** Installation

1. Clone the repository
2. Navigate to project directory
3. Install dependencies
   - npm install
4. Start the app using Expo
   - npx expo start
5. Run the app on your mobile device
   - After running npx expo start, a QR code will be displayed in the terminal.
   - Open the Expo Go app on your mobile device, scan the QR code, and the app will load on your phone.

** Developement Guidlines
- Working on Frontend Pages:
    - Each developer will work on individual frontend pages. While developing, you can view your page independently without connecting it to the entire app.
    - To do so, modify the App.js file temporarily to render your component. Don't push this change as it will affect others.
- Connecting Packages
    - Once all the pages are dne, we will connect them through React Navigation or other means necessary.
 
** Installed Packages

*** Navigation
We are using React Navigation for navigating between screens in the app. Here are the commands to install the required packages:
1. Install core Navigation library:
   - npm install @react-navigation/native
2. Install additional required libraries
   - npm install react-native-screens react-native-safe-area-context
3. Install the stack navigator
   - npm install @react-navigation/stack

*** Circular Progress Bar
To create a circular progress bar for the loading screen, we are using react-native-svg.
1. Install react-native-svg and the transformer for SVG
   - npm install react-native-svg
   - npm install --save-dev react-native-svg-transformer

** Commands Summary
# Install dependencies for the project
npm install

# Start the project using Expo
npx expo start

# Install React Navigation
npm install @react-navigation/native
npm install react-native-screens react-native-safe-area-context
npm install @react-navigation/stack

# Install react-native-svg for circular progress bar
npm install react-native-svg
npm install --save-dev react-native-svg-transformer

