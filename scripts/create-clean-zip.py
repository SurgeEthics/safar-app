import os
import zipfile
import shutil

output_zips = [
    'public/safar-gafargaon-clean-source.zip',
    'public/safar-gafargaon-final.zip',
    'public/safar-gafargaon-latest.zip'
]
exclude_dirs = {'node_modules', '.git', 'dist', '.aistudio', 'dev-dist', 'aistudio'}
exclude_extensions = {'.zip'}

primary_zip = output_zips[0]

for oz in output_zips:
    if os.path.exists(oz):
        try:
            os.remove(oz)
        except Exception:
            pass

count = 0
with zipfile.ZipFile(primary_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('.'):
        # Modify dirs in-place to skip excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
        if 'aistudio' in root:
            continue
        for file in files:
            if any(file.endswith(ext) for ext in exclude_extensions):
                continue
            full_path = os.path.join(root, file)
            if 'assets/aistudio' in full_path:
                continue
            arcname = os.path.relpath(full_path, '.')
            zf.write(full_path, arcname)
            count += 1

# Copy to other output paths
for oz in output_zips[1:]:
    shutil.copyfile(primary_zip, oz)

size_kb = os.path.getsize(primary_zip) / 1024
print(f"Clean archives created successfully: {size_kb:.1f} KB, {count} files")
for oz in output_zips:
    print(f" -> {oz}")
