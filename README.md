# Winget Package Search API

A fast, reliable REST API for searching Windows Package Manager (winget) packages. Built with Go, secured with API keys, and optimized for performance.

>***The mongodb database is our own proprietary database. It contain all the packages from https://github.com/microsoft/winget-pkgs repo, and we update it frequently. If you want to use the api then request for an api key via mail or other social media platform like X, LinkedIn.***

## 🚀 Features

- **Powerful Search**: Search across package names, publishers, descriptions, and authors
- **High Performance**: Rate limited to 100 requests/second with MongoDB optimization
- **Secure Access**: API key authentication with comprehensive middleware protection
- **RESTful Design**: Clean, intuitive REST API endpoints following best practices
- **Cross-Platform**: Built with Go for excellent cross-platform compatibility
- **Modern Web Interface**: Beautiful Next.js website with documentation and API key management

## 📁 Project Structure

```
winget-pkg-api/
├── api/                 # Go API server
├── cli/                 # CLI tool for user management
├── cron/                # Cron job for API monitoring
└── website/             # Next.js web interface & docs
```

## 🛠️ Components

### API Server (`/api`)
- **Language**: Go
- **Framework**: Gin
- **Database**: MongoDB
- **Features**:
  - RESTful API endpoints
  - API key authentication
  - Rate limiting (100 req/sec)
  - Package search functionality

### CLI Tool (`/cli`)
- **Language**: Go
- **Purpose**: User management and API key generation
- **Features**:
  - User registration with email
  - Secure API key generation
  - MongoDB integration

### Cron Job (`/cron`)
- **Language**: Node.js
- **Purpose**: API health monitoring
- **Features**:
  - Periodic API health checks
  - Response time monitoring
  - Error reporting

### Website (`/website`)
- **Framework**: Next.js 15
- **UI**: Tailwind CSS + ShadCN
- **Features**:
  - Modern, responsive design
  - API documentation
  - API key request form
  - Real-time API status checking
  - Dark/light theme support

## 🚀 Quick Start

### Prerequisites

- Go 1.21+
- Node.js 18+
- MongoDB instance
- pnpm (for website)

### Environment Setup

Create `.env` files in the respective directories:

**API (`/api/.env`)**:
```env
MONGODB_URL=mongodb://localhost:27017
```

**CLI (`/cli/.env`)**:
```env
MONGODB_URL=mongodb://localhost:27017
SALT=your-secret-salt-here
```

**Cron (`/cron/.env`)**:
```env
API_KEY=your-api-key-here
```

### Running the API

```bash
cd api
go mod download
go run main.go
```

The API will be available at `http://localhost:8080`

### Running the Website

```bash
cd website
pnpm install
pnpm dev
```

The website will be available at `http://localhost:3000`

### Creating API Keys

```bash
cd cli
go run main.go
```

Follow the prompts to register a new user and generate an API key.

## 📚 API Documentation

### Base URL
```
https://winget-pkg-api.onrender.com/api/v1
```

### Authentication
All requests require an API key in the `X-API-Key` header:
```
X-API-Key: your-api-key-here
```

### Endpoints

#### Health Check
```http
GET /ping
```

#### Search Packages
```http
GET /search?q=query
```
Searches across package names, publishers, descriptions, and authors.

#### Search by Package Name
```http
GET /packagename?name=package-name
```

#### Search by Package Identifier
```http
GET /packageidentifier?identifier=package-identifier
```

### Rate Limiting
- **Limit**: 100 requests per second
- **Header**: `X-RateLimit-Remaining` shows remaining requests

## 🔧 Development

### API Development
```bash
cd api
go mod download
go run main.go
```

### Website Development
```bash
cd website
pnpm install
pnpm dev
```

### Running Tests
```bash
# API tests
cd api
go test ./...

# Website tests
cd website
pnpm test
```

## 📦 Deployment

### API Deployment
The API is deployed on Render.com with automatic deployments from the main branch.

### Website Deployment
The website is built and deployed using Vercel with automatic deployments.

### Cron Job
The cron job runs on a schedule to monitor API health and performance.


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ for the Windows Package Manager community by Bijoy Kar
