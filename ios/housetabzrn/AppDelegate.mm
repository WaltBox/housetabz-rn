#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <UserNotifications/UserNotifications.h>

@interface AppDelegate () <UNUserNotificationCenterDelegate>
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"main";
  
  // Set up push notifications
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  
  // Any custom initial props to pass down to React Native can be added here.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Linking API
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [super application:application openURL:url options:options] ||
         [RCTLinkingManager application:application openURL:url options:options];
}

// Universal Links
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  BOOL result = [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
  return [super application:application continueUserActivity:userActivity restorationHandler:restorationHandler] || result;
}

// Handle push notification registration
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  // Convert token to hex string.
  const unsigned char *dataBuffer = (const unsigned char *)[deviceToken bytes];
  NSMutableString *hexString = [NSMutableString stringWithCapacity:(deviceToken.length * 2)];
  for (NSInteger i = 0; i < deviceToken.length; i++) {
    [hexString appendFormat:@"%02x", dataBuffer[i]];
  }
  NSString *token = [hexString copy];
  
  // Log the token for debugging.
  NSLog(@"Push notification device token: %@", token);
  
  // Emit the token to JavaScript so that your JS code can pick it up immediately.
  if (self.bridge) {
    [self.bridge enqueueJSCall:@"RCTDeviceEventEmitter"
                        method:@"emit"
                          args:@[@"remoteNotificationsRegistered", @{@"deviceToken": token}]
                    completion:NULL];
  }
  
  [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// Handle registration errors.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  NSLog(@"Failed to register for remote notifications: %@", error);
  
  [super application:application didFailToRegisterForRemoteNotificationsWithError:error];
}

// Handle receiving remote notifications.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  NSLog(@"Received remote notification: %@", userInfo);
  
  completionHandler(UIBackgroundFetchResultNewData);
  
  [super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

// Handle notifications when app is in foreground.
- (void)userNotificationCenter:(UNUserNotificationCenter *)center 
       willPresentNotification:(UNNotification *)notification 
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
  NSDictionary *userInfo = notification.request.content.userInfo;
  NSLog(@"Received notification in foreground: %@", userInfo);
  
  completionHandler(UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionSound | UNNotificationPresentationOptionBadge);
}

// Handle notification responses (when user taps notification).
- (void)userNotificationCenter:(UNUserNotificationCenter *)center 
didReceiveNotificationResponse:(UNNotificationResponse *)response 
         withCompletionHandler:(void(^)(void))completionHandler
{
  NSDictionary *userInfo = response.notification.request.content.userInfo;
  NSLog(@"Handling notification response: %@", userInfo);
  
  completionHandler();
}

@end
