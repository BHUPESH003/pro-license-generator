export function generateLicenseKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const groups = 4;
  const groupLen = 4;
  let key = [];
  for (let g = 0; g < groups; g++) {
    let group = "";
    for (let i = 0; i < groupLen; i++) {
      group += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    key.push(group);
  }
  return key.join("-");
}
