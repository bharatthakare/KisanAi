# **App Name**: KisanAI

## Core Features:

- Weather Updates: Fetch and display real-time weather data (temperature, humidity, wind speed, condition, city, country) from the OpenWeather API, using GPS for location. Includes background refresh.
- AI Farming Assistant: Provide farming advice based on user questions and current weather, using the Gemini API.  The AI will use a system prompt that instructs it to behave like an assistant.  Includes text-to-speech playback. The Gemini model can be swapped by setting an environment variable which is read using a tool.
- Community Feed: Enable users to view, create, and comment on posts, with real-time updates using WebSocket/SSE or Firestore, configurable via environment variables.
- Market Prices: Display real-time market prices for crops from the provided API, including crop, price, unit, market, trend, and timestamp, with pull-to-refresh and background refresh.
- User Authentication: Implement user authentication flow using OTP verification with the provided backend API, storing the token securely.
- Settings: Allow users to switch the application language (English, Hindi, Marathi) with instant i18n updates.
- Notifications: Trigger local notifications when rain is predicted or when the market trend rises for a specific crop, using background fetch.

## Style Guidelines:

- Primary color: Vibrant green (#90EE90) to represent growth and agriculture.
- Background color: Light, desaturated green (#F0FFF0).
- Accent color: Earthy brown (#A0522D) for highlighting important elements.
- Headline font: 'Poppins', a geometric sans-serif, offering a contemporary feel. Body Font: 'PT Sans' for readability in longer text.
- Use clear, informative icons related to weather, farming, and market trends.
- Employ a card-based layout for weather, market prices, and community feed for organized content presentation.
- Implement subtle animations for loading states, refreshing data, and new notifications.