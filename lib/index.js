#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const imageType = 'svg';

// Function to process images found in HTML content
async function processImagesInHtml(htmlContent, imageArrays) {
  // Regular expression to match image paths in HTML content
  const imageRegex = new RegExp(`["'](\\/assets\\/(?:images|svg-icons)(?:\\/[^"']+)*\\.${imageType})["']`, 'g');

  const matches = htmlContent.match(imageRegex);
  if (matches) {
    const cleanedMatches = matches.map(match => match.replace(/["']/g, ''));
    imageArrays[imageType] = imageArrays[imageType].concat(cleanedMatches);
  }
}

// Function to process images found in SCSS content
async function processScssFiles(scssContent, imageArrays) {
  // Regular expression to match URLs in SCSS content
  const urlRegex = /url\(["']?(.*?)["']?\)/g;

  let matches;
  while ((matches = urlRegex.exec(scssContent)) !== null) {
    const imageUrl = matches[1];
    // Adjust the image path to start from /assets/
    const adjustedPath = imageUrl.replace(/.*\/assets\//, '/assets/');

    if (!imageArrays[imageType]) {
      imageArrays[imageType] = [];
    }
    imageArrays[imageType].push(adjustedPath);
  }
}

// Function to process HTML files in a directory recursively
async function processHtmlFiles(directory) {
  const imageArrays = {
    png: [],
    jpg: [],
    webp: [],
    svg: [],
  };

  // Recursive function to traverse directories and process files
  async function traverse(directory) {
    try {
      const files = await fs.readdir(directory);

      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);

        if (stats.isDirectory()) {
          if (file !== 'node_modules') {
            await traverse(filePath);
          }
        } else if (stats.isFile()) {
          if (file.endsWith('.html')) {
            const htmlContent = await fs.readFile(filePath, 'utf-8');
            await processImagesInHtml(htmlContent, imageArrays);
          } else if (file.endsWith('.scss')) {
            const scssContent = await fs.readFile(filePath, 'utf-8');
            await processScssFiles(scssContent, imageArrays);
          }
        }
      }
    } catch (error) {
      console.error('Error while traversing directory:', error);
    }
  }

  try {
    await traverse(directory);
  } catch (error) {
    console.error('Error while processing HTML files:', error);
  }

  return imageArrays;
}

// Function to process images in a directory recursively
async function processImagesInDirectory(imageDirectory) {
  const imageArrays = {};

  try {
    const imageFiles = await fs.readdir(imageDirectory);

    for (const file of imageFiles) {
      const filePath = path.join(imageDirectory, file);

      if ((await fs.stat(filePath)).isDirectory()) {
        const subdirectoryArrays = await processImagesInDirectory(filePath);
        Object.keys(subdirectoryArrays).forEach(type => {
          imageArrays[type] = (imageArrays[type] || []).concat(subdirectoryArrays[type]);
        });
      } else {
        const type = path.extname(file).slice(1);
        if (type === imageType && (await fs.stat(filePath)).isFile()) {
          imageArrays[type] = (imageArrays[type] || []).concat(filePath.replace(/.*\/assets\//, '/assets/'));
        }
      }
    }
  } catch (error) {
    console.error('Error while processing images directory:', error);
  }

  return imageArrays;
}

// Function to find unused images
function findUnusedImages(htmlImages, assetsImages, imageType) {
  const usedImages = Object.values(htmlImages).flat();

  const unusedImages = {};
  unusedImages[imageType] = assetsImages[imageType].filter(img => !usedImages.includes(img));
  if (imageType !== 'svg')
    console.log(`Unused ${imageType.toUpperCase()} Images:`, unusedImages[imageType]);

  return unusedImages;
}

// Example usage
async function main() {
  try {
    const rootDirectory = __dirname;
    const htmlImages = await processHtmlFiles(path.join(rootDirectory, '/'));

    const assetsDirectory = path.join(__dirname, 'assets');
    const resultImages = await processImagesInDirectory(path.join(assetsDirectory, 'images'));
    const resultSvgIcons = await processImagesInDirectory(path.join(assetsDirectory, 'svg-icons'));

    const unusedImagesFromImages = findUnusedImages(htmlImages, resultImages, imageType);

    if (imageType === 'svg') {
      console.log(`Unused SVG Images from 'images' directory:`, unusedImagesFromImages[imageType]);
      console.log(`Unused SVG Images from 'svg-icons' directory:`, findUnusedImages(htmlImages, resultSvgIcons, imageType));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();

module.exports = { processHtmlFiles, processImagesInDirectory, findUnusedImages, main };
