/** Fractal Generator - HTML5 Canvas and Javascript Demo
    Alex Luton - aluton@gmail.com
    Two overlapping divs with ids 'fractal' and a semi transparent 'zoom_overlay',
    Correct aspect ratio is 7:4
*/
var canvas = document.getElementById("fractal");
var zoom_canvas = document.getElementById("zoom_overlay");
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var ctx = canvas.getContext("2d");
var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
var ztx = zoom_canvas.getContext("2d");
var zoombox = {};
var dragging = false;
var width=0, height=0;
var xoffset=0, yoffset=0;
ztx.fillStyle = "#fff"; // fill color
var reset_button = document.getElementById("reset");
var zoom_label = document.getElementById("zoom_label");

function initialiseCoordinates(){
    width=3.5; height=2;
    xoffset=0; yoffset=0;
}

// Draw single pixel to the imageData //
function drawPixel (x, y, r, g, b, a) {
    var index = (x + y * canvasWidth) * 4;

    canvasData.data[index + 0] = r;
    canvasData.data[index + 1] = g;
    canvasData.data[index + 2] = b;
    canvasData.data[index + 3] = a;
}

//Convert hue value to rgb
function hToRgb(h){
    if (h == 1)
      return [0,0,0];
    var r, g, b;
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    switch(i % 6){
        case 0: r = 1, g = f, b = 0; break;
        case 1: r = f, g = 1, b = 0; break;
        case 2: r = 0, g = 1, b = f; break;
        case 3: r = 0, g = f, b = 1; break;
        case 4: r = f, g = 0, b = 1; break;
        case 5: r = 1, g = 0, b = f; break;
    }
    return [r * 255, g * 255, b * 255];
}

// Begin drawing zoom box
function mouseDown(e) {
  zoombox.startX = e.pageX - this.offsetLeft;
  zoombox.startY = e.pageY - this.offsetTop;
  dragging = true;
}
// Redraw with new zoom co-ordinates
function mouseUp() {
  dragging = false;
  xoffset = xoffset + width / (zoom_canvas.width / zoombox.startX);
  yoffset = yoffset + height / (zoom_canvas.height / zoombox.startY);
  width = width / (zoom_canvas.width / zoombox.w);
  height = height / (zoom_canvas.height / zoombox.h);
  ztx.clearRect(0,0,zoom_canvas.width,zoom_canvas.height); // Remove the old zoom box
  drawFractal(width,height,xoffset,yoffset); // Draw with new zoom level
  reset_button.style.display = 'block';
  zoom_label.style.display = 'none';
}
// Draw the zoom box if mouse is down
function mouseMove(e) {
  if (dragging) {
    zoombox.w = (e.pageX - this.offsetLeft) - zoombox.startX;
    zoombox.h = zoombox.w / (width/height); // force current ratio
    ztx.clearRect(0,0,zoom_canvas.width,zoom_canvas.height);
    ztx.fillRect(zoombox.startX,zoombox.startY,zoombox.w,zoombox.h);
    ztx.strokeRect(zoombox.startX,zoombox.startY,zoombox.w,zoombox.h);
  }
}

// Set up listening for zoom box
zoom_canvas.addEventListener('mousedown', mouseDown, false);
zoom_canvas.addEventListener('mouseup', mouseUp, false);
zoom_canvas.addEventListener('mousemove', mouseMove, false);

function drawFractal(width,height,xoffset,yoffset) {
  // Draw the fractal
  for (px=0; px < canvasWidth; px++) {
    for (py=0; py < canvasHeight; py++) {
      
      var x0 = (px / canvasWidth) * width + (xoffset - 2.5);
      var y0 = (py / canvasHeight) * height + (yoffset - 1);
      var x = 0;
      var y = 0;
      var iter = 0;
      var max_iter = 128;
      
      while ((x*x + y*y) < 4 && iter < max_iter) {
        var x_temp = x*x - y*y + x0;
        y = 2*x*y + y0;
        x = x_temp;
        iter++;
      }
      
      var rgb = hToRgb(iter/max_iter);
      drawPixel(px, py, rgb[0], rgb[1], rgb[2], 255);
    } 
  }
  ctx.putImageData (canvasData, 0, 0);
}

function resetFractal(reset_button) {
    initialiseCoordinates();
    drawFractal(width,height,xoffset,yoffset);
    reset_button.style.display = 'none';
    zoom_label.style.display = 'block';
}
reset_button.addEventListener('click', function(){ resetFractal(this); }, false);
resetFractal(reset_button);