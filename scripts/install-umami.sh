#!/usr/bin/env bash

##
# @file
# Installs Umami demo site.
##

set -Eeuo pipefail

if [[ -f .env ]]; then
  source .env
fi

K6_DRUPAL_VERSION=${K6_DRUPAL_VERSION:-10.1.x}
K6_DRUPAL_DIR=${K6_DRUPAL_DIR:-'/var/www/umami/web'}

K6_DB_DRIVER=${K6_DB_DRIVER:-'mysql'}
K6_DB_HOST=${K6_DB_HOST:-'localhost'}
K6_DB_PORT=${K6_DB_PORT:-'3306'}
K6_DB_USER=${K6_DB_USER:-'root'}
K6_DB_PASS=${K6_DB_PASS:-'123'}
K6_DB_NAME=${K6_DB_NAME:-'k6_umami_'$RANDOM}

if [[ -d $K6_DRUPAL_DIR ]]; then
  read -rp "Directory $K6_DRUPAL_DIR already exists. Are you sure you want to remove it (Y/n): " REMOVE
  if [[ ${REMOVE,,} != 'y' && ${REMOVE,,} != '' ]]; then
    exit 0;
  fi
  chmod 777 $K6_DRUPAL_DIR/sites/default
  rm -rf $K6_DRUPAL_DIR
fi

git clone --depth=1 --branch=$K6_DRUPAL_VERSION https://git.drupalcode.org/project/drupal.git $K6_DRUPAL_DIR

cd $K6_DRUPAL_DIR
composer install
composer require drush/drush

mkdir -m 777 $K6_DRUPAL_DIR/sites/default/files
time ./vendor/bin/drush -y site:install demo_umami \
  --site-name='Umami Food Magazine' \
  --account-name=k6_admin \
  --account-pass=k6_admin \
  --account-mail=k6_admin@localhost \
  --db-url=$K6_DB_DRIVER'://'$K6_DB_USER':'$K6_DB_PASS'@'$K6_DB_HOST':'$K6_DB_PORT/$K6_DB_NAME

./vendor/bin/drush pm:uninstall big_pipe

./vendor/bin/drush user:create k6_author --password=k6_author --mail=k6-author@localhost
./vendor/bin/drush user:role:add author k6_author
