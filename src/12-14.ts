import { isMinusToken, ModifierSyntaxKind } from "typescript";

function fun121401() {

    let sections = getInput1214().split('\n\n')
    let word = sections[0]

    let rules = new Map(sections[1].split('\n').map(line => line.trim().split(' -> ')).map(it => [it[0], it[1]]));

    for (let i = 0; i < 10; i++) {
        let newWord = ""
        for (let j = 0; j < word.length - 1; j++) {
            newWord += word[j]
            if (rules.has(word[j] + word[j + 1]))
                newWord += rules.get(word[j] + word[j + 1])
        }
        newWord += word[word.length - 1]
        word = newWord
        let wordCount = new Map<string, number>()
        Array.from(word).forEach(it => wordCount.set(it, (wordCount.get(it) || 0) + 1));
        let score = Math.max(...wordCount.values()) - Math.min(...wordCount.values())
        console.log("score " + score)
    }
}

function fun121402() {

    let sections = getInput1214().split('\n\n')
    let word = sections[0]

    let rules = new Map(sections[1].split('\n').map(line => line.trim().split(' -> ')).map(it => [it[0], it[1]]));

    let wordCount = new Map<string, number>()
    wordCount = recCount(word, 40, rules, true, new Map<string, Map<string, number>>())
    let score = Math.max(...wordCount.values()) - Math.min(...wordCount.values())
    console.log("score " + score)
}


function recCount(query: string, depth: number, rules: Map<string, string>, includeFirst: boolean, cache: Map<string, Map<string, number>>): Map<string, number> {

    let cacheKey = depth + "," + query + "," + includeFirst
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey) || getWordCount("")
    }
    let ret = new Map<string, number>()
    if (depth == 0) {
        ret = includeFirst ? getWordCount(query) : getWordCount(query.substring(1));
    }
    else if (query.length > 2) {
        let splitAt = Math.ceil(query.length / 2)
        ret = combineWordCounts(
            recCount(query.substr(0, splitAt), depth, rules, includeFirst, cache),
            recCount(query.substring(splitAt - 1), depth, rules, false, cache)
        )
    }
    else {
        let si = rules.get(query) || ''
        ret = combineWordCounts(
            recCount(query[0] + si, depth - 1, rules, includeFirst, cache),
            recCount(si + query[1], depth - 1, rules, false, cache)
        )
    }
    cache.set(cacheKey, ret)
    return ret;
}

// function recGen(query: string, depth: number, rules: Map<string, string>): string {
//     if (depth == 0) {
//         return query;
//     }
//     else if (query.length > 2) {
//         let splitAt = Math.ceil(query.length / 2)
//         return recGen(query.substr(0, splitAt), depth, rules) + recGen(query.substring(splitAt - 1), depth, rules).substring(1)
//     }
//     else {
//         let si = rules.get(query) || ''
//         return recGen(query[0] + si, depth - 1, rules) + recGen(si + query[1], depth - 1, rules).substring(1)
//     }
// }

//fun121401()
fun121402()
function getWordCount(word: string): Map<string, number> {
    let wordCount = new Map<string, number>()
    Array.from(word).forEach(it => wordCount.set(it, (wordCount.get(it) || 0) + 1));
    return wordCount
}
function combineWordCounts(a: Map<string, number>, b: Map<string, number>): Map<string, number> {
    let ret = new Map<string, number>()

    a.forEach((v, k) => ret.set(k, v))
    b.forEach((v, k) => ret.set(k, (ret.get(k) || 0) + v))

    return ret;
}

function getTest1214(): string {
    return `NNCB

    CH -> B
    HH -> N
    CB -> H
    NH -> C
    HB -> C
    HC -> B
    HN -> C
    NN -> C
    BH -> H
    NC -> B
    NB -> B
    BN -> B
    BB -> N
    BC -> B
    CC -> N
    CN -> C`;
}


function getInput1214(): string {
    return `PSVVKKCNBPNBBHNSFKBO

    CF -> H
    PP -> H
    SP -> V
    NO -> C
    SF -> F
    FS -> H
    OF -> P
    PN -> B
    SH -> V
    BO -> K
    ON -> V
    VP -> S
    HN -> B
    PS -> P
    FV -> H
    NC -> N
    FN -> S
    PF -> F
    BF -> F
    NB -> O
    HS -> C
    SC -> V
    PC -> K
    KF -> K
    HC -> C
    OK -> H
    KS -> P
    VF -> C
    NV -> S
    KK -> F
    HV -> H
    SV -> V
    KC -> N
    HF -> P
    SN -> F
    VS -> P
    VN -> F
    VH -> C
    OB -> K
    VV -> O
    VC -> O
    KP -> V
    OP -> C
    HO -> S
    NP -> K
    HB -> C
    CS -> S
    OO -> S
    CV -> K
    BS -> F
    BH -> P
    HP -> P
    PK -> B
    BB -> H
    PV -> N
    VO -> P
    SS -> B
    CC -> F
    BC -> V
    FF -> S
    HK -> V
    OH -> N
    BV -> C
    CP -> F
    KN -> K
    NN -> S
    FB -> F
    PH -> O
    FH -> N
    FK -> P
    CK -> V
    CN -> S
    BP -> K
    CH -> F
    FP -> K
    HH -> N
    NF -> C
    VB -> B
    FO -> N
    PB -> C
    KH -> K
    PO -> K
    OV -> F
    NH -> H
    KV -> B
    OS -> K
    OC -> K
    FC -> H
    SO -> H
    KO -> P
    NS -> F
    CB -> C
    CO -> F
    KB -> V
    BK -> K
    NK -> O
    SK -> C
    SB -> B
    VK -> O
    BN -> H`;
}