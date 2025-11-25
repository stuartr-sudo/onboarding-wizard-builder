import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function seedAppDiscoveryWizard() {
  console.log('Starting seed...')

  // 1. Create the Wizard
  const { data: wizard, error: wizardError } = await supabase
    .from('wizards')
    .insert({
      title: 'App Discovery Framework',
      description: 'A master framework for Client Intake & Requirements Engineering.',
      theme_color_primary: '#000000',
      theme_color_secondary: '#ffffff',
    })
    .select()
    .single()

  if (wizardError) {
      console.error('Error creating wizard:', wizardError)
      throw new Error(wizardError.message)
  }
  const wizardId = wizard.id
  console.log('Created Wizard:', wizardId)

  // Helper to add steps and fields
  const addStep = async (stepNum: number, title: string, desc: string, fields: any[]) => {
    const { data: step, error: stepError } = await supabase
      .from('wizard_steps')
      .insert({
        wizard_id: wizardId,
        step_number: stepNum,
        title,
        description: desc,
      })
      .select()
      .single()

    if (stepError) {
        console.error('Error creating step:', stepError)
        throw new Error(stepError.message)
    }

    const fieldsToInsert = fields.map((f, index) => ({
      step_id: step.id,
      field_type: f.type,
      label: f.label,
      options: f.options, // Array or null
      required: f.required || false,
      order_index: index + 1,
    }))

    if (fieldsToInsert.length > 0) {
        const { error: fieldsError } = await supabase
        .from('wizard_fields')
        .insert(fieldsToInsert)
        
        if(fieldsError) {
            console.error('Error creating fields:', fieldsError)
            throw new Error(fieldsError.message)
        }
    }
  }

  try {
      // --- PHASE 1: The Core Strategy ---
      await addStep(1, 'Phase 1: Core Strategy', 'Goal: Define the business case and scope boundaries.', [
        { type: 'long_text', label: 'In one sentence, what does this app do?', required: true },
        { type: 'long_text', label: 'What is the primary problem this app solves?', required: true },
        { type: 'text_input', label: 'What is the name of the project/app (working title)?', required: true },
      ])

      await addStep(2, 'Phase 1: Target Audience', 'Who is the app for?', [
        { type: 'text_input', label: 'Who is the primary user? (e.g., Students, Doctors)', required: true },
        { 
          type: 'radio', 
          label: 'Is this a Single-Tenant or Multi-Tenant application?', 
          options: ['B2C (Consumer) - All users are individuals', 'B2B (SaaS) - Users belong to Organizations'],
          required: true 
        },
        {
          label: 'User Roles & Permissions',
          type: 'text_input', // Placeholder for multi-select description
          // In a real app we'd use a multi-select component. For now using text or separate toggles in next step.
        }
      ])
      
      await addStep(3, 'Phase 1: User Roles', 'Select all user types that apply.', [
          { type: 'toggle', label: 'Super Admin (System Owner)' },
          { type: 'toggle', label: 'Organization Admin (Customer Manager)' },
          { type: 'toggle', label: 'Editor/Manager' },
          { type: 'toggle', label: 'Standard Viewer' },
          { type: 'toggle', label: 'Guest (Unregistered)' },
          { type: 'text_input', label: 'Other (Custom Roles)' }
      ])

      // 1.3 Platforms
      await addStep(4, 'Phase 1: Platforms & Devices', 'Where must this app live?', [
          { type: 'toggle', label: 'Web (Browser-based)' },
          { type: 'toggle', label: 'iOS (iPhone/iPad)' },
          { type: 'toggle', label: 'Android (Phone/Tablet)' },
          { type: 'toggle', label: 'Desktop (Windows/macOS native)' },
          { type: 'toggle', label: 'Wearables (WatchOS/WearOS)' },
          { type: 'toggle', label: 'Smart TV (tvOS/Android TV)' },
      ])

      await addStep(5, 'Phase 1: Offline & Legacy', 'Technical Constraints', [
          { 
              type: 'radio', 
              label: 'Is offline support required?', 
              options: [
                  'No, app requires internet connection.', 
                  'Yes, read-only access when offline.', 
                  'Yes, full read/write sync when back online.'
              ] 
          },
          { type: 'toggle', label: 'Does it need to work on legacy devices (>3 years old)?' }
      ])

      // 1.4 Success Metrics
      await addStep(6, 'Phase 1: Success Metrics', 'What defines success for v1.0?', [
          { type: 'toggle', label: 'User Acquisition' },
          { type: 'toggle', label: 'Revenue Generation' },
          { type: 'toggle', label: 'Process Efficiency' },
          { type: 'toggle', label: 'Data Collection' },
          { type: 'toggle', label: 'Brand Awareness' },
      ])


      // --- PHASE 2: Functional Requirements ---
      
      // 2.1 Auth
      await addStep(7, 'Phase 2: Authentication', 'How do users sign up?', [
          { type: 'toggle', label: 'Email/Password' },
          { type: 'toggle', label: 'Social: Google' },
          { type: 'toggle', label: 'Social: Apple' },
          { type: 'toggle', label: 'Social: Facebook/LinkedIn' },
          { type: 'toggle', label: 'Social: Microsoft/GitHub' },
          { type: 'toggle', label: 'Phone Number (OTP)' },
          { type: 'toggle', label: 'SSO (Enterprise)' },
          { type: 'toggle', label: 'No Login (Guest)' },
      ])
      
      await addStep(8, 'Phase 2: Security (2FA)', 'Two-Factor Authentication', [
           { 
              type: 'radio', 
              label: 'Is 2FA/MFA required?', 
              options: [
                  'No', 
                  'Optional (SMS/App)', 
                  'Mandatory for all', 
                  'Mandatory for Admins only'
              ] 
          },
      ])

      // 2.2 Profiles
      await addStep(9, 'Phase 2: User Profiles', 'What data is captured?', [
          { type: 'toggle', label: 'Avatar/Photo' },
          { type: 'toggle', label: 'Bio/Description' },
          { type: 'toggle', label: 'Location/Address' },
          { type: 'toggle', label: 'Social Media Links' },
          { type: 'toggle', label: 'Portfolio/Gallery' },
          { type: 'toggle', label: 'File Attachments' },
      ])

      // 2.3 Social
      await addStep(10, 'Phase 2: Social Features', 'Communication requirements', [
          { type: 'toggle', label: 'Activity Feed' },
          { type: 'toggle', label: 'Direct Messaging (1-on-1)' },
          { type: 'toggle', label: 'Group Chat' },
          { type: 'toggle', label: 'Comments & Threading' },
          { type: 'toggle', label: 'Reactions/Likes' },
      ])
      
      await addStep(11, 'Phase 2: Notifications', 'Push Notification Triggers', [
          { type: 'toggle', label: 'Manual Marketing Blasts' },
          { type: 'toggle', label: 'Transactional' },
          { type: 'toggle', label: 'Social Interactions' },
          { type: 'toggle', label: 'Geofencing' },
      ])

      // 2.4 Media
      await addStep(12, 'Phase 2: Media Content', 'What will users upload?', [
          { type: 'toggle', label: 'Profile Images' },
          { type: 'toggle', label: 'Photos' },
          { type: 'toggle', label: 'Videos (Short form)' },
          { type: 'toggle', label: 'Videos (Long form)' },
          { type: 'toggle', label: 'Audio/Voice' },
          { type: 'toggle', label: 'Documents (PDF/Docx)' },
      ])
      
       await addStep(13, 'Phase 2: Device Access', 'Hardware permissions', [
          { type: 'toggle', label: 'Camera' },
          { type: 'toggle', label: 'Photo Gallery' },
          { type: 'toggle', label: 'Microphone' },
          { type: 'toggle', label: 'Contacts List' },
          { type: 'toggle', label: 'Bluetooth/NFC' },
      ])

      // 2.5 Location
      await addStep(14, 'Phase 2: Maps & Location', 'Location features', [
          { type: 'toggle', label: 'Display points on map' },
          { type: 'toggle', label: 'User Location Tracking' },
          { type: 'toggle', label: 'Routing/Navigation' },
          { type: 'toggle', label: 'Proximity Search' },
      ])

      // 2.6 Commerce
      await addStep(15, 'Phase 2: Commerce', 'Monetization Model', [
          { type: 'toggle', label: 'One-time Purchase' },
          { type: 'toggle', label: 'Recurring Subscription' },
          { type: 'toggle', label: 'Marketplace' },
          { type: 'toggle', label: 'In-App Purchases' },
      ])
      
      await addStep(16, 'Phase 2: Payments', 'Gateway Preference', [
          { type: 'toggle', label: 'Stripe' },
          { type: 'toggle', label: 'PayPal' },
          { type: 'toggle', label: 'Apple/Google Pay' },
          { type: 'toggle', label: 'Razorpay' },
          { type: 'toggle', label: 'Authorize.net' },
      ])

      // 2.7 Calendar
      await addStep(17, 'Phase 2: Calendar', 'Scheduling features', [
          { type: 'toggle', label: 'Event Creation' },
          { type: 'toggle', label: 'Appointment Booking' },
          { type: 'toggle', label: 'Sync Google/Outlook' },
          { type: 'toggle', label: 'Recurring Events' },
          { type: 'toggle', label: 'Timezone Management' },
      ])

      // --- PHASE 3: Admin Dashboard ---
      await addStep(18, 'Phase 3: Admin Dashboard', 'Management Capabilities', [
          { type: 'toggle', label: 'User Management' },
          { type: 'toggle', label: 'Dashboard Analytics' },
          { type: 'toggle', label: 'Content Moderation' },
          { type: 'toggle', label: 'Financial Management' },
          { type: 'toggle', label: 'Impersonate User' },
          { type: 'toggle', label: 'CMS' },
          { type: 'toggle', label: 'Export Data' },
      ])

      // --- PHASE 4: Design & UX ---
      await addStep(19, 'Phase 4: Branding', 'What is the vibe?', [
          { 
              type: 'radio', 
              label: 'Brand Style', 
              options: [
                  'Professional/Corporate', 
                  'Playful/Gamified', 
                  'Minimalist/Modern', 
                  'Luxury/High-end',
                  'Brutalist/Bold'
              ] 
          },
      ])
      
      await addStep(20, 'Phase 4: Interface', 'Visual preferences', [
          { type: 'toggle', label: 'Dark Mode Support' },
          { type: 'toggle', label: 'Custom Illustrations' },
          { type: 'toggle', label: '3D Elements' },
          { type: 'toggle', label: 'Micro-interactions' },
          { type: 'toggle', label: 'Accessibility First' },
      ])

      // --- PHASE 5: Technical ---
      await addStep(21, 'Phase 5: Integrations', 'External systems', [
          { type: 'toggle', label: 'CRM (Salesforce, HubSpot)' },
          { type: 'toggle', label: 'Marketing (Mailchimp, etc)' },
          { type: 'toggle', label: 'Analytics (GA, Mixpanel)' },
          { type: 'toggle', label: 'Customer Support (Intercom)' },
          { type: 'toggle', label: 'CMS (Contentful, Strapi)' },
          { type: 'toggle', label: 'Accounting (Xero)' },
          { type: 'toggle', label: 'AI Models (OpenAI)' },
      ])
      
      await addStep(22, 'Phase 5: Data Handling', 'Sovereignty & Isolation', [
          { 
              type: 'radio', 
              label: 'Data Sovereignty', 
              options: ['Global', 'USA Only', 'EU Only', 'APAC Only'] 
          },
          { 
              type: 'radio', 
              label: 'Data Isolation Model', 
              options: ['Open', 'User-Private', 'Team-Private'] 
          },
      ])
      
      await addStep(23, 'Phase 5: Security', 'Advanced Features', [
          { type: 'toggle', label: 'Row Level Security (RLS)' },
          { type: 'toggle', label: 'Audit Logs' },
          { type: 'toggle', label: 'End-to-End Encryption' },
          { type: 'toggle', label: 'Field-Level Encryption' },
          { type: 'toggle', label: 'IP Allow-listing' },
      ])

      // --- PHASE 6: Legal ---
      await addStep(24, 'Phase 6: Compliance', 'Regulatory Requirements', [
          { type: 'toggle', label: 'GDPR' },
          { type: 'toggle', label: 'CCPA' },
          { type: 'toggle', label: 'HIPAA' },
          { type: 'toggle', label: 'COPPA' },
          { type: 'toggle', label: 'PCI-DSS' },
          { type: 'toggle', label: 'SOC2' },
      ])

      // --- PHASE 7: Post-Launch ---
      await addStep(25, 'Phase 7: Hosting', 'Infrastructure', [
          { 
              type: 'radio', 
              label: 'Preferred Cloud Provider', 
              options: ['AWS', 'GCP', 'Azure', 'Vercel/Netlify', 'DigitalOcean', 'On-Premise', 'I don\'t know'] 
          },
      ])
      
      await addStep(26, 'Phase 7: Maintenance', 'Support Needs', [
          { type: 'toggle', label: 'Critical Bug Fixes only' },
          { type: 'toggle', label: 'Monthly Updates' },
          { type: 'toggle', label: 'Retainer for tweaks' },
          { type: 'toggle', label: '24/7 Monitoring' },
      ])

      console.log('Seeding complete!')
  } catch (e) {
      console.error('Seeding failed:', e)
  }
}

seedAppDiscoveryWizard()
