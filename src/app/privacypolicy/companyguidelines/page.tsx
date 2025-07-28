"use client";
import React from "react";

const SupplierGuidelines: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-20">
      <article className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <header>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            MyCleanone Supplier Guidelines
          </h1>
          <p className="text-gray-600 mb-8">
            Paciwire Technologies Private Limited (“MyCleanone”) is part of the
            Paciwire Group of Companies. The MyCleanone Supplier Guidelines
            (“Guidelines”) spell out our social, ethical and environmental
            standards and expectations for our supply chain.
          </p>
          <p className="text-gray-600 mb-2">
            These Guidelines are based on international standards including:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-8 space-y-1">
            <li>
              United Nations Guiding Principles on Business and Human Rights
              (UNGP)
            </li>
            <li>Ethical Trading Initiative Base Code (ETI)</li>
            <li>Responsible Business Alliance Code of Conduct (RBA)</li>
            <li>
              Managing Risks Associated with Modern Slavery A Good Practice Note
              (GPN)
            </li>
            <li>Universal Declaration of Human Rights (UDHR)</li>
            <li>
              International Labour Organisation Declaration on Fundamental
              Rights at Work (ILO Declaration)
            </li>
            <li>
              Indian Government Department of Home Affairs Modern Slavery Act
              2018 Draft Guidance
            </li>
          </ul>
          <p className="text-gray-600 mb-12">
            We expect our partners, suppliers, contractors, and subcontractors
            to uphold these Guidelines, applicable laws, and social
            responsibilities.
          </p>
        </header>

        {/* Table of Contents */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Table of Contents
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-800">
            <li>Labour</li>
            <li>Working Conditions</li>
            <li>Occupational Health and Safety</li>
            <li>Business Conduct and Ethics</li>
            <li>Environment</li>
            <li>Conflict Minerals</li>
            <li>Management Systems</li>
          </ol>
        </section>

        {/* I. Labour */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">I. Labour</h2>
          <p className="text-gray-700 mb-4">
            We uphold the human rights of workers and treat every worker with
            dignity and respect in accordance with international standards.
            Here, ‘worker’ includes permanent, temporary, contract, and student
            workers.
          </p>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Discrimination
            </h3>
            <p className="text-gray-700 mb-2">
              We do not discriminate against any worker based on race, colour,
              age, gender, religion, ethnicity, disability, sexual orientation,
              political affiliation, union membership, national origin, or
              marital status, in hiring, training, promotions, wages,
              discipline, termination, and retirement.
            </p>
            <p className="text-gray-700">
              Pregnancy tests or medical exams used for discriminatory purposes
              are not allowed except where required by law or safety.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Involuntary Labour
            </h3>
            <p className="text-gray-700 mb-2">
              We do not use forced, bonded, indentured, or exploitative prison
              labour. Workers have freedom of movement, and are not forced to
              surrender identification except when required by law.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Child Labour
            </h3>
            <p className="text-gray-700">
              We do not employ children. Minimum age is 18, or the higher of the
              legal working age or completion of compulsory education applicable
              in the country.
            </p>
          </article>

          <article>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Student, Intern and Apprentice Labour
            </h3>
            <p className="text-gray-700">
              All receive appropriate training and are paid at least the local
              minimum wage or equal to entry-level workers performing similar
              duties.
            </p>
          </article>
        </section>

        {/* II. Working Conditions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            II. Working Conditions
          </h2>
          <p className="text-gray-700 mb-4">
            We value a healthy, happy workforce and adhere to legal and ethical
            working conditions.
          </p>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Working Hours
            </h3>
            <p className="text-gray-700 mb-2">
              Working hours should not exceed 60 hours per week including
              overtime, with at least one day off per week and compliance with
              local laws.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Wages and Benefits
            </h3>
            <p className="text-gray-700 mb-2">
              Payment must meet or exceed statutory minimums with overtime paid
              at a premium. Wage deductions as disciplinary measures are
              prohibited. Payment must be timely and accompanied by
              comprehensible wage statements.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Freedom of Association
            </h3>
            <p className="text-gray-700">
              Workers have the right to associate, join organizations, seek
              representation, and bargain collectively.
            </p>
          </article>

          <article>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Harsh Treatment and Harassment
            </h3>
            <p className="text-gray-700">
              No sexual or verbal harassment, corporal punishment, mental or
              physical coercion allowed.
            </p>
          </article>
        </section>

        {/* III. Occupational Health and Safety */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            III. Occupational Health and Safety
          </h2>
          <p className="text-gray-700 mb-6">
            We commit to safe and healthy workplaces through integrated health
            and safety management.
          </p>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Occupational Safety and Industrial Hygiene
            </h3>
            <p className="text-gray-700">
              Identify hazards from chemicals, biological and physical agents;
              provide appropriate controls and PPE; empower workers to refuse
              unsafe work without fear.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Emergency Preparedness
            </h3>
            <p className="text-gray-700">
              Establish emergency plans, procedures, fire drills, exits, and
              first-aid supplies.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Occupational Injury and Illness
            </h3>
            <p className="text-gray-700">
              Implement systems to track, report, and manage workplace injuries
              and illnesses with return-to-work policies.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Physically Demanding or Repetitive Work
            </h3>
            <p className="text-gray-700">
              Measure and manage exposure to heavy lifting, prolonged standing
              or highly repetitive tasks.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Facilities
            </h3>
            <p className="text-gray-700">
              Provide clean toilets, safe drinking water, sanitary food prep,
              and safe living quarters (if provided) with proper heating,
              ventilation, fire alarms, and exits.
            </p>
          </article>

          <article>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Communication
            </h3>
            <p className="text-gray-700">
              Provide information and training about health and safety hazards.
            </p>
          </article>
        </section>

        {/* IV. Business Conduct and Ethics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            IV. Business Conduct and Ethics
          </h2>
          <p className="text-gray-700 mb-6">
            We uphold the highest ethical standards in business dealings.
          </p>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Business Integrity
            </h3>
            <p className="text-gray-700">
              Zero tolerance for corruption, bribery, extortion, and
              embezzlement. Compliance with UN and OECD conventions.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Conflict of Interest
            </h3>
            <p className="text-gray-700">
              Avoid conflicts of interest; gifts must be of low value and
              customary.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Transparent Dealings
            </h3>
            <p className="text-gray-700">
              Honest financial records, no falsification or misrepresentation.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Intellectual Property
            </h3>
            <p className="text-gray-700">
              Respect IP rights and protect customer and supplier information.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Privacy
            </h3>
            <p className="text-gray-700">
              Protect personal information; comply with privacy laws and
              regulations.
            </p>
          </article>

          <article>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Fair Dealings
            </h3>
            <p className="text-gray-700">
              Promote fair business, advertising and competition standards.
            </p>
          </article>
        </section>

        {/* V. Environment */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            V. Environment
          </h2>
          <p className="text-gray-700 mb-6">
            Commitment to environmental sustainability throughout our processes.
          </p>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Responsible Management
            </h3>
            <p className="text-gray-700">
              Reduce harmful environmental impacts through design, recycling,
              energy efficiency, and emission control.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Identifying Risks
            </h3>
            <p className="text-gray-700">
              Manage hazardous substances; provide training on their risks.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Permits and Registrations
            </h3>
            <p className="text-gray-700">
              Apply all required environmental permits and registrations;
              develop an Environmental Management System compliant with ISO
              14001 or similar.
            </p>
          </article>
        </section>

        {/* VI. Conflict Minerals */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            VI. Conflict Minerals
          </h2>
          <p className="text-gray-700">
            We do not support armed groups involved in human rights abuses in
            the Democratic Republic of Congo or adjoining countries.
          </p>
          <p className="text-gray-700 my-4">
            Suppliers must comply with conflict minerals regulations and provide
            supply chain transparency for minerals such as tin, tantalum,
            tungsten, and gold.
          </p>
        </section>

        {/* VII. Management Systems */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            VII. Management Systems
          </h2>
          <p className="text-gray-700 mb-4">
            We implement management systems to identify and mitigate risks,
            comply with laws, and uphold these Guidelines.
          </p>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Management Responsibility
            </h3>
            <p className="text-gray-700">
              Senior management is accountable and regularly reviews compliance
              systems.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Legal Requirements
            </h3>
            <p className="text-gray-700">
              Regular monitoring and understanding of relevant laws is
              mandatory.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Modern Slavery Due Diligence
            </h3>
            <p className="text-gray-700">
              Supply chain must confirm no involvement in modern slavery; due
              diligence and monitoring procedures required.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Modern Slavery Reporting
            </h3>
            <p className="text-gray-700">
              Notify MyCleanone immediately of any suspected or confirmed
              slavery or trafficking issues.
            </p>
            <p className="text-gray-700 mt-2">
              Annual slavery and human trafficking statements must be provided
              by May 31st each year.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Whistleblowing and No Retaliation
            </h3>
            <p className="text-gray-700 mb-2">
              Grievance mechanisms including a whistleblower hotline are
              available 24/7 for all supply chain workers and subcontractors.
            </p>
            <p className="text-gray-700">
              Protection against retaliation for reports is guaranteed.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Auditing and Monitoring
            </h3>
            <p className="text-gray-700">
              MyCleanone may conduct announced or unannounced audits, including
              document reviews and on-site visits.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Investigating
            </h3>
            <p className="text-gray-700">
              Cooperation is required in investigations; corrective actions may
              be required and contractual relationships may be terminated for
              serious breaches.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Training
            </h3>
            <p className="text-gray-700">
              Suppliers are expected to provide training on relevant laws and
              risks, maintain records, and make these available on request.
            </p>
          </article>

          <article>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Remedial Actions
            </h3>
            <p className="text-gray-700">
              MyCleanone and its supply chain work together on corrective
              actions to resolve incidents or risks, including slavery and human
              trafficking.
            </p>
            <p className="text-gray-700">
              Persistent serious breaches can lead to contract termination or
              reporting to authorities.
            </p>
          </article>
        </section>
      </article>
    </main>
  );
};

export default SupplierGuidelines;
