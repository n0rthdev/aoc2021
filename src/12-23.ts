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
class Move {
    destination: Point
    length: number
    constructor(destination: Point, lenght: number) {
        this.destination = destination;
        this.length = lenght
    }
    toString(): string {
        return this.destination.toString() + " with length " + this.length
    }
}
class PawnMove {
    pawn: string
    move: Move
    constructor(pawn: string, move: Move) {
        this.pawn = pawn
        this.move = move
    }
    toString(): string {
        return this.pawn.toString() + " to " + this.move.toString()
    }
}

// class Pawn {
//     position: Point
//     name: string

//     constructor(position: Point, name: string) {
//         this.position = position
//         this.name = name
//     }
//     getType(): string {
//         return this.name[0]
//     }
// }

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
    lastOneMoving: string | undefined
    lastPosition: Point | undefined
    board: Board
    cost: number
    str: string | undefined
    h: number | undefined
    pawnmoves: PawnMove[] = new Array<PawnMove>()
    constructor(pawns: Map<string, Point>, pawnsStoppedInHallway: Map<String, String>, cost: number, board: Board, pawnmoves: PawnMove[]) {
        this.pawns = pawns
        this.pawnsStoppedInHallway = pawnsStoppedInHallway
        this.cost = cost
        this.board = board
        this.pawnmoves = pawnmoves
    }

    toString(): string {
        if (!this.str) {
            this.str = GameState.mapToString(this.pawns) + " " + this.lastOneMoving?.toString() + " " + this.lastPosition?.toString() + " " + GameState.mapToString(this.pawnsStoppedInHallway)
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

    tcost(): number {
        return this.cost + this.heuristics()
    }

    copy(): GameState {
        return new GameState(new Map(this.pawns), new Map(this.pawnsStoppedInHallway), this.cost, this.board, [...this.pawnmoves])
    }
    isWon(): boolean {
        for (let [pawn, pos] of this.pawns) {
            if (this.board.rooms.get(pawn[0])?.filter(it => it == pos).length == 0) {
                return false;
            }
        }
        return true;
    }
    heuristics(): number {
        return 0;
        // if (!this.h) {
        //     let sum = 0
        //     for (let [pawn, pos] of this.pawns) {
        //         let rooms = this.board.rooms.get(pawn[0])!
        //         let cost = this.board.costsMap.get(pawn[0])!

        //         sum += Math.min(...rooms.map(it => Math.abs(it.x - pos.x) + Math.abs(it.y - pos.y))) * cost
        //     }
        //     this.h = sum
        // }
        // return this.h
    }

    nextStates(): GameState[] {
        let nextStates: GameState[] = []
        for (let [pawn, pos] of this.pawns) {
            // if (pawn == "D1" || pawn == "C1") {
            let pawnMoves = this.getMovePawnDestinations(pawn, pos, !this.pawnsStoppedInHallway.has(pawn))
            pawnMoves.forEach(it => {
                let newState = this.copy()
                newState.movePawnTo(pawn, it)
                nextStates.push(newState)
                //console.log("Move " + pawn + " to " + it.toString())
            }
            )
        }
        return nextStates
    }

    getMovePawnDestinations(pawn: string, pos: Point, firstMove: boolean): Move[] {
        let moves: Move[] = []
        //let movesToDestination: Move[] = []
        let moveToDestination: Move | undefined = undefined
        let openList = [pos]
        let costMap = new Map<Point, number>()
        let closeList = new Map<Point, undefined>()

        if (this.mustStayInRoom(pos, pawn) && this.board.grid.get(pos)!.length == 1) {
            return []
        }

        firstMove = firstMove && !this.mustStayInRoom(pos, pawn)

        while (openList.length > 0) {
            let currentPos = openList.shift()!
            let currentCost = costMap.get(currentPos)! || 0
            let neighbors = this.board.grid.get(currentPos)!
            for (let np of neighbors) {
                if (!closeList.has(np)) {
                    if (!this.pointHasPawn(np)) {
                        let room = this.board.p2rooms.get(np)
                        if (room) {
                            openList.push(np)
                            if (this.canEnterRoom(room, pawn)) {
                                moveToDestination = new Move(np, currentCost + 1)
                                //movesToDestination.push(new Move(np,currentCost +1))
                            }
                            costMap.set(np, currentCost + 1)
                        }
                        else if (this.board.entrance.get(np)) {
                            openList.push(np)
                            costMap.set(np, currentCost + 1)
                        }
                        else {
                            openList.push(np)
                            if (firstMove) {
                                moves.push(new Move(np, currentCost + 1))
                            }
                            costMap.set(np, currentCost + 1)
                        }
                    }
                }
            }
            closeList.set(currentPos, undefined)
        }
        return moveToDestination ? [moveToDestination] : moves
    }

    mustStayInRoom(pos: Point, pawn: string): boolean {
        return this.board.p2rooms.get(pos) == pawn[0] && this.canEnterRoom(pawn[0], pawn)
    }

    canEnterRoom(roomKey: string, pawn: string): boolean {
        if (roomKey != pawn[0])
            return false
        let room = this.board.rooms.get(roomKey)!
        let allowedToEnter = room.every(it => !this.someDifferentPawnOn(it, pawn))
        return allowedToEnter
    }

    movePawnTo(pawn: string, move: Move) {
        this.pawns.set(pawn, move.destination)
        this.cost += move.length * this.board.costsMap.get(pawn[0])!
        this.pawnsStoppedInHallway.set(pawn, pawn)
        this.pawnmoves.push(new PawnMove(pawn, move))
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

function fun122301() {
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
    let gameState = new GameState(pawns, new Map<string, string>(), 0, board, new Array<PawnMove>())

    console.log(gameState.isWon())

    let openList = [gameState.toString()]
    let map = new Map<string, GameState>()
    map.set(gameState.toString(), gameState)
    let closedList = new Map<string, GameState>()

    while (openList.length > 0) {
        let currentNode = openList.shift()!
        let currentGame = map.get(currentNode)!
        if (currentGame.isWon()) {
            console.log("Found with " + currentGame.cost)
            break;
        }
        console.log("Current cost " + currentGame.tcost())
        closedList.set(currentNode.toString(), currentGame)
        expand(currentGame, openList, map, closedList)
    }
}



function fun122302() {
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
                    if (x >= 2 && x <= 5) {
                        rooms.set(r, (rooms.get(r) || new Array<Point>(0)).concat([p]))
                    }
                    if (pawns.has(l + "1")) {
                        if (pawns.has(l + "2")) {
                            if (pawns.has(l + "3")) {
                                pawns.set(l + "4", p)
                            }
                            else {
                                pawns.set(l + "3", p)
                            }
                        }
                        else {
                            pawns.set(l + "2", p)
                        }
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
    let gameState = new GameState(pawns, new Map<string, string>(), 0, board, new Array<PawnMove>())

    console.log(gameState.isWon())

    let openList = [gameState.toString()]
    let map = new Map<string, GameState>()
    map.set(gameState.toString(), gameState)
    let closedList = new Map<string, GameState>()

    while (openList.length > 0) {
        let currentNode = openList.shift()!
        let currentGame = map.get(currentNode)!
        if (currentGame.isWon()) {
            console.log("Found with " + currentGame.cost)
            break;
        }
        console.log("Current cost " + currentGame.tcost())
        closedList.set(currentNode.toString(), currentGame)
        expand(currentGame, openList, map, closedList)
    }
}

function expand(currentNode: GameState, openList: Array<string>, map: Map<string, GameState>, closedList: Map<string, GameState>) {
    let moves = currentNode.nextStates()
    if (moves.length == 0) {
        console.log("reached end")
    }
    moves.forEach(it => {
        if (!closedList.has(it.toString())) {
            let nc = it.cost;
            let firstVisit = openList.indexOf(it.toString()) < 0
            if (firstVisit) {
                insertIntoPqueue(it, openList, map)
            }
            else {
                let v = map.get(it.toString())!
                if (v.cost > nc) {
                    map.set(it.toString(), it)
                }
                sortPQueue(openList, map)
            }

        }
    })
}

function sortPQueue(nodes: Array<string>, map: Map<string, GameState>) {
    nodes.sort((o1, o2) => map.get(o1)!.tcost() - map.get(o2)!.tcost())
}
function insertIntoPqueue(insert: GameState, nodes: Array<string>, map: Map<string, GameState>) {
    nodes.push(insert.toString())
    if (map.has(insert.toString())) {
        if (map.get(insert.toString())!.tcost() > insert.tcost()) {
            map.set(insert.toString(), insert)
        }
    }
    else {
        map.set(insert.toString(), insert)
    }
    sortPQueue(nodes, map)
}

fun122302()

function getTest1223finished(): string {
    return `#############
    #...........#
    ###A#B#C#D###
    ###A#B#C#D#
    ###########`
}

function getTest1223almostfinished(): string {
    return `#############
    #...........##
    ###A#B#D#C###
    ###A#B#D#C#
    ###########`
}

function getTest1223(): string {
    return `#############
    #...........#
    ###B#C#B#D###
    ###D#C#B#A#
    ###D#B#A#C#
    ###A#D#C#A#
    ###########`
}

function getInput1223(): string {
    return `#############
    #...........#
    ###D#A#D#C###
    ###D#C#B#A#
    ###D#B#A#C#
    ###C#A#B#B#
    ###########`;
}