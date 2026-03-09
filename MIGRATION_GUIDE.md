# Database Migration Guide

## 🗄️ Migrating Production Database Schema to Local Development

### 📋 Files Created
1. **`database_local.sql`** - Production schema adapted for local development
2. **`env.local.example`** - Local environment variables template

### 🛠️ Migration Steps

#### Step 1: Setup Local Database
```bash
# Start MariaDB (if not running)
sudo systemctl start mariadb

# Create local database and import schema
mysql -u root -p < server/config/database_local.sql
```

#### Step 2: Configure Environment
```bash
# Copy environment template
cd server
cp env.local.example .env

# Update with your local database credentials
# Edit .env file with your actual values
```

#### Step 3: Verify Migration
```bash
# Test database connection
mysql -u expense_tracker_user -p expense_tracker

# Check tables
mysql -u expense_tracker_user -p expense_tracker -e "SHOW TABLES;"

# Check sample data
mysql -u expense_tracker_user -p expense_tracker -e "SELECT * FROM users;"
```

### 🔄 Key Differences Between Production and Local

| Feature | Production | Local |
|----------|-------------|--------|
| Database Name | `expense_tracker_prod` | `expense_tracker` |
| Database User | `nopacorn_admin` | `expense_tracker_user` |
| Environment | `production` | `development` |
| Sample Data | ❌ None | ✅ Demo data included |
| Debug Mode | ❌ Disabled | ✅ Enabled |
| CORS | `https://app.nopacorn.com` | `http://localhost:5173` |

### 🎯 Benefits of Local Development

1. **Safe Testing**: Won't affect production data
2. **Sample Data**: Pre-populated with test data
3. **Debug Mode**: Enhanced logging and error reporting
4. **Fast Development**: No need to set up test data manually

### 📝 Environment Variables

#### Required Changes in `.env`:
```env
NODE_ENV=development
DB_NAME=expense_tracker
DB_USER=expense_tracker_user
CLIENT_URL=http://localhost:5173
```

#### Optional Local Settings:
```env
LOG_LEVEL=debug          # Verbose logging
SMTP_HOST=smtp.gmail.com # For email testing
UPLOAD_PATH=uploads/    # Local file storage
```

### 🚀 Start Local Development

```bash
# Install dependencies
cd server
npm install

# Start development server
npm run dev

# In another terminal, start frontend
cd ..
npm run dev
```

### 🔍 Verification Checklist

- [ ] Local database created successfully
- [ ] Sample data imported
- [ ] Server connects to local database
- [ ] Frontend loads on http://localhost:5173
- [ ] API calls work on http://localhost:5000
- [ ] Demo user can login (demo@example.com)
- [ ] Sample transactions are visible

### 🎉 Migration Complete!

Your local development environment is now ready with:
- ✅ Production-ready schema
- ✅ Sample test data
- ✅ Enhanced security features
- ✅ Proper environment configuration

**Next Steps:**
1. Update `.env` with your actual database password
2. Run `npm run dev` to start development
3. Test with demo credentials: `demo@example.com`

The local environment now mirrors production capabilities while keeping your development isolated and safe! 🎯
