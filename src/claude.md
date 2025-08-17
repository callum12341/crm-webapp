# CRM WebApp - Professional Customer Relationship Management System

## 📋 Project Overview

A modern, full-featured CRM (Customer Relationship Management) web application built with React and deployed on Vercel. This system provides comprehensive customer management, task tracking, email integration, and database functionality for businesses of all sizes.

### 🚀 Live Demo
- **URL**: Deploy on Vercel with your own database
- **Version**: 4.0.0
- **Status**: Production Ready

## ✨ Key Features

### Core CRM Functionality
- **Customer Management**: Complete CRUD operations with contact details, company info, and order values
- **Task Management**: Assignment, tracking, and status updates with priority levels
- **Email Integration**: Send, receive, and manage emails with SMTP/IMAP support
- **Global Search**: Search across customers, tasks, and emails simultaneously
- **Database Integration**: PostgreSQL support with Vercel Postgres

### Email System
- **SMTP Email Sending**: Native SMTP implementation for reliable email delivery
- **IMAP Email Fetching**: Receive and sync emails from mail servers
- **Email Templates**: Pre-built templates with variable substitution
- **Bulk Email**: Queue and send multiple emails with rate limiting
- **SendGrid Integration**: Alternative email service for high-volume sending

### Database & Data Management
- **PostgreSQL Integration**: Full database persistence with Vercel Postgres
- **Data Export/Import**: JSON and CSV format support
- **Backup & Restore**: Complete database backup functionality
- **Local Storage Fallback**: Works offline with browser storage

### Advanced Features
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Notifications**: Success/error feedback system
- **Email Queue Management**: Schedule and batch email sending
- **IMAP Troubleshooting**: Built-in debugging tools for email issues
- **Environment Configuration**: Easy setup with environment variables

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Beautiful, customizable icons
- **React Scripts**: Create React App for build and development

### Backend Stack
- **Vercel Functions**: Serverless API endpoints
- **Node.js**: JavaScript runtime for API functions
- **@vercel/postgres**: PostgreSQL database integration
- **Native SMTP**: Custom SMTP implementation without external dependencies

### Email Libraries
- **ImapFlow**: Modern IMAP client for email fetching
- **Nodemailer**: Email sending capabilities (optional)
- **PapaParse**: CSV parsing for data imports

## 📁 Project Structure

```
crm-webapp/
├── api/                          # Vercel serverless functions
│   ├── database/                 # Database operations
│   │   ├── init.js              # Database initialization
│   │   ├── customers.js         # Customer CRUD operations
│   │   ├── tasks.js             # Task management
│   │   ├── emails.js            # Email data operations
│   │   ├── export.js            # Data export functionality
│   │   ├── import.js            # Data import functionality
│   │   └── backup.js            # Database backup
│   ├── email/                   # Email services
│   │   ├── config.js            # Email configuration
│   │   ├── fetch-inbox.js       # IMAP email fetching
│   │   └── sync.js              # Email synchronization
│   ├── send-email.js            # SMTP email sending
│   ├── bulk-email.js            # Bulk email operations
│   ├── test-smtp.js             # SMTP testing
│   ├── test-imap-connection.js  # IMAP testing
│   └── debug-imap.js            # IMAP debugging
├── src/                         # React frontend
│   ├── App.js                   # Main CRM application
│   ├── hooks/                   # Custom React hooks
│   │   ├── useCustomers.js      # Customer data management
│   │   └── useDatabase.js       # Database operations
│   ├── index.js                 # React entry point
│   └── index.css                # Global styles
├── lib/                         # Shared libraries
│   └── database.js              # Database utilities and DAOs
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
└── README.md                    # Basic project info
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Vercel account (for deployment)
- PostgreSQL database (Vercel Postgres recommended)
- Email account with SMTP/IMAP access (optional)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd crm-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local` file:
   ```env
   # Database (Required for persistence)
   DATABASE_URL=postgresql://username:password@host:port/database
   
   # SMTP Email Sending (Required for email features)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   
   # IMAP Email Receiving (Optional)
   IMAP_HOST=imap.gmail.com
   IMAP_PORT=993
   IMAP_SECURE=true
   IMAP_USER=your-email@gmail.com
   IMAP_PASSWORD=your-app-password
   
   # SendGrid Alternative (Optional)
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Initialize database** (if using database)
   - Navigate to Database Management in the app
   - Click "Test Connection" to set up tables

### Deployment to Vercel

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set up Vercel Postgres** (recommended)
   - Go to Vercel Dashboard → Storage → Create Database
   - Select Postgres and create your database
   - Copy the connection string

3. **Configure environment variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all environment variables from your `.env.local`

4. **Deploy**
   ```bash
   vercel --prod
   ```

## 🔧 Configuration Guide

### Email Setup

#### Gmail Configuration
For Gmail accounts, you need to:
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use these settings:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-character-app-password
   
   IMAP_HOST=imap.gmail.com
   IMAP_PORT=993
   IMAP_SECURE=true
   IMAP_USER=your-email@gmail.com
   IMAP_PASSWORD=your-16-character-app-password
   ```

#### Other Email Providers
- **Outlook/Hotmail**: Use outlook SMTP/IMAP servers
- **Yahoo**: Use yahoo SMTP/IMAP servers
- **Custom**: Check your email provider's documentation

### Database Configuration

#### Vercel Postgres (Recommended)
1. Create database in Vercel Dashboard
2. Copy the `POSTGRES_URL` or `DATABASE_URL`
3. Add to environment variables

#### Alternative Databases
- **Neon**: PostgreSQL-compatible serverless database
- **Supabase**: Open source Firebase alternative
- **PlanetScale**: MySQL-compatible serverless database (requires schema changes)

## 📖 Usage Guide

### Customer Management
1. **Add Customers**: Click "Add Customer" button, fill in details
2. **Edit Customers**: Click edit icon on customer cards
3. **Customer Status**: Track Lead, Active, Inactive status
4. **Order Values**: Track revenue per customer
5. **Tags**: Organize customers with custom tags

### Task Management
1. **Create Tasks**: Assign tasks to team members with due dates
2. **Priority Levels**: Set High, Medium, Low priorities
3. **Status Tracking**: Pending, In Progress, Completed
4. **Customer Association**: Link tasks to specific customers

### Email Features
1. **Compose Emails**: Rich email composer with templates
2. **Email Templates**: Pre-built templates with variable substitution
3. **Bulk Emails**: Send to multiple customers with queue management
4. **Email Fetching**: Automatically sync incoming emails (IMAP required)
5. **Email Threading**: Group related emails together

### Data Management
1. **Export Data**: Download customers, tasks, emails as JSON/CSV
2. **Import Data**: Bulk import from JSON files
3. **Backup Database**: Create complete system backups
4. **Search**: Global search across all data

## 🛠️ Development

### Adding New Features

#### New API Endpoint
1. Create file in `/api/` directory
2. Follow existing patterns for CORS and error handling
3. Export default async function handler

#### New React Component
1. Add component to `src/App.js` or separate file
2. Follow existing patterns for state management
3. Use Tailwind CSS for styling

#### Database Changes
1. Update `lib/database.js` with new tables/columns
2. Add migration logic to `api/database/init.js`
3. Update corresponding DAO objects

### Code Style Guidelines
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations
- Use semantic HTML and ARIA labels
- Follow existing naming conventions

### Testing
```bash
# Run tests
npm test

# Build for production
npm run build
```

## 🐛 Troubleshooting

### Common Issues

#### Email Not Working
1. Check SMTP credentials in environment variables
2. Verify app passwords for Gmail (not regular password)
3. Use IMAP Debug tool in the application
4. Check firewall/network restrictions

#### Database Connection Issues
1. Verify DATABASE_URL format
2. Check database server status
3. Ensure IP whitelisting (if required)
4. Test connection using Database Management tool

#### Deployment Issues
1. Verify all environment variables are set in Vercel
2. Check build logs for errors
3. Ensure all dependencies are in package.json
4. Review Vercel function timeout limits

### IMAP Troubleshooting
The application includes a built-in IMAP troubleshooting tool:
1. Navigate to "IMAP Debug" in the sidebar
2. Test IMAP connection
3. Test email fetching
4. Inspect available mailboxes
5. Follow suggested solutions

### Performance Optimization
- Large email inboxes (15k+ emails): Use smaller fetch limits
- Database queries: Add indexes for frequently searched fields
- File uploads: Implement chunked uploads for large files
- API responses: Add pagination for large datasets

## 🔐 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique passwords for email accounts
- Rotate API keys regularly
- Use app-specific passwords instead of main account passwords

### Database Security
- Use connection pooling for production
- Implement proper SQL injection prevention (handled by Vercel Postgres)
- Regular database backups
- Monitor database access logs

### Email Security
- Use TLS/SSL for SMTP connections
- Validate email addresses before sending
- Implement rate limiting for bulk emails
- Monitor for spam/abuse

## 📊 Analytics & Monitoring

### Built-in Analytics
- Customer growth tracking
- Email delivery statistics
- Task completion rates
- Database usage metrics

### External Monitoring
- Vercel Analytics (automatic)
- Custom logging in API endpoints
- Error tracking and notifications
- Performance monitoring

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with proper testing
4. Submit pull request with description

### Reporting Issues
1. Use GitHub Issues
2. Include reproduction steps
3. Provide error logs/screenshots
4. Specify environment details

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- Check this README for setup instructions
- Review code comments for implementation details
- Use built-in debugging tools

### Community
- GitHub Issues for bug reports
- GitHub Discussions for questions
- Stack Overflow for general React/Node.js questions

### Professional Support
- Custom development available
- Enterprise deployment assistance
- Training and consultation

---

## 📝 Changelog

### Version 4.0.0 (Current)
- ✅ Full PostgreSQL database integration
- ✅ Enhanced email system with SMTP/IMAP
- ✅ Bulk email functionality with queuing
- ✅ Complete data export/import system
- ✅ Database backup and restore
- ✅ IMAP troubleshooting tools
- ✅ Responsive design improvements
- ✅ Advanced search capabilities

### Version 3.0.0
- ✅ Email integration (SMTP/IMAP)
- ✅ Task management system
- ✅ Email templates
- ✅ Global search functionality

### Version 2.0.0
- ✅ Enhanced customer management
- ✅ Improved UI/UX design
- ✅ Local storage implementation

### Version 1.0.0
- ✅ Basic CRM functionality
- ✅ Customer CRUD operations
- ✅ Initial React implementation

---

**Built with ❤️ for modern businesses**