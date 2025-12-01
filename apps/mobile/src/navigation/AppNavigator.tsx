import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FeedScreen from '../screens/feed/FeedScreen';
import LikesScreen from '../screens/likes/LikesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import UpgradePlanScreen from '../screens/subscription/UpgradePlanScreen';

export type RootStackParamList = {
  Feed: undefined;
  Likes: undefined;
  Profile: undefined;
  UpgradePlan: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Feed" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="Likes" component={LikesScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="UpgradePlan" component={UpgradePlanScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
