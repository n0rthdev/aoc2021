import { isMinusToken, ModifierSyntaxKind } from "typescript";

function fun121602() {

    let input =  getInput1216()
    let scanner = new Scanner(input)
    let parser = new Parser(scanner)

    let ret = parser.parseNextPacket()
    console.log("value is " + ret.calc())
}

function fun121601() {

    let input =  getInput1216()
    let scanner = new Scanner(input)
    let parser = new Parser(scanner)

    let ret = parser.parseNextPacket()
    let sum = sumVersion([ret])
    console.log("version sum is " + sum)
}

function sumVersion(toVisit: Packet[]) : number
{
    let sum = 0
    while(toVisit.length > 0)
    {
        let p = toVisit.shift()!!
        sum += p.version
        if(p instanceof Operator) {
            toVisit.push(...p.children)
        }
    }
    return sum
}


class Parser {
    scanner: Scanner
    constructor(scanner: Scanner) {
        this.scanner = scanner
    }

    parseNextPacket() : Packet {
        let version = this.readNextNumber(3)
        let typeID = this.readNextNumber(3)
        if(typeID == 4) {
            return new Literal(version, this.parseLiteralValue())
        }
        else {
            let lengthTypeID = this.readNextNumber(1)
            return new Operator(version, typeID, lengthTypeID, this.parseChildren(lengthTypeID))
        }
    }

    parseChildren(lengthTypeID : number) : Array<Packet> {
        if(lengthTypeID == 0) {
            let childrenSize = this.readNextNumber(15)
            return this.parsePacketsSizeLimit(childrenSize)
        }
        else {
            let childrenCount = this.readNextNumber(11)
            return this.parsePacketsCountLimit(childrenCount)
        }
    }

    parsePacketsSizeLimit(sizeLimit: number) {
        let start = this.scanner.index()
        let ret = new Array<Packet>()
        while(this.scanner.index() - start < sizeLimit) {
            let packet = this.parseNextPacket()
            if(packet) {
                ret.push(packet)
            }
        }
        return ret
    }
    
    parsePacketsCountLimit(countLimit: number) : Array<Packet> {
        let ret = new Array<Packet>()
        for(let i = 0; i < countLimit;i++) {
            let packet = this.parseNextPacket()
            if(packet) {
                ret.push(packet)
            }
        }
        return ret
    }


    parseLiteralValue() : number {
        let all = ""
        let cont = false
        do {
            cont = this.readNextBoolean()
            all += this.scanner.readNext(4)
        } while(cont);

        return parseInt(all, 2)
    }
    
    readNextNumber(nbits: number) {
        return parseInt(this.scanner.readNext(nbits), 2)
    }

    readNextBoolean() {
        return this.scanner.readNext(1) == "1"
    }
}

class Packet {
    version: number
    constructor(version : number) {
        this.version = version
    }
    calc () : number {
        return -1
    }
}

class Operator extends Packet {
    typeId: number
    lengthTypeID : number
    children: Array<Packet>
    constructor(version : number, typeId : number,lengthTypeID : number, children: Packet[]) {
        super(version)
        this.typeId = typeId
        this.lengthTypeID= lengthTypeID
        this.children = children 
    }
    calc () : number {
        switch(this.typeId) { 
            case 0: { 
               return this.children.reduce((sum, current) => sum + current.calc(), 0);
 
            } 
            case 1: { 
                return this.children.reduce((sum, current) => sum * current.calc(), 1);
            } 
            case 2: { 
                return Math.min(...this.children.map( it => it.calc()));
               
            } 
            case 3: { 
                return  Math.max(...this.children.map( it => it.calc()));
               
            } 
            case 5: { 
               if(this.children[0].calc() > this.children[1].calc()) {
                   return 1;
               }
               else   {
                   return 0;
               }
            } 
            case 6: { 
               if(this.children[0].calc() < this.children[1].calc()) {
                   return 1;
               }
               else   {
                   return 0;
               }
            } 
            case 7: { 
               if(this.children[0].calc() == this.children[1].calc()) {
                   return 1;
               }
               else   {
                   return 0;
               }
            } 
            default: { 
                return -1
            } 
         } 
    }
}

class Literal extends Packet {
    value: number
    constructor(version : number, value : number) {
        super(version)
        this.value = value
    }
    calc () : number {
        return this.value;
    }
}


class Scanner {
    input: string
    halfByteIndex: number
    bitIndex: number
    currentHalfByte: string

    constructor(input: string) {
        this.halfByteIndex = 0
        this.bitIndex = 0
        this.input = input
        this.currentHalfByte = this.hex2bin(this.input[0])
        console.log("scanner" + this.hex2bin(this.input))
    }
    index() : number {
        return this.halfByteIndex * 4 + this.bitIndex
    }
    
    size() : number {
        return this.input.length * 4
    }

    readNext(nbits: number): string {
        let ret = ""
        let bitsRemaining = nbits
        do {
            if (this.bitIndex == 4) {
                this.startWithNextHalfByte()
            }
            let read = this.currentHalfByte.substring(this.bitIndex, Math.min(4, this.bitIndex + bitsRemaining))
            ret += read
            bitsRemaining -= read.length
            this.bitIndex += read.length
        } while (bitsRemaining > 0 && this.hasNext())

        console.log("reading: " + ret + " with size " + ret.length)
        return ret;
    }
    hasByteLeft(): boolean {
        return this.size() - 8 >= this.index()
    }
    hasNext() : boolean {
        return this.input.length > this.halfByteIndex
    }
    readToEnd(): string {
        return this.readNext(this.input.length * 4)
    }
    startWithNextHalfByte() {
        this.halfByteIndex++
        if(this.hasNext()) {
            this.currentHalfByte = this.hex2bin(this.input[this.halfByteIndex])
            this.bitIndex = 0
        }
    }

    hex2bin(hex: string): string {
        return (parseInt(hex, 16).toString(2)).padStart(4 * hex.length, '0');
    }
}




fun121601()
fun121602()

function getTest121601(): string {
    return `8A004A801A8002F478`;
}


function getTest121602(): string {
    return `38006F45291200`;
}


function getTest121603(): string {
    return `EE00D40C823060`;
}


function getTest121604(): string {
    return `620080001611562C8802118E34`;
}

function getTest121605(): string {
    return `C0015000016115A2E0802F182340`;
}

function getTest121606(): string {
    return `A0016C880162017C3686B18A3D4780`;
}


function getInput1216(): string {
    return `E20D79005573F71DA0054E48527EF97D3004653BB1FC006867A8B1371AC49C801039171941340066E6B99A6A58B8110088BA008CE6F7893D4E6F7893DCDCFDB9D6CBC4026FE8026200DC7D84B1C00010A89507E3CCEE37B592014D3C01491B6697A83CB4F59E5E7FFA5CC66D4BC6F05D3004E6BB742B004E7E6B3375A46CF91D8C027911797589E17920F4009BE72DA8D2E4523DCEE86A8018C4AD3C7F2D2D02C5B9FF53366E3004658DB0012A963891D168801D08480485B005C0010A883116308002171AA24C679E0394EB898023331E60AB401294D98CA6CD8C01D9B349E0A99363003E655D40289CBDBB2F55D25E53ECAF14D9ABBB4CC726F038C011B0044401987D0BE0C00021B04E2546499DE824C015B004A7755B570013F2DD8627C65C02186F2996E9CCD04E5718C5CBCC016B004A4F61B27B0D9B8633F9344D57B0C1D3805537ADFA21F231C6EC9F3D3089FF7CD25E5941200C96801F191C77091238EE13A704A7CCC802B3B00567F192296259ABD9C400282915B9F6E98879823046C0010C626C966A19351EE27DE86C8E6968F2BE3D2008EE540FC01196989CD9410055725480D60025737BA1547D700727B9A89B444971830070401F8D70BA3B8803F16A3FC2D00043621C3B8A733C8BD880212BCDEE9D34929164D5CB08032594E5E1D25C0055E5B771E966783240220CD19E802E200F4588450BC401A8FB14E0A1805B36F3243B2833247536B70BDC00A60348880C7730039400B402A91009F650028C00E2020918077610021C00C1002D80512601188803B4000C148025010036727EE5AD6B445CC011E00B825E14F4BBF5F97853D2EFD6256F8FFE9F3B001420C01A88915E259002191EE2F4392004323E44A8B4C0069CEF34D304C001AB94379D149BD904507004A6D466B618402477802E200D47383719C0010F8A507A294CC9C90024A967C9995EE2933BA840`;
}