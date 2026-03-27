# **App Name**: Sentinel-Ops

## Core Features:

- Secure User Registration: Implement a high-fidelity registration page ('register.jsx') with real-time email and Indian phone number validation, floating labels, and Framer Motion transitions for a smooth user experience.
- User & Resource Data Persistence: Develop a data utility ('database.py') using Motor (MongoDB) to securely store new user profiles and maintain a history of detected 'Ghost Resources'.
- API User Management Endpoint: Integrate a `POST /register` endpoint into `main.py` that utilizes Pydantic schemas ('schemas.py') for robust validation and saves new user data to the database.
- Dynamic Application Routing: Update `SentinelOps.jsx` to manage the navigational flow, providing seamless transitions between the 'SplashScreen.jsx', the new 'register.jsx' page, and the primary 'Dashboard.jsx'.
- Core FinOps Logic Validation: Create a `pytest` suite ('test_main.py') to rigorously validate the 'main.py' logic, including the 'calculate_carbon_saved' function, the 'detect_ghosts' logic (based on CPU < 5% and Network < 10MB thresholds), and the JSON response structure of the '/forecast' FastAPI endpoint.

## Style Guidelines:

- Background: A 'Cyber-Obsidian' black (`#050505`), establishing a sleek and high-tech foundation, as requested by the user.
- Primary Accent: Vibrant neon green (`#00ff88`), drawing inspiration from digital interfaces and the requested palette, used for interactive elements, highlights, and critical information.
- Secondary Accent: Deep, energetic purple (`#bc13fe`), chosen from the user's existing palette to provide a complementary digital glow for distinctions and elevated UI components.
- Headers: 'Orbitron' (sans-serif) for a futuristic and bold presence, aligning with the platform's advanced technology theme.
- Code and Data Snippets: 'Share Tech Mono' (monospace sans-serif), offering a clean, technical, and easily readable font for all code-related content and detailed data displays.
- Registration Layout: Incorporate floating labels on input fields for a modern and uncluttered aesthetic, maintaining focus on content and user input.
- UI Transitions: Utilize Framer Motion for sophisticated micro-animations on the registration page and a seamless animated boot sequence ('SplashScreen.jsx'), enhancing interactivity and engagement.