# 💰 Personal Financial Management App

A comprehensive financial management application built with cutting-edge web technologies, featuring intuitive expense tracking, intelligent budget management, and sophisticated analytics with beautiful data visualizations. This project demonstrates advanced full-stack development skills with modern React patterns, database optimization, and user-centric design.

## ✨ Key Features

### 🏠 Smart Dashboard
- **Dynamic Month/Year Navigation**: Seamlessly browse through any time period with intelligent data loading
- **Real-time Balance Tracking**: Live updates of income vs expenses with visual feedback
- **Interactive Transaction Management**: Add, edit, and categorize financial transactions with contextual date handling

### 📊 Advanced Analytics & Reports
- **Multi-Period Analysis**: 
  - Week-over-week comparisons with daily breakdowns
  - Month-over-month insights with categorical analysis  
  - Year-over-year trends with seasonal patterns
- **Interactive Data Visualizations**: 
  - Pie charts for category spending distribution
  - Area charts for income vs expense trends
  - Progress bars for budget utilization
- **Intelligent Insights**: AI-powered financial recommendations and spending pattern analysis
- **Top Expenses Tracking**: Automatic identification of largest expenditures with contextual information

### 🎯 Intelligent Budget Management
- **Category-based Budgeting**: Set monthly spending limits for custom categories
- **Real-time Budget Monitoring**: Visual progress indicators with color-coded alerts
- **Smart Notifications**: Proactive warnings when approaching or exceeding budget limits
- **Budget Performance Analytics**: Track budget adherence across different time periods

### 🔍 Powerful Transaction System
- **Advanced Filtering**: Multi-criteria search by description, category, amount, and date
- **Dynamic Sorting**: Sort by date, amount, description, or category with ascending/descending options
- **Smart Categorization**: Drag-and-drop category assignment with visual icons
- **Contextual Date Handling**: Intelligent date assignment based on selected viewing period

### 🎨 Modern User Experience
- **Dark/Light Theme**: System-aware theme switching with smooth transitions
- **Responsive Design**: Optimized for mobile-first experience with desktop enhancements
- **Progressive Web App**: Installable PWA with offline capabilities
- **Intuitive Navigation**: Tab-based interface with smooth animations

### 🔐 Enterprise-Grade Security
- **Modern Authentication**: Secure user management with Better Auth integration
- **Password Management**: Encrypted password changes with strength validation
- **Profile Management**: Secure image uploads with Cloudinary integration
- **Session Management**: Automatic session handling with refresh tokens

## 🛠️ Tech Stack

### Frontend Architecture
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router and server components
- **[TypeScript](https://www.typescriptlang.org/)** - End-to-end type safety with strict mode
- **[React Hooks](https://reactjs.org/docs/hooks-intro.html)** - Custom hooks for state management and side effects
- **[React Context](https://reactjs.org/docs/context.html)** - Global state management for theme and user data
- **[Shadcn/ui](https://ui.shadcn.com/)** - Modern, accessible component library with Radix UI
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS with custom design system
- **[Recharts](https://recharts.org/)** - Declarative charting library for data visualization
- **[Lucide React](https://lucide.dev/)** - Beautiful, customizable icon system

### Backend & Database
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe SQL toolkit with automatic migrations
- **[SQLite](https://www.sqlite.org/)** - Embedded database for development
- **[Turso](https://turso.tech/)** - Distributed SQLite for production deployment
- **[Better Auth](https://www.better-auth.com/)** - Modern authentication with social providers

### Cloud Services & DevOps
- **[Cloudinary](https://cloudinary.com/)** - Image optimization and management
- **[Vercel](https://vercel.com/)** - Deployment platform with edge functions
- **API Routes** - RESTful API design with proper error handling

## 🏗️ Project Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # RESTful API endpoints
│   │   ├── analytics/           # Advanced analytics engine
│   │   ├── auth/                # Authentication handlers
│   │   ├── categories/          # Category management CRUD
│   │   ├── transactions/        # Transaction processing
│   │   ├── upload/              # File upload handling
│   │   └── user/                # User profile & settings
│   ├── relatorios/              # Comprehensive reports page
│   ├── settings/                # User preferences & configuration  
│   ├── transactions/            # Transaction management interface
│   └── layout.tsx               # Root layout with providers
├── components/
│   ├── ui/                      # Reusable UI components
│   ├── common/                  # Business logic components
│   │   └── dashboard/           # Dashboard-specific components
│   └── forms/                   # Form components with validation
├── hooks/                       # Custom React hooks
│   ├── use-analytics.ts         # Analytics data management
│   ├── use-month-navigator.ts   # Date navigation logic
│   └── use-theme.ts             # Theme management
├── lib/                         # Utility libraries
│   ├── auth.ts                  # Authentication configuration
│   ├── auth-client.ts           # Client-side auth helpers
│   └── utils.ts                 # Common utilities
├── db/                          # Database layer
│   ├── schema.ts                # Drizzle schema definitions
│   └── index.ts                 # Database connection
└── types/                       # TypeScript type definitions
```

## 📊 Database Schema

### Core Tables
- **users**: User profiles with settings and preferences
- **accounts**: Authentication accounts with encrypted passwords
- **transactions**: Financial transactions with categorization
- **categories**: Custom spending categories with budget limits
- **sessions**: Secure session management

### Key Relationships
- Users have many transactions and categories
- Transactions belong to categories (optional)
- Categories have spending thresholds and visual customization


## 🎯 Key Features Walkthrough

### 📈 Analytics Engine
The analytics system (`/api/analytics`) provides comprehensive financial insights:

- **Period Comparisons**: Automatic calculation of trends vs previous periods
- **Category Analysis**: Spending breakdown with budget utilization
- **Top Expenses**: Identification of significant transactions
- **Visual Charts**: Dynamic data visualization with Recharts
- **Smart Insights**: Contextual financial advice based on spending patterns

### 🏷️ Category Management
Advanced categorization system with:

- **Custom Categories**: User-defined spending categories with visual icons
- **Budget Limits**: Monthly spending thresholds with progress tracking
- **Visual Indicators**: Color-coded progress bars and alerts
- **Smart Defaults**: Pre-configured categories for common expenses

### 📱 Transaction Interface
Sophisticated transaction management:

- **Multi-criteria Filtering**: Search by description, category, amount, type
- **Dynamic Sorting**: Flexible sorting options with visual feedback
- **Contextual Actions**: Edit, delete, and categorize with modal dialogs
- **Batch Operations**: Efficient handling of multiple transactions

### 🔧 User Preferences
Comprehensive settings management:

- **Profile Management**: Secure profile updates with image upload
- **Theme Switching**: Dark/light mode with system preference detection
- **Security Settings**: Password changes with strength validation
- **Notification Preferences**: Customizable alert settings

## 🎨 Design System

### Color Palette
- **Primary Green**: `#A8E6CF` - Success, positive values, primary actions
- **Accent Pink**: `#FFAAA5` - Categories, secondary actions, warnings
- **Gradients**: Multi-color gradients for visual appeal and hierarchy

### Typography
- Clean, modern typography with proper hierarchy
- Consistent spacing and sizing across components
- Dark mode optimized contrast ratios

### Component System
- Consistent design tokens throughout the application
- Reusable components with proper prop interfaces
- Accessible design following WCAG guidelines

## 📊 Performance Optimizations

- **Server Components**: Leverage Next.js 15 server components for optimal performance
- **Database Queries**: Optimized Drizzle queries with proper indexing
- **Image Optimization**: Cloudinary integration for responsive images
- **Code Splitting**: Automatic route-based code splitting
- **Caching Strategy**: Intelligent caching for API responses

## 🔒 Security Features

- **Authentication**: Secure session management with Better Auth
- **Password Encryption**: bcryptjs with configurable salt rounds
- **Input Validation**: Comprehensive validation on client and server
- **SQL Injection Prevention**: Type-safe queries with Drizzle ORM
- **XSS Protection**: Sanitized inputs and outputs

## 🧪 Testing & Quality

- **TypeScript**: Strict type checking for runtime safety
- **ESLint**: Code quality enforcement
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Responsive Testing**: Multi-device compatibility

## 📈 Future Enhancements

- [ ] Export functionality (PDF, CSV)
- [ ] Recurring transactions
- [ ] Multi-currency support
- [ ] Advanced goal setting
- [ ] Bank integration APIs
- [ ] Mobile app development
- [ ] Advanced analytics with ML

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 API Documentation

### Analytics Endpoints
- `GET /api/analytics?period=monthly` - Retrieve analytics data
- Supports `weekly`, `monthly`, `yearly` periods
- Returns category spending, trends, and insights

### Transaction Management
- `GET /api/transactions?year=2024&month=12` - List transactions
- `POST /api/transactions` - Create new transaction
- Automatic date context handling

### Category System
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn](https://twitter.com/shadcn) for the incredible UI component ecosystem
- [Drizzle Team](https://orm.drizzle.team/) for the type-safe ORM
- [Turso](https://turso.tech/) for distributed SQLite infrastructure
- [Better Auth](https://www.better-auth.com/) for modern authentication
- [Recharts](https://recharts.org/) for beautiful data visualization
