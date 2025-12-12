AI Medicine Reminder & Health Monitor App

A smart AI-powered mobile application that helps patients take medicines on time, understand their prescription, track their health vitals, and improve medication adherence.

🧠 1. Problem Statement

Patients frequently forget to take medicines on time, leading to poor treatment results.
Doctors also have no visibility into whether patients are following their prescribed routine.

💡 2. Solution

This app solves the problem by combining:

✔ OCR-based prescription reading
✔ Smart medicine reminders
✔ Health vitals tracking using mobile sensors
✔ AI-based adherence prediction
✔ Simple and friendly UI

🚀 3. Key Features
📸 OCR Prescription Reader

Upload a photo of a handwritten or printed prescription

Extract medicine names automatically

User can edit and finalize details

⏰ Smart Medicine Reminder System

Adaptive reminders

Tracks “Taken” / “Missed” doses

Sends alerts through Firebase Cloud Messaging

📊 Health Monitoring

Tracks health vitals using:

Phone sensors (steps, activity, calories)

Google Fit / Apple HealthKit (optional)

Smart insights and trends

🤖 AI Adherence Prediction

Learns user behaviour:

Which dose user misses?

At what time?

Why?

Suggests optimal reminder times

Generates a risk score

🛠 4. Tech Stack
Frontend

Flutter / React Native

Backend

Firebase (Authentication + Firestore + FCM)

Node.js or Python (APIs + ML Model)

Machine Learning

Python

Pandas / Scikit-learn

Adherence Prediction Model

OCR

Google Vision API
or

Tesseract OCR

Health APIs

Google Fit (Android)

HealthKit (iOS)

📁 5. Project Structure
/assets               -> Images & sample prescriptions
/lib or /src          -> App source code
/ml_model             -> ML model files
/backend              -> API server + Firebase logic
/documentation        -> Diagrams + report + architecture

🧩 6. How It Works
Step 1: User logs in
Step 2: Uploads prescription
Step 3: OCR extracts medicine names
Step 4: User confirms dose & timing
Step 5: App sends smart reminders
Step 6: Tracks vitals via sensors
Step 7: AI predicts adherence pattern
📈 7. Future Scope

IoT Smart Pill Box integration

Wearable health tracker sync

Doctor dashboard for remote monitoring

AI chatbot for medicine guidance

Emergency alert system

📝 8. Screenshots / UI (Add your screenshots here)
/assets/ui_design/login_screen.png
/assets/ui_design/ocr_preview.png
/assets/ui_design/reminder_screen.png
/assets/ui_design/health_dashboard.png

👩‍⚕️ 9. Why This App Is Needed (Short Answer for Viva)

Normal alarms can remind,
but they cannot track, analyse, predict, or adapt.

This app is designed to:

Ensure the patient actually takes medicines

Reduce missed doses

Help chronic patients stay consistent

Provide doctors real data
