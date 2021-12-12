import { isMinusToken, ModifierSyntaxKind } from "typescript";

function fun1212() {

    let input = getInput1212().split('\n').map(line => line.trim().split('-'));

    let graph = new Map<string, string[]>()
    
    input.forEach(it => {
        let a = graph.get(it[0]) || []
        let b = graph.get(it[1]) || []
        a.push(it[1])
        b.push(it[0])
        graph.set(it[0], a)
        graph.set(it[1], b)

    });

    let solutions = new Array<string[]>()
    traverse02(graph, "start", new Array<string>(), solutions)
    //solutions.forEach(it => console.log(it))
    console.log("number of slutions " + solutions.length)
}

function traverse01(graph : Map<string, string[]>, node : string, path : Array<string>, solutions : Array<string[]>)
{
    path.push(node)
    if(node == "end") {
        solutions.push([...path])
    }
    else {
        (graph.get(node) || [])
        .filter(it => it == "end" || it.toUpperCase() == it || path.indexOf(it) < 0)
        .forEach(it => traverse01(graph,it,path,solutions))
    }
    path.pop()
}

function traverse02(graph : Map<string, string[]>, node : string, path : Array<string>, solutions : Array<string[]>, allowDoubleSmall : boolean = true)
{
    let smallNodeOnPath = (node.toLowerCase() == node && path.indexOf(node) >= 0)
    if(smallNodeOnPath && !allowDoubleSmall) {
        return
    }
    
    path.push(node)
    if(node == "end") {
        solutions.push([...path])
    }
    else {
        (graph.get(node) || [])
        .filter(it => it != "start")
        .forEach(it => traverse02(graph,it,path,solutions,allowDoubleSmall && !smallNodeOnPath))
    }
    path.pop()
}

fun1212()

function getTest121201(): string {
    return `start-A
    start-b
    A-c
    A-b
    b-d
    A-end
    b-end`;
}

function getTest121202(): string {
    return `dc-end
    HN-start
    start-kj
    dc-start
    dc-HN
    LN-dc
    HN-end
    kj-sa
    kj-HN
    kj-dc`;
}

function getTest121203(): string {
    return `fs-end
    he-DX
    fs-he
    start-DX
    pj-DX
    end-zg
    zg-sl
    zg-pj
    pj-he
    RW-he
    fs-DX
    pj-RW
    zg-RW
    start-pj
    he-WI
    zg-he
    pj-fs
    start-RW`;
}


function getInput1212(): string {
    return `FK-gc
    gc-start
    gc-dw
    sp-FN
    dw-end
    FK-start
    dw-gn
    AN-gn
    yh-gn
    yh-start
    sp-AN
    ik-dw
    FK-dw
    end-sp
    yh-FK
    gc-gn
    AN-end
    dw-AN
    gn-sp
    gn-FK
    sp-FK
    yh-gc`;
}