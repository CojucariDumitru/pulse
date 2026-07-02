// Cloudinary delivery helper — assets live under `pulse/` (see server/scripts/upload-cloudinary.mjs).
const CLOUD_NAME = 'dozr400tl';

export function cld(publicId: string, transform = 'c_fill,g_auto,w_900,h_700'): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform},f_auto,q_auto/pulse/${publicId}`;
}

export const img = {
  wide: (id: string) => cld(id, 'c_fill,g_auto,w_1600,h_900'),
  card: (id: string) => cld(id, 'c_fill,g_auto,w_800,h_600'),
  square: (id: string, size = 700) => cld(id, `c_fill,g_auto,w_${size},h_${size}`),
  portrait: (id: string) => cld(id, 'c_fill,g_face,w_500,h_650'),
};
