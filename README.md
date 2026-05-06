# 📷 KaviosPix — Frontend

Frontend application for KaviosPix built with React.js.

It handles Google OAuth login, JWT-based authentication, OTP verification, protected routes and album/image management by communicating with the KaviosPix backend API.

---

## 🚀 Live App

https://kavios-px-frontend.vercel.app/

---

## ⚙️ Tech Stack

- React.js
- React Router DOM
- Axios
- Custom CSS
- React Hooks (useState, useEffect, useNavigate)

---

## 📁 Project Structure

```
kaviospix-frontend/
├── src/
│   ├── api/
│   │   └── axios.js
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── OtpVerify.jsx
│   │   ├── Albums.jsx
│   │   └── AlbumDetail.jsx
│   ├── styles/
│   │   └── main.css
│   └── App.js
└── package.json
```

---

## 🔐 Auth Flow

### Google OAuth

- User clicks "Continue with Google"
- Redirected to backend `/api/auth/google`
- After successful login, JWT token comes in URL query params
- Token saved in localStorage
- User redirected to `/albums`

### Email/Password Login

- User enters email and password
- POST `/api/auth/login`
- JWT token saved in localStorage
- User redirected to `/albums`

### Register + OTP Verification

- User fills register form
- OTP sent via `/api/auth/send-otp`
- User redirected to `/verify-otp`
- User enters OTP
- POST `/api/auth/verify-otp`
- JWT token returned on success
- User redirected to `/albums`

---

## 📦 Features

- Google OAuth authentication
- Email/password authentication flow with JWT token handling
- OTP-based email verification
- Protected routes
- Album create / delete / share
- Image upload
- Favorite images
- Add comments on images
- Logout functionality

---

## 🧠 Important Logic

### Axios Interceptor

JWT token is automatically attached to authenticated API requests using Axios request interceptors. This avoids manually passing tokens in every request.

### ProtectedRoute

If token does not exist in localStorage, user is redirected to login page. Used for protected pages like `/albums` and `/albums/:albumId`.

### OTP Flow

After OTP is sent successfully, user is redirected to OTP verification page with temporary auth state passed through navigation.

### Dynamic State Handling

Album sharing inputs and image comment inputs are managed using dynamic object state patterns like:

```js
{ [albumId]: email }
```

and

```js
{ [imageId]: comment }
```

This avoids creating separate state variables for every album or image.

---

## ⚠️ Problems I faced

- Handling Google OAuth redirect flow and extracting JWT token from URL query params
- Managing protected routes and preventing unauthorized access without token
- Maintaining separate dynamic state for album sharing and image comments
- Passing temporary auth state between register and OTP verification pages
- Debugging CORS issues between Vercel frontend and Render backend during deployment
- Handling async API states and preventing duplicate requests during OTP verification

---

## ❌ Limitations

- No toast notification system yet
- No image preview before upload
- No loading skeletons
- Mobile responsiveness not fully optimized
- State managed locally without Redux/Context API

---

## ▶️ Run locally

```bash
git clone https://github.com/shiv-11013/kaviosPX-Frontend
cd kaviospix-frontend
npm install
npm start
```

---

## 👨‍💻 Author

Name: Shiv Kumar  
GitHub: https://github.com/shiv-11013  
Email: shivkumar121112@gmail.com
