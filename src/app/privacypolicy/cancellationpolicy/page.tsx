"use client";
import React from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Globe,
  Calendar,
  DollarSign,
} from "lucide-react";

const CancellationRefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Cancellation and Refund Policy
          </h1>
          <p className="mt-2 text-lg text-gray-600">MyCleanOne</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* General Policy Overview */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">
              30-Day Money-Back Guarantee
            </h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            We offer a 30-day money-back guarantee on subscriptions for certain
            MyCleanOne and Solutions that end-users purchase directly from us
            through our online retail stores or through Google Play. If your
            purchase qualifies, and you follow all the instructions in this
            Cancellation and Refund Policy within 30 days of the date of
            purchase, we will terminate your subscription and refund 100% of the
            price you paid for the then-current subscription term.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800">
              We also allow you to cancel your subscription and request a refund
              (prorated for the unexpired or unused portion of the Subscription
              Term) if we provide notice to you that we are amending the End
              User License Agreement we entered into with you in respect of such
              subscription and/or Solution (the "EULA"), and you object to such
              amendment within 30 days of the date of such notice.
            </p>
          </div>
        </section>

        {/* Regional Specific Policies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Germany, Netherlands, UK */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Globe className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Germany, Netherlands & UK Residents
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  Annual Subscriptions (one-year term or more)
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Initial Purchase:</strong> Under our 30-day Money
                    Back Guarantee, the purchase of an annual subscription is
                    eligible for a refund, if requested within 30-days of the
                    date of purchase.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Each annual renewal is eligible for either:</strong>
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-4">
                    <li>
                      A full refund under our 30-day Money Back Guarantee, if
                      requested within 30 days of being charged.
                    </li>
                    <li>
                      After the expiration of the 30-day Money Back Guarantee, a
                      pro-rated refund of the days left in your renewed
                      subscription term, beginning the month after you request
                      the refund.
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Trial Subscriptions
                </h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>
                      When a payment method is required to start a free trial:
                    </strong>
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    If you do not cancel your trial, the subscription fee for
                    your first year following the end of your trial and then
                    each subsequent annual renewal fee are eligible for either:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-4">
                    <li>
                      A full refund under our 30-day Money Back Guarantee, if
                      requested within 30-day of being charged.
                    </li>
                    <li>
                      After the expiration of the 30-day Money Back Guarantee, a
                      pro-rated refund of the days left in your renewed
                      subscription term, beginning the month after you request
                      the refund.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Quebec */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Globe className="h-6 w-6 text-red-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Quebec Residents
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  Annual Subscriptions (one-year term or more)
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>
                      The purchase of an annual subscription is eligible for
                      either:
                    </strong>
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-4">
                    <li>
                      A full refund under our 30-day Money Back Guarantee, if
                      requested within 30-days of the date of purchase.
                    </li>
                    <li>
                      After the expiration of the 30-day Money Back Guarantee, a
                      pro-rated refund of the days left in your current
                      subscription term.
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Each annual renewal is eligible for either:</strong>
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-4">
                    <li>
                      A full refund under our 30-day Money Back Guarantee, if
                      requested within 30 days of being charged.
                    </li>
                    <li>
                      After the expiration of the 30-day Money Back Guarantee, a
                      pro-rated refund of the days left in your renewed
                      subscription term.
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Trial Subscriptions
                </h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>
                      When a payment method is required to start a free trial:
                    </strong>
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    If you do not cancel your trial, the subscription fee for
                    your first year following the end of your trial and then
                    each subsequent annual renewal fee are eligible for either:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-4">
                    <li>
                      A full refund under our 30-day Money Back Guarantee, if
                      requested within 30-day of being charged.
                    </li>
                    <li>
                      After the expiration of the 30-day Money Back Guarantee, a
                      pro-rated refund of the days left in your renewed
                      subscription term.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* How to Request Cancellation */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-4">
            <DollarSign className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Requesting a Cancellation and Refund from Us
            </h2>
          </div>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
            <p className="text-amber-800">
              Before you start, please read all the restrictions and limitations
              described in this Cancellation and Refund Policy. If you qualify
              for a cancellation and refund on your purchase, and you purchased
              the subscription directly from us through our online retail store
              or from Google Play, then please follow the instructions below:
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Products Purchased from Us and Subscriptions You Terminate for
              Notified Amendments to the EULA
            </h3>
            <p className="text-gray-700 leading-relaxed">
              To request a cancellation and refund for a subscription you
              purchased from us through our online retail stores, or to
              terminate a subscription because you object to an amendment to the
              EULA we have notified to you, please find the confirmation email
              or invoice we sent directly to you in connection with your
              purchase, because it will tell you which MyCleanOne company you
              will need to contact (which may not be the brand name on the
              Solution) and will contain certain other information you must
              provide us in order to request your cancellation and refund.
            </p>
            <p className="text-gray-700">
              Then, click on the link below and follow the instructions on the
              linked page:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  Consumer products purchased from MyCleanOne
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900">
                  Business products purchased from MyCleanOne
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-900">
                  All business products and consumer products purchased from
                  MyCleanOne
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Restrictions and Limitations */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-4">
            <XCircle className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Restrictions and Limitations
            </h2>
          </div>

          <div className="space-y-6">
            {/* Physical Store, iTunes and Other Resellers */}
            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Restrictions Regarding Products Purchased from a Physical Store,
                iTunes and Other Resellers
              </h3>
              <p className="text-gray-700">
                To request a refund on a subscription and/or Solution you
                purchased from a physical bricks-and-mortar store, the iTunes
                app store or any other reseller (not mentioned above), rather
                than directly from us, please contact the reseller regarding its
                cancellation and refund policy and any request for a refund. We
                do not grant refunds on those purchases.
              </p>
            </div>

            {/* Resellers, Distributors and Channel Partners */}
            <div className="border-l-4 border-orange-400 pl-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Restrictions on Refunds to Resellers, Distributors and Channel
                Partners
              </h3>
              <p className="text-gray-700">
                If you purchased a subscription and/or Solution for resale to a
                third party, you have a right to receive refunds only if the
                right is granted by your Reseller Agreement, Distribution
                Agreement, Channel Partner Agreement or other agreement with us.
                Please review your agreement with us before requesting a
                cancellation and refund.
              </p>
            </div>

            {/* Other Restrictions */}
            <div className="border-l-4 border-gray-400 pl-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Other Restrictions
              </h3>
              <p className="text-gray-700 mb-3">
                We do not grant cancellations and refunds for the purchase of
                any:
              </p>

              <div className="space-y-3">
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Solution</strong> if you completed the purchase more
                    than 30 days prior to the date you requested a cancellation
                    and refund
                  </p>
                </div>

                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>CD, DVD or other physical medium</strong> on which
                    we provide a copy of a Solution, unless the physical medium
                    is defective
                  </p>
                </div>

                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Service</strong> we have fully performed prior to
                    the date you requested a cancellation and refund
                  </p>
                </div>

                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Solution</strong> within 6 months after you have
                    received a cancellation and refund for any prior purchase of
                    the same Solution
                  </p>
                </div>

                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>
                      VPN Solution or other communications Solution
                    </strong>{" "}
                    that you have used to upload and/or download more than 10GB
                    of data in aggregate, or that you have used to connect to
                    our VPN or other communication service more than 100 times
                  </p>
                </div>

                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Solution</strong> with respect to which you have
                    violated our End User License Agreement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EU Dispute Resolution */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Dispute Resolution (EU Residents Only)
            </h2>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 mb-4">
              If you are a consumer and live in the European Union and you
              purchased the subscription and/or Solution online from one of our
              companies based in the European Union, you may be entitled to
              address any dispute with us through an internet platform for
              online dispute resolution established by the European Commission
              (the "ODR Platform").
            </p>
            <p className="text-blue-800 mb-4">
              The ODR Platform is intended to facilitate out-of-court
              resolutions relating to online purchases of goods and services
              between consumers and traders based in the European Union.
            </p>
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4 text-blue-600" />
              <a
                href="http://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                You will find the ODR Platform here:
                http://ec.europa.eu/consumers/odr/
              </a>
            </div>
            <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
              <p className="text-sm text-yellow-800">
                <strong>Please note:</strong> Our End User License Agreement
                requires that you first contact us and provide us with an
                opportunity to resolve your issue, before you initiate any
                dispute resolution process.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300">
              © 2024 MyCleanOne. All rights reserved.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              For questions about this policy, please contact our support team.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CancellationRefundPolicy;
