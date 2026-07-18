import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/theme';

import LoginScreen from './src/screens/LoginScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import PickupScreen from './src/screens/PickupScreen';
import DeliveryScreen from './src/screens/DeliveryScreen';
import FailTaskScreen from './src/screens/FailTaskScreen';

const Stack = createNativeStackNavigator();

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
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            ) : (
                <>
                    <Stack.Screen name="TaskList" component={TaskListScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task' }} />
                    <Stack.Screen name="Pickup" component={PickupScreen} options={{ title: 'Pickup' }} />
                    <Stack.Screen name="Delivery" component={DeliveryScreen} options={{ title: 'Delivery' }} />
                    <Stack.Screen name="FailTask" component={FailTaskScreen} options={{ title: 'Report problem' }} />
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <RootNavigator />
                <StatusBar style="auto" />
            </NavigationContainer>
        </AuthProvider>
    );
}
