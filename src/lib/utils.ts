// utils/generateLicenseKey.ts

import License from "@/models/License";

export async function generateUniqueLicenseKey(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const groups = 4;
  const groupLen = 4;

  let key: string;
  let exists = true;

  while (exists) {
    let parts = [];
    for (let g = 0; g < groups; g++) {
      let group = "";
      for (let i = 0; i < groupLen; i++) {
        group += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      parts.push(group);
    }
    key = parts.join("-");

    // Check in DB if already exists
    exists = !!(await License.exists({ licenseKey: key }));
  }

  return key!;
}
