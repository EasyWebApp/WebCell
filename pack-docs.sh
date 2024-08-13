# generate multilingual file
for file in *.md; do
    typedoc --readme $file

    mv docs/index.html ${file%.md}.html
done

# generate docs
typedoc source/

mv *.html docs/

# replace ReadMe-*.md to *.html, change url in *.html
for file in docs/ReadMe-*.html; do
    # example: mv ReadMe-zh.html docs/zh.html
    mv docs/$file docs/"${file#ReadMe-}"

    # example: replace ReadMe-zh.md zh.html
    replace "./${file%.html}" "./${file#ReadMe-}" docs/*.html
done

# default language
mv docs/ReadMe.html docs/index.html
