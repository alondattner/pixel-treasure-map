/**
 *    _____ _          _ _______                                __  __             
 *   |  __ (_)        | |__   __|                              |  \/  |            
 *   | |__) |__  _____| |  | |_ __ ___  __ _ ___ _   _ _ __ ___| \  / | __ _ _ __  
 *   |  ___/ \ \/ / _ \ |  | | '__/ _ \/ _` / __| | | | '__/ _ \ |\/| |/ _` | '_ \ 
 *   | |   | |>  <  __/ |  | | | |  __/ (_| \__ \ |_| | | |  __/ |  | | (_| | |_) |
 *   |_|   |_/_/\_\___|_|  |_|_|  \___|\__,_|___/\__,_|_|  \___|_|  |_|\__,_| .__/  by Alon Dattner
 *                                                                          | |    
 *                                                                          |_|    
 *
 *  PixelTreasureMap renders a random pixelated treasure map using perlin noise for height map generation.
 *  
 *  - Press 'n' to generate a [n]ew map
 *  - Press 'f' to toggle [f]ullscreen mode
 *  - Press 's' to [s]ave the map as an image
 *
 **/

// You can adjust the colors to your preference
let color_deepWater = "#008dc4";
let color_shallowWater = "#00a9cc";
let color_sand = "#eecda3";
let color_lightGrass = "#C2D58D";
let color_darkGrass = "#79BD4F";
let color_trees = "#618749";
let color_stone = "#736C6C";
let color_cross = "#DF0000";

// You can try playing around with the blockSize (resolution) and noiseScale (zoom).
let blockSize = 5; // Be careful with blockSize < 5 since it will take longer to render the map.
let noiseScale = 1/150;

// DON'T CHANGE THESE!
let treasureMap;
let font;
let image_papyrusTexture;

/**
 *  Preload font and papyrus texture
 **/
function preload() {
  font = loadFont('Daydream.ttf');
  image_papyrusTexture = loadImage('papyrus-texture-vignette.png');
}

/**
 *  Setup scene
 **/
function setup() {
  createCanvas(windowWidth, windowHeight);
  noiseDetail(5, 0.5);
  angleMode(DEGREES);
  pixelDensity(1);
  noStroke();
  renderNewTreasureMap();
}

/**
 *  Creates and renders a new map
 **/
function renderNewTreasureMap() {
  treasureMap = new TreasureMap();
  treasureMap.render();
}

/**
 *  Handles user input
 **/
function keyPressed() {
  switch(key) {
      
    // Toggle fullscreen
    case 'f': {
      fullscreen(!fullscreen())
      break;
    }
      
    // Generate new map
    case 'n': {
      renderNewTreasureMap();
      break;
    }
      
    // Save map as image
    case 's': {
      saveCanvas("PixelTreasureMap_" + floor(millis()) + ".jpg");
      break;
    }
  }
}

/**
 *  Handles responsiveness
 **/
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  renderNewTreasureMap();
}

/**
 *  TreasureMap class
 **/
class TreasureMap {
  constructor() {
    
    // Set timestamp (for monitoring)
    let ts = new Date().getTime();
    
    // Create empty heightMap map
    this.heightMap = [];    
    
    // Set noise seed for random map every time
    noiseSeed(millis());
    
    // Loop through all pixels (considering blockSize)
    for(let x=0; x<windowWidth; x+=blockSize) {
      this.heightMap[x] = [];  // Add empty array so we can fill it afterwards
      for(let y=0; y<windowHeight; y+=blockSize) {
        
        // Generate noise for pixel/block based on position and offset
        this.heightMap[x][y] = noise(x*noiseScale, y*noiseScale);
      }
    }
    
    // Log timestamp (for monitoring)
    console.log("constructor(): " + (new Date().getTime() - ts) + "ms");
  }
  
  /**
   *  Renders the treasure map
   **/
  render() {    
    
    // Set timestamp (for monitoring)
    let ts = new Date().getTime();
    
    // Loop through all pixels (considering blockSize)
    for(let x=0; x<windowWidth; x+=blockSize) {
      for(let y=0; y<windowHeight; y+=blockSize) {
        
        // Get pixel color based on windowHeight map
        let pixelHeight = this.heightMap[x][y];
        let pixelColor = this.pickColor(pixelHeight);

        // Draw pixel (using rectangle)
        push();
        fill(pixelColor);
        rect(x,y,blockSize,blockSize);
        pop();
      }
    }
    
    // Draw overlays
    this.drawCross();
    this.drawText();
    
    // Blend papyrus texture
    push();
    blendMode(BLEND);
    tint(255,75);
    image(image_papyrusTexture, 0, 0, windowWidth, windowHeight);
    pop();
    
    // Log timestamp (for monitoring)
    console.log("render(): " + (new Date().getTime() - ts) + "ms");
  }
  
  /**
   *  Returns a color based on windowHeight (noise value)
   **/
  pickColor(n) {
    let pixelColor = "#ffffff";
    if(n < 0.3) {
      pixelColor = color_deepWater;
    } else if(n < 0.4) {
      pixelColor = color_shallowWater;
    } else if(n < 0.45) {
      pixelColor = color_sand;
    } else if(n < 0.5) {
      pixelColor = color_lightGrass;
    } else if(n < 0.65) {
      pixelColor = color_darkGrass;
    } else if(n < 0.75) {
      pixelColor = color_trees;
    } else if(n < 1) {
      pixelColor = color_stone;
    }
    return color(pixelColor);
  }
  
  /**
   *  Draws the red cross
   **/
  drawCross() {
    let crossX = getRandom(blockSize*10, windowWidth-blockSize*10);
    let crossY = getRandom(windowHeight/6+blockSize*10, windowHeight-blockSize*10);
    
    // Draw cross
    push();
    fill(color_cross)
    textFont(font);
    textAlign(CENTER);
    textSize(40);
    text("x", crossX, crossY);
    pop();        
  }
  
  /**
   *  Draws all texts
   **/
  drawText() {
    
    //Draw header
    push();
    rotate(-2);
    fill("#160800")
    textFont(font);
    textAlign(CENTER);
    textSize(50);
    text("pixel TREASURE  MAP", windowWidth/2, windowHeight/6);
    pop();
  }
}

/**
 *  Returns a random start coordinate inside the min and max (considering the block size)
 *  
 *  Disclamer:
 *  This function was originally generated by ChatGPT (for the first challenge).
 **/
function getRandom(min, max) {
  min = Math.ceil(min / blockSize) * blockSize;
  max = Math.floor(max / blockSize) * blockSize;
  return Math.floor(random((max - min) / blockSize + 1)) * blockSize + min;
}