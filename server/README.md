# MoneyMind AI Server

Backend for AI-powered spending suggestions. Uses Hugging Face Inference API (Mistral-7B-Instruct) to give personalized advice based on your financial data.

## Setup

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Add your Hugging Face API key**
   - Copy `.env.example` to `.env`
   - Get an API key from [Hugging Face Settings](https://huggingface.co/settings/tokens) (with "Inference" permission)
   - Add to `.env`: `HF_API_KEY=hf_your-key-here`

3. **Run the server**
   ```bash
   npm start
   ```
   Server runs at `http://localhost:3001`

## Usage

- Open MoneyMind Fusion in your browser
- Go to **AI Insights** in the sidebar
- Click **Get suggestions** to receive AI advice based on your spending
- Configure the API URL in **Settings** if the server runs on a different host/port
