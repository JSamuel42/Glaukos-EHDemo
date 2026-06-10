import {
  BookOpen, FlaskConical, FileText,
  FolderArchive, BarChart3, BookMarked, FolderKanban,
} from 'lucide-react';

export type ModuleGroup = 'core-materials' | 'country-readiness' | 'custom-applications';

export interface ModuleGroupDef {
  key: ModuleGroup;
  label: string;
  sublabel?: string;
}

export const MODULE_GROUPS: ModuleGroupDef[] = [
  { key: 'core-materials', label: 'Core Materials' },
  { key: 'country-readiness', label: 'Country Readiness' },
  { key: 'custom-applications', label: 'Custom Applications' },
];

export type ModuleKey =
  | 'library'
  | 'document-hub'
  | 'scientific-narrative'
  | 'payer-value-story'
  | 'epidemiology'
  | 'literature-reviews'
  | 'dossier-builder'
  // dormant — code kept, not listed in nav/landing
  | 'projects'
  | 'objection-handling'
  | 'ask-gvd'
  | 'comparative-data'
  | 'ai-mock-negotiations'
  | 'synthetic-ad-boards';

export interface ModuleDef {
  key: ModuleKey;
  group: ModuleGroup;
  name: string;
  shortName: string;
  href: string;
  icon: typeof BookOpen;
  cardBlurb: string;
  cardCta: string;
  /** Non-clickable "Coming Soon" card — also used for disabled/greyed tiles. */
  comingSoon?: boolean;
  /** When true the module is dormant: not listed on landing or in nav.
   *  Source files remain in place for shared-import safety. */
  dormant?: boolean;
}

export const MODULES: ModuleDef[] = [
  // Core Materials
  { key: 'library', group: 'core-materials', name: 'Library', shortName: 'Library',
    href: '/library', icon: BookOpen,
    cardBlurb: 'Browse curated iStent infinite evidence across the OAG patient funnel.',
    cardCta: 'Explore Library' },
  { key: 'document-hub', group: 'core-materials', name: 'DocuHub', shortName: 'DocuHub',
    href: '/document-hub', icon: FolderArchive,
    cardBlurb: 'Access global publication documents in one place.',
    cardCta: 'Browse Documents',
    comingSoon: true },

  // Country Readiness
  { key: 'scientific-narrative', group: 'country-readiness', name: 'Scientific Narrative', shortName: 'Sci Narrative',
    href: '/scientific-narrative', icon: FlaskConical,
    cardBlurb: "Explore iStent infinite's Scientific Communication platform.",
    cardCta: 'Explore Narrative' },
  { key: 'payer-value-story', group: 'country-readiness', name: 'Payer Value Story', shortName: 'Value Story',
    href: '/payer-value-story', icon: FileText,
    cardBlurb: 'Explore value narratives across key payer domains for iStent infinite.',
    cardCta: 'Explore Value Story' },

  // Custom Applications
  { key: 'epidemiology', group: 'custom-applications', name: 'Epidemiology', shortName: 'Epidemiology',
    href: '/epidemiology', icon: BarChart3,
    cardBlurb: 'Explore OAG patient funnels and surgical-eligible population estimates.',
    cardCta: 'Explore Patient Funnels' },
  { key: 'literature-reviews', group: 'custom-applications', name: 'Literature Reviews', shortName: 'Lit Reviews',
    href: '/literature-reviews', icon: BookMarked,
    cardBlurb: 'Run structured literature searches and push results into the Library.',
    cardCta: 'Start Review' },
  { key: 'dossier-builder', group: 'custom-applications', name: 'Dossier Builder', shortName: 'Dossier',
    href: '/dossier-builder', icon: FolderKanban,
    cardBlurb: 'Compile evidence into structured country dossier sections.',
    cardCta: 'Build Dossier' },

  // Dormant — kept for shared-import safety, not listed on landing or nav
  { key: 'projects',           group: 'core-materials',     name: 'Projects',          shortName: 'Projects',    href: '/projects',           icon: BookOpen, cardBlurb: '', cardCta: '', dormant: true },
  { key: 'objection-handling', group: 'country-readiness',  name: 'Objection Handling', shortName: 'Objections', href: '/objection-handling', icon: BookOpen, cardBlurb: '', cardCta: '', dormant: true },
  { key: 'ask-gvd',            group: 'country-readiness',  name: 'Ask GVD',           shortName: 'Ask GVD',     href: '/ask-gvd',            icon: BookOpen, cardBlurb: '', cardCta: '', dormant: true },
  { key: 'comparative-data',   group: 'custom-applications', name: 'Comparative Data', shortName: 'Comparative', href: '/comparative-data',   icon: BookOpen, cardBlurb: '', cardCta: '', dormant: true },
  { key: 'ai-mock-negotiations', group: 'custom-applications', name: 'AI Mock Negotiations', shortName: 'Mock Negotiations', href: '/ai-mock-negotiations', icon: BookOpen, cardBlurb: '', cardCta: '', dormant: true },
  { key: 'synthetic-ad-boards', group: 'custom-applications', name: 'Synthetic Ad-boards', shortName: 'Ad-boards', href: '/synthetic-ad-boards', icon: BookOpen, cardBlurb: '', cardCta: '', dormant: true },
];

export const MODULES_BY_KEY: Record<ModuleKey, ModuleDef> =
  Object.fromEntries(MODULES.map(m => [m.key, m])) as Record<ModuleKey, ModuleDef>;

export function getModulesByGroup(group: ModuleGroup): ModuleDef[] {
  return MODULES.filter(m => m.group === group && !m.dormant);
}
