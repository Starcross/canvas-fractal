/** Fractal Generator - HTML5 Canvas and Javascript Demo
 Alex Luton - aluton@gmail.com
 Requires two overlapping divs with ids 'fractal' and a semi transparent 'zoom_overlay',
 Correct aspect ratio is 7:4
 */

class Fractal{

    constructor(pixelWidth, pixelHeight) {
        this.pixelWidth = pixelWidth
        this.pixelHeight = pixelHeight
        this.initCoordinates()
    }

    /* Reset fractal coordinates */
    initCoordinates() {
        this.width = 3.5
        this.height = 2
        this.xoffset = 0
        this.yoffset = 0
    }

    /* Return an rgb triplet array of the fractal colour for a given pixel offset */
    getPixel(px, py, maxIter) {
        const x0 = (px / this.pixelWidth) * this.width + (this.xoffset - 2.5)
        const y0 = (py / this.pixelHeight) * this.height + (this.yoffset - 1)
        let x = 0
        let y = 0
        let iter = 0

        while ((x * x + y * y) < 4 && iter < maxIter) {
            const x_temp = x * x - y * y + x0
            y = 2 * x * y + y0
            x = x_temp
            iter++
        }

        return Fractal.hueToRgb(iter / maxIter)
    }

    /* Convert hue value to rgb */
    static hueToRgb(h) {
        if (h === 1)
            return [0, 0, 0]
        let r=0, g=0, b=0
        const i = Math.floor(h * 6)
        const f = h * 6 - i
        switch (i % 6) {
            case 0:
                r = 1, g = f, b = 0
                break
            case 1:
                r = f, g = 1, b = 0
                break
            case 2:
                r = 0, g = 1, b = f
                break
            case 3:
                r = 0, g = f, b = 1
                break
            case 4:
                r = f, g = 0, b = 1
                break
            case 5:
                r = 1, g = 0, b = f
                break
        }
        return [r * 255, g * 255, b * 255]
    }

}

class FractalCanvas {

    constructor() {
        const canvas = document.getElementById("fractal")
        this.zoom_canvas = document.getElementById("zoom_overlay")
        this.ctx = canvas.getContext("2d")
        this.canvasData = this.ctx.getImageData(0, 0, canvas.width, canvas.height)
        this.ztx = this.zoom_canvas.getContext("2d")
        this.zoombox = {}
        this.dragging = false

        this.ztx.fillStyle = "#fff" // fill color
        this.reset_button = document.getElementById("reset")
        this.zoom_label = document.getElementById("zoom_label")

        // Set up listening for zoom box
        this.zoom_canvas.addEventListener('mousedown', (event) => this.mouseDown(event), false)
        this.zoom_canvas.addEventListener('mouseup', (event) => this.mouseUp(event), false)
        this.zoom_canvas.addEventListener('mousemove', (event) => this.mouseMove(event), false)

        this.reset_button.addEventListener('click', (event) => this.resetFractal(event), false)

        this.fractal = new Fractal(canvas.width, canvas.height)
        this.resetFractal()
    }

    /* Draw single pixel to the canvas imageData */
    drawPixel(x, y, r, g, b, a) {
        const index = (x + y * this.fractal.pixelWidth) * 4

        this.canvasData.data[index] = r
        this.canvasData.data[index + 1] = g
        this.canvasData.data[index + 2] = b
        this.canvasData.data[index + 3] = a
    }

    /* Start drag to zoom box */
    mouseDown(e) {
        this.zoombox.startX = e.offsetX
        this.zoombox.startY = e.offsetY
        this.dragging = true
    }

    /* Draw the zoom box if mouse is down */
    mouseMove(e) {
        if (this.dragging) {
            this.zoombox.w = e.offsetX - this.zoombox.startX
            if (this.zoombox.w < 0) return // Only support drag to right/down for now
            this.zoombox.h = this.zoombox.w / (this.fractal.width / this.fractal.height) // force current ratio
            this.ztx.clearRect(0, 0, this.zoom_canvas.width, this.zoom_canvas.height)
            this.ztx.fillRect(this.zoombox.startX, this.zoombox.startY, this.zoombox.w, this.zoombox.h)
            this.ztx.strokeRect(this.zoombox.startX, this.zoombox.startY, this.zoombox.w, this.zoombox.h)
        }
    }

    /* Redraw with new zoom co-ordinates */
    mouseUp() {
        if (!this.zoombox.h) return // Ignore single click with no drag

        const fractal = this.fractal
        fractal.xoffset = fractal.xoffset + fractal.width / (this.zoom_canvas.width / this.zoombox.startX)
        fractal.yoffset = fractal.yoffset + fractal.height / (this.zoom_canvas.height / this.zoombox.startY)
        fractal.width = fractal.width / (this.zoom_canvas.width / this.zoombox.w)
        fractal.height = fractal.height / (this.zoom_canvas.height / this.zoombox.h)

        this.dragging = false
        this.ztx.clearRect(0, 0, this.zoom_canvas.width, this.zoom_canvas.height) // Remove the old zoom box
        this.drawFractal() // Draw with new zoom level
        this.reset_button.style.display = 'block'
        this.zoom_label.style.display = 'none'
    }

    /* Draw the fractal to the canvas */
    drawFractal() {
        // Find a reasonable max iter based on zoom level, starting around 128
        const maxIter = Math.floor(90 * (1 / (this.fractal.height / 4)) ** 0.5)

        // Perform the fractal calculations
        for (let px = 0; px < this.fractal.pixelWidth; px++) {
            for (let py = 0; py < this.fractal.pixelHeight; py++) {
                const rgb = this.fractal.getPixel(px, py, maxIter)
                this.drawPixel(px, py, rgb[0], rgb[1], rgb[2], 255)
            }
        }
        this.ctx.putImageData(this.canvasData, 0, 0)
    }

    /* Reset and draw fractal */
    resetFractal() {
        this.fractal.initCoordinates()
        this.drawFractal()
        this.reset_button.style.display = 'none'
        this.zoom_label.style.display = 'block'
    }

}

const fractalCanvas = new FractalCanvas()