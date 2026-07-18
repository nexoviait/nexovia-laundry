// Points the app at the real Laravel backend built earlier in this project.
//
// Set EXPO_PUBLIC_API_URL in a `.env` file (see .env.example) to override.
// Common values during development:
//   - Android emulator:  http://10.0.2.2:8000/api/v1
//   - iOS simulator:     http://localhost:8000/api/v1
//   - Physical device:   http://<your-computer-LAN-IP>:8000/api/v1
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
