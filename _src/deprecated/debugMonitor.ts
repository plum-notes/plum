export class DebugMonitoring{
    // TODO: improve or just remove monitoring
    recursionMonitorData : any    = {};
    currentRecursionData : any    = this.recursionMonitorData;
    parentRecursionData  : any    = [];
    monitorStringData    : string = "";

    /**
     *
     */
    constructor() {
        this.init();        
    }

    init() {
        this.monitorStringData = "";
        this.parentRecursionData = [];
        this.currentRecursionData = this.recursionMonitorData = { name: "root", content: {}, children: [] };
    }

    monitorNewLayer(name: string) {
        this.parentRecursionData.push(this.currentRecursionData);
        const newMonitorData: any = { name: name, content: {}, children: [] };
        this.currentRecursionData.children.push(newMonitorData);
        this.currentRecursionData = newMonitorData;
        this.updateStringData("[" + name + ": ");
    }

    monitorGoBackLayer() {
        this.currentRecursionData = this.parentRecursionData[this.parentRecursionData.length - 1];
        this.updateStringData("]");
        this.parentRecursionData.pop();
    }

    monitorData(name: string, content: any) {
        const isContentString: boolean = typeof content === 'string' || content instanceof String;
        if (!isContentString)
            content = JSON.stringify(content);
        this.currentRecursionData.content[name] = content;
        this.updateStringData(name + ": " + content);
    }

    updateStringData(dataString: string) {
        let layer: number = 0;
        for (let i = 1; i < this.parentRecursionData.length; i++) {
            this.monitorStringData += "   ";
            layer = i + 1;
        }
        this.monitorStringData += dataString + "\n";//("+layer+")
    }
}