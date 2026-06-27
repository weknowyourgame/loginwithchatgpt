"use client";

import { useCallback, useState } from "react";

import {
  PackageManagerInstallCard,
  type ShadcnPackageManager
} from "@/components/package-manager-install-toolbar";

const COMMANDS: Record<ShadcnPackageManager, string> = {
  bun: "bun add loginwithchatgpt",
  npm: "npm install loginwithchatgpt",
  pnpm: "pnpm add loginwithchatgpt",
  yarn: "yarn add loginwithchatgpt"
};

export function InstallCommand() {
  const [pm, setPm] = useState<ShadcnPackageManager>("bun");
  const [copied, setCopied] = useState(false);
  const command = COMMANDS[pm];

  const onCopy = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore unsupported clipboard
    }
  }, [command]);

  return (
    <PackageManagerInstallCard
      value={pm}
      onValueChange={setPm}
      managers={["bun", "npm", "pnpm", "yarn"]}
      command={command}
      copied={copied}
      onCopy={onCopy}
    />
  );
}
