import { getMutableClone, isLiteralTypeNode, isMinusToken, ModifierSyntaxKind } from "typescript";


function fun121801() {
    let input = getInput1217().split("\n").map(it => Node.parse(it.trim()))

    // check("[[1,2],[[3,4],5]]", 143)
    // check("[[[[0,7],4],[[7,8],[6,0]]],[8,1]]", 1384)
    // check("[[[[1,1],[2,2]],[3,3]],[4,4]]", 445)
    // check("[[[[3,0],[5,3]],[4,4]],[5,5]]", 791)
    // check("[[[[5,0],[7,4]],[5,5]],[6,6]]", 1137)
    // check("[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]", 3488)

    // checkR("[[[[[9,8],1],2],3],4]", "[[[[0,9],2],3],4]")
    // checkR("[7,[6,[5,[4,[3,2]]]]]", "[7,[6,[5,[7,0]]]]")
    // checkR("[[6,[5,[4,[3,2]]]],1]", "[[6,[5,[7,0]]],3]")
    // checkR("[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]", "[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]")
    // checkR("[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]", "[[3,[2,[8,0]]],[9,[5,[7,0]]]]")

    let result = input.reduce((sum, current) => Node.add(sum, current), Node.zero());

    console.log("magnitude " + result.magnitude())
}

function check(input: string, magitude: number) {
    let t = Node.parse(input)
    t.reduce()
    console.log("input: " + input + " has " + t.magnitude() + " should have " + magitude)
}

function checkR(input: string, result: string) {
    let t = Node.parse(input)
    t.reduce()
    console.log("input: " + input + " reduces to " + t.toString() + " " + (t.toString() == result))
}

function fun121802() {
    let input = getInput1217().split("\n").map(it => it.trim())

    let max = 0;

    for (let i = 0; i < input.length; i++) {
        for (let j = 0; j < input.length; j++) {
            if (i != j) {
                let node = Node.add(Node.parse(input[i]), Node.parse(input[j]))
                node.reduce()
                let t = node.magnitude()
                if (t > max) {
                    max = t;
                    console.log("max " + node.toString())
                }
            }
        }
    }

    console.log("max " + max)
}

class Node {
    left: Node | undefined
    right: Node | undefined
    value: number | undefined

    static add(left: Node, right: Node): Node {
        if (right.isZero())
            return left;
        if (left.isZero())
            return right;

        console.log("   " + left.toString())
        console.log("+  " + right.toString())
        let t = this.fromNeighbors(left, right);
        t.reduce();
        console.log("=  " + t.toString())
        return t;
    }

    static fromNeighbors(left: Node, right: Node): Node {
        let t = new Node();
        t.left = left
        t.right = right
        return t;
    }

    static fromNumber(value: number): Node {
        let t = new Node();
        t.value = value;
        return t;
    }

    static zero(): Node {
        return new Node();
    }

    static parse(input: string, i: number[] = [0]): Node {
        if (input[i[0]] == '[') {
            i[0]++
            let left = Node.parse(input, i)
            if (input[i[0]] != ',') {
                console.log("error missing ,")
            }
            i[0]++
            let right = Node.parse(input, i)
            if (input[i[0]] != ']') {
                console.log("error missing ]")
            }
            i[0]++
            return Node.fromNeighbors(left, right)
        }
        else {
            let num = ""
            while ("0" <= input.charAt(i[0]) && input.charAt(i[0]) <= "9") {
                num += input[i[0]]
                i[0]++
            }
            return Node.fromNumber(parseInt(num))
        }
    }

    reduce() {
        let run = true
        while (run) {
            run = false;
            while (this.explodeStep(0).length > 0) {
                //console.log("*       " + this.toString())
            }
            if (this.splitStep()) {
                //console.log("*       " + this.toString())
                run = true;
            }
        }
    }

    explodeStep(depth: number): number[] {
        if (this.isPair()) {
            if (depth == 4) {
                return this.explode()
            }

            let result = this.left!.explodeStep(depth + 1)
            if (result.length != 0) {
                if (result[1] >= 0) {
                    this.right!.applyLeft(result[1])
                    result[1] = -1
                }
            }
            else {
                result = this.right!.explodeStep(depth + 1)
                if (result.length != 0 && result[0] >= 0) {
                    this.left!.applyRight(result[0])
                    result[0] = -1
                }
            }
            return result;
        }
        return []
    }

    splitStep(): boolean {
        if (this.isPair()) {
            return this.left!.splitStep() || this.right!.splitStep()
        }
        else if (this.canSplit()) {
            this.split()
            return true
        }
        return false
    }

    applyLeft(value: number) {
        if (this.isPair()) {
            this.left!.applyLeft(value)
        }
        else {
            //console.log("      apply left " + this.value + " with " + value)
            this.value! += value
        }
    }

    applyRight(value: number) {
        if (this.isPair()) {
            this.right!.applyRight(value)
        }
        else {
            //console.log("      apply right " + this.value + " with " + value)
            this.value! += value
        }
    }

    explode(): number[] {
        let ret = [this.left!.value!, this.right!.value!]
        //console.log("      exploding " + this.toString() + " return " + ret.toString())
        this.left = undefined
        this.right = undefined
        this.value = 0
        return ret;
    }
    split() {
        let str = this.toString()
        this.left = Node.fromNumber(Math.floor(this.value! / 2))
        this.right = Node.fromNumber(Math.ceil(this.value! / 2))
        this.value = undefined
        //console.log("      splitting " + str + " to " + this.toString())
    }
    magnitude(): number {
        if (this.isPair()) {
            return 3 * this.left!.magnitude() + 2 * this.right!.magnitude()
        }
        else {
            return this.value!;
        }
    }
    canSplit() {
        return this.value! >= 10
    }
    isPair(): boolean {
        return this.value == undefined
    }
    isZero(): boolean {
        return this.value == undefined && this.left == undefined && this.right == undefined
    }
    toString(): string {
        if (this.isPair()) {
            return "[" + this.left!.toString() + "," + this.right!.toString() + "]"
        }
        else {
            return this.value!.toString()
        }
    }
}

//fun121801()
fun121802()

function getMiniExample1217(): string {
    return `[1,1]
    [2,2]
    [3,3]
    [4,4]
    [5,5]
    [6,6]`;
}

function getStepExample1217(): string {
    return `[[[[4,3],4],4],[7,[[8,4],9]]]
    [1,1]`;
}

function getLargeExample1217(): string {
    return `[[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]
    [7,[[[3,7],[4,3]],[[6,3],[8,8]]]]
    [[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]
    [[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]]
    [7,[5,[[3,8],[1,4]]]]
    [[2,[2,2]],[8,[8,1]]]
    [2,9]
    [1,[[[9,3],9],[[9,0],[0,7]]]]
    [[[5,[7,4]],7],1]
    [[[[4,2],2],6],[8,7]]`;
}

function getTest1217(): string {
    return `[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]
    [[[5,[2,8]],4],[5,[[9,9],0]]]
    [6,[[[6,2],[5,6]],[[7,6],[4,7]]]]
    [[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]
    [[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]
    [[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]
    [[[[5,4],[7,7]],8],[[8,3],8]]
    [[9,3],[[9,9],[6,[4,9]]]]
    [[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]
    [[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]`;
}

function getInput1217(): string {
    return `[[1,8],[[8,7],[3,[1,9]]]]
    [[[[8,1],7],[[9,9],[4,8]]],[[7,[7,2]],[2,[1,6]]]]
    [[[[0,8],0],[0,[7,2]]],[[[3,2],8],[[5,6],3]]]
    [[[7,[7,9]],8],[[[7,0],[7,7]],[[8,2],2]]]
    [[5,7],[[0,[1,0]],[2,[4,6]]]]
    [[[[7,7],[2,6]],9],[[1,3],[[1,7],7]]]
    [[[[5,7],[8,6]],[1,[6,4]]],[7,[[2,8],[9,2]]]]
    [[[3,6],[[7,7],[1,0]]],[[1,[9,3]],[[0,9],[9,5]]]]
    [[[6,[6,2]],[[3,4],[5,1]]],[[3,[5,6]],[8,[4,8]]]]
    [[[[4,9],6],4],[3,[[1,6],[4,3]]]]
    [[[[4,9],[6,0]],2],[[0,9],[[8,4],[3,5]]]]
    [[5,[8,[1,1]]],[7,[[3,2],2]]]
    [1,2]
    [[[1,9],[[7,4],4]],[[7,[0,7]],9]]
    [[[[5,9],0],[3,8]],[[[4,9],[5,8]],[2,7]]]
    [[[[1,1],[4,5]],[7,7]],1]
    [[[[4,3],3],[1,6]],[[0,2],8]]
    [[[[1,5],9],[[5,5],1]],[[6,1],[[9,9],[3,0]]]]
    [[6,9],[[[9,7],[3,8]],[[2,2],[8,7]]]]
    [[[6,2],[6,[8,1]]],[[[5,1],1],9]]
    [[[8,5],[7,9]],[[5,2],[[1,6],[8,0]]]]
    [[[[5,6],[9,1]],3],[[1,7],[6,5]]]
    [[[5,7],8],[9,[8,7]]]
    [[[[0,7],4],[3,[3,2]]],[[[0,8],5],[[8,8],1]]]
    [[[[8,2],[6,5]],[8,6]],[1,[[1,4],[3,7]]]]
    [[7,[9,[0,8]]],[[[7,1],[5,5]],[5,[1,5]]]]
    [[3,5],[[[7,4],[1,6]],[[6,9],4]]]
    [4,[9,4]]
    [[3,[5,5]],9]
    [[0,2],[[[9,8],9],1]]
    [[[0,3],[[9,8],0]],[[5,[5,1]],[7,[6,5]]]]
    [[[9,[0,4]],[[0,2],[4,5]]],[3,[2,[9,8]]]]
    [[[2,6],[[3,5],5]],[0,[9,7]]]
    [[[6,[0,8]],9],[8,7]]
    [[[[8,2],3],[6,6]],[6,[5,[7,8]]]]
    [[[9,[3,6]],[0,6]],[9,[[4,4],5]]]
    [[[3,2],5],2]
    [[[2,1],[[6,7],1]],[[7,[7,0]],5]]
    [[[[1,3],1],[1,5]],[[1,3],[[5,6],1]]]
    [[[3,[9,9]],[2,6]],[[[3,4],[5,8]],[1,[1,9]]]]
    [[[0,2],[4,[5,0]]],9]
    [[9,0],[7,[7,[9,9]]]]
    [[[8,[4,9]],[6,[4,8]]],[[3,6],[7,[9,1]]]]
    [[7,[6,[5,7]]],[[[0,9],[9,2]],1]]
    [8,[6,[[9,7],[5,7]]]]
    [[[7,[6,1]],[9,[4,9]]],[[[2,0],7],[8,7]]]
    [[5,[[4,1],[2,7]]],[0,[2,[5,3]]]]
    [[[0,8],[0,5]],2]
    [[[3,[9,8]],9],[1,2]]
    [[[[7,1],9],2],[[[4,6],[0,5]],[6,8]]]
    [4,[[[5,3],3],[[1,8],3]]]
    [[[3,0],[[5,0],[3,9]]],[6,[9,2]]]
    [[[6,6],[[8,2],6]],[[[0,6],8],[[3,3],[1,2]]]]
    [[6,[[5,2],[2,8]]],[1,7]]
    [[4,3],[[[1,5],0],[[1,4],6]]]
    [[7,[[2,7],7]],[[[4,2],[4,5]],[[5,3],3]]]
    [[0,1],[[9,[1,0]],9]]
    [[[[4,5],[1,8]],[5,1]],[[[4,6],[6,0]],[3,[1,4]]]]
    [[[[7,5],[0,9]],[[1,0],[2,7]]],[[9,4],[6,[7,7]]]]
    [[[3,1],9],[[[7,9],[4,7]],[[4,0],2]]]
    [[[9,[2,3]],[4,[3,1]]],[[9,[1,7]],[8,[9,6]]]]
    [[[2,2],0],[[9,[0,1]],[2,[2,4]]]]
    [9,[[6,9],[[2,5],[1,1]]]]
    [[2,9],[[[8,8],9],[[4,0],[8,2]]]]
    [1,[[8,[7,4]],8]]
    [[[[0,3],2],[[0,6],[3,8]]],6]
    [[[[3,7],[1,3]],[4,[0,3]]],[[[7,7],1],[[2,9],1]]]
    [[[4,[5,0]],[[1,1],6]],[[3,4],[8,5]]]
    [8,[2,[[0,4],9]]]
    [[[7,1],8],[[0,2],[[8,7],6]]]
    [[[4,0],4],[[4,[2,4]],[2,[1,8]]]]
    [[[1,5],[2,[5,4]]],[2,5]]
    [[[9,[6,7]],[1,6]],[[[0,3],[8,2]],[9,7]]]
    [[[[4,9],[4,0]],[[6,7],[5,9]]],[[[7,0],1],[[0,1],[4,6]]]]
    [[[8,[2,3]],[[1,6],[2,9]]],[[6,9],[4,[2,3]]]]
    [[[3,1],7],[[[6,9],[9,2]],[[3,9],2]]]
    [[9,[[8,3],[0,9]]],[[0,8],8]]
    [[[[4,8],4],[5,[3,3]]],[8,[6,4]]]
    [[[[0,8],[1,6]],[[9,4],3]],2]
    [[[7,[8,2]],[[9,0],1]],[[2,7],[[3,0],[8,6]]]]
    [[4,[1,[4,7]]],[[[2,6],4],[[5,3],9]]]
    [[0,5],[8,[[1,8],0]]]
    [[[1,[3,3]],9],[2,1]]
    [[[[5,0],[2,4]],[[1,7],0]],[[[5,3],4],5]]
    [[[9,[1,1]],7],[9,[7,1]]]
    [[[[5,5],9],4],[2,9]]
    [[5,[5,[6,8]]],9]
    [[[9,[1,6]],[[1,7],7]],[[7,3],[5,4]]]
    [[3,[[7,5],4]],[[[9,6],[7,1]],1]]
    [[[[8,7],1],3],[[2,[3,1]],[4,8]]]
    [[[4,[5,5]],0],[[7,8],[1,[5,6]]]]
    [[[[1,1],[9,2]],[1,[3,5]]],[[7,[2,1]],[2,[7,3]]]]
    [[[[3,7],[0,9]],0],[[0,8],[9,[2,8]]]]
    [[[7,[3,9]],[5,[1,6]]],[[[8,4],7],[[5,6],3]]]
    [[[[0,7],[4,3]],[1,[0,8]]],[[6,9],2]]
    [[[8,9],[8,3]],[[6,[0,1]],[7,8]]]
    [[[[6,6],9],[8,0]],[[9,[7,2]],[0,3]]]
    [[[[8,9],[0,0]],[9,3]],[3,[9,[8,9]]]]
    [[[8,[8,5]],[6,[9,1]]],8]
    [[6,[[1,0],8]],[4,6]]`;
}
