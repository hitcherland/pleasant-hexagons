
function hexToPixel(size, q, j, r) {
    return [size * 1.5 * q, size * j, size * (factor * q + 2 * factor * r)];
}

function toIsometricPoint(x, y, z) {
    const X = (x - z) / Math.sqrt(2) + center[0];
    const Y = (x + 2 * y + z) / Math.sqrt(6) + center[1];
    return [X, Y];
}


const audioContext = new AudioContext()

class HexBlock {
    constructor(q, r, s, size, angle, hue) {
        this.q = q;
        this.r = r;
        this.s = s;
        this.height = size;
        this.offsetAngle = angle;
        this.updateSpeed = 7e-5;
        this.offsetScale = 0.2;
        this.offsetHeight = this.offsetScale * size * Math.sin(Math.PI * 2 * this.offsetAngle);
        this.hue = hue;
        this.size = size;
        this.doBeep = false;
        this.glow = false;

        this.matrix1 = new DOMMatrix([1, 0, 0, 1, Math.random(), this.offsetHeight]);
        this.matrix2 = new DOMMatrix([1, 0.2, 0.2, 1, 0, this.offsetHeight]);


        var o = audioContext.createOscillator()
        this.g = audioContext.createGain()
        o.connect(this.g)
        this.g.connect(audioContext.destination)
        o.start(0)
        const freqs = [440, 493.9, 554.4, 587.3, 659.3, 740, 830]
        o.frequency.value = freqs[Math.floor(freqs.length * Math.random())]
        this.g.gain.setValueAtTime(0, audioContext.currentTime);
    }

    beepInit() {
        
    }

    beep() {
        this.g.gain.setValueAtTime(0.05, audioContext.currentTime);
        this.g.gain.exponentialRampToValueAtTime(
            0.00001, audioContext.currentTime + 2.0
        )
    }

    pixelPosition() {
        const isoPoints = toIsometricPoint(this.q, this.r, this.s);
        return hexToPixel(this.size, ...isoPoints);
    }

    compare(block) {
        const A = this.pixelPosition();
        const B = block.pixelPosition();
        
        if(A[1] != B[1]) {
            return A[1] - B[1];
        } else {
            return A[0] - B[0]
        }
    }

    render(ctx) {
        ctx.save();
        const [x, y, z] = hexToPixel(this.size / 2, this.q, this.r, this.s);

        const height = this.height + this.offsetHeight;

        const A = -2 * Math.PI / 6;
        const [X, Y] = toIsometricPoint(x + 0.5 * this.size * Math.sin(A + Math.PI / 6), y, z + 0.5 * this.size * Math.cos(A + Math.PI / 6));

        ctx.beginPath();
        ctx.moveTo(X, Y);

        for(let i=6; i>=3; i--) {
            const angle = A + (i + 0.5) * Math.PI / 3;
            const [X, Y] = toIsometricPoint(x + 0.5 * this.size * Math.sin(angle), y - height, z + 0.5 * this.size * Math.cos(angle));
            ctx.lineTo(X, Y);
        }

        for(let i=3; i>=0; i--) {
            const angle = A + (i + 0.5)* Math.PI / 3;
            const [X, Y] = toIsometricPoint(x + 0.5 * this.size * Math.sin(angle), y, z + 0.5 * this.size * Math.cos(angle));
            ctx.lineTo(X, Y);
        }
        
        ctx.closePath();
        
        ctx.globalAlpha = 1;
        if(this.glow > 0) {
            ctx.fillStyle = `hsl(${this.hue}deg ${this.glow}% ${this.glow / 2}%)`;
            this.glow -= 1;
        }
        else {
            ctx.fillStyle = `hsl(${this.hue}deg 00% 00%)`;
        }
        ctx.fill();
        ctx.stroke();

        ctx.globalAlpha = 0.08;
        bg.setTransform(this.matrix1);
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.moveTo(X, Y);

        for(let i=0; i<=6; i++) {
            const angle = A + (i + 0.5) * Math.PI / 3;
            const [X, Y] = toIsometricPoint(x + 0.5 * this.size * Math.sin(angle), y - height, z + 0.5 * this.size * Math.cos(angle));
            ctx.lineTo(X, Y);
        }

        ctx.fillStyle = `hsl(${this.hue}deg 80% 40%)`;
        if(this.glow > 0) {
            ctx.fillStyle = `hsl(${this.hue}deg ${this.glow}% ${this.glow / 2}%)`;
            this.glow -= 1;
        }
        else {
            ctx.fillStyle = `hsl(${this.hue}deg 00% 00%)`;
        }
        ctx.fill();
        ctx.stroke();

        ctx.globalAlpha = 0.12;
        bg.setTransform(this.matrix2);
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    update(timestamp) {
        const v1 = Math.sin(2 * Math.PI * (this.offsetAngle + this.updateSpeed * timestamp));
        const v2 = Math.cos(2 * Math.PI * (this.offsetAngle + this.updateSpeed * timestamp)) * this.offsetScale;
        this.offsetHeight = this.offsetScale * this.size * v1;
        this.matrix1.translateSelf(0, -v2, 0);
        this.matrix2.translateSelf(v2, -2 * v2, 0);

        if(blocks[0] !== this) {
            if(v1 > 0 && this.doBeep) {
                this.beep();
                this.glow = 100;
                this.doBeep = false;
            }
            
            if(v1 < 0) {
                this.doBeep = true;
            }
        }
    }
}

function animate(timestamp) {
    ctx.clearRect(0, 0, options.width, options.height);
    
    blocks.forEach((block, i) => {
        block.render(ctx);
        block.update(timestamp);
    });

    requestAnimationFrame(animate);
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = document.createElement('img');
const win = Math.min(window.innerHeight, window.innerWidth);
const factor = Math.sqrt(3) / 2;
const options = {
    width: win,
    height: win,
};
const width = options.width;
const height = options.height;
const center = [options.width / 2, options.height / 2];
const blocks = [];
let bg;

ctx.lineWidth = 2;
img.onload = function() {
    bg = ctx.createPattern(img, "repeat")
    document.getElementById('start').onclick = function() {



        
        canvas.width = width;
        canvas.height = height;
        
        
        
        
        const size = options.width / 10;
        const R = 5;
        for(let s=-R; s<=R; s++) {
            for(let q=Math.max(-R, -s-R); q<=Math.min(R, -s+R); q++) {
                blocks.push(new HexBlock(q, 0, s, size, Math.random(), 360 * Math.random()))
            }
        }
        
        blocks.sort((a, b) => {
            return a.compare(b);
        });
        animate(0);
        document.getElementById('start').style.visibility = "hidden";
    }
}


img.src = 'bg.png';
