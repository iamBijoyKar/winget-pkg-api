# Winget Package Search API

A fast, reliable REST API for searching Windows Package Manager (winget) packages. Built with Go, secured with API keys, and optimized for performance.

> **This is a free project, built for the tech side project community!**
>
> **⚠️ WARNING:**
> - This API is hosted on a free server (Render.com) and may be slow or rate limited under high load.
> - Please **do not overuse** the API, **do not scrape** large amounts of data, and be respectful of the service and other users.
> - Abuse may result in your API key being revoked.
> - This project is intended for learning, prototyping, and side projects—not for production scraping or heavy automation.

>***The mongodb database is our own proprietary database. It contain all the packages from https://github.com/microsoft/winget-pkgs repo, and we update it frequently. If you want to use the api then request for an api key via mail or other social media platform like X, LinkedIn.***

## 🚀 Features

- **Powerful Search**: Search across package names, publishers, descriptions, and authors
- **High Performance**: Rate limited to 20 requests/second with MongoDB optimization
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
  - Rate limiting (20 req/sec)
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
- **Limit**: 20 requests per second
- **Header**: `X-RateLimit-Remaining` shows remaining requests

## ⚠️ Usage Policy & Community Guidelines

- This API is **free** for the tech side project community.
- Please **do not abuse** the service. Heavy scraping, automation, or abuse may result in your API key being revoked.
- If you need higher limits or have a special use case, please contact the maintainer.
- Be respectful to other users and the community spirit of this project!


## 📦 Deployment

### API Deployment
The API is deployed on Render.com with automatic deployments from the main branch. (Free server)

### Website Deployment
The website is built and deployed using Vercel with automatic deployments. (Free server)

### Cron Job
The cron job runs on a schedule to monitor API health and performance and to prevent cold start.


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue on GitHub or contact the maintainers.

## 🚨 Free Project & Server Performance Notice

This API and website are provided **completely free** for the tech side project community, and are currently hosted on free-tier servers (Render.com for the API, Vercel for the website). As a result, you may experience slower performance or rate limiting during periods of high load.

**Future plans:**
- If I secure a job or receive enough donations to cover server costs, I will consider moving the API to a paid server for improved performance and reliability—especially if more users begin to rely on the service.
- Your support and understanding are appreciated! If you find this project valuable and want to help boost its performance, consider contributing or donating to help cover server expenses.

---

Built with ❤️ for the Windows Package Manager community by Bijoy Kar
