import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Shield, Scale, BookOpen } from 'lucide-react';

interface PolicySection {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  content: string;
}

const policies: PolicySection[] = [
  {
    id: 'terms', title: 'Terms & Conditions', category: 'Legal', icon: Scale,
    content: `Welcome to Young Warriors Cricket Club ("YWCC"). By enrolling in our programs or accessing our services, you agree to be bound by these Terms and Conditions.

**1. Enrollment & Membership**
Enrollment in any YWCC program is subject to availability and acceptance by the academy management. Membership is non-transferable and personal to the registered individual.

**2. Fees & Payments**
All fees must be paid by the stated due dates. Late payments may incur additional charges. The academy reserves the right to suspend access to training sessions for accounts with outstanding dues exceeding 30 days.

**3. Code of Conduct**
All players, parents, and guardians are expected to maintain respectful conduct at all times. Violations may result in suspension or termination of membership without refund.

**4. Program Changes**
YWCC reserves the right to modify program schedules, coaches, and facilities with reasonable prior notice. Material changes will be communicated at least 7 days in advance.

**5. Liability**
Participation in cricket involves inherent physical risks. YWCC takes all reasonable precautions for safety but is not liable for injuries sustained during training or matches when proper protocols are followed.

**6. Intellectual Property**
All content, branding, and materials created by YWCC remain the intellectual property of the academy.

**7. Governing Law**
These terms are governed by the laws of India. Any disputes shall be subject to jurisdiction of courts in the academy's registered city.

By enrolling, you acknowledge that you have read, understood, and agree to these Terms & Conditions.`
  },
  {
    id: 'privacy', title: 'Privacy Policy', category: 'Legal', icon: Shield,
    content: `Young Warriors Cricket Club is committed to protecting the privacy of all members, players, and website users.

**Information We Collect**
- Personal identification: Name, date of birth, contact details, guardian information
- Cricket profile: Position, stats, attendance, performance records
- Payment information: Fee history and transaction records
- Communications: Messages sent through our platform

**How We Use Information**
- Managing academy enrollment and attendance
- Processing fee payments and sending reminders
- Communicating important academy updates
- Improving our programs and services
- Generating performance reports for players and parents

**Data Security**
We implement industry-standard security measures including encrypted data storage, secure access controls, and regular security audits.

**Data Sharing**
We do not sell, trade, or share personal data with third parties except:
- As required by law or court order
- With authorized coaches and staff for training purposes
- With payment processors for fee collection

**Data Retention**
Player data is retained for the duration of membership plus 3 years for compliance purposes.

**Your Rights**
You have the right to access, correct, or request deletion of your personal data by contacting our admin office.

**Contact**
For privacy concerns, contact: privacy@youngwarriorscc.in`
  },
  {
    id: 'refund', title: 'Refund & Cancellation Policy', category: 'Legal', icon: Scale,
    content: `**Enrollment Fee**
The initial enrollment/registration fee is non-refundable once the player has commenced training.

**Monthly/Quarterly Fees**
- Cancellation more than 15 days before the billing period: Full refund
- Cancellation 8–15 days before: 50% refund
- Cancellation within 7 days or after period starts: No refund

**Annual Fees**
Annual fee refunds are processed on a pro-rata basis for unused months, minus a 10% administrative fee, for cancellations made with valid written notice.

**Medical Withdrawals**
Full or partial refunds may be considered for documented medical emergencies preventing participation. A medical certificate from a registered physician is required.

**Program Cancellation by Academy**
If YWCC cancels a program, enrolled players will receive a full refund for the cancelled period.

**How to Request a Refund**
Submit a written request to the admin office with your registration number and reason for refund. Refunds are processed within 15 working days.

**Exceptional Circumstances**
Refund requests due to relocation, family emergencies, or other extraordinary circumstances will be reviewed case-by-case by academy management.`
  },
  {
    id: 'cookie', title: 'Cookie Policy', category: 'Legal', icon: Shield,
    content: `**What Are Cookies**
Cookies are small text files stored on your device when you visit our website. They help us provide a better experience by remembering your preferences.

**Cookies We Use**
- Session cookies: Required for login and portal access (deleted when browser closes)
- Preference cookies: Remember your display settings and language preferences
- Analytics cookies: Help us understand how the website is used (anonymized)

**Managing Cookies**
You can control cookies through your browser settings. Disabling session cookies may prevent login functionality.

**Third-Party Cookies**
We may use analytics services that set their own cookies. These are subject to those providers' privacy policies.

By continuing to use our website, you consent to our use of cookies as described in this policy.`
  },
  {
    id: 'disclaimer', title: 'Disclaimer', category: 'Legal', icon: FileText,
    content: `**General Disclaimer**
The information on this website is provided for general informational purposes. While we strive to keep information accurate and current, we make no warranties about completeness, accuracy, or suitability of the information.

**Training Results**
Individual results from training programs vary. Any testimonials or success stories represent individual experiences and do not guarantee similar outcomes for all participants.

**External Links**
Our website may contain links to external websites. YWCC is not responsible for the content or practices of those sites.

**Medical Disclaimer**
Information provided about cricket fitness and training is general in nature. Consult a qualified medical professional before starting any new physical activity, especially if you have existing health conditions.`
  },
  {
    id: 'rules', title: 'Academy Rules & Regulations', category: 'Academy', icon: BookOpen,
    content: `**Attendance Requirements**
- Minimum 75% attendance required to remain in good standing
- Three consecutive absences without notice may result in suspension
- Inform the academy at least 2 hours before a session if unable to attend

**Punctuality**
- Players must arrive 10 minutes before scheduled sessions
- Three late arrivals (after 15 minutes) count as one absence
- Persistent lateness will be addressed with parents/guardians

**Equipment**
- Players are responsible for maintaining their personal equipment
- Academy equipment must be used with care and returned after each session
- Damage due to negligence may result in replacement costs

**Training Ground Conduct**
- No unauthorized access to the main pitch during matches or professional training
- Follow all safety instructions from coaches immediately
- No consumption of food or beverages in training areas except water

**Communication**
- All concerns should be raised respectfully with coaches or admin staff
- Social media posts about academy activities must be positive and appropriate
- Contact academy management through official channels only

**Disciplinary Process**
- Verbal warning → Written warning → Suspension → Expulsion
- Serious misconduct may skip earlier stages`
  },
  {
    id: 'player-conduct', title: 'Player Code of Conduct', category: 'Academy', icon: BookOpen,
    content: `**On the Field**
1. Respect all coaches, umpires, and officials — their decisions are final
2. Play with full effort and sportsmanship at all times
3. Celebrate victories humbly and accept defeats gracefully
4. Never deliberately injure or intimidate opponents
5. Report any unsafe conditions to coaches immediately

**Off the Field**
1. Represent YWCC with pride in appearance and behavior
2. Maintain academic responsibilities alongside cricket training
3. Avoid substances that may harm performance or health
4. Be a positive ambassador for the academy in the community

**Respect for Teammates**
1. Encourage and support fellow players regardless of skill level
2. No bullying, harassment, or discrimination of any kind
3. Celebrate others' achievements genuinely
4. Resolve conflicts peacefully and through proper channels

**Digital Conduct**
1. Do not share negative content about the academy or teammates online
2. Seek permission before posting photos or videos of other players
3. Represent yourself professionally on social media

**Consequences**
Violation of the Player Code of Conduct may result in suspension from training sessions, removal from match squads, or termination of membership.`
  },
  {
    id: 'parent-conduct', title: 'Parent Code of Conduct', category: 'Academy', icon: BookOpen,
    content: `**During Training & Matches**
1. Remain in designated spectator areas during all training sessions
2. Do not enter the training ground or coaching area without permission
3. Avoid shouting instructions to players during sessions — trust the coaches
4. Applaud good play from both teams during matches

**Communication with Staff**
1. Raise concerns privately with coaches or admin — not publicly or during sessions
2. Schedule meetings through official channels for detailed discussions
3. Treat all academy staff with courtesy and respect

**Behavior Standards**
1. No abusive language, aggressive behavior, or threats toward staff, players, or other parents
2. Do not disparage other players, coaches, or the academy publicly
3. Set a positive example of sportsmanship for all children

**Supporting Your Player**
1. Focus on effort and learning, not just results
2. Ensure your child arrives on time with proper equipment
3. Inform the academy promptly of any health concerns, injuries, or personal issues affecting attendance

**Consequences for Parents**
Parents who repeatedly violate this code may be asked to leave academy premises, and in serious cases, their child's membership may be terminated.`
  },
  {
    id: 'coach-conduct', title: 'Coach Code of Conduct', category: 'Academy', icon: BookOpen,
    content: `**Professional Standards**
1. Maintain current coaching qualifications and pursue continuous development
2. Arrive fully prepared for all sessions with clear objectives
3. Maintain accurate records of player attendance and progress
4. Adhere to all YWCC policies and reporting requirements

**Player Welfare**
1. Player safety and wellbeing are the highest priority in all decisions
2. Tailor coaching approaches to individual player needs and abilities
3. Never use physical punishment or abusive language
4. Promptly report any safeguarding concerns to senior management

**Relationships**
1. Maintain professional relationships with players and parents at all times
2. One-on-one sessions with minors must be in visible, public spaces
3. All communication with underage players must involve parents or guardian knowledge
4. Never engage in inappropriate communication via social media or messaging apps

**Confidentiality**
1. Player personal and medical information is strictly confidential
2. Performance discussions should occur privately, not publicly
3. Do not share internal academy matters with external parties

**Integrity**
1. Manage team selection fairly and transparently based on merit and conduct
2. Never accept gifts or favors that could compromise impartiality
3. Report conflicts of interest immediately to management`
  },
  {
    id: 'child-safety', title: 'Child Safety & Safeguarding Policy', category: 'Welfare', icon: Shield,
    content: `**Our Commitment**
Young Warriors Cricket Club is committed to providing a safe environment for all players, particularly children under 18 years of age. Every child has the right to participate in cricket free from abuse, exploitation, and harm.

**Safeguarding Principles**
- The welfare of the child is paramount
- All children deserve protection regardless of background
- Concerns will be taken seriously and acted upon promptly
- Allegations will be handled fairly and confidentially

**Designated Safeguarding Officer**
The academy maintains a Designated Safeguarding Officer (DSO) responsible for receiving, recording, and escalating concerns. Contact: safeguarding@youngwarriorscc.in

**Safe Practices**
- Criminal background checks for all staff working with minors
- At least two adults present at all training sessions
- Changing room access policy strictly enforced
- No photography of minors without explicit parental consent

**Signs of Concern**
Any unexplained injuries, behavioral changes, or disclosures from players will be responded to sensitively and in accordance with statutory guidelines.

**Reporting Procedures**
1. Any concern should be reported to the DSO immediately
2. Records will be maintained confidentially
3. Where necessary, concerns will be referred to appropriate authorities
4. Parents will be informed unless this would put the child at greater risk`
  },
  {
    id: 'anti-bullying', title: 'Anti-Bullying & Anti-Harassment Policy', category: 'Welfare', icon: Shield,
    content: `**Definition**
Bullying is defined as repeated, intentional behavior that causes physical, emotional, or social harm. This includes verbal abuse, physical aggression, cyberbullying, and social exclusion.

**Zero Tolerance**
YWCC has zero tolerance for any form of bullying, harassment, or discrimination based on age, gender, race, religion, disability, or any other characteristic.

**All Forms Prohibited**
- Physical bullying: hitting, pushing, damaging property
- Verbal bullying: name-calling, threats, insults
- Social bullying: exclusion, spreading rumors, manipulation
- Cyberbullying: online harassment, sharing embarrassing content

**Reporting**
Players or parents who experience or witness bullying should report it to any academy staff member. Reports can be made anonymously.

**Investigation Process**
1. All reports are taken seriously and investigated promptly
2. Complainant and alleged bully interviewed separately
3. Evidence gathered and reviewed
4. Appropriate action taken

**Support**
Both victims and those who bully others may receive support from the academy to address underlying issues and restore positive relationships where appropriate.`
  },
  {
    id: 'health-safety', title: 'Health & Safety Policy', category: 'Welfare', icon: Shield,
    content: `**Commitment to Safety**
YWCC is committed to providing safe training facilities and practices that minimize the risk of injury to all players, staff, and visitors.

**Risk Assessment**
Regular risk assessments are conducted for all training areas, equipment, and activities. Identified hazards are addressed promptly.

**Equipment Safety**
- All cricket equipment is inspected regularly and replaced when worn
- Protective equipment (helmet, pads, gloves) is mandatory for batting
- Faulty equipment must not be used and should be reported immediately

**Training Ground Safety**
- Playing surface inspected before each session
- Adequate lighting required for evening sessions
- Emergency exits and first aid kit locations known to all staff
- No unauthorized vehicles in training areas

**Emergency Procedures**
1. In case of serious injury: Call emergency services (112) immediately
2. Designated first aider must be notified
3. Incident report completed within 24 hours
4. Parents/guardians notified promptly

**Weather Safety**
Training is suspended during lightning, heavy rain, or extreme heat. Coaches have authority to cancel sessions for safety reasons.

**First Aid**
At least one trained first aider present at all sessions. First aid kit maintained and checked monthly.`
  },
  {
    id: 'medical-consent', title: 'Medical Consent Policy', category: 'Welfare', icon: Shield,
    content: `**Medical Information Requirement**
All enrolled players must provide complete medical history including:
- Known allergies (food, medication, environmental)
- Existing medical conditions
- Current medications
- Previous serious injuries or surgeries
- Emergency contact details

**Consent for Treatment**
By enrolling, parents/guardians provide consent for academy staff to:
- Administer first aid in emergencies
- Call emergency services when necessary
- Transport to hospital in life-threatening situations

**Updates Required**
Parents must immediately inform the academy of any changes to medical conditions, medications, or relevant health information.

**Confidentiality**
Medical information is shared only with relevant staff on a need-to-know basis and stored securely.

**Fitness to Participate**
- Players returning from injury must provide medical clearance
- Coaches may exclude players showing signs of serious illness or injury
- Players with concussion must not train until medically cleared

**Medication at the Academy**
Players who require medication during training must:
1. Inform their coach and provide written notice
2. Store medication safely
3. Self-administer unless prior written parental authorization is given`
  },
  {
    id: 'injury-waiver', title: 'Injury & Liability Waiver', category: 'Legal', icon: Scale,
    content: `**Acknowledgment of Risk**
I/We acknowledge that participation in cricket involves inherent physical risks including but not limited to sprains, fractures, concussions, and eye injuries.

**Assumption of Risk**
By enrolling, participants voluntarily assume all risks associated with cricket training and match play, including risks that may arise from the negligence of others.

**YWCC Liability**
Young Warriors Cricket Club shall not be held liable for injuries sustained during training or matches, provided that:
- Proper safety protocols were followed
- Appropriate protective equipment was available and used
- The injury was not caused by gross negligence of academy staff

**Medical Expenses**
YWCC does not provide medical insurance. Participants are responsible for their own medical expenses. We strongly recommend all players maintain appropriate health/sports insurance coverage.

**Emergency Treatment Consent**
In the event of a life-threatening emergency where parents cannot be immediately reached, YWCC staff are authorized to consent to emergency medical treatment.

**Property Liability**
YWCC is not responsible for loss or damage to personal property brought to academy premises.`
  },
  {
    id: 'photography', title: 'Photography & Video Consent Policy', category: 'Academy', icon: FileText,
    content: `**Purpose**
YWCC may photograph or video players during training, matches, and academy events for:
- Academy records and performance analysis
- Academy website, social media, and promotional materials
- Press releases and media coverage

**Consent**
Enrollment constitutes consent for photography and video recording unless a written opt-out is provided to the admin office.

**Opt-Out Rights**
Parents/guardians may opt out of all photography by submitting a written request. Opt-out requests will be respected and documented.

**Children's Images**
Images of players under 18 will:
- Never be used in a way that could embarrass or exploit the child
- Not include full names unless explicit consent is given
- Not be sold to third parties
- Be stored securely and deleted when no longer needed

**Player-Taken Photography**
Players and parents taking photos/videos at academy events must:
- Seek permission from subjects before publishing
- Not photograph changing rooms or private areas
- Report any concerns about inappropriate photography immediately`
  },
  {
    id: 'attendance-policy', title: 'Attendance Policy', category: 'Academy', icon: BookOpen,
    content: `**Minimum Attendance Requirement**
Players are expected to maintain a minimum attendance rate of 75% across all scheduled training sessions.

**Reporting Absences**
- Notify the academy at least 2 hours before a session via phone or the player portal
- Email notification acceptable for advance absences
- Unexplained absences are marked as absent and affect standing

**Leave of Absence**
Extended leave (more than 5 consecutive days) must be formally requested in writing. Medical certificates required for medical leave.

**Impact of Poor Attendance**
- Below 75%: Warning letter to player and parent
- Below 60%: Review meeting with academy management
- Below 50% for 2 consecutive months: Possible suspension pending review

**Attendance and Match Selection**
Players with attendance below 75% may not be selected for academy representative teams and tournaments.

**Holiday Periods**
Academy holidays are published in advance. Sessions scheduled during public holidays are marked accordingly and do not affect attendance calculations.

**Make-Up Sessions**
The academy does not provide formal make-up sessions for individual absences. Players are encouraged to practice independently and seek guidance from coaches.`
  },
  {
    id: 'fee-policy', title: 'Fee Payment Policy', category: 'Financial', icon: FileText,
    content: `**Fee Structure**
Fees are structured as enrollment fee, monthly tuition, and optional additional fees for tournaments, equipment, and special programs. Current fee schedule is available from the admin office.

**Payment Due Dates**
Monthly fees are due by the 5th of each month. Quarterly fees by the 5th of the first month of each quarter.

**Payment Methods**
- Bank transfer / NEFT / IMPS
- UPI / Mobile payment apps
- Cash (with receipt from admin office)
- Post-dated cheques (up to 3 months ahead)

**Late Payment**
- Fees not paid by the 10th incur a late fee of ₹100
- Fees outstanding beyond 30 days may result in suspension
- Outstanding fees beyond 60 days may result in membership termination

**Fee Concessions**
Sibling discounts, financial hardship cases, and merit-based fee reductions are available. Apply in writing to the academy principal.

**Fee Transparency**
Detailed fee receipts are provided for all payments. Fee statements available through the player portal.

**Disputes**
Fee disputes must be raised within 15 days of the billing date in writing to the admin office.`
  },
  {
    id: 'admission', title: 'Admission & Registration Policy', category: 'Academy', icon: BookOpen,
    content: `**Eligibility**
YWCC welcomes players aged 6 and above. Different programs cater to different age groups and skill levels.

**Enrollment Process**
1. Complete the online or paper registration form
2. Submit required documents (birth certificate, photos, medical information)
3. Attend a skill assessment session (for intermediate/advanced programs)
4. Pay enrollment fee to confirm placement
5. Receive registration number and program details

**Required Documents**
- Birth certificate (for age verification)
- 2 passport-size photographs
- Medical history form completed by parent/guardian
- School enrollment certificate (for under-16 players)
- Proof of address

**Waiting List**
When a program is at capacity, eligible applicants are placed on a waiting list and notified when a place becomes available.

**Trial Period**
New players may be offered a 2-week trial period before full enrollment. Trial fees are charged at the standard rate.

**Age Group Placement**
Placement is based on age, physical development, and skill level assessment. The academy's decision on group placement is final.`
  },
  {
    id: 'equipment', title: 'Equipment Usage Policy', category: 'Academy', icon: FileText,
    content: `**Personal Equipment**
Players are responsible for providing their own basic equipment: bat, batting pads, batting gloves, and helmet (for batters). Appropriate cricket shoes are required.

**Academy Equipment**
The academy provides: bowling machines, fielding aids, practice balls, additional protective equipment, and shared training gear.

**Equipment Care**
- Handle all equipment with care during and after training
- Return borrowed equipment to its designated storage location after each session
- Report damaged or missing equipment to coaches immediately

**Replacement Costs**
Players who damage academy equipment through negligence or misuse will be required to contribute toward replacement costs, as assessed by the coach.

**Equipment Loans**
Short-term equipment loans for tournaments or external matches must be arranged through the admin office and returned within the agreed timeframe.

**Personal Equipment Storage**
YWCC provides limited storage space for players' personal equipment. The academy is not responsible for loss or theft of stored items.`
  },
  {
    id: 'ground-facility', title: 'Ground & Facility Usage Policy', category: 'Academy', icon: FileText,
    content: `**Access Hours**
Training facilities are open only during scheduled session times. Unauthorized access outside these hours is not permitted.

**Main Ground**
Access to the main match ground is restricted to scheduled matches, tournaments, and special training sessions approved by management.

**Practice Nets**
Practice net bookings must be made through the admin office. Unbooked use of nets is subject to availability and coach approval.

**Changing Facilities**
- Maintain cleanliness and leave facilities as found
- Report any maintenance issues to admin immediately
- Respect privacy of all users in changing facilities

**Parking**
Visitors must park only in designated areas. Do not obstruct access roads or emergency exits.

**Prohibited Activities**
- No smoking, alcohol, or illegal substances on academy premises
- No gambling or betting on matches
- No animals on the playing ground
- No unauthorized food vendors or commercial activities

**External Hire**
External organizations wishing to hire academy facilities must submit a formal request and comply with all academy rules during the period of hire.`
  },
  {
    id: 'tournament', title: 'Tournament & Match Participation Policy', category: 'Academy', icon: FileText,
    content: `**Selection Criteria**
Selection for academy teams and tournaments is based on:
- Skill level and performance in training
- Attendance record (minimum 75% required)
- Conduct and adherence to academy values
- Physical fitness and readiness

**Notification**
Selected players will be notified at least 7 days before a tournament with full details of schedule, venue, and requirements.

**Tournament Fees**
Tournament registration fees may be charged separately from regular fees. Parents will be informed of costs in advance.

**Code of Conduct at Events**
All players, parents, and supporters represent YWCC and must maintain exemplary behavior at all tournament venues.

**Withdrawal**
Players who withdraw from a tournament after confirmation must inform the academy at least 48 hours in advance to allow for replacement selection.

**External Tournament Representation**
Players selected for external tournaments, state-level competitions, or higher-level representation must obtain academy approval and follow all related guidelines.

**Awards & Recognition**
Outstanding tournament performances will be recognized through the academy's achievement and award system.`
  },
  {
    id: 'social-media', title: 'Social Media Policy', category: 'Academy', icon: FileText,
    content: `**Academy's Social Media**
YWCC maintains official accounts for communication and promotion. Only authorized personnel may post on behalf of the academy.

**Player & Parent Social Media**
When posting about academy activities:
1. Do not share negative or embarrassing content about coaches, players, or the academy
2. Do not share personal information of other players without consent
3. Seek permission before tagging other players in photos or videos
4. Content involving minors requires parental consent before posting

**Prohibited Content**
- Match footage or photos shared without permission
- Negative commentary on officials, coaches, or opponents
- Content that violates player privacy
- Anything that could bring the academy into disrepute

**Cyberbullying**
Any form of cyberbullying involving academy members will be treated as seriously as in-person bullying and may result in membership termination.

**Reporting**
Report any social media concerns to: admin@youngwarriorscc.in`
  },
  {
    id: 'complaint', title: 'Complaint & Grievance Policy', category: 'Academy', icon: FileText,
    content: `**Our Commitment**
YWCC is committed to handling all complaints fairly, promptly, and confidentially.

**How to Raise a Complaint**
1. **Informal Resolution**: Speak directly with the relevant coach or staff member
2. **Formal Written Complaint**: Submit in writing to admin@youngwarriorscc.in or in person at the office
3. **Escalation**: If unresolved, escalate to the Academy Director

**What to Include**
- Your name, contact details, and registration number
- Clear description of the complaint and dates involved
- What you have already done to resolve the issue
- What outcome you are seeking

**Timeline**
- Acknowledgment within 2 working days
- Initial response within 7 working days
- Full resolution within 21 working days

**Confidentiality**
Complaints are handled confidentially. Only those necessary for investigation will be involved.

**No Retaliation**
YWCC prohibits retaliation against any person who raises a genuine complaint in good faith.

**External Escalation**
If not satisfied with the academy's resolution, players may escalate to the relevant national cricket governing body.`
  },
  {
    id: 'data-protection', title: 'Data Protection Policy', category: 'Legal', icon: Shield,
    content: `**Data Controller**
Young Warriors Cricket Club is the data controller for all personal data collected through enrollment, the player portal, and our website.

**Legal Basis for Processing**
We process personal data based on:
- Contractual necessity (managing enrollment and services)
- Legal obligation (maintaining records as required)
- Legitimate interest (improving our programs)
- Consent (marketing communications)

**Data Minimization**
We collect only data that is necessary for the purposes identified. We do not collect unnecessary information.

**International Transfers**
Player data may be processed by our technology providers (including Supabase/PostgreSQL infrastructure). We ensure appropriate safeguards are in place.

**Your Rights Under Data Protection Law**
- Right to access your data
- Right to correct inaccurate data
- Right to erasure (subject to legal obligations)
- Right to restrict processing
- Right to data portability
- Right to object to processing

**Exercising Your Rights**
Submit requests to: data@youngwarriorscc.in. We will respond within 30 days.

**Complaints**
You have the right to complain to your national data protection authority if you believe we have mishandled your personal data.`
  },
  {
    id: 'contact-support', title: 'Contact & Support Policy', category: 'Academy', icon: FileText,
    content: `**Contact Channels**
- **Email**: info@youngwarriorscc.in
- **Phone**: Available during office hours (Mon-Sat, 9am-6pm)
- **In Person**: Admin office at the academy premises
- **Player Portal**: Message system for registered players

**Response Times**
- Email: Within 2 working days
- Phone: Same day callback if message left
- In-person visits: Immediate (subject to staff availability)
- Player portal messages: Within 3 working days

**Urgent Issues**
For urgent safety or welfare concerns, contact the designated duty officer immediately. Emergency contact details are posted on the notice board at the academy entrance.

**Feedback**
We welcome feedback about our programs, facilities, and services. Your input helps us improve. Submit feedback through the contact form on our website or directly to any staff member.

**Out of Hours**
For true emergencies outside office hours, contact local emergency services (112) and then notify the academy at the earliest opportunity.`
  },
  {
    id: 'faq', title: 'FAQ', category: 'General', icon: BookOpen,
    content: `**Q: How do I enroll my child in YWCC?**
Visit the Register page on our website or come to the academy office during office hours. Bring your child's birth certificate and medical information form.

**Q: What age groups do you accept?**
We welcome players from age 6 upward. Different programs are available for Foundation (6–10), Youth (11–14), Junior (15–17), and Senior (18+) groups.

**Q: What equipment does my child need?**
Basic personal equipment: bat, batting pads, batting gloves, and helmet. The academy provides shared equipment for fielding and bowling drills.

**Q: Can my child train during school exams?**
Yes, but we encourage maintaining balance. Temporary leave during exam periods can be arranged without affecting standing.

**Q: How are fees paid?**
Via bank transfer, UPI, or cash at the admin office. We issue receipts for all payments, accessible through the player portal.

**Q: What happens if my child is injured?**
Our trained first aiders respond immediately. For serious injuries, we contact emergency services and parents. An incident report is filed.

**Q: Can parents watch training sessions?**
Yes, from designated spectator areas. Parents are not permitted on the training ground during sessions.

**Q: How do I access the player portal?**
Players receive a registration number and PIN upon enrollment. Log in at youngwarriorscc.in/player-login

**Q: How do I contact my child's coach?**
Through the admin office. Direct coach contact details may be shared at the discretion of management for specific communication needs.`
  },
  {
    id: 'accessibility', title: 'Accessibility Statement', category: 'General', icon: FileText,
    content: `**Our Commitment**
YWCC is committed to ensuring that our programs, facilities, and digital platforms are accessible to all, regardless of disability or physical limitation.

**Physical Accessibility**
- Academy entrances accommodate wheelchairs
- Accessible seating available in spectator areas
- Accessible restroom facilities provided
- Staff assistance available upon request

**Inclusive Cricket Programs**
We offer adapted cricket programs for players with physical disabilities or learning difficulties. Contact us to discuss how we can accommodate individual needs.

**Digital Accessibility**
Our website follows WCAG 2.1 guidelines:
- Alt text for all images
- Keyboard-navigable interface
- High-contrast text options
- Screen reader compatible

**Communication Accessibility**
We can provide information in alternative formats (large print, audio) upon request.

**Feedback**
We continuously work to improve accessibility. Report any access barriers to: accessibility@youngwarriorscc.in`
  },
  {
    id: 'uniform', title: 'Uniform & Dress Code Policy', category: 'Academy', icon: BookOpen,
    content: `**Official Academy Uniform**
The YWCC official uniform includes:
- Academy white cricket trousers
- YWCC training jersey (color as per program level)
- Academy cap or helmet cover
- White cricket shoes for matches

**Training Attire**
For regular training sessions:
- Comfortable sports trousers or shorts (navy/grey)
- YWCC training T-shirt or plain sports top
- Appropriate athletic shoes (not regular sneakers for nets)

**Match Day Uniform**
Full official whites required for all home matches. Away matches may have specific requirements communicated in advance.

**Uniform Purchase**
Official YWCC uniforms are available through the academy store. Players are expected to purchase within 30 days of enrollment.

**Maintenance**
Players are responsible for keeping uniforms clean and in good condition. Torn or worn uniforms should be replaced promptly.

**Exceptions**
Any exceptions to the dress code for religious or medical reasons must be discussed with the admin office in advance.`
  },
  {
    id: 'trial', title: 'Trial Session Policy', category: 'Academy', icon: BookOpen,
    content: `**Trial Program**
Prospective players may attend up to 2 trial sessions before formal enrollment. This allows both the player and the academy to assess program suitability.

**Booking a Trial**
- Register online or contact the admin office
- Trial sessions are subject to space availability
- A trial fee is charged at the session rate

**During the Trial**
- Trials are run by qualified coaches who will assess the player's current skill level and fitness
- Parents are welcome to observe from designated spectator areas
- Players should bring their own basic equipment if available

**After the Trial**
- Coaches will provide brief feedback to parents/guardians
- Enrollment offer (if appropriate) will be made within 3 working days
- The academy reserves the right to decline enrollment if a program is not suitable for the player's current level or age

**Trial Fees**
Trial fees are not refunded if the player chooses not to enroll. If the academy declines to enroll after a trial, fees are refunded.`
  },
  {
    id: 'scholarship', title: 'Scholarship Policy', category: 'Academy', icon: BookOpen,
    content: `**Academy Scholarship Program**
YWCC offers scholarships to talented players from economically disadvantaged backgrounds who demonstrate exceptional cricket potential.

**Eligibility Criteria**
- Age: 10–17 years
- Demonstrated cricket talent as assessed by head coach
- Household income below threshold (reviewed annually)
- Academic performance in reasonable standing
- Strong conduct record

**Scholarship Benefits**
- Full or partial fee waiver for training programs
- Access to academy equipment for training use
- Priority consideration for representative team selection
- Mentorship from senior coaches

**Application Process**
1. Submit scholarship application form (available from admin)
2. Provide income documentation
3. Attend skills assessment with head coach
4. Interview with academy management
5. Decision communicated within 4 weeks

**Scholarship Renewal**
Scholarships are reviewed annually. Continued eligibility requires:
- Maintaining attendance above 85%
- Positive conduct report from coaches
- Continued financial need verification

**Donor Scholarships**
YWCC gratefully accepts donations to fund additional scholarships. Contact us to discuss naming opportunities for donors.`
  },
  {
    id: 'emergency', title: 'Emergency Response Policy', category: 'Welfare', icon: Shield,
    content: `**Emergency Contacts**
- Emergency Services: 112
- Nearest Hospital: [Contact admin for current details]
- Academy Emergency Line: Available on notice board at academy

**Medical Emergencies**
1. Call 112 for life-threatening situations immediately
2. Notify the first aider and senior coach present
3. Do not move a seriously injured person unless they are in immediate danger
4. Contact parent/guardian immediately
5. Complete incident report within 24 hours

**Fire Emergency**
1. Alert everyone present
2. Call fire services (101) if not already triggered by alarm
3. Evacuate via designated exits
4. Assemble at designated muster point (signed at academy)
5. Do not re-enter until all-clear given by fire services

**Missing Child Procedure**
1. Immediately notify senior coach and admin
2. Search the immediate premises
3. Contact parents/guardians
4. If not found within 15 minutes, contact police (100)

**Weather Emergencies**
Sessions suspended immediately for lightning, flash flooding, or dangerous wind conditions. Players to remain in covered areas until all-clear.

**Communication**
All incidents will be communicated to parents promptly and transparently. Serious incidents are reported to relevant authorities.`
  },
];

const CATEGORIES = ['All', 'Legal', 'Academy', 'Welfare', 'Financial', 'General'];

export default function Policies() {
  const [selectedCat, setSelectedCat] = useState('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = policies.filter(p => {
    const matchCat = selectedCat === 'All' || p.category === selectedCat;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id);

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={i} className="font-bold text-gray-900 mt-4 mb-1">{line.slice(2, -2)}</h4>;
      }
      if (line.match(/^\d+\./)) {
        return <p key={i} className="text-gray-700 leading-relaxed ml-4 text-sm my-0.5">{line}</p>;
      }
      if (line.startsWith('- ')) {
        return <p key={i} className="text-gray-700 leading-relaxed ml-4 text-sm my-0.5">• {line.slice(2)}</p>;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-gray-700 leading-relaxed text-sm">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <FileText size={14} /> Legal & Policy Documents
          </div>
          <h1 className="text-4xl font-bold mb-4">Academy Policies</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Comprehensive policies governing membership, conduct, safety, and operations at Young Warriors Cricket Club.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search policies…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCat === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4">{filtered.length} policies</p>

        {/* Accordion */}
        <div className="space-y-2">
          {filtered.map(policy => {
            const isOpen = openId === policy.id;
            const Icon = policy.icon;
            return (
              <div key={policy.id} className={`bg-white rounded-xl border transition-all ${isOpen ? 'border-gray-300 shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}>
                <button
                  onClick={() => toggle(policy.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isOpen ? 'bg-gray-900' : 'bg-gray-100'}`}>
                      <Icon size={16} className={isOpen ? 'text-white' : 'text-gray-600'} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{policy.title}</h3>
                      <span className="text-xs text-gray-400">{policy.category}</span>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={18} className="text-gray-500 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <div className="max-w-none">
                      {formatContent(policy.content)}
                    </div>
                    <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
                      Last updated: July 2026 · Young Warriors Cricket Club
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FileText size={48} className="mx-auto mb-3 opacity-40" />
            <p>No policies found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
