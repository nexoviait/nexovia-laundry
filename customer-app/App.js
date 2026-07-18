import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { BookingProvider } from './src/context/BookingContext';
import { colors } from './src/theme';

import PhoneScreen from './src/screens/auth/PhoneScreen';
import OtpVerifyScreen from './src/screens/auth/OtpVerifyScreen';
import HomeScreen from './src/screens/HomeScreen';
import OrdersListScreen from './src/screens/OrdersListScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AddressesScreen from './src/screens/AddressesScreen';
import SelectServicesScreen from './src/screens/booking/SelectServicesScreen';
import SelectSlotScreen from './src/screens/booking/SelectSlotScreen';
import SelectAddressScreen from './src/screens/booking/SelectAddressScreen';
import ConfirmScreen from './src/screens/booking/ConfirmScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
    return <Text style={{ fontSize: 11, color: focused ? colors.primary : colors.textMuted, fontWeight: focused ? '700' : '400' }}>{label}</Text>;
}

function Tabs() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />, tabBarLabel: () => null }}
            />
            <Tab.Screen
                name="Orders"
                component={OrdersListScreen}
                options={{ tabBarIcon: ({ focused }) => <TabIcon label="Orders" focused={focused} />, tabBarLabel: () => null }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />, tabBarLabel: () => null }}
            />
        </Tab.Navigator>
    );
}

function RootNavigator() {
    const { user, booting } = useAuth();

    if (booting) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerTintColor: colors.text }}>
            {!user ? (
                <>
                    <Stack.Screen name="Phone" component={PhoneScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} options={{ title: '' }} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
                    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order' }} />
                    <Stack.Screen name="Addresses" component={AddressesScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="BookingSelectServices" component={SelectServicesScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="BookingSelectSlot" component={SelectSlotScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="BookingSelectAddress" component={SelectAddressScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="BookingConfirm" component={ConfirmScreen} options={{ headerShown: false }} />
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <BookingProvider>
                    <NavigationContainer>
                        <RootNavigator />
                        <StatusBar style="auto" />
                    </NavigationContainer>
                </BookingProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}
