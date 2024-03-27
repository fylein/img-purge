## img-purge
img-purge is a command-line tool designed to help you keep your web projects clean by identifying and removing unused images. It analyzes your HTML and SCSS files to detect image references and then compares them against the images stored in your project's directories.

## How it works
**Scans HTML and SCSS files** : img-purge recursively traverses the directory where it's run, searching for HTML and SCSS files.

**Identifies image references** : It parses the content of these files to identify image references, including both direct image URLs in HTML and URLs within CSS url() declarations.

**Compares with project images** : It then compares the detected image references with the actual image files stored in the project's assets/images and assets/svg-icons directories.

**Identifies unused images** : Any images found in the image directories that aren't referenced in the HTML or SCSS files are flagged as unused.

**Output** : img-purge logs the unused images, allowing you to review and optionally remove them to declutter your project and reduce unnecessary file storage.

## Installation
You can install img-purge globally using npm: npm i -g purge-unused-images

## Usage
To use img-purge, simply run the img-purge command in your terminal: npx img-purge (imagetype) Ex: npx img-purge png