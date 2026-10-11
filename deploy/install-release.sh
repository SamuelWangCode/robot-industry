#!/bin/bash
set -euo pipefail

# Run as root with a prepared release directory, runtime and private api.env.
release=${1:?Usage: install-release.sh /opt/robot-industry/releases/RELEASE}
release=$(realpath "$release")
case "$release" in
  /opt/robot-industry/releases/*) ;;
  *) echo 'Release must be under /opt/robot-industry/releases' >&2; exit 1 ;;
esac
test -f "$release/dist/index.html"
test -f "$release/server/system-prompt.txt"
test -x /opt/robot-industry/runtime/bin/node
test -s /etc/robot-industry/api.env

backup="/root/robot-industry-backups/$(date -u +%Y%m%dT%H%M%SZ)"
install -d -m 700 "$backup"
cp -p /etc/nginx/conf.d/robot-industry.conf "$backup/nginx.conf"
if [ -f /etc/systemd/system/robot-industry-api.service ]; then
  cp -p /etc/systemd/system/robot-industry-api.service "$backup/api.service"
fi
old_release=$(readlink -f /opt/robot-industry/current || true)
old_site=$(readlink -f /var/www/robot-industry)
printf '%s\n' "$old_release" > "$backup/previous-release.txt"
printf '%s\n' "$old_site" > "$backup/previous-site.txt"
site_moved=false

rollback() {
  trap - ERR
  cp -p "$backup/nginx.conf" /etc/nginx/conf.d/robot-industry.conf
  if [ -n "$old_release" ] && [ -d "$old_release" ]; then
    ln -sfn "$old_release" /opt/robot-industry/current
  fi
  if [ "$site_moved" = true ]; then
    if [ -L /var/www/robot-industry ]; then unlink /var/www/robot-industry; fi
    mv "$backup/original-site" /var/www/robot-industry
  elif [ -L /var/www/robot-industry ]; then
    ln -sfn "$old_site" /var/www/robot-industry
  fi
  if [ -f "$backup/api.service" ]; then
    cp -p "$backup/api.service" /etc/systemd/system/robot-industry-api.service
    systemctl daemon-reload
    systemctl restart robot-industry-api || true
  else
    systemctl disable --now robot-industry-api || true
  fi
  nginx -t && systemctl reload nginx
  echo "Deployment failed; restored previous site. Backup: $backup" >&2
  exit 1
}
trap rollback ERR

id robot-industry >/dev/null 2>&1 || useradd --system --no-create-home --shell /sbin/nologin robot-industry
ln -sfn "$release" /opt/robot-industry/current
install -m 644 "$release/deploy/robot-industry-api.service" /etc/systemd/system/robot-industry-api.service
systemctl daemon-reload
systemctl enable --now robot-industry-api
systemctl restart robot-industry-api
curl --fail --retry 8 --retry-connrefused --retry-delay 1 --silent http://127.0.0.1:3001/robot-industry/api/health

# Modify only this site's existing HTTPS block; preserve other virtual hosts.
python3 - "$release" <<'PY'
import pathlib,sys
p=pathlib.Path('/etc/nginx/conf.d/robot-industry.conf')
s=p.read_text()
if 'location ^~ /robot-industry/api/' not in s:
    marker='location /robot-industry/ {'
    assert s.count(marker)==1
    proxy=(pathlib.Path(sys.argv[1])/'deploy/nginx-api.conf.example').read_text()
    extras='''
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/css application/javascript application/json image/svg+xml;
    location ^~ /robot-industry/assets/ {
        alias /var/www/robot-industry/assets/;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    location ^~ /robot-industry/reports/ {
        alias /var/www/robot-industry/reports/;
        add_header Cache-Control "public, max-age=86400";
    }
    '''
    s=s.replace(marker,proxy+'\n'+extras+marker+'\n        add_header Cache-Control "no-cache" always;')
    p.write_text(s)
PY
nginx -t

if [ ! -L /var/www/robot-industry ]; then
  mv /var/www/robot-industry "$backup/original-site"
  site_moved=true
  ln -s "$release/dist" /var/www/robot-industry
else
  ln -s "$release/dist" /var/www/robot-industry-next
  mv -Tf /var/www/robot-industry-next /var/www/robot-industry
fi
systemctl reload nginx
curl --fail --silent --resolve www.sh-ai-trend.com:443:127.0.0.1 https://www.sh-ai-trend.com/robot-industry/api/health
curl --fail --silent --output /dev/null --resolve www.sh-ai-trend.com:443:127.0.0.1 https://www.sh-ai-trend.com/robot-industry/
trap - ERR
echo "Release active: $release"
echo "Backup: $backup"
