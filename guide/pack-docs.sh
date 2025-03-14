mkdir -p dist/
cp ReadMe.md dist/
cp guide/*.md dist/
cd dist/
# remove Markdown suffix, because TypeDoc will copy Markdown file to `/media` folder
replace ".md\)" ")" *.md
replace "guide/" "" ReadMe.md

# generate multilingual file
for file in *.md; do
    typedoc --readme $file

    mv docs/index.html ./${file%.md}.html
done

cd ../
# generate docs
typedoc source/

mv dist/*.html docs/
rm -r dist/docs dist/*.md

cd docs
# default language
mv ReadMe.html index.html

# replace ReadMe-* to *, change URL in *.html
for file in ReadMe-*.html; do
    # example: mv ReadMe-zh.html docs/zh.html
    mv $file "${file#ReadMe-}"

    # example: remove ReadMe-
    replace "./ReadMe-" "./" *.html
done
