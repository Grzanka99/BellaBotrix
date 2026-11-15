/**
 * Every panel page without its own `@aside` page. Needed because a slot keeps
 * its previous content on client-side navigation unless the new URL matches a
 * page in it: without this, the stream-stats sidebars would stay visible
 * after navigating away.
 */
export default function AsideCatchAll() {
  return null
}
