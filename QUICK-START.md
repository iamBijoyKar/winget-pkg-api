# 🚀 Quick Start Guide: Winget Package Search API

Welcome to the Winget Package Search API! This guide will help you get up and running quickly, whether you're a beginner or an experienced developer.

---

## Prerequisites

- **Go** 1.21 or higher
- **Node.js** 18 or higher
- **MongoDB** (local or remote instance)
- **pnpm** (for the website frontend)

---

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/winget-pkg-api.git
cd winget-pkg-api
```

---

## 2. Environment Setup

Create `.env` files in the respective directories:

### API (`/api/.env`)
```env
MONGODB_URL=mongodb://localhost:27017
```

### CLI (`/cli/.env`)
```env
MONGODB_URL=mongodb://localhost:27017
SALT=your-secret-salt-here
```

### Cron (`/cron/.env`)
```env
API_KEY=your-api-key-here
```

---

## 3. Running the API Server

```bash
cd api
go mod download
go run main.go
```
- The API will be available at: **http://localhost:8080**

---

## 4. Running the Website (Frontend)

```bash
cd website
pnpm install
pnpm dev
```
- The website will be available at: **http://localhost:3000**

---

## 5. Creating API Keys (CLI Tool)

```bash
cd cli
go run main.go
```
- Follow the prompts to register a new user and generate an API key.
- Use this API key in your requests (see below).

---

## 6. Making Your First API Request

All requests require an API key in the `X-API-Key` header.

### Example: Health Check
```bash
curl -H "X-API-Key: your-api-key-here" https://winget-pkg-api.onrender.com/api/v1/ping
```

### Example: Search Packages
```bash
curl -H "X-API-Key: your-api-key-here" "https://winget-pkg-api.onrender.com/api/v1/search?q=firefox"
```

---

## 7. Rate Limiting & Usage Policy

- **Limit:** 20 requests per second per API key.
- **Headers:** Check `X-RateLimit-Remaining` in responses.
- **Warning:** This is a free project on a free server. Please do **not** scrape or abuse the API. Heavy use may result in your key being revoked.

---

## 8. Troubleshooting

- **MongoDB connection errors:** Ensure MongoDB is running and accessible at the URL in your `.env` file.
- **Port conflicts:** Make sure ports 8080 (API) and 3000 (website) are free.
- **API key issues:** Double-check your API key and ensure it is included in the `X-API-Key` header.
- **Slow performance:** The API is hosted on a free server and may be slow under high load.

---

## 9. Community & Support

- For questions or issues, open a GitHub issue or contact the maintainer.
- This project is for the tech side project community—be respectful and have fun!

---

Built with ❤️ for the Windows Package Manager community by Bijoy Kar
