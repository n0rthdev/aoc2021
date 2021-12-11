import { isMinusToken, ModifierSyntaxKind } from "typescript";

function fun121101() {

    let input = getInput1211().split('\n').map(line => line.trim().split('').map(digit => parseInt(digit)));
    
    let flashing = new Array<number[]>()
    let flashCount = 0;

    for(let step = 0; step < 100; step++) {
        for(let i = 0; i < input.length; i++)  {
            for(let j = 0; j < input[i].length; j++) {
                input[i][j] = input[i][j] >= 10 ? 1 : (input[i][j]+1);
                if(input[i][j] == 10) {
                    flashing.push([i,j])
                }
            }
        }

        while(flashing.length > 0) {
            let flash = flashing.shift() || []
            flashOctopus(input, flashing, flash[0], flash[1])
            flashCount++
        }
    }

    console.log("flashCount " + flashCount)
}

function fun121102() {

    let input = getInput1211().split('\n').map(line => line.trim().split('').map(digit => parseInt(digit)));
    
    let flashing = new Array<number[]>()

    for(let step = 0; true; step++) {
        for(let i = 0; i < input.length; i++) {
            for(let j = 0; j < input[i].length; j++) {
                
                input[i][j] = input[i][j] >= 10 ? 1 : (input[i][j]+1);
                if(input[i][j] == 10) {
                    flashing.push([i,j])
                }
            }
        }
        let flashCount = 0;
        while(flashing.length > 0) {
            let flash = flashing.shift() || []
            flashOctopus(input, flashing, flash[0], flash[1])
            flashCount++
        }
        if(flashCount == input.length * input[0].length) {
            console.log("flashCount " + flashCount + " at " + (step+1))
            break;
        }
    }
    
}

function flashOctopus(input : number[][], flashing : number[][], x : number, y : number)
{
    for(let i = Math.max(0,x-1); i < Math.min(x+2,input.length);i++) {
        for(let j = Math.max(0,y-1); j < Math.min(y+2,input.length);j++) {
            input[i][j]++
            if(input[i][j] == 10) {
                flashing.push([i,j])
            }
        }
    }
}

//fun121101()
fun121102()

function getTest1211(): string {
    return `5483143223
    2745854711
    5264556173
    6141336146
    6357385478
    4167524645
    2176841721
    6882881134
    4846848554
    5283751526`;
}


function getInput1211(): string {
    return `1326253315
    3427728113
    5751612542
    6543868322
    4422526221
    2234325647
    1773174887
    7281321674
    6562513118
    4824541522`;
}