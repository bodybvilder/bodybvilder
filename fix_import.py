import re

path = r'src\components\posereference.jsx'
with open(path, encoding='utf-8') as f:
    content = f.read()

# Remove duplicate: keep only the one with useState
# Pattern: the bare import comes before the one with useState
fixed = re.sub(
    r"import React from 'react';\r?\n(import React, \{ useState \} from 'react';)",
    r"import React, { useState } from 'react';",
    content
)

if fixed == content:
    print("Pattern not found, trying line-by-line fix...")
    lines = content.split('\n')
    out = []
    for line in lines:
        if line.strip() == "import React from 'react';":
            continue  # skip bare import
        out.append(line)
    fixed = '\n'.join(out)

with open(path, 'w', encoding='utf-8') as f:
    f.write(fixed)

# Verify first 5 lines
for i, line in enumerate(fixed.split('\n')[:6], 1):
    print(f"{i}: {line}")

print("\nDone!")
