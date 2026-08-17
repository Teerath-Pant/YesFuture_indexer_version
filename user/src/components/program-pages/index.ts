import SponserMagic from "./sponser-magic";
import XTwoPage from "./x-two";
import XFourPage from "./x-four";
import MagicGoldMatrix from "./magic-gold-matrix"
import XxxPage from "./xxx";


export const ProgramPages = {
  x2: XTwoPage,
  x3: SponserMagic,
  x4: MagicGoldMatrix,
  xxx: XxxPage,
} as const;

export const ProgramColors = {
    x2: "#D6C82C",
    x3: "#3b82f6",
    x4: "#a855f7",
    xxx: "#ec4899",
} as const;

export { XxxPage, XFourPage, SponserMagic, XTwoPage,MagicGoldMatrix };