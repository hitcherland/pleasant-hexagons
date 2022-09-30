const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const options = {
    width: 800,
    height: 800,
}
const width = options.width;
const height = options.height;
const center = [options.width / 2, options.height / 2];

canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext('2d');

ctx.fillStyle = 'rgb(0, 255, 0)'
ctx.fillRect(0, 0, canvas.width, canvas.height);

function toIsometricPoint(x, y, z) {
    const X = (x - z) / Math.sqrt(2) + center[0];
    const Y = (x + 2 * y + z) / Math.sqrt(6) + center[1];
    //return [x + center[0], z + center[1]]
    return [X, Y];
}


function drawRegularPolygonPath(n, x, y, z, r) {
    const angle = Math.PI / n;
    const [X, Y] = toIsometricPoint(x + 0.5 * r * Math.sin(angle), y, z + 0.5 * r * Math.cos(angle));
    ctx.moveTo(X, Y);
    for(let i=1; i<=n; i++) {
        const angle = i * Math.PI * 2 / n + Math.PI / n;
        const [X, Y] = toIsometricPoint(x + 0.5 * r * Math.sin(angle), y, z + 0.5 * r * Math.cos(angle));
        ctx.lineTo(X, Y);
    }
}

const factor = Math.sqrt(3) / 2;
function hexToPixel(size, q, j, r) {
    return [size * 1.5 * q, size * j, size * (factor * q + 2 * factor * r)];
}

console.warn([[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]].map(x => toIsometricPoint(...x)));


ctx.lineWidth = 2;
const size = options.width / 4;

//ctx.translate(0.5, 0.5);
[[0,0,0], [1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1], [1, 0, -1], [-1, 0, 1], [0, -0.5, 0]].forEach(([q, j ,r]) => {
    let [x, y, z] = hexToPixel(size / 2, q, j, r);    
    ctx.fillStyle = `hsl(${360 * Math.random()}deg 80% 50%)`;
    ctx.beginPath();
    drawRegularPolygonPath(6, x, y, z, size);
    ctx.fill();
    ctx.stroke();
})

