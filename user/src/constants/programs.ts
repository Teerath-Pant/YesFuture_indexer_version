import type { PackageCardData } from "@/components/package-card-selector"

export const RootID = "YF00001"

export const ProgramColors = {
  x2:"#D6C82C",
  x3:"#3b82f6",
  x4:"#a855f7",
  xxx:"#ec4899",
}

export const programs = {
  magicGoldMatrix: "magic-gold-matrix",
  sponserMagic: "sponser-magic",
  magicLevels: "magic-levels",
}
export type ProgramTypes = keyof typeof programs



export const sponsorMagicPackages = [12.525, 25.05, 50.1, 100.2, 200.4, 400.8, 801.6, 1603.2, 3206.4]
export const magicGoldMatrixPackages = [37.5,75, 150, 300, 600, 1200, 2400, 4800, 9600]
export const magicLevelPackages = [24.75, 49.5, 99, 198, 396, 792, 1584, 3168, 6336]


export const MATRIX_PACKAGES: PackageCardData[] = [
  { id: "1", label: "Package 1", amount: "37.5 USDT", color: "" },
  { id: "2", label: "Package 2", amount: "75 USDT", color: "" },
  { id: "3", label: "Package 3", amount: "150 USDT", color: "" },
  { id: "4", label: "Package 4", amount: "300 USDT", color: "" },
  { id: "5", label: "Package 5", amount: "600 USDT", color: "" },
  { id: "6", label: "Package 6", amount: "1200 USDT", color: "" },
  { id: "7", label: "Package 7", amount: "2400 USDT", color: "" },
  { id: "8", label: "Package 8", amount: "4800 USDT", color: "" },
  { id: "9", label: "Package 9", amount: "9600 USDT", color: "" },
];

export const LEVEL_PACKAGES: PackageCardData[] = [
  { id: "1", label: "Package 1", amount: "24.975 USDT", color: "" },
  { id: "2", label: "Package 2", amount: "49.95 USDT", color: "" },
  { id: "3", label: "Package 3", amount: "99.90 USDT", color: "" },
  { id: "4", label: "Package 4", amount: "199.80 USDT", color: "" },
  { id: "5", label: "Package 5", amount: "399.60 USDT", color: "" },
  { id: "6", label: "Package 6", amount: "799.20 USDT", color: "" },
  { id: "7", label: "Package 7", amount: "1598.40 USDT", color: "" },
  { id: "8", label: "Package 8", amount: "3196.80 USDT", color: "" },
  { id: "9", label: "Package 9", amount: "6393.60 USDT", color: "" },
];

export const SPONSOR_PACKAGES: PackageCardData[] = [
  { id: "1", label: "Package 1", amount: "12.525 USDT", color: "" },
  { id: "2", label: "Package 2", amount: "25.05 USDT", color: "" },
  { id: "3", label: "Package 3", amount: "50.10 USDT", color: "" },
  { id: "4", label: "Package 4", amount: "100.20 USDT", color: "" },
  { id: "5", label: "Package 5", amount: "200.40 USDT", color: "" },
  { id: "6", label: "Package 6", amount: "400.80 USDT", color: "" },
  { id: "7", label: "Package 7", amount: "801.60 USDT", color: "" },
  { id: "8", label: "Package 8", amount: "1603.20 USDT", color: "" },
  { id: "9", label: "Package 9", amount: "3206.40 USDT", color: "" },
];
