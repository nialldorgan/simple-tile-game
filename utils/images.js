import * as ImageManipulator from 'expo-image-manipulator'

// Chop an image into tiles for the puzzle
  export async function chopImageIntoTiles(imageUri, gridSize, tileSize) {
    const tiles = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cropRegion = {
          originX: col * tileSize,
          originY: row * tileSize,
          width: tileSize,
          height: tileSize,
        };

        const cropped = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ crop: cropRegion }],
          { compress: 1, format: ImageManipulator.SaveFormat.PNG }
        );

        tiles.push({
          uri: cropped.uri,
          row,
          col,
          index: row * gridSize + col,
        });
      }
    }
    return tiles
  }

  // Resize an image to fit the board
  export async function resizeImage(uri, targetWidth, targetHeight) {
    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: {
        height: targetHeight,
        width: targetWidth
      }}],
      { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true }
    )
    return resizedImage
  }