# Frozen migration inputs

Copies of the i18n namespaces `import-content.mts` reads, taken at the point
each section moved into the CMS.

They are not the site's translations — the site retires a namespace as soon as
its section reads the CMS instead. They live here so that seeding a fresh
database still works after that: without them the only way to populate a new
Neon project would be to retype every section by hand.

Editing them changes what a *fresh* import produces. It does not change the
site, and it does not change content already in the database.
