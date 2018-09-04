import os
import re

for root, dirs, files in os.walk("./dist/studio-main/"):
    for file in files:
        if file.endswith(".ts"):
            file = os.path.join(root, file)
            replaced_content = []
            with open(file, "r") as f:
                content = f.read().split('\n')
                for row in content:
                    if "../../core" in row:
                        change_row = row.replace("'../../", "'./")
                        print(row, " - ", change_row)
                        replaced_content.append(change_row)
                        continue
                    if "main.ts" in file and "'../core/common'" in row:
                        change_row = row.replace("'../", "'./src/")
                        print(row, " - ", change_row)
                        replaced_content.append(change_row)
                        continue

                    replaced_content.append(row)
                replaced_content = "\n".join(replaced_content)

            with open(file, "w") as f:
                f.write(replaced_content)
