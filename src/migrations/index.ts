import * as migration_20260216_121044_add_category_images_and_parent from './20260216_121044_add_category_images_and_parent';
import * as migration_20260304_195200_products_gallery_to_upload_has_many from './20260304_195200_products_gallery_to_upload_has_many';

export const migrations = [
  {
    up: migration_20260216_121044_add_category_images_and_parent.up,
    down: migration_20260216_121044_add_category_images_and_parent.down,
    name: '20260216_121044_add_category_images_and_parent'
  },
  {
    up: migration_20260304_195200_products_gallery_to_upload_has_many.up,
    down: migration_20260304_195200_products_gallery_to_upload_has_many.down,
    name: '20260304_195200_products_gallery_to_upload_has_many',
  },
];
