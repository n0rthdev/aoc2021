import { getMutableClone, isConstructorDeclaration, isLiteralTypeNode, isMinusToken, ModifierSyntaxKind } from "typescript";


function fun122101() {
    //let pos = [4,8]
    let pos = [8, 7]
    
    let score = [0, 0]
    let die = 1
    let rollCount = 0

    for (let n = 0; ; n++) {
        for (let p = 0; p < 2; p++) {
            let out = "Player " + (p + 1) + " rolls"
            for (let t = 0; t < 3; t++) {
                pos[p] = ((pos[p] - 1 + die) % 10 + 1)
                out += " " + die
                die = (die % 100) + 1;
                rollCount++
            }
            score[p] += pos[p]

            out += " and moves to " + pos[p] + " for a total score of " + score[p]

            console.log(out)
            if (score[p] >= 1000) {
                console.log("end with " + score[(1 - p)] * rollCount)
                return;
            }
        }
    }
}

class Game {
    pos: number[]
    score: number[]
    count: number

    constructor(pos: number[], score: number[], count: number) {
        this.pos = pos;
        this.score = score;
        this.count = count;
    }

    copy(): Game {
        return new Game([...this.pos], [...this.score], this.count)
    }

    toString() : string {
        return this.pos.toString() + this.score.toString()
    }

}

function fun122102() {
    //let pos = [4,8]
    let pos = [8, 7]
    let score = [0, 0]
    let wincount = [0, 0]

    let games = new Map<String, Game>()

    //when rolling 3 dices (with numbers 1-3 on them) 
    //the distribution of their sum looks like this:
    let diceRollDistributionMap = new Map([
        [3, 1],
        [4, 3],
        [5, 6],
        [6, 7],
        [7, 6],
        [8, 3],
        [9, 1],
    ]);

    games.set(pos.toString() + score.toString(), new Game(pos, score, 1))

    for (let n = 0; ; n++) {
        for (let p = 0; p < 2; p++) {
            let newGames = new Map<String, Game>()

            for (let [key, oldGame] of games) {
                if (oldGame.score[1 - p] >= 21) {
                    wincount[1 - p] += oldGame.count
                }
                else {
                    for (let [move, d] of diceRollDistributionMap) {
                        let newgame = oldGame.copy()
                        newgame.pos[p] = ((newgame.pos[p] - 1 + move) % 10 + 1)
                        newgame.score[p] += newgame.pos[p]
                        newgame.count = oldGame.count * d  + (newGames.get(newgame.toString())?.count || 0)
                        newGames.set(newgame.toString(), newgame)
                    }
                }
            }
            console.log("Game count " + newGames.size)
            if (newGames.size == 0) {
                console.log("Win counts are " + wincount.toString())
                return;
            }
            games = newGames
        }
    }
}

fun122101()
fun122102()

