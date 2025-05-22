# Start5

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E=18.0.0-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)

Start5 is a modern and enterprise-grade community platform where software developers and entrepreneurs can showcase their quick-build projects (completed in approximately 5 days), startup ideas, and serve as a professional portfolio. The platform facilitates project sharing, interaction between developers, and highlighting your technical skills across different languages and frameworks.

## Project Purpose and Summary

Start5 was created to solve the challenge of showcasing small yet meaningful projects that demonstrate a developer's capabilities. Whether you're building weekend projects, MVPs, or proof-of-concepts, Start5 gives them a dedicated home with proper presentation tools. The platform combines social features with professional portfolio capabilities, allowing users to:

- Showcase both public and private projects
- Add rich media and detailed descriptions to projects
- Connect with other developers and entrepreneurs
- Highlight expertise in specific technologies
- Build a professional online presence

## Main Features

### Custom Authentication System
- Email verification workflow
- Username-based accounts with personal URLs
- Admin role management
- Public/private project visibility controls
- Secure password management

### Comprehensive Project Management
- Project creation with detailed information
- Visual galleries with multiple media support
- Comment system for feedback and discussion
- Report functionality for inappropriate content
- Real-time notification system
- Admin panels for moderation
- Advanced search and filtering options

### Personal User Profiles
- Custom username-based URLs (`/u/username`)
- Short biography and personal information
- Social media links
- Project statistics and activity metrics
- Admin badges and verification status

### Modern Dark-themed UI
- Fully responsive design for all device sizes
- Accessibility-focused interface
- Dark mode optimized for developer preference
- Clean and professional aesthetics

## Installation and Setup Guide

### Prerequisites
- Node.js >= 18.x
- NPM >= 9.x
- PostgreSQL >= 14.x
- Cloudinary account (for image storage)

### Environment Configuration
Create a `.env.local` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://user:password@localhost:5432/start5?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email Service (optional)
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com
```

### Database Setup

```bash
# Install dependencies
npm install

# Initialize Prisma client and apply migrations
npx prisma migrate dev

# Seed the database with initial data (optional)
npx prisma db seed
```

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Usage Scenarios

### For Developers
1. **Project Showcase**: Add your completed projects with descriptions, GitHub links, live demos, and screenshots
2. **Portfolio Building**: Create a professional profile highlighting your technical skills
3. **Community Interaction**: Comment on other projects, follow interesting developers

### For Admins
1. **Content Moderation**: Review and manage reported content
2. **User Management**: Manage user accounts and roles
3. **Analytics**: Track platform growth and engagement metrics

## Technologies and Dependencies

### Core Stack
- **Next.js 14**: React framework for server-side rendering and API routes
- **Prisma ORM**: Database access and management
- **PostgreSQL**: Main database
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript

### Additional Technologies
- **Cloudinary**: Media storage and optimization
- **Custom Auth System**: Built-in authentication solution
- **React Hook Form**: Form validation and handling
- **Zod**: Schema validation
- **SWR**: Data fetching and state management
- **Lucide Icons**: Modern icon library

## Contributing

We welcome contributions to Start5! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our style guidelines and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Screenshots

*Coming soon*

## Contact and Support

For questions, support, or contributions, please reach out through:

- GitHub Issues: [Create an issue](https://github.com/yourusername/start5/issues)
- Email: contact@start5.dev
- Discord: [Join our server](https://discord.gg/start5)

---

*Start5 - Build small, showcase big.*
