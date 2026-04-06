
# SENTINEL-OPS | Tokyo Night Cloud FinOps

An elite, AI-powered Infrastructure Analytics & Financing platform designed for the 2026 Cloud Economy. This project serves as a High-Fidelity (HiFi) demonstration of modern FinOps, Security, and Fintech integration.

## 🚀 2026 Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
- **UI Components**: ShadCN UI, Framer Motion (Orbital Physics).
- **Backend/AI**: Google Genkit (Gemini 2.5).
- **Database/Auth**: Firebase Firestore, Firebase Authentication.
- **FinTech**: jsPDF (Report Generation), qrcode.react (UPI Gateway).

## 🛡️ Security-First Architecture
- **Biometric Kill-Switch**: Critical system states (Ghost Mode) are protected by WebAuthn/Biometric gateways.
- **Stealth Protocol (Ghost Mode)**: A one-tap "Tokyo Red" shift that masks all sensitive PII and dispatch headers.

## 🐳 Docker Deployment
To run the project in a container:

1. **Rebuild Environment**: If you are in Google IDX, click the **"Rebuild Environment"** button in the notification or top bar to enable the Docker service.
2. **Build the image**:
   ```bash
   docker build -t sentinel-ops .
   ```
3. **Run the container**:
   ```bash
   docker run -p 3000:3000 sentinel-ops
   ```
The application will be accessible at `http://localhost:3000`.

## 🎓 Viva Implementation Notes
- **EMI Formula**: Uses the standard Reducing Balance Method: `EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]`.
- **Ghost Logic**: Implemented via global CSS variable injection (`.ghost-active`) and React state-machine locks.
- **NLP Intent**: Regex-based steganographic command mapping for "Cloudy" weather triggers in the Terminal.
