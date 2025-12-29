import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppRoutes } from "../../../types";
import { 
  FeedIcon, 
  GroupsIcon, 
  PlusIcon, 
  ChatIcon, 
  ProfileIcon 
} from "../../../../assets/icons";
import { 
  FeedScreen, 
  GroupsScreen, 
  CreateScreen, 
  ChatScreen, 
  ProfileScreen 
} from "../../../screens";
import { GradientIcon } from "../../../components";

const Tab = createBottomTabNavigator<AppRoutes>();

export function MainTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopWidth: 0,
          height: Platform.OS === 'android' ? 65 + insets.bottom : 85,
          paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 8) : Math.max(insets.bottom, 20),
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: Platform.OS === 'android' ? 8 : 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        sceneContainerStyle: {
          paddingBottom: Platform.OS === 'android' ? 65 + insets.bottom : 85,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIcon: ({ focused }) => {
          const iconSize = 24;
          const gradientColors: readonly [string, string] = ['#00C6FF', '#0072FF'];
          
          // Wrap all icons in a container to ensure proper spacing
          const IconContainer = ({ children }: { children: React.ReactNode }) => (
            <View style={{
              width: 32,
              height: 32,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {children}
            </View>
          );
          
          if (route.name === 'Feed') {
            return (
              <IconContainer>
                {focused ? (
                  <GradientIcon colors={gradientColors} size={iconSize}>
                    <FeedIcon color="#FFFFFF" size={iconSize} />
                  </GradientIcon>
                ) : (
                  <FeedIcon color="#9CA3AF" size={iconSize} />
                )}
              </IconContainer>
            );
          } else if (route.name === 'Groups') {
            return (
              <IconContainer>
                {focused ? (
                  <GradientIcon colors={gradientColors} size={iconSize}>
                    <GroupsIcon color="#FFFFFF" size={iconSize} />
                  </GradientIcon>
                ) : (
                  <GroupsIcon color="#9CA3AF" size={iconSize} />
                )}
              </IconContainer>
            );
          } else if (route.name === 'Create') {
            return (
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#3B82F6',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -8,
              }}>
                <PlusIcon color="#FFFFFF" size={24} />
              </View>
            );
          } else if (route.name === 'Chat') {
            return (
              <IconContainer>
                {focused ? (
                  <GradientIcon colors={gradientColors} size={iconSize}>
                    <ChatIcon color="#FFFFFF" size={iconSize} />
                  </GradientIcon>
                ) : (
                  <ChatIcon color="#9CA3AF" size={iconSize} />
                )}
              </IconContainer>
            );
          } else if (route.name === 'Profile') {
            return (
              <IconContainer>
                {focused ? (
                  <GradientIcon colors={gradientColors} size={iconSize}>
                    <ProfileIcon color="#FFFFFF" size={iconSize} />
                  </GradientIcon>
                ) : (
                  <ProfileIcon color="#9CA3AF" size={iconSize} />
                )}
              </IconContainer>
            );
          }
          return null;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: "Feed",
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          tabBarLabel: "Groups",
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          tabBarLabel: "",
          tabBarStyle: { display: 'none' },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: "Chat",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}
