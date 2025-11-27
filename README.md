# Heart Arrhythmia Classification Using ECG + AI (Mock)

This is a full-stack mock demo project showcasing a web UI for uploading ECG files and receiving mock predictions from a hybrid 1D-CNN + LSTM model (mocked for demo).

## Features
- Express.js + EJS frontend
- User authentication (Register/Login)
- File upload with Multer
- MongoDB persistence for predictions
- Responsive UI with SVG waveform animation
- Random data generation for testing
- Protected routes (requires authentication)

## Setup

### 1. Install dependencies
```powershell
cd "c:\Users\Adhi\Downloads\fghgjgvj"
npm install
```

### 2. Set up MongoDB
- **Local:** Ensure `mongod` service is running
- **Atlas:** Set `MONGODB_URI` environment variable:
  ```powershell
  $env:MONGODB_URI='mongodb+srv://user:pass@cluster.mongodb.net/ecg_app'
  ```

### 3. Run the server
```powershell
npm run dev
# or
npm start
```

Open `http://localhost:3000`

## Usage

1. **Register/Login:** Create an account at `/auth/register` or login at `/auth/login`
2. **Upload ECG:** Go to `/predict` and upload a .csv, .wav, or .txt file
3. **View Results:** Check `/results` to see predictions and generate sample data
4. **Generate Data:** On Results page, choose count and click "Generate Data" to populate the database

## API Endpoints

- `POST /api/predict` - Upload ECG file (requires authentication)
- `GET /api/predictions` - Get prediction list (requires authentication)
- `POST /api/generate` - Generate random sample predictions (requires authentication)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user

## Notes
- Default session timeout: 24 hours
- Passwords are hashed using bcryptjs
- Generated filenames are synthetic; modify `mockPrediction()` in `routes/api.js` for customization
