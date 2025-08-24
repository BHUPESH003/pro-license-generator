export function buildLicenseEmail({
  user,
  licenseKeys,
  status,
  plan,
  expiryDate,
  action,
}: {
  user: any;
  licenseKeys: string[];
  status: string;
  plan: string;
  expiryDate: Date;
  action: string;
}) {
  return {
    subject: `Your MyCleanOne License Keys${action ? ` - ${action}` : ""}`,
    greeting: `Hi${user?.name ? " " + user.name : ""},`,
    message:
      action === "deactivated"
        ? `Your license(s) have been deactivated due to payment failure or subscription cancellation.`
        : action === "reactivated"
          ? `Your license(s) have been reactivated. Thank you for your continued subscription!`
          : action === "updated"
            ? `Your license subscription has been updated.`
            : `Thank you for your purchase! Here are your license keys:`,
    licenseKeys,
    plan,
    expiryDate: expiryDate ? expiryDate.toISOString().slice(0, 10) : undefined,
    instructions:
      action === "deactivated"
        ? "To reactivate, please update your payment method or renew your subscription."
        : "Enter these keys in your MyCleanOne client to activate your software. If you need more devices, you can upgrade anytime.",
    support:
      "If you have any questions, reply to this email or contact support@mycleanone.com.",
    status,
  };
}
