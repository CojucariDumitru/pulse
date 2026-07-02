export const SITE = {
  name: 'PULSE',
  tagline: 'Find your rhythm.',
  phone: '+1 (212) 555-0196',
  phoneHref: 'tel:+12125550196',
  email: 'hello@pulsestudio.app',
  address: {
    line1: '88 Mercer St',
    line2: 'New York, NY 10012',
    full: '88 Mercer St, New York, NY 10012',
  },
  mapsQuery: '88+Mercer+St+New+York+NY+10012',
  hours: [
    { days: 'Mon – Fri', time: '6am – 9pm' },
    { days: 'Sat – Sun', time: '8am – 2pm' },
  ],
  social: {
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com',
  },
};

export const MAPS_EMBED = `https://maps.google.com/maps?q=${SITE.mapsQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
export const MAPS_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${SITE.mapsQuery}`;

export const NAV_LINKS = [
  { label: 'Classes', to: '/#classes' },
  { label: 'Schedule', to: '/schedule' },
  { label: 'Program', to: '/program' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Contact', to: '/contact' },
];
