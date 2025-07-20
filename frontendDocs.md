Part 4: UI Development: Components & Layouts
4.1. Reusable UI Library (/src/components/ui)

Prompt for Cursor: "Create a library of reusable UI components in /src/components/ui. Start with:

Button.tsx: A flexible button component that accepts variants (primary, secondary), size, and other standard button props. Style it with Tailwind CSS.

Input.tsx: A styled text input component.

Modal.tsx: A generic modal component that takes an isOpen prop and a children prop to display content."

Icon.tsx: A component that takes an icon name as a prop and dynamically renders an inline SVG. Create a few sample SVG icons (e.g., 'user', 'lock') within this component."

4.2. Application Layouts

Prompt for Cursor: "Create two distinct layout files:

/src/app/(marketing)/layout.tsx: This will be the layout for the public-facing pages. It should include a header and footer.

/src/app/dashboard/layout.tsx: This is the layout for the protected user area. It should include a persistent sidebar for navigation and a main content area. This layout should also wrap its children in the Redux Provider."

4.3. Private Routing

Prompt for Cursor: "Implement private routing for the dashboard. Use Next.js Middleware to protect all routes under the /dashboard path. If a user is not authenticated (i.e., no valid JWT), redirect them to the login page."

Modules:
Modern Landing Page
A compelling, minimalist marketing site to attract and inform potential customers about the software's value.
User stories: As a Product Manager, I've identified the following user stories for the "Modern Landing Page" feature, focusing on different potential customer mindsets and their goals. The page aims to be compelling, minimalist, and effective at attracting and informing.

---

### User Stories for Modern Landing Page

Feature: Modern Landing Page
Description: A compelling, minimalist marketing site to attract and inform potential customers about the software's value.

---

1. Initial Discovery & Value Proposition

- As a first-time visitor and potential customer,
- I want a clear, concise, and visually appealing overview of the software's primary benefits and features at a glance,
- so that I can quickly understand if it solves my problem and is worth exploring further without feeling overwhelmed by information or clutter.

Details/Acceptance Criteria:\*

- The above-the-fold content clearly states the core value proposition.
- Key benefits are highlighted with concise text and relevant visuals/icons.
- The overall design feels modern, clean, and professional.
- Loading speed is optimized to prevent early bounce.
- Provides a clear path to "learn more" or "explore features."

---

2. Deeper Exploration & Trust Building

- As a potential customer evaluating solutions,
- I want to easily access more detailed information, such as key features, common use cases, and social proof (testimonials/case studies),
- so that I can thoroughly assess the software's capabilities, understand how it applies to my specific needs, and build confidence in its value proposition before committing to a trial or demo.

Details/Acceptance Criteria:\*

- The page includes dedicated sections for features, clearly outlining what the software does.
- Relevant use cases or industry applications are presented to demonstrate applicability.
- Credible testimonials, client logos, or a link to case studies are prominently displayed.
- Information is presented in an easy-to-digest format (e.g., bullet points, short paragraphs, engaging visuals).
- Navigation allows users to jump between sections easily.

---

3. Conversion & Next Steps

- As a motivated potential customer,
- I want clear and prominent calls-to-action (CTAs) for key conversion points (e.g., 'Start Free Trial,' 'Request Demo,' 'Contact Sales'),
- so that I can easily take the next step towards experiencing the software or getting my specific questions answered, without any friction or confusion.

Details/Acceptance Criteria:\*

- CTAs are visually distinct and strategically placed throughout the page (e.g., above-the-fold, mid-page, footer).
- The CTA text is compelling and actionable.
- Clicking a CTA leads directly to the intended action (e.g., signup form, demo request form, contact page).
- The page implicitly guides users towards these CTAs through content flow and design.
- A clear "Pricing" section or link is easily discoverable.

User Stories for: Secure User Authentication
×
As a Product Manager, I've outlined detailed user stories for the "Secure User Authentication" feature. These stories capture different user scenarios and their underlying needs, ensuring we build a robust and user-centric system.

---

### Feature: Secure User Authentication

Description: A robust sign-in system with email-based password setup to ensure user accounts are protected.

---

Here are at least 3 distinct user stories:

1. User Story: First-Time Account Creation (Secure Onboarding)
   As a
   first-time user*,
   I want
   to create an account and set up my password through a secure email-based verification process*,
   so that
   I can gain access to the system quickly and confidently, knowing my initial login credentials are well-protected from unauthorized access.\*

2. User Story: Secure Login for Returning Users
   As a
   returning user*,
   I want
   to securely log into my account using my unique email and password*,
   so that
   I can reliably access my personalized dashboard and data without fear of unauthorized access, ensuring my information remains private and safe.\*

3. User Story: Password Recovery (Email-Based)
   As a
   user who has forgotten my password*,
   I want
   to reset my password through a secure, email-based recovery process that verifies my identity*,
   so that
   I can quickly regain access to my account without compromising its security, ensuring I'm the only one who can access my data even if I lose my credentials.\*

---

Additional Considerations (for further breakdown):

- User Story: Password Update/Change
  As a
  security-conscious user*,
  I want
  to be able to change my password securely from within my account settings*,
  so that
  I can proactively maintain the strength of my account's security and protect my personal information from potential threats.\*

- User Story: Account Locking (Security Measure)
  As a
  user whose account is potentially under attack*,
  I want
  the system to temporarily lock my account after multiple failed login attempts*,
  so that
  my account is automatically protected from brute-force attacks and unauthorized access, even if my password becomes known.\*

User Stories for: Stripe Payment Integration
×
As a Product Manager, here are three detailed user stories for the Stripe Payment Integration feature, focusing on different user types and how the integration provides a "seamless and secure payment processing using Stripe Checkout for a trustworthy purchase experience":

---

### Feature: Stripe Payment Integration

Description: Seamless and secure payment processing using Stripe Checkout for a trustworthy purchase experience.

---

User Story 1: The End-Customer (Buyer)

- As a Customer,
- I want to pay for my order using a familiar, secure, and intuitive payment gateway like Stripe Checkout,
- so that I can complete my purchase quickly, feel confident that my financial information is protected, and trust that my transaction will be processed accurately, leading to a smooth and worry-free buying experience.

---

User Story 2: The Store Owner/Business Administrator

- As a Store Owner / Business Administrator,
- I want payments from my customers to be securely processed and automatically reconciled through an integrated solution like Stripe,
- so that I can efficiently manage sales, easily track transactions, quickly process refunds if needed, and rely on a robust system that builds credibility with my customers without having to directly handle sensitive payment data.

---

User Story 3: The Customer Support Agent

- As a Customer Support Agent,
- I want to quickly access a customer's payment status and transaction details (e.g., successful, failed, refunded) directly within our system, powered by the Stripe integration,
- so that I can efficiently resolve payment-related inquiries, verify order statuses, or initiate refunds without needing to navigate to external systems, ensuring a seamless and reliable support experience for our customers.

User Stories for: Personal User Dashboard
×
As a Product Manager, here are detailed user stories for the Personal User Dashboard, focusing on the core functionalities: license keys, device management, and software downloads.

---

### Feature: Personal User Dashboard

Description: An intuitive dashboard where users can view their license keys, manage devices, and download the software.

---

#### User Story 1: Viewing and Understanding License Keys

- As a Registered User,
- I want to clearly see all my purchased license keys, including their associated product, current status (active/expired), expiration date, and remaining activations/seats (if applicable),
- so that I can easily manage my software entitlements, understand their validity, and know when I need to renew or if I have capacity for more installations.

- Acceptance Criteria:
- The dashboard displays a dedicated section for "My Licenses."
- Each license entry includes: Product Name, License Key (with option to copy), Status (e.g., Active, Expired, Suspended), Expiration Date, and number of available vs. total device activations/seats.
- An indicator (e.g., color code, icon) clearly highlights licenses approaching expiration or already expired.
- Users can sort licenses by product, status, or expiration date.
- Clicking on a license provides more detailed information (e.g., purchase date, last activated device).

#### User Story 2: Managing Associated Devices

- As a Registered User,
- I want to view a list of all devices currently associated with my license(s) and be able to easily deactivate an old or unused device,
- so that I can free up a license seat for a new device, remove access from lost/stolen hardware, or manage my installations across my owned computers.

- Acceptance Criteria:
- The dashboard displays a dedicated "My Devices" section.
- For each device, the following information is displayed: Device Name (user-editable), Operating System, Date of Last Activity/Activation, and the associated License Key.
- Users can initiate a "Deactivate Device" action next to each listed device.
- Upon deactivation, the license seat associated with that device is immediately freed up and available for a new activation.
- A confirmation dialog appears before deactivating a device, clearly stating the implications.
- Users can rename a device for easier identification.

#### User Story 3: Downloading Software and Updates

- As a Registered User,
- I want to easily access and download the latest compatible version of the software for my operating system directly from my dashboard,
- so that I can quickly install, reinstall, or upgrade my software without searching for download links, ensuring I always have the correct and most secure version.

- Acceptance Criteria:
- A prominent "Download Software" section is visible on the dashboard.
- The system automatically detects or suggests the most appropriate download based on the user's operating system (e.g., Windows, macOS, Linux).
- Users have the option to manually select a different OS version if needed.
- The download link always points to the latest stable release of the software.
- Information about the current software version available for download is displayed (e.g., Version Number, Release Date).
- For multi-product licenses, distinct download links are provided for each entitled product.
- Optionally, a changelog or release notes link is available for the latest version.

User Stories for: Unique License Key System
×
As a Product Manager, here are three detailed user stories for the "Unique License Key System" feature, following the requested format and including acceptance criteria for clarity.

---

### Feature: Unique License Key System

Description: Automated generation of unique, device-locked license keys upon purchase to protect the software intellectual property.

---

#### User Story 1: Initial Software Activation

- As a: Software Purchaser / Licensed User
- I want: to receive a unique license key immediately after purchasing the software, and then easily use it to activate the software on my primary device.
- So that: I can quickly gain legitimate access to the software and start using it without delay or complicated steps, feeling confident in my legal ownership.

Acceptance Criteria:

- AC1.1: The system automatically generates a unique license key upon successful completion of a software purchase.
- AC1.2: The license key is prominently displayed on the purchase confirmation page and sent to the user via email immediately after purchase.
- AC1.3: The software's initial setup or activation screen provides a clear and intuitive input field for the license key.
- AC1.4: Upon entering a valid unique license key, the software successfully validates it against the backend system.
- AC1.5: The system associates the license key with the specific device hardware (e.g., CPU ID, MAC address, hard drive serial) upon successful first activation.
- AC1.6: The software application becomes fully functional after successful activation.
- AC1.7: The user receives immediate visual confirmation within the software that it has been successfully activated.
- AC1.8: An invalid or previously used license key (on a different device) results in a clear error message, preventing activation.

---

#### User Story 2: License Transfer / Reactivation on New Device

- As a: Licensed Software User
- I want: to be able to deactivate my license from an old device and reactivate it on a new device (e.g., a new computer, a re-installation after a hardware upgrade, or a replacement machine).
- So that: I can continue using the software I legally own without needing to purchase a new license, ensuring flexibility and protecting my investment.

Acceptance Criteria:

- AC2.1: The software provides a clear mechanism (e.g., an in-app "Deactivate License" option or a web-based license management portal) for a user to initiate deactivation from their current device.
- AC2.2: Upon successful deactivation, the associated license key is released from the old device's hardware lock in the backend system.
  AC2.3: The released license key can then be used to activate the software on a
  new\* device.
- AC2.4: The system prevents the same license key from being simultaneously active on more than one device at any given time.
- AC2.5: If a user attempts to activate a license key that is still active on another device, they receive a clear message prompting them to deactivate it first or contact support.
- AC2.6: The system tracks and logs the history of license activations and deactivations for each key (device IDs, timestamps).
- AC2.7: There is a defined limit or policy (e.g., X transfers per year, or requiring support intervention after a certain number) for license transfers to prevent abuse, with clear messaging to the user if a limit is reached.

---

#### User Story 3: License Management and IP Protection (Admin/Support)

- As a: Software Company Administrator / Customer Support Agent
- I want: to have a secure backend system to view, validate, and manage (e.g., revoke, reset activations) unique license keys.
- So that: I can effectively protect our intellectual property by preventing unauthorized use, provide timely customer support for licensing issues, and maintain accurate records of active licenses.

Acceptance Criteria:

- AC3.1: The backend system provides a searchable interface to look up license keys by customer email, purchase ID, or the key itself.
- AC3.2: For each license key, the system displays its current status (e.g., Active, Deactivated, Revoked), associated customer information, and the hardware IDs of devices it has been activated on (if applicable).
- AC3.3: The system allows an administrator to manually revoke a specific license key, immediately rendering it unusable for any future activations.
- AC3.4: The system allows an administrator to reset the device lock for a specific license key, enabling a customer to reactivate it on a new device without needing prior deactivation (useful for lost/crashed devices).
- AC3.5: All administrative actions (revoking, resetting) are logged with timestamps and the administrator's ID for audit purposes.
- AC3.6: The system identifies and flags attempts to activate revoked or invalid license keys.
- AC3.7: The system can generate reports on active licenses, recent activations/deactivations, and potential abuse attempts.

User Stories for: Full Legal Compliance
×
As a Product Manager, here are detailed user stories for the "Full Legal Compliance" feature:

---

Feature: Full Legal Compliance
Description: Includes all necessary legal pages (ToS, Privacy Policy, EULA) to ensure the platform operates within regulatory guidelines.

---

### User Stories:

1. As a New User, I want to be prompted to review and explicitly accept the current Terms of Service (ToS), Privacy Policy, and End User License Agreement (EULA) upon registration, so that I understand the rules and legal basis for using the platform before gaining full access.

- Details:
- The registration flow must include a mandatory step where these documents are presented.
- Users must be able to scroll through the full text of each document.
- A clear checkbox or button confirming "I have read and agree to the [Document Name]" must be present for each document, or a single "I agree to all terms" after reviewing.
- The system must record the user's explicit acceptance, including the date and the specific version of the documents agreed upon.
- Users should not be able to proceed with registration until all required agreements are accepted.

2. As a Platform Administrator / Legal Officer, I want to be able to easily upload, update, and publish new versions of the Terms of Service (ToS), Privacy Policy, and End User License Agreement (EULA) through a dedicated interface, so that the platform always reflects the latest legal requirements and protects the business from potential liabilities.

- Details:
- A backend content management system (CMS) or dedicated legal page management tool should exist.
- Ability to upload documents in common web formats (e.g., HTML, Markdown, or direct text input).
- Version control for each document, allowing for historical review of past versions.
- A clear "publish" workflow to make new versions live.
- Option to set an effective date for new versions.
- Ability to trigger user notifications for significant updates (as per Story 3).

3. As an Existing User, I want to be automatically notified of and required to re-accept updated versions of the Terms of Service (ToS), Privacy Policy, or EULA upon their effective date, so that I am always aware of and in agreement with the current legal framework governing my use of the platform.

- Details:
- Upon login or first interaction after a new version becomes effective, a prominent notification or interstitial screen should appear.
- The notification should highlight that terms have changed and provide direct links to the new versions.
- Users must be able to review the updated documents and explicitly agree to them to continue using the platform's core features.
- The system must record the user's re-acceptance, including the date and the specific version agreed upon.
- If a user does not accept the new terms within a defined grace period (if applicable), their access to the platform may be restricted or terminated, with clear communication.
