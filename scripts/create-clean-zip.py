import os
import zipfile
import shutil

print("Running clean production build...")
os.system("npm run build")

output_zip = 'public/safar-gafargaon-clean-source.zip'
secondary_zip = 'public/safar-gafargaon-final-source.zip'
exclude_dirs = {'node_modules', '.git', '.aistudio', 'dev-dist', 'aistudio', 'node-compile-cache', 'imported_safar'}
exclude_extensions = {'.zip', '.log', '.map'}

for target in [output_zip, secondary_zip]:
    if os.path.exists(target):
        try:
            os.remove(target)
        except Exception:
            pass

print("Packaging neat, clean project zip with full source, configs, and production dist...")
count = 0
with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.') and d != 'aistudio' and d != 'imported_safar']
        for file in files:
            if any(file.endswith(ext) for ext in exclude_extensions):
                continue
            if 'public/assets/aistudio' in root or 'assets/aistudio' in root:
                continue
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, '.')
            zf.write(full_path, arcname)
            count += 1

# Copy to secondary and to dist
shutil.copyfile(output_zip, secondary_zip)
if os.path.exists('dist'):
    shutil.copyfile(output_zip, os.path.join('dist', 'safar-gafargaon-clean-source.zip'))
    shutil.copyfile(output_zip, os.path.join('dist', 'safar-gafargaon-final-source.zip'))

size_mb = os.path.getsize(output_zip) / (1024 * 1024)
size_kb = os.path.getsize(output_zip) / 1024
print(f"Archive successfully created: {output_zip} ({size_mb:.2f} MB / {size_kb:.1f} KB, {count} files)")
