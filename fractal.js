/** Fractal Generator - HTML5 Canvas and Javascript Demo
 Alex Luton - aluton@gmail.com
 Requires two overlapping divs with ids 'fractal' and a semi transparent 'zoom_overlay',
 Correct aspect ratio is 7:4
 */

class Fractal {

    constructor() {
        const canvas = document.getElementById("fractal")
        this.zoom_canvas = document.getElementById("zoom_overlay")
        this.canvasWidth = canvas.width, this.canvasHeight = canvas.height
        this.ctx = canvas.getContext("2d")
        this.canvasData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight)
        this.ztx = this.zoom_canvas.getContext("2d")
        this.zoombox = {}
        this.dragging = false
        this.width = 0, this.height = 0
        this.xoffset = 0, this.yoffset = 0
        this.ztx.fillStyle = "#fff" // fill color
        this.reset_button = document.getElementById("reset")
        this.zoom_label = document.getElementById("zoom_label")

        // Set up listening for zoom box
        this.zoom_canvas.addEventListener('mousedown', (event) => this.mouseDown(event), false)
        this.zoom_canvas.addEventListener('mouseup', (event) => this.mouseUp(event), false)
        this.zoom_canvas.addEventListener('mousemove', (event) => this.mouseMove(event), false)

        this.reset_button.addEventListener('click', (event) => this.resetFractal(event), false)
        this.resetFractal()
    }

    /* Reset fractal coordinates */
    initCoordinates() {
        this.width = 3.5
        this.height = 2
        this.xoffset = 0
        this.yoffset = 0
    }

    /* Draw single pixel to the imageData */
    drawPixel(x, y, r, g, b, a) {
        const index = (x + y * this.canvasWidth) * 4

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
            this.zoombox.h = this.zoombox.w / (this.width / this.height) // force current ratio
            this.ztx.clearRect(0, 0, this.zoom_canvas.width, this.zoom_canvas.height)
            this.ztx.fillRect(this.zoombox.startX, this.zoombox.startY, this.zoombox.w, this.zoombox.h)
            this.ztx.strokeRect(this.zoombox.startX, this.zoombox.startY, this.zoombox.w, this.zoombox.h)
        }
    }

    /* Redraw with new zoom co-ordinates */
    mouseUp() {
        if (!this.zoombox.h) return // Ignore single click with no drag

        this.xoffset = this.xoffset + this.width / (this.zoom_canvas.width / this.zoombox.startX)
        this.yoffset = this.yoffset + this.height / (this.zoom_canvas.height / this.zoombox.startY)
        this.width = this.width / (this.zoom_canvas.width / this.zoombox.w)
        this.height = this.height / (this.zoom_canvas.height / this.zoombox.h)

        this.dragging = false
        this.ztx.clearRect(0, 0, this.zoom_canvas.width, this.zoom_canvas.height) // Remove the old zoom box
        this.drawFractal() // Draw with new zoom level
        this.reset_button.style.display = 'block'
        this.zoom_label.style.display = 'none'
    }

    /* Draw the fractal to the canvas */
    drawFractal() {
        // Find a reasonable max iter based on zoom level, starting around 128
        const max_iter = Math.floor(90 * (1 / (this.height / 4)) ** 0.5)

        // Perform the fractal calculations
        for (let px = 0; px < this.canvasWidth; px++) {
            for (let py = 0; py < this.canvasHeight; py++) {

                const x0 = (px / this.canvasWidth) * this.width + (this.xoffset - 2.5)
                const y0 = (py / this.canvasHeight) * this.height + (this.yoffset - 1)
                let x = 0
                let y = 0
                let iter = 0

                while ((x * x + y * y) < 4 && iter < max_iter) {
                    const x_temp = x * x - y * y + x0
                    y = 2 * x * y + y0
                    x = x_temp
                    iter++
                }

                const rgb = Fractal.hueToRgb(iter / max_iter)
                this.drawPixel(px, py, rgb[0], rgb[1], rgb[2], 255)
            }
        }
        this.ctx.putImageData(this.canvasData, 0, 0)
    }

    /* Reset and draw fractal */
    resetFractal() {
        this.initCoordinates()
        this.drawFractal(this.width, this.height, this.xoffset, this.yoffset)
        this.reset_button.style.display = 'none'
        this.zoom_label.style.display = 'block'
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

const fractal = new Fractal()