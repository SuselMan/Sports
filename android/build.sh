#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
health_sdk="${HEALTH_ANDROID_SDK:-/home/suselman/tools/android-sdk}"
health_tools="$health_sdk/build-tools/35.0.0"
health_jar="$health_sdk/platforms/android-35/android.jar"
health_keys="$HOME/.local/share/kektrack-apk-signing"
rm -rf build/classes build/dex
mkdir -p build/classes build/dex "$health_keys"
chmod 700 "$health_keys"
if [[ ! -f "$health_keys/release.jks" ]]; then
  python3 -c 'import secrets; print(secrets.token_urlsafe(40))' > "$health_keys/password"
  chmod 600 "$health_keys/password"
  keytool -genkeypair -keystore "$health_keys/release.jks" -storepass:file "$health_keys/password" -keypass:file "$health_keys/password" -alias kektrack-release -keyalg RSA -keysize 3072 -validity 10000 -dname 'CN=Ilya Kektrack' >/dev/null
  chmod 600 "$health_keys/release.jks"
fi
javac -source 8 -target 8 -classpath "$health_jar" -d build/classes src/ru/ilya/kektrack/*.java
jar cf build/classes.jar -C build/classes .
"$health_tools/d8" --lib "$health_jar" --min-api 26 --output build/dex build/classes.jar
kektrack_manifest="AndroidManifest.xml"
if [[ "${KEKTRACK_DEBUG:-0}" == "1" ]]; then
  sed 's/<application /<application android:debuggable="true" /' AndroidManifest.xml > build/AndroidManifest.xml
  kektrack_manifest="build/AndroidManifest.xml"
fi
"$health_tools/aapt2" compile --dir res -o build/compiled-res.zip
"$health_tools/aapt2" link build/compiled-res.zip -I "$health_jar" --manifest "$kektrack_manifest" -o build/resources.apk
python3 - <<'PY'
from pathlib import Path
import zipfile
with zipfile.ZipFile('build/resources.apk') as source,zipfile.ZipFile('build/unsigned.apk','w') as output:
    for entry in source.infolist():output.writestr(entry,source.read(entry))
    for file in Path('build/dex').glob('*.dex'):output.write(file,file.name)
    for file in Path('../frontend/dist').rglob('*'):
        if file.is_file():output.write(file,'assets/web/'+str(file.relative_to('../frontend/dist')))
PY
"$health_tools/zipalign" -f 4 build/unsigned.apk build/aligned.apk
"$health_tools/apksigner" sign --ks "$health_keys/release.jks" --ks-key-alias kektrack-release --ks-pass "file:$health_keys/password" --out build/kektrack.apk build/aligned.apk
"$health_tools/apksigner" verify --verbose build/kektrack.apk
sha256sum build/kektrack.apk
