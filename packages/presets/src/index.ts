import { oriaDefaultTheme } from "@oriatheme/core";
import type { ThemeDefinition } from "@oriatheme/core";
import type { PresetCategory } from "./preset-designs.js";
import { oriaManuscriptTheme } from "./themes/manuscript.js";
import { manuscriptPreset } from "./specs/manuscript.js";
import { oriaMonoTheme } from "./themes/mono.js";
import { monoPreset } from "./specs/mono.js";
import { oriaMinimalismTheme } from "./themes/minimalism.js";
import { minimalismPreset } from "./specs/minimalism.js";
import { oriaLineArtTheme } from "./themes/line-art.js";
import { lineArtPreset } from "./specs/line-art.js";
import { oriaGlassTheme } from "./themes/glass.js";
import { glassPreset } from "./specs/glass.js";
import { oriaNeoBrutalismTheme } from "./themes/neo-brutalism.js";
import { neoBrutalismPreset } from "./specs/neo-brutalism.js";
import { oriaPunchcardTheme } from "./themes/punchcard.js";
import { punchcardPreset } from "./specs/punchcard.js";
import { oriaSketchbookTheme } from "./themes/sketchbook.js";
import { sketchbookPreset } from "./specs/sketchbook.js";
import { oriaSoftClayTheme } from "./themes/soft-clay.js";
import { softClayPreset } from "./specs/soft-clay.js";
import { oriaGoldenBazaarTheme } from "./themes/golden-bazaar.js";
import { goldenBazaarPreset } from "./specs/golden-bazaar.js";
import { oriaTheoremTheme } from "./themes/theorem.js";
import { theoremPreset } from "./specs/theorem.js";
import { oriaRedlineTheme } from "./themes/redline.js";
import { redlinePreset } from "./specs/redline.js";
import { oriaLineBlazeTheme } from "./themes/line-blaze.js";
import { lineBlazePreset } from "./specs/line-blaze.js";
import { oriaGreenLiteTheme } from "./themes/green-lite.js";
import { greenLitePreset } from "./specs/green-lite.js";
import { oriaNeumorphismTheme } from "./themes/neumorphism.js";
import { neumorphismPreset } from "./specs/neumorphism.js";
import { oriaMemphisTheme } from "./themes/memphis.js";
import { memphisPreset } from "./specs/memphis.js";
import { oriaOceanTheme } from "./themes/ocean.js";
import { oceanPreset } from "./specs/ocean.js";
import { oriaForestTheme } from "./themes/forest.js";
import { forestPreset } from "./specs/forest.js";
import { oriaAuroraTheme } from "./themes/aurora.js";
import { auroraPreset } from "./specs/aurora.js";
import { oriaWarmReadingTheme } from "./themes/warm-reading.js";
import { warmReadingPreset } from "./specs/warm-reading.js";
import { oriaMonochromeDeployTheme } from "./themes/monochrome-deploy.js";
import { monochromeDeployPreset } from "./specs/monochrome-deploy.js";
import { oriaPrecisionFlowTheme } from "./themes/precision-flow.js";
import { precisionFlowPreset } from "./specs/precision-flow.js";
import { oriaElevatedSurfaceTheme } from "./themes/elevated-surface.js";
import { elevatedSurfacePreset } from "./specs/elevated-surface.js";
import { oriaBentoUiTheme } from "./themes/bento-ui.js";
import { bentoUiPreset } from "./specs/bento-ui.js";
import { oriaDashboardTheme } from "./themes/dashboard.js";
import { dashboardPreset } from "./specs/dashboard.js";
import { oriaEditorialTheme } from "./themes/editorial.js";
import { editorialPreset } from "./specs/editorial.js";
import { oriaAiNativeTheme } from "./themes/ai-native.js";
import { aiNativePreset } from "./specs/ai-native.js";
import { oriaCommandCenterTheme } from "./themes/command-center.js";
import { commandCenterPreset } from "./specs/command-center.js";
import { oriaSpatialUiTheme } from "./themes/spatial-ui.js";
import { spatialUiPreset } from "./specs/spatial-ui.js";
import { oriaSoftUiTheme } from "./themes/soft-ui.js";
import { softUiPreset } from "./specs/soft-ui.js";
import { oriaCyberpunkTheme } from "./themes/cyberpunk.js";
import { cyberpunkPreset } from "./specs/cyberpunk.js";
import { oriaY2kTheme } from "./themes/y2k.js";
import { y2kPreset } from "./specs/y2k.js";
import { oriaRetroTerminalTheme } from "./themes/retro-terminal.js";
import { retroTerminalPreset } from "./specs/retro-terminal.js";
import { oriaPaperTheme } from "./themes/paper.js";
import { paperPreset } from "./specs/paper.js";
import { oriaCalmTheme } from "./themes/calm.js";
import { calmPreset } from "./specs/calm.js";
import { oriaPlayfulTheme } from "./themes/playful.js";
import { playfulPreset } from "./specs/playful.js";
import { oriaPremiumTheme } from "./themes/premium.js";
import { premiumPreset } from "./specs/premium.js";
import { oriaOrganicTheme } from "./themes/organic.js";
import { organicPreset } from "./specs/organic.js";
import { oriaCottagecoreTheme } from "./themes/cottagecore.js";
import { cottagecorePreset } from "./specs/cottagecore.js";
import { oriaNatureTheme } from "./themes/nature.js";
import { naturePreset } from "./specs/nature.js";
import { oriaRetroTheme } from "./themes/retro.js";
import { retroPreset } from "./specs/retro.js";
import { oriaKawaiiTheme } from "./themes/kawaii.js";
import { kawaiiPreset } from "./specs/kawaii.js";
import { oriaSunsetTheme } from "./themes/sunset.js";
import { sunsetPreset } from "./specs/sunset.js";

export type { PresetCategory } from "./preset-designs.js";

export interface PresetCatalogEntry {
  readonly theme: ThemeDefinition;
  readonly category: PresetCategory;
}

export { oriaDefaultTheme, oriaManuscriptTheme, oriaMonoTheme, oriaMinimalismTheme, oriaLineArtTheme, oriaGlassTheme, oriaNeoBrutalismTheme, oriaPunchcardTheme, oriaSketchbookTheme, oriaSoftClayTheme, oriaGoldenBazaarTheme, oriaTheoremTheme, oriaRedlineTheme, oriaLineBlazeTheme, oriaGreenLiteTheme, oriaNeumorphismTheme, oriaMemphisTheme, oriaOceanTheme, oriaForestTheme, oriaAuroraTheme, oriaWarmReadingTheme, oriaMonochromeDeployTheme, oriaPrecisionFlowTheme, oriaElevatedSurfaceTheme, oriaBentoUiTheme, oriaDashboardTheme, oriaEditorialTheme, oriaAiNativeTheme, oriaCommandCenterTheme, oriaSpatialUiTheme, oriaSoftUiTheme, oriaCyberpunkTheme, oriaY2kTheme, oriaRetroTerminalTheme, oriaPaperTheme, oriaCalmTheme, oriaPlayfulTheme, oriaPremiumTheme, oriaOrganicTheme, oriaCottagecoreTheme, oriaNatureTheme, oriaRetroTheme, oriaKawaiiTheme, oriaSunsetTheme };

/** The complete collection for direct use as runtime presets. */
export const oriaPresetThemes: readonly ThemeDefinition[] = Object.freeze([oriaDefaultTheme, oriaManuscriptTheme, oriaMonoTheme, oriaMinimalismTheme, oriaLineArtTheme, oriaGlassTheme, oriaNeoBrutalismTheme, oriaPunchcardTheme, oriaSketchbookTheme, oriaSoftClayTheme, oriaGoldenBazaarTheme, oriaTheoremTheme, oriaRedlineTheme, oriaLineBlazeTheme, oriaGreenLiteTheme, oriaNeumorphismTheme, oriaMemphisTheme, oriaOceanTheme, oriaForestTheme, oriaAuroraTheme, oriaWarmReadingTheme, oriaMonochromeDeployTheme, oriaPrecisionFlowTheme, oriaElevatedSurfaceTheme, oriaBentoUiTheme, oriaDashboardTheme, oriaEditorialTheme, oriaAiNativeTheme, oriaCommandCenterTheme, oriaSpatialUiTheme, oriaSoftUiTheme, oriaCyberpunkTheme, oriaY2kTheme, oriaRetroTerminalTheme, oriaPaperTheme, oriaCalmTheme, oriaPlayfulTheme, oriaPremiumTheme, oriaOrganicTheme, oriaCottagecoreTheme, oriaNatureTheme, oriaRetroTheme, oriaKawaiiTheme, oriaSunsetTheme]);

/** Minimal runtime catalog; descriptive and workflow metadata lives in documentation. */
export const oriaPresetCatalog: readonly PresetCatalogEntry[] = Object.freeze([
  Object.freeze({ theme: oriaDefaultTheme, category: "oria" }),
  Object.freeze({ theme: oriaManuscriptTheme, category: manuscriptPreset.category }),
  Object.freeze({ theme: oriaMonoTheme, category: monoPreset.category }),
  Object.freeze({ theme: oriaMinimalismTheme, category: minimalismPreset.category }),
  Object.freeze({ theme: oriaLineArtTheme, category: lineArtPreset.category }),
  Object.freeze({ theme: oriaGlassTheme, category: glassPreset.category }),
  Object.freeze({ theme: oriaNeoBrutalismTheme, category: neoBrutalismPreset.category }),
  Object.freeze({ theme: oriaPunchcardTheme, category: punchcardPreset.category }),
  Object.freeze({ theme: oriaSketchbookTheme, category: sketchbookPreset.category }),
  Object.freeze({ theme: oriaSoftClayTheme, category: softClayPreset.category }),
  Object.freeze({ theme: oriaGoldenBazaarTheme, category: goldenBazaarPreset.category }),
  Object.freeze({ theme: oriaTheoremTheme, category: theoremPreset.category }),
  Object.freeze({ theme: oriaRedlineTheme, category: redlinePreset.category }),
  Object.freeze({ theme: oriaLineBlazeTheme, category: lineBlazePreset.category }),
  Object.freeze({ theme: oriaGreenLiteTheme, category: greenLitePreset.category }),
  Object.freeze({ theme: oriaNeumorphismTheme, category: neumorphismPreset.category }),
  Object.freeze({ theme: oriaMemphisTheme, category: memphisPreset.category }),
  Object.freeze({ theme: oriaOceanTheme, category: oceanPreset.category }),
  Object.freeze({ theme: oriaForestTheme, category: forestPreset.category }),
  Object.freeze({ theme: oriaAuroraTheme, category: auroraPreset.category }),
  Object.freeze({ theme: oriaWarmReadingTheme, category: warmReadingPreset.category }),
  Object.freeze({ theme: oriaMonochromeDeployTheme, category: monochromeDeployPreset.category }),
  Object.freeze({ theme: oriaPrecisionFlowTheme, category: precisionFlowPreset.category }),
  Object.freeze({ theme: oriaElevatedSurfaceTheme, category: elevatedSurfacePreset.category }),
  Object.freeze({ theme: oriaBentoUiTheme, category: bentoUiPreset.category }),
  Object.freeze({ theme: oriaDashboardTheme, category: dashboardPreset.category }),
  Object.freeze({ theme: oriaEditorialTheme, category: editorialPreset.category }),
  Object.freeze({ theme: oriaAiNativeTheme, category: aiNativePreset.category }),
  Object.freeze({ theme: oriaCommandCenterTheme, category: commandCenterPreset.category }),
  Object.freeze({ theme: oriaSpatialUiTheme, category: spatialUiPreset.category }),
  Object.freeze({ theme: oriaSoftUiTheme, category: softUiPreset.category }),
  Object.freeze({ theme: oriaCyberpunkTheme, category: cyberpunkPreset.category }),
  Object.freeze({ theme: oriaY2kTheme, category: y2kPreset.category }),
  Object.freeze({ theme: oriaRetroTerminalTheme, category: retroTerminalPreset.category }),
  Object.freeze({ theme: oriaPaperTheme, category: paperPreset.category }),
  Object.freeze({ theme: oriaCalmTheme, category: calmPreset.category }),
  Object.freeze({ theme: oriaPlayfulTheme, category: playfulPreset.category }),
  Object.freeze({ theme: oriaPremiumTheme, category: premiumPreset.category }),
  Object.freeze({ theme: oriaOrganicTheme, category: organicPreset.category }),
  Object.freeze({ theme: oriaCottagecoreTheme, category: cottagecorePreset.category }),
  Object.freeze({ theme: oriaNatureTheme, category: naturePreset.category }),
  Object.freeze({ theme: oriaRetroTheme, category: retroPreset.category }),
  Object.freeze({ theme: oriaKawaiiTheme, category: kawaiiPreset.category }),
  Object.freeze({ theme: oriaSunsetTheme, category: sunsetPreset.category })
]);
