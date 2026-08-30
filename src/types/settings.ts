export interface SiteSettings {
  supportQrUrl: string;
  supportTitle: string;
  supportMessage: string;
  supportUpiId?: string;
  isEnabled: boolean;
  updatedAt?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  supportQrUrl: '',
  supportTitle: 'Support the Curator',
  supportMessage:
    'Enjoying Airwaves? Help keep this curated directory of 70 independent feeds ad-free and maintained.',
  supportUpiId: '',
  isEnabled: true,
};
