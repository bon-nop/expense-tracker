# Group Expense Tracker

A mobile-first web application for tracking personal and shared expenses with real-time balance calculations.

## Features

- **Personal Expense Tracking**: Record income and expenses with categories
- **Group Expense Management**: Create groups, invite members, and track shared expenses
- **Split Bills**: Automatic 50/50 split calculations for group expenses
- **Balance Tracking**: Real-time debt calculations and settlement tracking
- **Analytics**: Visual reports and spending insights
- **Mobile-First Design**: Responsive UI optimized for mobile devices

## Tech Stack

- **Frontend**: React.js, Vite, TailwindCSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MariaDB
- **Authentication**: JWT tokens
- **Styling**: TailwindCSS with custom components

## Prerequisites

- Node.js (v18 or higher)
- MariaDB (v10.4 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

1. Install MariaDB on your system
2. Start MariaDB service
3. Create database and user (optional):

```sql
-- Connect to MariaDB
mysql -u root -p

-- Create database
CREATE DATABASE expense_tracker;

-- Create user (optional)
CREATE USER 'expense_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON expense_tracker.* TO 'expense_user'@'localhost';
FLUSH PRIVILEGES;
```

4. Run the database schema:

```bash
mysql -u root -p expense_tracker < server/config/database.sql
```

### 2. Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Update environment variables in `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=expense_tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup

1. Navigate to project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Update environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm run dev
```

### 4. Running Both Servers

Use the convenience script to run both frontend and backend simultaneously:

```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Transactions
- `GET /api/transactions` - Get personal transactions
- `GET /api/transactions/group/:groupId` - Get group transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Groups
- `GET /api/groups` - Get user groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/join` - Join group by invite code
- `GET /api/groups/:id/balances` - Get group balances
- `POST /api/groups/:id/settle` - Settle debt

### Analytics
- `GET /api/analytics/personal/summary` - Personal analytics summary
- `GET /api/analytics/personal/categories` - Personal category breakdown
- `GET /api/analytics/group/:id/summary` - Group analytics summary

## Database Schema

The application uses the following main tables:
- `users` - User accounts
- `groups` - Group information
- `group_members` - Group membership junction table
- `transactions` - Expense/income records
- `transaction_splits` - Transaction split details
- `balances` - Group member balances

## Development

### Project Structure
```
expense-tracker/
├── src/                    # Frontend source
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── utils/             # Utility functions
│   └── ...
├── server/                # Backend source
│   ├── config/           # Database configuration
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── ...
└── README.md
```

### Adding New Features

1. **Backend**: Add new routes in `server/routes/` and models in `server/models/`
2. **Frontend**: Add new pages in `src/pages/` and components in `src/components/`
3. **Database**: Update `server/config/database.sql` for schema changes

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Update JWT secret with a secure value
3. Configure MariaDB for production use
4. Build frontend: `npm run build`
5. Start production server: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
