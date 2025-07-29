import React from "react";
import {
  Users,
  Shield,
  Building,
  Heart,
  Leaf,
  AlertTriangle,
  Settings,
  CheckCircle,
  Clock,
  Globe,
  FileText,
  Eye,
  Scale,
  Handshake,
  Lock,
  Zap,
  Database,
  Calendar,
  Phone,
  Search,
  BookOpen,
  Wrench,
} from "lucide-react";

const SupplierGuidelines = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Handshake className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                Supplier Guidelines
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                MyCleanone - Paciwire Technologies Private Limited
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Building className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              About Our Supplier Guidelines
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Our Commitment
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                  Paciwire Technologies Private Limited ("MyCleanone") is part
                  of the Paciwire Group of Companies. These Guidelines spell out
                  our social, ethical and environmental standards and
                  expectations for our supply chain.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                International Standards
              </h3>
              <div className="space-y-2">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                  <span className="text-green-900 dark:text-green-200 font-medium text-sm">
                    UN Guiding Principles on Business and Human Rights
                  </span>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                  <span className="text-green-900 dark:text-green-200 font-medium text-sm">
                    Ethical Trading Initiative Base Code
                  </span>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                  <span className="text-green-900 dark:text-green-200 font-medium text-sm">
                    Responsible Business Alliance Code of Conduct
                  </span>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                  <span className="text-green-900 dark:text-green-200 font-medium text-sm">
                    International Labour Organisation Declaration
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              We expect our partners, suppliers, contractors, and subcontractors
              to uphold these Guidelines, applicable laws, and social
              responsibilities.
            </p>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-purple-500 dark:text-purple-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Table of Contents
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">
                  1. Labour
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">
                  2. Working Conditions
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">
                  3. Health & Safety
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-2">
                <Scale className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">
                  4. Business Ethics
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-2">
                <Leaf className="h-5 w-5 text-teal-500 dark:text-teal-400 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">
                  5. Environment
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">
                  6. Conflict Minerals
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-2">
                <Settings className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">
                  7. Management Systems
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* I. Labour */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Users className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              I. Labour
            </h2>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                We uphold the human rights of workers and treat every worker
                with dignity and respect in accordance with international
                standards. Here, 'worker' includes permanent, temporary,
                contract, and student workers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  No Discrimination
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                We do not discriminate against any worker based on race, colour,
                age, gender, religion, ethnicity, disability, sexual
                orientation, political affiliation, union membership, national
                origin, or marital status.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Pregnancy tests or medical exams used for discriminatory
                purposes are not allowed except where required by law or safety.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Shield className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  No Involuntary Labour
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                We do not use forced, bonded, indentured, or exploitative prison
                labour. Workers have freedom of movement, and are not forced to
                surrender identification except when required by law.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Heart className="h-5 w-5 text-pink-500 dark:text-pink-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  No Child Labour
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                We do not employ children. Minimum age is 18, or the higher of
                the legal working age or completion of compulsory education
                applicable in the country.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <BookOpen className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Student & Apprentice Labour
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                All receive appropriate training and are paid at least the local
                minimum wage or equal to entry-level workers performing similar
                duties.
              </p>
            </div>
          </div>
        </section>

        {/* II. Working Conditions */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Clock className="h-6 w-6 text-green-500 dark:text-green-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              II. Working Conditions
            </h2>
          </div>

          <div className="mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
              <p className="text-green-800 dark:text-green-200 leading-relaxed">
                We value a healthy, happy workforce and adhere to legal and
                ethical working conditions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Working Hours
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Working hours should not exceed 60 hours per week including
                overtime, with at least one day off per week and compliance with
                local laws.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Zap className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Wages and Benefits
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Payment must meet or exceed statutory minimums with overtime
                paid at a premium. Wage deductions as disciplinary measures are
                prohibited. Payment must be timely and comprehensible.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Users className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Freedom of Association
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Workers have the right to associate, join organizations, seek
                representation, and bargain collectively.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Shield className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  No Harsh Treatment
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                No sexual or verbal harassment, corporal punishment, mental or
                physical coercion allowed.
              </p>
            </div>
          </div>
        </section>

        {/* III. Occupational Health and Safety */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-red-500 dark:text-red-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              III. Occupational Health and Safety
            </h2>
          </div>

          <div className="mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200 leading-relaxed">
                We commit to safe and healthy workplaces through integrated
                health and safety management.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Occupational Safety
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Identify hazards from chemicals, biological and physical agents;
                provide appropriate controls and PPE; empower workers to refuse
                unsafe work without fear.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Zap className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Emergency Preparedness
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Establish emergency plans, procedures, fire drills, exits, and
                first-aid supplies.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Heart className="h-5 w-5 text-pink-500 dark:text-pink-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Injury & Illness
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Implement systems to track, report, and manage workplace
                injuries and illnesses with return-to-work policies.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Wrench className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Physical Work
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Measure and manage exposure to heavy lifting, prolonged standing
                or highly repetitive tasks.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Building className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Facilities
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Provide clean toilets, safe drinking water, sanitary food prep,
                and safe living quarters with proper heating, ventilation, and
                exits.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <BookOpen className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Communication
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Provide information and training about health and safety
                hazards.
              </p>
            </div>
          </div>
        </section>

        {/* IV. Business Conduct and Ethics */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Scale className="h-6 w-6 text-purple-500 dark:text-purple-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              IV. Business Conduct and Ethics
            </h2>
          </div>

          <div className="mb-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-6">
              <p className="text-purple-800 dark:text-purple-200 leading-relaxed">
                We uphold the highest ethical standards in business dealings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Business Integrity
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Zero tolerance for corruption, bribery, extortion, and
                embezzlement. Compliance with UN and OECD conventions.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  No Conflict of Interest
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Avoid conflicts of interest; gifts must be of low value and
                customary.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Eye className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Transparent Dealings
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Honest financial records, no falsification or misrepresentation.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <FileText className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Intellectual Property
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Respect IP rights and protect customer and supplier information.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Lock className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Privacy
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Protect personal information; comply with privacy laws and
                regulations.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Handshake className="h-5 w-5 text-teal-500 dark:text-teal-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Fair Dealings
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Promote fair business, advertising and competition standards.
              </p>
            </div>
          </div>
        </section>

        {/* V. Environment */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Leaf className="h-6 w-6 text-teal-500 dark:text-teal-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              V. Environment
            </h2>
          </div>

          <div className="mb-6">
            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg p-4 mb-6">
              <p className="text-teal-800 dark:text-teal-200 leading-relaxed">
                Commitment to environmental sustainability throughout our
                processes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Settings className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Responsible Management
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Reduce harmful environmental impacts through design, recycling,
                energy efficiency, and emission control.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Identifying Risks
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Manage hazardous substances; provide training on their risks.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Permits & Registrations
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Apply all required environmental permits; develop an
                Environmental Management System compliant with ISO 14001 or
                similar.
              </p>
            </div>
          </div>
        </section>

        {/* VI. Conflict Minerals */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <AlertTriangle className="h-6 w-6 text-orange-500 dark:text-orange-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              VI. Conflict Minerals
            </h2>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-4">
            <p className="text-orange-800 dark:text-orange-200 leading-relaxed mb-4">
              We do not support armed groups involved in human rights abuses in
              the Democratic Republic of Congo or adjoining countries.
            </p>
            <p className="text-orange-800 dark:text-orange-200 leading-relaxed">
              Suppliers must comply with conflict minerals regulations and
              provide supply chain transparency for minerals such as tin,
              tantalum, tungsten, and gold.
            </p>
          </div>
        </section>

        {/* VII. Management Systems */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Settings className="h-6 w-6 text-indigo-500 dark:text-indigo-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              VII. Management Systems
            </h2>
          </div>

          <div className="mb-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4 mb-6">
              <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed">
                We implement management systems to identify and mitigate risks,
                comply with laws, and uphold these Guidelines.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Users className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Management Responsibility
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Senior management is accountable and regularly reviews
                compliance systems.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Scale className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Legal Requirements
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Regular monitoring and understanding of relevant laws is
                mandatory.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Search className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Modern Slavery Due Diligence
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Supply chain must confirm no involvement in modern slavery; due
                diligence and monitoring procedures required.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <FileText className="h-5 w-5 text-orange-500 dark:text-orange-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Modern Slavery Reporting
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Notify MyCleanone immediately of any suspected issues. Annual
                statements must be provided by May 31st each year.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Phone className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Whistleblowing
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Grievance mechanisms including a 24/7 whistleblower hotline.
                Protection against retaliation guaranteed.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Eye className="h-5 w-5 text-teal-500 dark:text-teal-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Auditing & Monitoring
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                MyCleanone may conduct announced or unannounced audits,
                including document reviews and on-site visits.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Search className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Investigating
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Cooperation is required in investigations; corrective actions
                may be required and contractual relationships may be terminated
                for serious breaches.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <BookOpen className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Training
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Suppliers are expected to provide training on relevant laws and
                risks, maintain records, and make these available on request.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Wrench className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Remedial Actions
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                MyCleanone and its supply chain work together on corrective
                actions to resolve incidents or risks, including slavery and
                human trafficking. Persistent serious breaches can lead to
                contract termination.
              </p>
            </div>
          </div>
        </section>

        {/* Key Requirements Summary */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Key Requirements Summary
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Mandatory Compliance
                  </h3>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Zero tolerance for modern slavery and child labor</li>
                    <li>• Adherence to working hours and wage requirements</li>
                    <li>• Implementation of health and safety protocols</li>
                    <li>• Environmental compliance and permits</li>
                    <li>• Business ethics and anti-corruption measures</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Reporting Requirements
                  </h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Annual slavery statements due May 31st</li>
                    <li>• Immediate notification of suspected violations</li>
                    <li>• Cooperation with audits and investigations</li>
                    <li>• Maintenance of training records</li>
                    <li>• Supply chain transparency documentation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Phone className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Contact & Support
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                General Inquiries
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                For questions about these guidelines or compliance requirements,
                please contact our supply chain team.
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Email:{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  suppliers@mycleanone.com
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Whistleblower Hotline
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                24/7 confidential reporting line for ethical concerns or
                violations. All reports are protected against retaliation.
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Hotline:{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  Available 24/7
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Effective Date:</strong> These guidelines are effective
              immediately and apply to all current and future supplier
              relationships. Updates will be communicated through official
              channels.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SupplierGuidelines;
