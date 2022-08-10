'use strict';
class CuttingMachineData {
    
    constructor(machineName,
        position, 
        totalTime, 
        cutTime, 
        dryHaulTime, 
        dryRunTime, 
        processingTime, 
        biteTime, 
        interruptTime,
        sharpenTime, 
        idleTime,
        cutFilenameList,
        cutSpeed) {
        this.machineName = machineName ? machineName : 0;
        this.position = position ? position : 0;
        this.totalTime = totalTime ? totalTime : 0;
        this.cutTime = cutTime ? cutTime : 0;
        this.dryHaulTime = dryHaulTime ? dryHaulTime : 0;
        this.dryRunTime = dryRunTime ? dryRunTime : 0;
        this.processingTime = processingTime ? processingTime : 0;
        this.biteTime = biteTime ? biteTime : 0;
        this.interruptTime = interruptTime ? interruptTime : 0;
        this.sharpenTime = sharpenTime ? sharpenTime : 0;
        this.idleTime = idleTime ? idleTime : 0;

        this.cutTimePercent = 0;
        this.dryHaulTimePercent = 0;
        this.dryRunTimePercent = 0;
        this.processingTimePercent = 0;
        this.biteTimePercent = 0;
        this.interruptTimePercent = 0;
        this.sharpenTimePercent = 0;
        this.idleTimePercent = 0;

        this.cutFilenameList = cutFilenameList ? cutFilenameList : [];
        this.cutSpeed = cutSpeed ? cutSpeed : 0;
    }

    calculate() {
        this.cutTimePercent = (this.cutTime / this.totalTime) * 100;
        this.dryHaulTimePercent = (this.dryHaulTime / this.totalTime) * 100;
        this.dryRunTimePercent = (this.dryRunTime / this.totalTime) * 100;
        this.processingTimePercent = (this.processingTime / this.totalTime) * 100;
        this.biteTimePercent = (this.biteTime / this.totalTime) * 100;
        this.interruptTimePercent = (this.interruptTime / this.totalTime) * 100;
        this.sharpenTimePercent = (this.sharpenTime / this.totalTime) * 100;
        this.idleTimePercent = (this.idleTime / this.totalTime) * 100;
    }
}

module.exports = CuttingMachineData;