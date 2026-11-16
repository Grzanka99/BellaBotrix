/**
 * Without a boundary here, a slot page that fetches (stream stats) would hold
 * back client-side navigation until its data arrives, defeating
 * `../loading.tsx`. Nothing is shown meanwhile; the extra sidebars appear
 * once their data is ready.
 */
export default function AsideLoading() {
  return null
}
