# Plesk Deployment Plan for Group Expense Tracker

This plan outlines the steps to deploy the Group Expense Tracker application on a Plesk hosting environment, covering both frontend and backend components with proper configuration.

## Current Application Architecture
- **Frontend**: React + Vite (runs on port 5173 in development)
- **Backend**: Node.js + Express + MariaDB (runs on port 5000 in development)
- **Database**: MariaDB with connection pooling
- **Authentication**: JWT-based with secure password hashing

## Deployment Strategy

### 1. Environment Configuration Setup
- Create production environment variables in Plesk
- Configure database credentials for production MariaDB instance
- Set JWT secret and other security configurations
- Update CORS settings for production domain

### 2. Backend Deployment
- Modify server.js for production port handling (use Plesk-assigned port)
- Update database connection for production MariaDB
- Configure Express for production environment with proper error handling
- Set up PM2 or similar process manager for Node.js application

### 3. Frontend Build and Deployment
- Build React application for production using `npm run build`
- Configure Vite for production build with proper base path
- Deploy static files to Plesk web directory
- Update API proxy configuration for production endpoints

### 4. Database Setup
- Create MariaDB database and user in Plesk
- Import database schema from `server/config/database.sql`
- Configure proper database permissions
- Set up database connection pooling for production

### 5. Security Configuration
- Configure HTTPS/SSL certificates
- Set up proper CORS for production domain
- Implement rate limiting and security headers
- Configure environment-specific security settings

### 6. Domain and Routing Configuration
- Configure domain/subdomain for the application
- Set up URL rewriting for React Router
- Configure API endpoints routing
- Ensure proper handling of static assets

## Key Considerations

### Production Environment Variables
```
NODE_ENV=production
PORT=3000 (or Plesk-assigned port)
DB_HOST=localhost (Plesk database server)
DB_PORT=3306
DB_USER=production_db_user
DB_PASSWORD=secure_password
DB_NAME=expense_tracker_prod
JWT_SECRET=production_jwt_secret_key
```

### Build Process
1. Frontend: `npm run build` creates optimized static files
2. Backend: Deploy Node.js application with PM2 process manager
3. Database: Import schema and configure connection

### Plesk Specific Steps
- Use Plesk File Manager to upload files
- Configure Node.js support in Plesk hosting panel
- Set up application document root
- Configure environment variables through Plesk interface
- Set up scheduled tasks for application monitoring

## Post-Deployment Checklist
- [ ] Test all API endpoints in production
- [ ] Verify database connectivity and operations
- [ ] Test user registration and authentication
- [ ] Verify transaction creation and management
- [ ] Test group functionality
- [ ] Check SSL certificate and HTTPS
- [ ] Monitor application logs for errors
- [ ] Set up backup procedures for database

## Monitoring and Maintenance
- Configure application logging
- Set up error monitoring
- Implement database backup strategy
- Plan for future updates and deployments

This deployment plan ensures a secure, production-ready setup of the Group Expense Tracker on Plesk hosting infrastructure.
