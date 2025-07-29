"use client";
import React from "react";
import {
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Globe,
  Smartphone,
  Monitor,
  Cookie,
  Eye,
  Lock,
  Users,
  FileText,
} from "lucide-react";

const DoNotSellSharePolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                Do Not Sell or Share My Information
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                MyCleanOne Privacy Controls
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* How to Instruct Us Section */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Settings className="h-6 w-6 text-green-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              How Can You Instruct Us Not to Sell or Share Your Information?
            </h2>
          </div>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            There are several ways in which you can do this. First, there is
            this:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Cookie Preferences */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Cookie className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Cookie Preferences
                </h3>
              </div>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                You can also easily access these settings at any time by
                clicking on the "Cookie Preferences" in the footer of our
                websites. Another way in which you can communicate your cookie
                preferences to us is change the cookie settings in your browser.
              </p>
            </div>

            {/* Direct Contact */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ExternalLink className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Direct Contact
                </h3>
              </div>
              <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed mb-3">
                To specifically request that we do not "sell" your personal
                information in situations that do not involve cookies, you can
                use our online form at:
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                  <a
                    href="http://www.mycleanone.com/contactus"
                    className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 underline text-sm"
                  >
                    www.mycleanone.com/contactus
                  </a>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-green-700 dark:text-green-300 text-sm">
                    dpo@mycleanone.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>Please note:</strong> We do not maintain the data in a
                manner that would allow us to link the information to your
                email, so we are not able to opt you out directly.
              </p>
            </div>
          </div>
        </section>

        {/* Why We Provide the Link */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Eye className="h-6 w-6 text-purple-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Why Do We Provide the "Do Not Sell or Share" Link?
            </h2>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6 mb-6">
            <p className="text-purple-800 dark:text-purple-200 leading-relaxed">
              If you are a California resident, the California Consumer Privacy
              Act ("CCPA") provides you with the right to opt out of the "sale"
              of your personal information.
            </p>
          </div>

          <div className="space-y-6">
            {/* Personal Information Definition */}
            <div className="border-l-4 border-blue-400 dark:border-blue-500 pl-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                What is "Personal Information" Under CCPA?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Under the CCPA, "personal information" includes information that
                is not necessarily tied to your identity as an individual
                directly, but may be associated with your device. This covers
                identifiers such as:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    IP addresses
                  </span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Web cookies
                  </span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Web beacons
                  </span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mobile Ad IDs
                  </span>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                In many cases, this type of information is not associated with
                you, but there are unique identifiers that could be.
              </p>
            </div>

            {/* Sale Definition */}
            <div className="border-l-4 border-green-400 dark:border-green-500 pl-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                What Does "Sell" Mean Under CCPA?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                The term "sell" is defined to include not just selling in
                exchange for money, but also sharing or transferring personal
                information (including information that does not directly
                identify an individual as described above) in exchange for
                anything of value, which covers a much broader set of situations
                and types of exchanges.
              </p>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  What is NOT considered a "sale":
                </h4>
                <ul className="list-disc list-inside text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>
                    When the consumer has directed a company to disclose the
                    personal information ("consumer directed exception")
                  </li>
                  <li>
                    When information is transferred as part of a merger,
                    acquisition, bankruptcy or other similar transaction that
                    results in an effective change of control ("change of
                    control")
                  </li>
                </ul>
              </div>
            </div>

            {/* Sharing Definition */}
            <div className="border-l-4 border-orange-400 dark:border-orange-500 pl-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                What is NOT considered "Sharing"?
              </h3>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <p className="text-orange-800 dark:text-orange-200 text-sm mb-2">
                  There are certain things that are not considered "sharing",
                  such as:
                </p>
                <ul className="list-disc list-inside text-sm text-orange-800 dark:text-orange-200 space-y-1">
                  <li>A consumer directed exception</li>
                  <li>
                    The transfer or sharing of the personal information with a
                    service provider or a contractor (the "service provider
                    exception")
                  </li>
                  <li>Change of control</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Do We Sell or Share */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Lock className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Do We "Sell" or "Share" Your Personal Information?
            </h2>
          </div>

          <div className="space-y-6">
            {/* General Practice */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
                  Our General Practice
                </h3>
              </div>
              <p className="text-green-800 dark:text-green-200 leading-relaxed">
                As a matter of general practice, we do not sell information that
                directly identifies you, like your name, address, or email.
                Under the service provider exception discussed above, we share
                some of your personal information with our service providers,
                whom we bind by contract to use the information solely to
                provide a service for us or on our behalf (for example, we use
                partners to provide technical support), or in the limited
                additional circumstances outlined in our Privacy Policy (such as
                for the purpose of processing payments preventing fraud or to
                comply with the law).
              </p>
            </div>

            {/* Digital Analytics and Advertising */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                  Digital Analytics and Advertising Ecosystem
                </h3>
              </div>
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed mb-4">
                However, the CPRA's broad definitions of "personal information",
                "sale" and "sharing with third parties" may deem the common flow
                of information in the digital analytics and advertising
                ecosystem to be a sale. Like most companies that operate
                commercial websites and apps, we utilize online analytics to
                measure the ways users engage with our websites and apps.
              </p>

              <div className="bg-white dark:bg-slate-700 p-4 rounded border border-blue-300 dark:border-blue-600">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  These insights help us:
                </h4>
                <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>Detect and fix bugs</li>
                  <li>Measure usage of our website and apps</li>
                  <li>Better understand how users interact with them</li>
                  <li>Perform online advertising</li>
                </ul>
              </div>
            </div>

            {/* Tracking Mechanisms */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                How We Conduct These Analyses
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                In order to conduct these analyses and to facilitate online
                advertising, we contract with parties that collect device
                identifiers and place tags, cookies, beacons, and similar
                tracking mechanisms on our own websites/apps as well as the
                websites/apps of other parties.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-700 p-4 rounded border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Website Example:
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We may request that an advertising partner facilitate the
                    placement of our ads on a particular website after a
                    consumer has previously visited our websites. That partner
                    would generally do this by placing a cookie on a user's
                    browser, which can then identify when a consumer uses the
                    same browser to visit other websites.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-700 p-4 rounded border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Mobile App Example:
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Where our websites or apps provide space for advertisements,
                    this partner may use identifiers, such as cookies for
                    websites or a device's AdID for mobile apps, to facilitate
                    real-time bidding by advertisers.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-600 rounded">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>For mobile apps:</strong> You can opt out of this
                  processing by upgrading to a paid version of the same product
                  or by uninstalling the product. Please note that on our
                  websites, regardless of your choice concerning the use of your
                  personal information, you will still see some advertising when
                  such advertising does not involve the sale of your personal
                  information.
                </p>
              </div>
            </div>

            {/* Service Provider Exception */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-3">
                When We Don't Consider It a "Sale"
              </h3>
              <p className="text-purple-800 dark:text-purple-200 leading-relaxed mb-4">
                Where we can reasonably ensure via contract that the parties
                described above can and will use a cookie or a device identifier
                solely to provide the specific service we have requested, and
                that they will not use or share the data for other purposes, we
                will not deem that sharing a "sale."
              </p>
              <p className="text-purple-800 dark:text-purple-200 leading-relaxed">
                In most cases, we've determined that our data analytics
                providers that measure the ways users engage with our websites
                and apps meet this standard and, accordingly, we will not block
                the sharing of an identifier with those service providers, even
                when you choose to opt out through the "Do Not Sell" link.
              </p>
            </div>

            {/* When We Consider It a Sale */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-3">
                When We Consider It a "Sale" or "Sharing"
              </h3>
              <p className="text-red-800 dark:text-red-200 leading-relaxed">
                In some cases, though, we are not in complete control of how
                such identifiers are ultimately used by certain parties (for
                example, this sometimes happens in the online advertising
                ecosystem). As a result, when we have a case like this, we can't
                determine that the sharing of information with these parties
                falls within the service provider exception under the law and we
                will treat that scenario as a "sale" or, as the case may be, as
                "sharing with third parties".
              </p>
            </div>
          </div>
        </section>

        {/* How We Maintain Your Choice */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              How Do We Maintain Your "Do Not Sell" Choice?
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Websites */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Monitor className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  For Our Websites
                </h3>
              </div>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed mb-4">
                If you set a "Do Not Sell or Share" preference (via the cookie
                setting) that preference is specific to the site that you are
                visiting.
              </p>

              <div className="space-y-3">
                <div className="bg-white dark:bg-slate-700 p-3 rounded border border-blue-300 dark:border-blue-600">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Important:</strong> The setting will work only if
                      your browser is set to accept cookies.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-700 p-3 rounded border border-blue-300 dark:border-blue-600">
                  <div className="flex items-start">
                    <XCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> If you clear your browser cookies,
                      the cookie-based "Do Not Sell or Share" setting will be
                      erased, and you will need to reset the setting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Apps */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  For Mobile Apps
                </h3>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-700 p-4 rounded border border-green-300 dark:border-green-600">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    Android Mobile Apps
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    Android mobile apps do not use cookies but mobile
                    Advertising IDs. Your Advertising ID can be reset or, in
                    some versions, turned off.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-700 p-4 rounded border border-green-300 dark:border-green-600">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    iOS Apps
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    On iOS, your Advertising IDs can be turned off.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-700 p-4 rounded border border-green-300 dark:border-green-600">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    How to Change Settings
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed mb-2">
                    You can change your preferences and set the local "Do Not
                    Sell or Share" by accessing the system settings.
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    The setting should remain until you specifically change it
                    or clear app data on your device— but you should check the
                    setting regularly to ensure it reflects your current choice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Policy Reference */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              For More Information
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Please review our Privacy Policy for a more detailed description of
            how we collect, use, and share the personal information of
            California residents in operating our business, your privacy rights
            as a California resident and how to exercise the other rights you
            have as a California resident.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-slate-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300 dark:text-gray-400">
              © 2024 MyCleanOne. All rights reserved.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Your privacy rights matter to us. For questions about this policy,
              please contact our support team.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DoNotSellSharePolicy;
