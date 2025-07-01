# 🎓 CampusCrew - Student Platform

A comprehensive campus collaboration platform designed specifically for CMR Group of Institutions students. Connect, collaborate, and grow together!

![CampusConnect](https://img.shields.io/badge/CampusConnect-v1.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg)

## 🏫 **Supported Institutions**

- **CMREC** - CMR Engineering College
- **CMRIT** - CMR Institute of Technology
- **CMRTC** - CMR Technical Campus
- **CMRCET** - CMR College of Engineering & Technology

## ✨ **Features**

### 🔐 **Authentication System**
- College email validation for secure access
- User profiles with college and skill information
- Secure login/logout with session management

### 💬 **Real-Time Communication**
- **Group Chat**: Connect with all CMR students in one place
- **Direct Messaging**: Private conversations with fellow students
- **Online Presence**: See who's currently active
- **Typing Indicators**: Real-time typing status
- **File Sharing**: Share documents and images in chat

### 💼 **Gig Marketplace**
- **Post Gigs**: Offer academic help, projects, or services
- **Browse Opportunities**: Find gigs that match your skills
- **Make Offers**: Submit proposals for available gigs
- **Offer Management**: Accept or reject offers on your posted gigs
- **Real-time Updates**: Get notified instantly when new gigs are posted

### 🔔 **Smart Notifications**
- Real-time notifications for new offers
- Message notifications for chat activity
- System announcements and updates
- Notification management (mark as read, delete)

### 📊 **User Dashboard**
- Track your posted gigs and their status
- View completed work and earnings
- Manage your profile and skills
- See your activity history

### 👨‍💼 **Admin Features**
- User management and moderation
- Content oversight capabilities
- System analytics and insights
- Secure admin authentication

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Git

### **Installation**

1. **Clone the repository**
```bash
git clone git@github.com:gauravthalod/CampusCrew.git
cd CampusCrew
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:8080` (or the port shown in terminal)

## 🛠️ **Tech Stack**

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for beautiful components
- **Lucide React** for icons
- **React Router** for navigation

### **Backend Ready**
- **Supabase** integration ready (optional)
- **Real-time subscriptions** support
- **File storage** capabilities
- **Authentication** infrastructure

### **Development Tools**
- **ESLint** for code quality
- **TypeScript** for type safety
- **PostCSS** for CSS processing
- **Vite** for fast builds

## 📱 **Responsive Design**

CampusConnect is fully responsive and works seamlessly on:
- 📱 **Mobile devices** (iOS/Android)
- 📱 **Tablets** (iPad/Android tablets)
- 💻 **Desktop computers** (Windows/Mac/Linux)
- 🖥️ **Large screens** (4K/ultrawide monitors)

## 🎨 **UI/UX Features**

- **Modern Design**: Clean, intuitive interface
- **Dark/Light Mode**: Comfortable viewing in any environment
- **Smooth Animations**: Polished user experience
- **Accessibility**: WCAG compliant design
- **Fast Loading**: Optimized performance

## 🔧 **Configuration**

### **Environment Variables**
```env
# App Configuration
VITE_APP_NAME=CampusConnect
VITE_APP_VERSION=1.0.0

# College Email Domains
REACT_APP_VALID_DOMAINS=cmrec.ac.in,cmrit.ac.in,cmrtc.ac.in,cmrcet.ac.in

# Features
REACT_APP_ENABLE_CHAT=true
REACT_APP_ENABLE_GIGS=true
REACT_APP_ENABLE_NOTIFICATIONS=true

# Demo Configuration
REACT_APP_DEMO_MODE=false
REACT_APP_DEMO_EMAIL=demo@cmrec.ac.in
```

## 📚 **Usage Guide**

### **For Students**

1. **Sign Up**: Register with your college email address
2. **Complete Profile**: Add your skills and college information
3. **Explore**: Browse the gig marketplace and join group chat
4. **Connect**: Start conversations with fellow students
5. **Collaborate**: Post gigs or apply for opportunities

### **For Gig Posters**

1. **Post a Gig**: Click the "+" button and fill in details
2. **Manage Offers**: Check notifications for incoming offers
3. **Accept/Reject**: Review and respond to offers
4. **Track Progress**: Monitor your gigs in the dashboard

### **For Service Providers**

1. **Browse Gigs**: Explore available opportunities
2. **Make Offers**: Submit proposals with your rates
3. **Get Notified**: Receive updates on offer status
4. **Build Reputation**: Complete gigs successfully

## 🤝 **Contributing**

We welcome contributions from the CMR community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **CMR Group of Institutions** for inspiration
- **React Community** for amazing tools
- **Tailwind CSS** for beautiful styling
- **Shadcn/ui** for component library
- **All contributors** who help improve CampusConnect

## 📞 **Support**

Need help? Reach out to us:

- 📧 **Email**: support@campusconnect.cmr.edu.in
- 💬 **Discord**: [Join our community](https://discord.gg/campusconnect)
- 🐛 **Issues**: [GitHub Issues](https://github.com/gauravthalod/CampusCrew/issues)
- 📖 **Documentation**: [Wiki](https://github.com/gauravthalod/CampusCrew/wiki)

---

**Made with ❤️ for CMR Group Students**

*Empowering collaboration, one connection at a time.*

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b9a5b6fe-6186-4d16-ab32-258f0cec6859) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
