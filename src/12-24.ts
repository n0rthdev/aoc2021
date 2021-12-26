import { collapseTextChangeRangesAcrossMultipleVersions, getMutableClone, isConstructorDeclaration, isLiteralTypeNode, isMinusToken, ModifierSyntaxKind, textSpanIntersectsWithTextSpan } from "typescript";


//function recursion()
//{

//}


function fun1224() {
    let lines = getInput1224().split("\n").map(it => it.trim().split(" "))

    let register: number[] = [0, 0, 0, 0]
    let endLastDigit = 0
    //let tracing = new Array<Map<number,number[][]>>()
    let map = new Map<number, number>()
    let ip = 0

    map.set(0, 0)

    for (let digit = 0; digit < 14; digit++) {
        
        //let out2in = new Map<number, number[][]>()
        let newMap = new Map<number, number>()
      //  tracing.push(out2in)
        for (let [key, path] of map) {
           
            for (let w = 1; w <= 9; w++) {
                let newInput = false
                ip = endLastDigit
                register = [0, 0, 0, key]
                for (; ip < lines.length ; ip++) {
                    let command = lines[ip][0]
                    let p0 = lines[ip][1].charCodeAt(0) - "w".charCodeAt(0)
                    if (command == "inp") {
                        if(!newInput) {
                            register[p0] = w
                            newInput = true
                        }
                        else {
                            register[0] = 0
                            register[1] = 0
                            register[2] = 0
                            break;
                        }
                    }
                    //else if (newInput && p0 == 0) {
                        //register[p0] = w
                        //break;
                    //}
                    else {
                        let readFromIdx = lines[ip][2].charCodeAt(0) - "w".charCodeAt(0)
                        let p1 = (0 <= readFromIdx && readFromIdx < 4) ? register[readFromIdx] : parseInt(lines[ip][2])

                        switch (command) {
                            case "add":
                                register[p0] = register[p0] + p1
                                break;

                            case "mul":
                                register[p0] = register[p0] * p1
                                break;

                            case "div":
                                register[p0] = parseInt((register[p0] / p1).toString())
                                break;

                            case "mod":
                                register[p0] = register[p0] % p1
                                break;

                            case "eql":
                                register[p0] = (register[p0] == p1) ? 1 : 0
                                break;
                        }
                    }
                }
                let a = newMap.get(register[3])
                if(a)
                {
                    newMap.set(register[3], Math.min(a,path*10 + w))
                }
                else {
                    newMap.set(register[3], path*10 + w)
                }
                
            }
        }
        console.log("map size: " + newMap.size)
        endLastDigit = ip-1
        map = newMap
    }
    console.log("end " + map.get(0))
}



fun1224()

function getTest1224(): string {
    return `inp w
    add z w
    mod z 2
    div w 2
    add y w
    mod y 2
    div w 2
    add x w
    mod x 2
    div w 2
    mod w 2`
}

function getInput1224(): string {
    return `inp w
    mul x 0
    add x z
    mod x 26
    div z 1
    add x 10
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 12
    mul y x
    add z y
    inp w
    mul x 0
    add x z
    mod x 26
    div z 1
    add x 10
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 10
    mul y x
    add z y
    inp w
    mul x 0
    add x z
    mod x 26
    div z 1
    add x 12
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 8
    mul y x
    add z y
    inp w
    mul x 0
    add x z
    mod x 26
    div z 1
    add x 11
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 4
    mul y x
    add z y
    inp w
    mul x 0
    add x z
    mod x 26
    div z 26
    add x 0
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 3
    mul y x
    add z y
    inp w
    mul x 0
    add x z
    mod x 26
    div z 1
    add x 15
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 10
    mul y x
    add z y
    inp w
    mul x 0
    add x z
    mod x 26
    div z 1
    add x 13
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 6
    mul y x
    add z y
    inp w
    mul x 0
    add x z
    mod x 26
    div z 26
    add x -12
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 13
    mul y x
    add z y
    inp w
    mul x 0
    add x z
    mod x 26
    div z 26
    add x -15
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 8
    mul y x
    add z y
    inp w
    mul x 0
    add x z
    mod x 26
    div z 26
    add x -15
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 1
    mul y x
    add z y
    inp w
    mul x 0
    add x z
    mod x 26
    div z 26
    add x -4
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 7
    mul y x
    add z y
    inp w
    mul x 0
    add x z
    mod x 26
    div z 1
    add x 10
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 6
    mul y x
    add z y
    inp w
    mul x 0
    add x z
    mod x 26
    div z 26
    add x -5
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 9
    mul y x
    add z y
    inp w
    mul x 0
    add x z
    mod x 26
    div z 26
    add x -12
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 9
    mul y x
    add z y`;
}