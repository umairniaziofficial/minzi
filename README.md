# Minzi - Modern URL Shortener

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green)](https://www.mongodb.com/)

Minzi is a modern, feature-rich URL shortener service built with Node.js, Express, and MongoDB. It provides a clean, responsive interface and detailed analytics for shortened links.

## 🚀 Features

- **Quick Link Shortening**: Generate short URLs instantly
- **Custom Slugs**: Create personalized, memorable URLs
- **QR Code Generation**: Generate QR codes for shortened links
- **Detailed Analytics**:
  - Click tracking
  - Visitor demographics
  - Device statistics
  - Browser information
  - Geographic distribution
  - Referrer tracking
- **Responsive UI**: Modern interface built with Tailwind CSS
- **Real-time Charts**: Interactive visualizations of link performance
- **Docker Support**: Easy deployment with containerization

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: HTML5, Tailwind CSS, Chart.js
- **Analytics**: Custom analytics engine
- **Deployment**: Docker, Vercel-ready
- **Other Tools**: nanoid, ua-parser-js, geoip-lite

## 📋 Prerequisites

- Node.js (>= 16.0.0)
- MongoDB (>= 4.4)
- npm or yarn

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/umairrx/minzi.git
   cd minzi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables:
   ```bash
   cp .env.sample .env
   ```

4. Configure your MongoDB connection in `.env`:
   ```
   MONGO_URI=your_mongodb_connection_string
   ```

5. Start the server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## 🐳 Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t minzi .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 -e MONGO_URI=your_mongodb_uri minzi
   ```

## ☁️ Vercel Deployment

This project is Vercel-ready. Simply:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy!

## 📊 API Endpoints

### Create Shortened URL
```http
POST /api/links
Content-Type: application/json

{
  "url": "https://example.com",
  "customSlug": "optional-custom-slug"
}
```

### Get Link Analytics
```http
GET /api/links/:slug/analytics
```

## 📱 Features Overview

- **Link Management**
  - Quick URL shortening
  - Custom slug support
  - QR code generation
  - One-click copying
  - Social sharing

- **Analytics Dashboard**
  - Total clicks tracking
  - Unique visitor counting
  - Geographic distribution
  - Device analytics
  - Browser statistics
  - Referrer tracking
  - Time-based analytics

## 🔒 Security Features

- URL validation
- Rate limiting (configurable)
- Input sanitization
- Secure redirects
- Analytics data protection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chart.js for analytics visualizations
- Tailwind CSS for styling
- Lucide icons for UI elements
- All other open-source contributors

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the [issues page](https://github.com/umairrx/minzi/issues)
2. Create a new issue if needed
3. Include as much detail as possible in bug reports

---

Made with ❤️ by [Umair Niazi](https://github.com/umairrx)