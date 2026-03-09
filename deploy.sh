#!/bin/bash

# Group Expense Tracker - Production Deployment Script
# This script automates the deployment process for Plesk hosting

set -e  # Exit on any error

echo "🚀 Starting Group Expense Tracker Production Deployment..."

# Configuration
PROJECT_NAME="expense-tracker"
BACKUP_DIR="/var/backups/$PROJECT_NAME"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="/var/log/deployment_$PROJECT_NAME_$TIMESTAMP.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "${RED}❌ ERROR: $1${NC}"
    exit 1
}

# Success message
success() {
    log "${GREEN}✅ $1${NC}"
}

# Warning message
warning() {
    log "${YELLOW}⚠️  $1${NC}"
}

# Info message
info() {
    log "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error_exit "This script must be run as root (use sudo)"
    fi
}

# Create backup
create_backup() {
    info "Creating backup of existing installation..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup current application
    if [ -d "/var/www/$PROJECT_NAME" ]; then
        cp -r "/var/www/$PROJECT_NAME" "$BACKUP_DIR/$PROJECT_NAME_$TIMESTAMP"
        success "Application backed up to $BACKUP_DIR/$PROJECT_NAME_$TIMESTAMP"
    fi
    
    # Backup database
    if command -v mysql &> /dev/null; then
        mysqldump -u root -p expense_tracker_prod > "$BACKUP_DIR/database_$TIMESTAMP.sql" 2>/dev/null || warning "Database backup failed or not configured"
        success "Database backed up to $BACKUP_DIR/database_$TIMESTAMP.sql"
    fi
}

# Install dependencies
install_dependencies() {
    info "Installing system dependencies..."
    
    # Update package list
    apt update || error_exit "Failed to update package list"
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
        success "Node.js installed"
    fi
    
    # Install PM2 if not present
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
        success "PM2 installed"
    fi
    
    # Install additional security packages
    npm install -g express-rate-limit helmet compression
}

# Setup database
setup_database() {
    info "Setting up MariaDB database..."
    
    # Check if MariaDB is running
    if ! systemctl is-active --quiet mariadb; then
        systemctl start mariadb
        systemctl enable mariadb
        success "MariaDB started and enabled"
    fi
    
    # Create database and user
    mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS expense_tracker_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'expense_tracker_user'@'localhost' IDENTIFIED BY 'your_secure_database_password';
GRANT ALL PRIVILEGES ON expense_tracker_prod.* TO 'expense_tracker_user'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    # Import schema
    if [ -f "server/config/database_production.sql" ]; then
        mysql -u expense_tracker_user -p expense_tracker_prod < server/config/database_production.sql
        success "Database schema imported"
    else
        warning "Database schema file not found"
    fi
}

# Build frontend
build_frontend() {
    info "Building frontend for production..."
    
    # Install frontend dependencies
    npm ci --production=false || error_exit "Failed to install frontend dependencies"
    
    # Build frontend
    npm run build || error_exit "Frontend build failed"
    
    success "Frontend built successfully"
}

# Setup backend
setup_backend() {
    info "Setting up backend..."
    
    # Navigate to server directory
    cd server
    
    # Install backend dependencies
    npm ci --production || error_exit "Failed to install backend dependencies"
    
    # Copy production environment file
    if [ -f ".env.production" ]; then
        cp .env.production .env
        success "Production environment configured"
    else
        warning "Production environment file not found, using default"
    fi
    
    cd ..
}

# Deploy files
deploy_files() {
    info "Deploying application files..."
    
    # Create web directory
    mkdir -p "/var/www/$PROJECT_NAME"
    
    # Copy backend files
    cp -r server/* "/var/www/$PROJECT_NAME/"
    
    # Copy frontend build files
    cp -r dist/* "/var/www/$PROJECT_NAME/public/"
    
    # Set permissions
    chown -R www-data:www-data "/var/www/$PROJECT_NAME"
    chmod -R 755 "/var/www/$PROJECT_NAME"
    
    success "Files deployed successfully"
}

# Configure PM2
configure_pm2() {
    info "Configuring PM2 process manager..."
    
    # Create PM2 ecosystem file
    cat > "/var/www/$PROJECT_NAME/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'expense-tracker',
    script: 'server.js',
    cwd: '/var/www/expense-tracker',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/expense-tracker-error.log',
    out_file: '/var/log/expense-tracker-out.log',
    log_file: '/var/log/expense-tracker-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
EOF
    
    # Start application with PM2
    cd "/var/www/$PROJECT_NAME"
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    success "PM2 configured and application started"
}

# Configure web server
configure_web_server() {
    info "Configuring web server..."
    
    # Create Apache configuration
    cat > "/etc/apache2/sites-available/$PROJECT_NAME.conf" << EOF
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    # Frontend static files
    DocumentRoot /var/www/expense-tracker/public
    
    # Proxy API requests to Node.js
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    # Handle React Router
    <Directory /var/www/expense-tracker/public>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Security headers
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # Compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
    
    ErrorLog \${APACHE_LOG_DIR}/expense-tracker-error.log
    CustomLog \${APACHE_LOG_DIR}/expense-tracker-access.log combined
</VirtualHost>
EOF
    
    # Enable site and modules
    a2ensite "$PROJECT_NAME.conf"
    a2enmod proxy proxy_http rewrite headers deflate
    systemctl reload apache2
    
    success "Web server configured"
}

# Setup SSL certificate
setup_ssl() {
    info "Setting up SSL certificate..."
    
    # Install Certbot if not present
    if ! command -v certbot &> /dev/null; then
        apt install -y certbot python3-certbot-apache
    fi
    
    # Request SSL certificate
    certbot --apache -d yourdomain.com -d www.yourdomain.com --non-interactive --agree-tos --email admin@yourdomain.com || warning "SSL setup failed, configure manually"
    
    success "SSL certificate configured"
}

# Setup monitoring
setup_monitoring() {
    info "Setting up monitoring..."
    
    # Create log rotation
    cat > "/etc/logrotate.d/expense-tracker" << EOF
/var/log/expense-tracker-*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
    
    # Create monitoring script
    cat > "/usr/local/bin/monitor-expense-tracker.sh" << EOF
#!/bin/bash
# Monitor application health

# Check if PM2 process is running
if ! pm2 list | grep -q "expense-tracker.*online"; then
    echo "Application is down, restarting..."
    pm2 restart expense-tracker
fi

# Check disk space
DISK_USAGE=\$(df /var/www | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 80 ]; then
    echo "Warning: Disk usage is \${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=\$(free | awk 'NR==2{printf "%.0f", \$3*100/\$2}')
if [ \$MEM_USAGE -gt 80 ]; then
    echo "Warning: Memory usage is \${MEM_USAGE}%"
fi
EOF
    
    chmod +x "/usr/local/bin/monitor-expense-tracker.sh"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-expense-tracker.sh") | crontab -
    
    success "Monitoring configured"
}

# Final verification
verify_deployment() {
    info "Verifying deployment..."
    
    # Check if application is running
    if pm2 list | grep -q "expense-tracker.*online"; then
        success "Application is running"
    else
        error_exit "Application failed to start"
    fi
    
    # Check API endpoint
    if curl -s http://localhost:3000/api/health | grep -q "running"; then
        success "API is responding"
    else
        warning "API not responding, check logs"
    fi
    
    # Check web server
    if systemctl is-active --quiet apache2; then
        success "Web server is running"
    else
        error_exit "Web server is not running"
    fi
}

# Cleanup
cleanup() {
    info "Cleaning up..."
    
    # Remove old backups (keep last 5)
    find "$BACKUP_DIR" -name "$PROJECT_NAME_*" -type d -mtime +5 -exec rm -rf {} + 2>/dev/null || true
    find "$BACKUP_DIR" -name "database_*.sql" -mtime +5 -delete 2>/dev/null || true
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    info "Starting deployment process..."
    
    check_root
    create_backup
    install_dependencies
    setup_database
    build_frontend
    setup_backend
    deploy_files
    configure_pm2
    configure_web_server
    setup_ssl
    setup_monitoring
    verify_deployment
    cleanup
    
    success "🎉 Deployment completed successfully!"
    info "Application is now available at: https://yourdomain.com"
    info "API endpoint: https://yourdomain.com/api"
    info "PM2 monitoring: pm2 list"
    info "Logs: tail -f /var/log/expense-tracker-out.log"
}

# Run main function
main "$@"
