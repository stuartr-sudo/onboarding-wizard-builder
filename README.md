# 🎯 Onboarding Wizard Builder

A powerful, customizable onboarding wizard builder with a beautiful glassmorphic teal design. Built with Next.js 16, Supabase, and AI integration.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## ✨ Features

### 🎨 Beautiful UI/UX
- **Glassmorphic Design** with teal gradient theme
- **Responsive** mobile-first design
- **Smooth Animations** and transitions
- **Progress Bar** with step counter
- **Above-the-fold** step content (no scrolling per step)

### 🛠️ Admin Interface
- **Drag-and-drop** step reordering
- **Multiple field types**: text, textarea, dropdown, radio, toggle, color picker, image upload
- **Real-time updates** (no page refresh needed)
- **Mark fields as required** or optional
- **Custom descriptions** for each step
- **Preview mode** before publishing

### 👥 Client Experience
- **Multi-step wizard** with progress tracking
- **AI-powered features**:
  - 🎤 Voice-to-text (OpenAI Whisper)
  - ✨ AI suggestions (GPT-4o)
- **Auto-save** progress
- **File uploads** to Supabase Storage
- **Validation** (Next button only shows when required fields are filled)

### 🔒 Security
- **Row Level Security (RLS)** policies
- **User roles**: super_admin, admin, client
- **Supabase Auth** for admin login
- **Anonymous sessions** for clients
- **Secure file uploads**

### 📊 Pre-built Wizard
- **App Discovery Framework** (29 steps)
- Covers all aspects of app development requirements
- Fully customizable and editable

## 🚀 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI (Whisper API, GPT-4o)
- **Drag & Drop**: @dnd-kit
- **Deployment**: Vercel-ready

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- OpenAI API key (for AI features)

### 1. Clone the repository
```bash
git clone https://github.com/stuartr-sudo/onboarding-wizard-builder.git
cd onboarding-wizard-builder
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database schema:
   - Go to SQL Editor in Supabase Dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Execute the SQL

3. (Optional) Seed the App Discovery Framework wizard:
   ```bash
   npx tsx scripts/seed-wizard.ts
   ```

4. (Optional) Add step descriptions:
   - Run the SQL in `scripts/update-step-descriptions.sql` in Supabase SQL Editor

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Admin Access
1. Go to `/login` to create an admin account
2. After signup, update your role in Supabase:
   ```sql
   UPDATE profiles 
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```
3. Access the admin dashboard at `/admin`

### Building a Wizard
1. **Create a new wizard** or edit the existing one
2. **Add steps** with the "Add Step" button
3. **Drag to reorder** steps in the sidebar
4. **Add fields** to each step (text, dropdown, radio, etc.)
5. **Set field properties** (required, options, label)
6. **Preview** your wizard before publishing

### Client Flow
1. Share the wizard URL: `/wizards/{wizard-id}`
2. Clients complete the wizard step-by-step
3. View submissions in `/admin/submissions`

## 🎨 Customization

### Changing Colors
The teal gradient theme is defined in multiple places:

**Background Gradient**: `linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)`

Update in:
- `app/wizards/[id]/page.tsx` (start page)
- `app/wizards/[id]/steps/[stepNumber]/page.tsx` (step pages)
- `components/wizard/ClientStepForm.tsx` (buttons)

### Wizard Configuration
All wizard settings are stored in the `wizards` table in Supabase:
- `title`: Wizard name
- `description`: Brief description
- `theme_color_primary`: Primary brand color
- `font_family`: Custom font (optional)
- `logo_url`: Logo image URL (optional)

## 📁 Project Structure

```
├── app/
│   ├── admin/              # Admin dashboard
│   │   ├── wizards/        # Wizard management
│   │   └── submissions/    # View submissions
│   ├── api/                # API routes (AI features)
│   ├── auth/               # Authentication
│   ├── login/              # Login page
│   └── wizards/            # Client-facing wizards
├── components/
│   ├── admin/              # Admin UI components
│   └── wizard/             # Client wizard components
├── scripts/
│   ├── seed-wizard.ts      # Seed App Discovery wizard
│   ├── update-step-descriptions.sql
│   └── fix-admin-role.sql
├── supabase/
│   └── schema.sql          # Database schema + RLS
├── utils/
│   └── supabase/           # Supabase client helpers
└── types/                  # TypeScript types
```

## 🗄️ Database Schema

- **`profiles`**: User profiles with roles
- **`wizards`**: Wizard configurations
- **`wizard_steps`**: Individual steps
- **`wizard_fields`**: Form fields within steps
- **`wizard_submissions`**: Client submissions
- **`wizard_responses`**: Individual field responses

## 🔐 Security Features

- **Row Level Security (RLS)** on all tables
- **Role-based access control** (super_admin, admin, client)
- **Supabase Auth** for user management
- **Environment variables** for sensitive data
- **File upload validation**

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app is a standard Next.js application and can be deployed to any platform that supports Node.js.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- AI features by [OpenAI](https://openai.com/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Made with ❤️ by Stuart
