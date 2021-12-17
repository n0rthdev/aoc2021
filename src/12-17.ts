import { getMutableClone, isMinusToken, ModifierSyntaxKind } from "typescript";


function fun121701() {
    let minY = parseInt(getInput1217().split('y=')[1].split('..')[0])
    let peak = gauss(minY)
    console.log("peak " + peak)
}
function fun121701long() {
    // general note if the target contains a y = 0, the max height would be infinite,
    // because every throw passes its start during falling.
    let y = getInput1217().split('y=')[1].split('..').map(it => parseInt(it))
    let vYinit = getVyMaxInit(y)
    let peak = gauss(vYinit)
    console.log("peak " + peak)
}
function getVyMaxInit(y: number[]): number {
    let yStart = 0
    let yMaxStartToTargetDistance = getYMaxStartToTargetDistance(y, yStart)
    // we determine if the shot hitting the target is right before or right after passing the ystart during falling.
    //both y values must be above or below (otherwise see top comment) so checking one is sufficent.
    return (y[0] > 0) ? yMaxStartToTargetDistance : yMaxStartToTargetDistance - 1
}
function getYMaxStartToTargetDistance(y: number[], yStart: number): number {
    return Math.max(Math.abs(y[0] - yStart), Math.abs(y[1] - yStart))
}
function gauss(n: number): number {
    return n * (n + 1) / 2
}

function fun121702() {

    let input = getInput1217()
        //let input = getInput1217()
        .substring('target area: '.length).split(', ').map(it => it.split('=')[1].split('..').map(it => parseInt(it)))

    let minVx = Math.ceil(invertedGauss(input[0][0]))
    let maxVx = input[0][1]

    let minVy = Math.min(...input[1])
    let maxVy = getVyMaxInit(input[1])

    let hits = new Map<String, number>()

    let tLimit = 2 * maxVy + 1  // maxVy [m/s] / 1 m/s^2 = t_peak [s] ... times 2 for up and down to zero, plus 1 for last fall to target

    for (let t = 1; t < tLimit; t++) {
        let vxHit: number[] = []
        for (let vx = minVx; vx <= maxVx; vx++) {
            let x = Xat(vx, t)
            if (x > input[0][1]) {
                break;
            }
            else if (x >= input[0][0]) {
                vxHit.push(vx)
            }
        }
        let vyHit: number[] = []
        for (let vy = minVy; vy <= maxVy; vy++) {
            let y = Yat(vy, t)
            if (input[1][0] <= y && y <= input[1][1]) {
                vyHit.push(vy)
            }
        }
        vxHit.forEach(xHit => vyHit.forEach(yHit => hits.set([xHit, yHit].toString(), 0)))
    }
    console.log("solutions count " + hits.size)
}

function invertedGauss(sum: number): number {
    return 1 / 2 * (Math.sqrt(8 * sum + 1) - 1)
}

fun121702()

function Xat(vXinit: number, t: number): number {
    return gauss(vXinit) - gauss(Math.max(0, vXinit - t))
}
function Yat(vYinit: number, t: number) {
    return vYinit * t - gauss(t - 1)
}

function getTest1217(): string {
    return `target area: x=20..30, y=-10..-5`;
}

function getInput1217(): string {
    return `target area: x=81..129, y=-150..-108`;
}
