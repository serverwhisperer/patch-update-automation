export function parseUpdateResult(rawText) {
  const lines = rawText.split("\n");
  let total = 0;
  let critical = 0;
  let rebootRequired = false;
  const criticalPackages = [];

  const criticalKeywords = ["linux-", "kernel", "systemd", "glibc", "openssl"];

  lines.forEach(line => {
    const match = line.match(/([a-z0-9\-\_\.]+)\/.*\[upgradable from:/i);
    if (match) {
      total++;
      const pkg = match[1].toLowerCase();

      if (criticalKeywords.some(c => pkg.startsWith(c) || pkg.includes(c))) {
        critical++;
        criticalPackages.push(pkg);

        if (
          pkg.startsWith("linux-image") ||
          pkg.startsWith("linux-headers") ||
          pkg.startsWith("linux-modules") ||
          pkg === "linux-generic"
        ) {
          rebootRequired = true;
        }
      }
    }
  });

  if (/Pending kernel upgrade|Restarting the system to load the new kernel|reboot required|System restart required/i.test(rawText)) {
    rebootRequired = true;
  }

  return { total, critical, criticalPackages, rebootRequired };
}