# generate multilingual file
for file in ReadMe-*.md; do

typedoc --readme $file

mv docs/index.html ${file%.md}.html

done

# generate docs
typedoc source/

# copy html file to docs folder, replace link
for file in ReadMe-*.html; do

# example: mv ReadMe-zh.html docs/zh.html
mv $file docs/"${file#ReadMe-}"

# example: replace ReadMe-zh.md zh.html
replace "./${file%.html}.md" "./${file#ReadMe-}" docs/*.html

done