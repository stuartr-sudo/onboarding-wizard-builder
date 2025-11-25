-- Update step descriptions to provide clear context and guidance for each phase

-- Phase 1 Steps
UPDATE wizard_steps SET description = 'Help us understand what problem your app solves and who it''s designed for. This sets the foundation for everything that follows.' WHERE title = 'Phase 1: Current Situation';
UPDATE wizard_steps SET description = 'Select all user types that apply. Understanding your user hierarchy helps us design the right permission structure.' WHERE title = 'Phase 1: User Roles';
UPDATE wizard_steps SET description = 'Tell us about your primary audience. This helps us tailor the user experience to your specific users.' WHERE title = 'Phase 1: Target Audience';
UPDATE wizard_steps SET description = 'Define the business case and success metrics. These answers help us align technical decisions with your business goals.' WHERE title = 'Phase 1: Core Strategy';
UPDATE wizard_steps SET description = 'Choose which devices and platforms your app needs to support. This affects design, development approach, and timeline.' WHERE title = 'Phase 1: Platforms & Devices';
UPDATE wizard_steps SET description = 'Tell us about offline requirements and device compatibility. This impacts architecture decisions early on.' WHERE title = 'Phase 1: Offline & Legacy';
UPDATE wizard_steps SET description = 'Define what success looks like for your app launch. Clear metrics help us measure progress and ROI.' WHERE title = 'Phase 1: Success Metrics';

-- Phase 2 Steps  
UPDATE wizard_steps SET description = 'Security is critical. Tell us about your two-factor authentication requirements to protect your users.' WHERE title = 'Phase 2: Security (2FA)';
UPDATE wizard_steps SET description = 'How will users create accounts and sign in? Choose the authentication methods that work best for your audience.' WHERE title = 'Phase 2: Authentication';
UPDATE wizard_steps SET description = 'What information do you need to collect from users? This shapes your data model and user experience.' WHERE title = 'Phase 2: User Profiles';
UPDATE wizard_steps SET description = 'Social features can drive engagement. Select the communication tools your app needs.' WHERE title = 'Phase 2: Social Features';
UPDATE wizard_steps SET description = 'Push notifications keep users engaged. Define when and how you want to reach your users.' WHERE title = 'Phase 2: Notifications';
UPDATE wizard_steps SET description = 'What types of files will users upload? This affects storage planning and media handling.' WHERE title = 'Phase 2: Media Content';
UPDATE wizard_steps SET description = 'Does your app need access to device hardware? Select the permissions you''ll require.' WHERE title = 'Phase 2: Device Access';
UPDATE wizard_steps SET description = 'Location features can enhance your app. Tell us about your mapping and GPS requirements.' WHERE title = 'Phase 2: Maps & Location';
UPDATE wizard_steps SET description = 'How will your app make money? Understanding your business model shapes payment integration.' WHERE title = 'Phase 2: Commerce';
UPDATE wizard_steps SET description = 'Choose your payment providers. Different gateways have different fees and capabilities.' WHERE title = 'Phase 2: Payment Gateways';
UPDATE wizard_steps SET description = 'Does your app need scheduling features? Tell us about calendar and appointment needs.' WHERE title = 'Phase 2: Calendar & Events';

-- Phase 3 Steps
UPDATE wizard_steps SET description = 'What tools do you need to manage your app and users? Define your admin capabilities.' WHERE title = 'Phase 3: Admin Capabilities';

-- Phase 4 Steps
UPDATE wizard_steps SET description = 'Your app''s personality matters. Choose the design aesthetic that matches your brand.' WHERE title = 'Phase 4: Brand Aesthetic';
UPDATE wizard_steps SET description = 'Select advanced visual features. These choices impact development complexity and cost.' WHERE title = 'Phase 4: Interface & UX';
UPDATE wizard_steps SET description = 'Define your brand colors and fonts. Consistent branding creates a professional, memorable experience.' WHERE title = 'Phase 4: Brand Colors';

-- Phase 5 Steps
UPDATE wizard_steps SET description = 'Which external services need to integrate with your app? This affects API planning.' WHERE title = 'Phase 5: Integrations';
UPDATE wizard_steps SET description = 'Data residency matters for compliance. Tell us where your data needs to be stored.' WHERE title = 'Phase 5: Data Sovereignty';
UPDATE wizard_steps SET description = 'How should data be protected and isolated? Security architecture is critical for trust.' WHERE title = 'Phase 5: Security Model';
UPDATE wizard_steps SET description = 'Advanced security features for high-compliance environments. Select what your industry requires.' WHERE title = 'Phase 5: Advanced Security';

-- Phase 6 Steps
UPDATE wizard_steps SET description = 'Legal compliance protects you and your users. Select the regulations that apply to your business.' WHERE title = 'Phase 6: Compliance';

-- Phase 7 Steps
UPDATE wizard_steps SET description = 'Where should your app be hosted? Different providers have different strengths and pricing.' WHERE title = 'Phase 7: Hosting';
UPDATE wizard_steps SET description = 'What level of ongoing support do you need? This affects long-term costs and reliability.' WHERE title = 'Phase 7: Maintenance';

-- Budget & Timeline Steps
UPDATE wizard_steps SET description = 'Understanding your budget helps us scope the project realistically and prioritize features.' WHERE title = 'Phase 8: Budget & Timeline';
UPDATE wizard_steps SET description = 'Our partnership model: 50% deposit, 25% at MVP, 25% at deployment, plus 6% ownership and $1,500/month retainer.' WHERE title = 'Phase 8: Engagement Model';

