# Group Expense Tracker - Plesk Deployment Guide

This guide provides step-by-step instructions for deploying the Group Expense Tracker on Plesk hosting.

## 📋 Prerequisites

- Plesk hosting panel access
- SSH access to server
- Domain name configured in Plesk
- MariaDB/MySQL database access
- Node.js support in Plesk

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)

1. **Upload Files**
   ```bash
   # Upload project files to server
   scp -r expense-tracker/ user@yourserver:/tmp/
   ```

2. **Run Deployment Script**
   ```bash
   # SSH into server
   ssh user@yourserver
   
   # Navigate to project directory
   cd /tmp/expense-tracker
   
   # Make script executable
   chmod +x deploy.sh
   
   # Run deployment (requires sudo)
   sudo ./deploy.sh
   ```

### Option 2: Manual Plesk Deployment

#### Step 1: Database Setup

1. **Create Database in Plesk**
   - Go to Plesk → Databases → Add Database
   - Name: `expense_tracker_prod`
   - User: `expense_tracker_user`
   - Generate secure password
   - Note down credentials

2. **Import Database Schema**
   ```sql
   -- Upload and run server/config/database_production.sql
   mysql -u expense_tracker_user -p expense_tracker_prod < database_production.sql
   ```

#### Step 2: Backend Deployment

1. **Enable Node.js in Plesk**
   - Plesk → Tools & Settings → Updates
   - Install Node.js support if not already installed

2. **Upload Backend Files**
   - Create `/var/www/expense-tracker` directory
   - Upload all files from `server/` directory
   - Set permissions: `chown -R www-data:www-data /var/www/expense-tracker`

3. **Configure Environment**
   ```bash
   cd /var/www/expense-tracker
   cp .env.production .env
   # Edit .env with your actual database credentials
   ```

4. **Install Dependencies**
   ```bash
   npm ci --production
   ```

5. **Start Node.js Application**
   ```bash
   # Using PM2 (recommended)
   npm install -g pm2
   pm2 start server.js --name expense-tracker
   pm2 save
   pm2 startup
   ```

#### Step 3: Frontend Build and Deployment

1. **Build Frontend Locally**
   ```bash
   # On your development machine
   npm ci
   npm run build
   ```

2. **Upload Frontend Files**
   - Upload contents of `dist/` directory to `/var/www/expense-tracker/public/`
   - Set permissions: `chown -R www-data:www-data /var/www/expense-tracker/public`

#### Step 4: Web Server Configuration

1. **Apache Configuration**
   - Create `/etc/apache2/sites-available/expense-tracker.conf`
   - Add the configuration from `deploy.sh`

2. **Enable Site and Modules**
   ```bash
   a2ensite expense-tracker.conf
   a2enmod proxy proxy_http rewrite headers deflate
   systemctl reload apache2
   ```

#### Step 5: SSL Certificate Setup

1. **Install Certbot**
   ```bash
   apt install certbot python3-certbot-apache
   ```

2. **Request Certificate**
   ```bash
   certbot --apache -d yourdomain.com
   ```

## 🔧 Configuration Files

### Environment Variables

Update these files with your actual values:

#### Backend: `/var/www/expense-tracker/.env`
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=expense_tracker_user
DB_PASSWORD=your_secure_password
DB_NAME=expense_tracker_prod
JWT_SECRET=your_32_character_secret
CLIENT_URL=https://yourdomain.com
```

#### Frontend: `/var/www/expense-tracker/public/.env`
```env
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_APP_NAME=Group Expense Tracker
```

### Apache Virtual Host

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/expense-tracker/public
    
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    <Directory /var/www/expense-tracker/public>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

## 🔒 Security Configuration

### 1. Database Security
- Use strong database passwords
- Limit database user permissions
- Enable SSL for database connections

### 2. Application Security
- Set secure JWT secrets (minimum 32 characters)
- Enable rate limiting
- Use HTTPS only
- Set security headers

### 3. File Permissions
```bash
# Secure file permissions
chmod 755 /var/www/expense-tracker
chmod 644 /var/www/expense-tracker/.env
chown -R www-data:www-data /var/www/expense-tracker
```

## 📊 Monitoring and Maintenance

### PM2 Monitoring
```bash
# Check application status
pm2 list

# View logs
pm2 logs expense-tracker

# Restart application
pm2 restart expense-tracker

# Monitor resources
pm2 monit
```

### Log Files
- Application logs: `/var/log/expense-tracker-*.log`
- Apache logs: `/var/log/apache2/expense-tracker-*.log`
- PM2 logs: `~/.pm2/logs/`

### Automated Monitoring
The deployment script sets up:
- Application health monitoring (every 5 minutes)
- Disk space monitoring
- Memory usage monitoring
- Log rotation

## 🔄 Updates and Deployment

### Updating the Application
```bash
# 1. Backup current version
sudo cp -r /var/www/expense-tracker /var/backups/expense-tracker-$(date +%Y%m%d)

# 2. Update files
# Upload new files to /var/www/expense-tracker

# 3. Update dependencies
cd /var/www/expense-tracker
npm ci --production

# 4. Rebuild frontend (if needed)
# Build locally and upload to public/

# 5. Restart application
pm2 restart expense-tracker
```

### Database Updates
```bash
# Backup database
mysqldump -u expense_tracker_user -p expense_tracker_prod > backup.sql

# Run migration scripts
mysql -u expense_tracker_user -p expense_tracker_prod < migration.sql
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check PM2 status
pm2 list

# View error logs
pm2 logs expense-tracker --err

# Check environment variables
pm2 env 0
```

#### 2. Database Connection Failed
```bash
# Test database connection
mysql -u expense_tracker_user -p expense_tracker_prod

# Check database credentials
cat /var/www/expense-tracker/.env | grep DB_
```

#### 3. Frontend Not Loading
```bash
# Check Apache status
systemctl status apache2

# Check Apache logs
tail -f /var/log/apache2/error.log

# Check file permissions
ls -la /var/www/expense-tracker/public/
```

#### 4. API Not Responding
```bash
# Test API directly
curl http://localhost:3000/api/health

# Check if Node.js process is running
ps aux | grep node

# Check port availability
netstat -tlnp | grep 3000
```

## 📞 Support

### Getting Help
1. Check application logs for error messages
2. Verify all environment variables are set correctly
3. Ensure database connection is working
4. Check file permissions and ownership

### Emergency Recovery
```bash
# Restore from backup
sudo systemctl stop apache2
pm2 stop expense-tracker
sudo rm -rf /var/www/expense-tracker
sudo cp -r /var/backups/expense-tracker-YYYYMMDD /var/www/expense-tracker
pm2 start expense-tracker
sudo systemctl start apache2
```

## 🎯 Post-Deployment Checklist

- [ ] Application loads correctly in browser
- [ ] User registration and login works
- [ ] Transaction creation and management functions
- [ ] Group features work correctly
- [ ] API endpoints respond properly
- [ ] SSL certificate is valid
- [ ] Security headers are present
- [ ] Monitoring is active
- [ ] Backups are configured
- [ ] Log rotation is working
- [ ] Performance is acceptable
- [ ] Error handling is working

Your Group Expense Tracker is now deployed and ready for production use!
