# tracker-app
Real-Time Location Tracking App
A real-time location tracking web application built with Node.js, Express, Socket.IO, and Leaflet.js.
This project allows multiple users to share their live location and see others' locations on an interactive map — all updated in real time without refreshing the page.

# Features
- Live Location Tracking – Tracks and updates user location continuously
- Real-Time Communication – Uses WebSockets for instant data sharing
- Multi-User Support – Displays markers for all connected users
- Auto Remove Markers – Removes markers when a user disconnects
- Map Integration – Interactive map using Leaflet + OpenStreetMap

# Tech Stack

Layer	Technology Used
Frontend	HTML, CSS, JavaScript, Leaflet.js
Backend	Node.js, Express
Real-Time	Socket.IO (WebSockets)
View Engine :	EJS
Map Tiles :	OpenStreetMap

<img width="1782" height="737" alt="image" src="https://github.com/user-attachments/assets/4d3d3d2a-57e4-4650-987f-5e8848f5eb42" />



⚙️ Installation & Setup
Follow these steps to run the project locally:

1️⃣ Clone the repository

git clone https://github.com/YaminiSeerapu51/RealTime-Tracker-App.git
cd realtime-location-tracker

npm install

Challenges: 
- Env variables very careful
- Root Directory error (have to mention it in Railway)
  

npx nodemon app.js
or 
npm start
http://localhost:3000

Future Scope : 
- Use routing services or algorithms to estimate travel direction, and speed.

