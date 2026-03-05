import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  try {
    await db.run(sql`ALTER TABLE \`products_rels\` ADD \`media_id\` integer;`)
  } catch {
    // Column already exists.
  }

  try {
    await db.run(sql`ALTER TABLE \`_products_v_rels\` ADD \`media_id\` integer;`)
  } catch {
    // Column already exists.
  }

  try {
    await db.run(sql`CREATE INDEX \`products_rels_media_id_idx\` ON \`products_rels\` (\`media_id\`);`)
  } catch {
    // Index already exists.
  }

  try {
    await db.run(
      sql`CREATE INDEX \`_products_v_rels_media_id_idx\` ON \`_products_v_rels\` (\`media_id\`);`,
    )
  } catch {
    // Index already exists.
  }

  await db.run(sql`
    INSERT INTO \`products_rels\` (\`order\`, \`parent_id\`, \`path\`, \`media_id\`)
    SELECT \`_order\`, \`_parent_id\`, 'gallery', \`image_id\`
    FROM \`products_gallery\`
    WHERE \`image_id\` IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM \`products_rels\` r
        WHERE r.\`parent_id\` = \`products_gallery\`.\`_parent_id\`
          AND r.\`path\` = 'gallery'
          AND r.\`media_id\` = \`products_gallery\`.\`image_id\`
      );
  `)

  await db.run(sql`
    INSERT INTO \`_products_v_rels\` (\`order\`, \`parent_id\`, \`path\`, \`media_id\`)
    SELECT \`_order\`, \`_parent_id\`, 'version.gallery', \`image_id\`
    FROM \`_products_v_version_gallery\`
    WHERE \`image_id\` IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM \`_products_v_rels\` r
        WHERE r.\`parent_id\` = \`_products_v_version_gallery\`.\`_parent_id\`
          AND r.\`path\` = 'version.gallery'
          AND r.\`media_id\` = \`_products_v_version_gallery\`.\`image_id\`
      );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DELETE FROM \`products_rels\` WHERE \`path\` = 'gallery' AND \`media_id\` IS NOT NULL;`)
  await db.run(
    sql`DELETE FROM \`_products_v_rels\` WHERE \`path\` = 'version.gallery' AND \`media_id\` IS NOT NULL;`,
  )
}
