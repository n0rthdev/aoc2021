import { collapseTextChangeRangesAcrossMultipleVersions, getMutableClone, isConstructorDeclaration, isLiteralTypeNode, isMinusToken, ModifierSyntaxKind, textSpanIntersectsWithTextSpan } from "typescript";

class Point {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
    toString(): string {
        return [this.x, this.y].toString()
    }
}

class Pawn {
    position: Point
    name: string

    constructor(position: Point, name: string) {
        this.position = position
        this.name = name
    }
    getType(): string {
        return this.name[0]
    }
}

class Board {
    grid: Map<Point, Point[]>
    rooms: Map<string, Point[]>  //roomkey to positions
    p2rooms: Map<Point, string>  //position to roomkey
    entrance: Map<Point, string> //entrance Point to Room
    costsMap: Map<String, number>

    constructor(grid: Map<Point, Point[]>, rooms: Map<string, Point[]>, costMap: Map<String, number>) {
        this.grid = grid
        this.rooms = rooms
        this.p2rooms = new Map<Point, string>()
        this.entrance = new Map<Point, string>()

        for (let [room, pos] of rooms) {
            pos.forEach(it => this.p2rooms.set(it, room))
        }
        for (let [here, neighbors] of grid) {
            if (!this.p2rooms.has(here)) {
                let re = neighbors.filter(it => this.p2rooms.has(it)).map(it => this.p2rooms.get(it)!)
                if (re.length > 0) {
                    this.entrance.set(here, re[0])
                }
            }
        }
        this.costsMap = costMap
    }

    pointIsHallway(p: Point): boolean {
        return !this.p2rooms.has(p)
    }
}
class GameState {
    pawns: Map<string, Point>
    pawnsStoppedInHallway: Map<String, String>
    pawnReachedRoom: Map<String, String>
    lastOneMoving: string | undefined
    lastPosition: Point | undefined
    cost: number
    str: string | undefined
    h: number | undefined
    constructor(pawns: Map<string, Point>, pawnsStoppedInHallway: Map<String, String>, pawnReachedRoom: Map<String, String>, cost: number) {
        this.pawns = pawns
        this.pawnsStoppedInHallway = pawnsStoppedInHallway
        this.pawnReachedRoom = pawnReachedRoom
        this.cost = cost
    }

    toString(): string {
        if (!this.str) {
            this.str = GameState.mapToString(this.pawns) + " " + this.lastOneMoving?.toString() + " " + this.lastPosition?.toString() + " " + GameState.mapToString(this.pawnsStoppedInHallway) + " " + GameState.mapToString(this.pawnReachedRoom)
        }
        return this.str;
    }

    static mapToString(map: Map<any, any>): string {
        return JSON.stringify(
            Array.from(
                map.entries()
            ).sort(([key1, value1], [key2, value2]) => key1.toString() < key2.toString() ? 1 : -1).reduce((o, [key, value]) => o + "," + key.toString() + "->" + value.toString(), "")
        )
    }

    tcost(board: Board): number {
        return this.cost + this.heuristics(board)
    }

    copy(): GameState {
        return new GameState(new Map(this.pawns), new Map(this.pawnsStoppedInHallway), new Map(this.pawnReachedRoom), this.cost)
    }
    isWon(board: Board): boolean {
        for (let [pawn, pos] of this.pawns) {
            if (board.rooms.get(pawn[0])?.filter(it => it == pos).length == 0) {
                return false;
            }
        }
        return true;
    }
    heuristics(board: Board): number {
        if (!this.h) {
            let sum = 0
            for (let [pawn, pos] of this.pawns) {
                let rooms = board.rooms.get(pawn[0])!
                let cost = board.costsMap.get(pawn[0])!

                sum += Math.min(...rooms.map(it => Math.abs(it.x - pos.x) + Math.abs(it.y-pos.y))) * cost

                // if (!(board.p2rooms.get(pos) == pawn[0])) {
                //     let myy = pos.y == 2 ? 2 : (Math.abs(2 - pos.y) + 1)
                //     sum += Math.min(...rooms.map(it => Math.abs(it.x - pos.x) + myy)) * cost
                // }
                // else {
                // }
            }
            this.h = sum
        }
        return this.h
    }

    nextStates(board: Board): GameState[] {
        if (this.lastOneMoving && (board.entrance.has(this.pawns.get(this.lastOneMoving)!)
            || (this.lastPosition && this.pawnsStoppedInHallway.has(this.lastOneMoving)))) {
            // currently moving pawn must continue. either because on entrance, or because it was alreday parked in the hallway
            return this.getNextPawnMoves(this.lastOneMoving, this.pawns.get(this.lastOneMoving)!, board)
        }
        else {
            let nexStates: GameState[] = []
            for (let [pawn, pos] of this.pawns) {
                // if (pawn == "D1" || pawn == "C1") {
                nexStates.push(...this.getNextPawnMoves(pawn, pos, board))
                //}
            }
            return nexStates;
        }
    }

    getNextPawnMoves(pawn: string, pos: Point, board: Board): GameState[] {
        let nexStates: GameState[] = []
        let moves = this.pawnReachedRoom.has(pawn) ? board.rooms.get(pawn[0])!.filter(it => it != pos) : board.grid.get(pos)!
        for (let nextPos of moves) {
            if (!this.pointHasPawn(nextPos)) {
                if (board.p2rooms.has(nextPos)) {
                    let room = board.rooms.get(board.p2rooms.get(nextPos)!)!
                    let allowedToEnter = room.every(it => !this.someDifferentPawnOn(it, pawn))
                    if (allowedToEnter) {
                        let nextState = this.copy()
                        nextState.movePawnTo(pawn, nextPos, board)
                        nexStates.push(nextState)
                    }
                }
                else {
                    let nextState = this.copy()
                    nextState.movePawnTo(pawn, nextPos, board)
                    nexStates.push(nextState)
                }
            }
        }
        //        if ((pawn == "C1" || pawn == "D1") && nexStates.length == 0) {
        //console.log("asdf")
        //}
        return nexStates
    }

    movePawnTo(pawn: string, nextPos: Point, board: Board) {
        this.pawns.set(pawn, nextPos)
        if (this.lastPosition && this.lastOneMoving != pawn && board.pointIsHallway(this.lastPosition)) {
            this.pawnsStoppedInHallway.set(pawn, pawn)
        }
        if (board.p2rooms.has(nextPos) && board.p2rooms.get(nextPos)! == pawn[0]) {
            this.pawnReachedRoom.set(pawn, pawn)
        }
        this.lastOneMoving = pawn
        this.lastPosition = nextPos
        this.cost += board.costsMap.get(pawn[0])!
    }

    pointHasPawn(p: Point) {
        for (let [pawn, pos] of this.pawns) {
            if (pos == p) {
                return true
            }
        }
        return false
    }
    someDifferentPawnOn(p: Point, mypawn: String): boolean {
        for (let [pawn, pos] of this.pawns) {
            if (pos == p && pawn[0] != mypawn[0]) {
                return true
            }
        }
        return false
    }
    pointString(p: Point): string {
        for (let [pawn, pos] of this.pawns) {
            if (pos == p) {
                return pawn
            }
        }
        return "."
    }
}

function fun1223() {
    let lines = getInput1223().split("\n").map(it => it.trim())
    let points = new Map<string, Point>()
    let rooms = new Map<string, Point[]>()
    let costMap = new Map<string, number>()
    let grid = new Map<Point, Point[]>()

    costMap.set("A", 1)
    costMap.set("B", 10)
    costMap.set("C", 100)
    costMap.set("D", 1000)

    let pawns = new Map<string, Point>();

    for (let x = 0; x < lines.length; x++) {
        for (let y = 0; y < lines[x].length; y++) {
            let l = lines[x][y]
            let p = new Point(x, y)
            if (l != "#") {
                points.set(p.toString(), p)
                if (l != "." && l != " ") {
                    let r = (y == 3) ? "A" : (y == 5) ? "B" : (y == 7) ? "C" : "D"
                    if (x == 2) {
                        rooms.set(r, (rooms.get(r) || new Array<Point>(0)).concat([p]))
                    }
                    else if (x == 3) {
                        rooms.set(r, (rooms.get(r) || new Array<Point>(0)).concat([p]))
                    }
                    if (pawns.has(l + "1")) {
                        pawns.set(l + "2", p)
                    }
                    else {
                        pawns.set(l + "1", p)
                    }
                }
            }
        }
    }

    for (let [s, point] of points) {

        let a = points.get([point.x - 1, point.y].toString())
        let b = points.get([point.x, point.y - 1].toString())
        let c = points.get([point.x + 1, point.y].toString())
        let d = points.get([point.x, point.y + 1].toString())

        grid.set(point, Array.from([a, b, c, d]).filter(it => it != undefined).map(it => it!))
    }

    let board = new Board(grid, rooms, costMap)
    let gameState = new GameState(pawns, new Map<string, string>(), new Map<string, string>(), 0)

    console.log(gameState.isWon(board))

    let openList = [gameState.toString()]
    let map = new Map<string, GameState>()
    map.set(gameState.toString(), gameState)
    let closedList = new Map<string, GameState>()

    while (openList.length > 0) {
        let currentNode = openList.shift()!
        let currentGame = map.get(currentNode)!
        if (currentGame.isWon(board)) {
            console.log("Found with " + currentGame.cost)
            break;
        }
        console.log("Current cost " + currentGame.tcost(board))
        closedList.set(currentNode.toString(), currentGame)
        expand(currentGame, board, openList, map, closedList)
    }
}
function expand(currentNode: GameState, board: Board, openList: Array<string>, map: Map<string, GameState>, closedList: Map<string, GameState>) {
    let moves = currentNode.nextStates(board)
    if (moves.length == 0) {
        console.log("reached end")
    }
    moves.forEach(it => {
        if (!closedList.has(it.toString())) {
            //let nc = it.cost;
            let firstVisit = openList.indexOf(it.toString()) < 0
            if (firstVisit) {
                if (firstVisit) {
                    insertIntoPqueue(it, openList, map, board)
                }
                else {
                    sortPQueue(openList, map, board)
                }
            }
        }
    })
}

function sortPQueue(nodes: Array<string>, map: Map<string, GameState>, board: Board) {
    nodes.sort((o1, o2) => map.get(o1)!.tcost(board) - map.get(o2)!.tcost(board))
}
function insertIntoPqueue(insert: GameState, nodes: Array<string>, map: Map<string, GameState>, board: Board) {
    nodes.push(insert.toString())
    if(map.has(insert.toString()))
    {
        if(map.get(insert.toString())!.tcost(board) > insert.tcost(board))
        {
            map.set(insert.toString(), insert)
        }
    }
    else {
        map.set(insert.toString(), insert)
    }
    sortPQueue(nodes, map, board)
}




fun1223()

function getTest1223finished(): string {
    return `#############
    #...........#
    ###A#B#C#D###
    ###A#B#C#D#
    ###########`
}

function getTest1223almostfinished(): string {
    return `#############
    #.....#....##
    ###B#A#D#C###
    ###A#B#C#D#
    ###########`
}

function getTest1223(): string {
    return `#############
    #...........#
    ###B#C#B#D###
    ###A#D#C#A#
    ###########`
}

function getInput1223(): string {
    return `#############
    #...........#
    ###D#A#D#C###
    ###C#A#B#B#
    ###########`;
}