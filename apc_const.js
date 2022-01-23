module.exports = {
    manufacturer: 'APC',

    // https://github.com/networkupstools/nut/blob/master/drivers/apc-mib.c
    paramList: {
        "1.3.6.1.4.1.318.1.1.1.1.1.1.0": "ups.model",
        "1.3.6.1.4.1.318.1.1.1.1.2.3.0": "ups.serial",
        "1.3.6.1.4.1.318.1.1.1.4.3.3.0": "ups.load",
        "1.3.6.1.4.1.318.1.1.1.1.1.2.0": "ups.id",
        "1.3.6.1.4.1.318.1.1.1.4.1.1.0": "ups.power.status", //See below
        "1.3.6.1.4.1.318.1.1.1.2.3.2.0": "ups.temperature",
        "1.3.6.1.4.1.318.1.1.1.2.3.1.0": "battery.charge",
        "1.3.6.1.4.1.318.1.1.1.2.3.4.0": "battery.voltage",
        "1.3.6.1.4.1.318.1.1.1.2.2.7.0": "battery.voltage.nominal",
        "1.3.6.1.4.1.318.1.1.1.2.1.1.0": "battery.status", //See below
        "1.3.6.1.4.1.318.1.1.1.7.2.6.0": "battery.calibration.status", //See below
        "1.3.6.1.4.1.318.1.1.1.2.2.4.0": "battery.replace.status", //See below
        "1.3.6.1.4.1.318.1.1.1.3.3.1.0": "input.voltage",
        "1.3.6.1.4.1.318.1.1.1.3.3.2.0": "input.voltage.maximum",
        "1.3.6.1.4.1.318.1.1.1.3.3.3.0": "input.voltage.minimum",
        "1.3.6.1.4.1.318.1.1.1.3.3.4.0": "input.frequency",
        "1.3.6.1.4.1.318.1.1.1.4.3.1.0": "output.voltage",
        "1.3.6.1.4.1.318.1.1.1.4.3.2.0": "output.frequency",
        "1.3.6.1.4.1.318.1.1.1.4.3.4.0": "output.current",
        "1.3.6.1.4.1.318.1.1.1.5.2.1.0": "output.voltage.nominal",
    },

    cmdList: {
        "load.off": "1.3.6.1.4.1.318.1.1.1.6.2.1.0",
        "load.on": "1.3.6.1.4.1.318.1.1.1.6.2.6.0",
        "shutdown.stayoff": "1.3.6.1.4.1.318.1.1.1.6.2.1.0",
        "shutdown.return": "1.3.6.1.4.1.318.1.1.1.6.1.1.0",
        "test.failure.start": "1.3.6.1.4.1.318.1.1.1.6.2.4.0",
        "test.panel.start": "1.3.6.1.4.1.318.1.1.1.6.2.5.0",
        "bypass.start": "1.3.6.1.4.1.318.1.1.1.6.2.7.0",
        "bypass.stop": "1.3.6.1.4.1.318.1.1.1.6.2.7.0",
        "test.battery.start": "1.3.6.1.4.1.318.1.1.1.7.2.2.0",
        "calibrate.start": "1.3.6.1.4.1.318.1.1.1.7.2.5.0",
        "calibrate.stop": "1.3.6.1.4.1.318.1.1.1.7.2.5.0",
        "reset.input.minmax": "1.3.6.1.4.1.318.1.1.1.9.1.1.0"
    },

    powerStatus: {
        1: "", // Unknown
        2: "OL", // on line
        3: "OB", // on battery
        4: "OL BOOST", // on smart boost
        5: "OFF", // timed sleeping
        6: "OFF", // software bypass
        7: "OFF", // off
        8: "", // rebooting
        9: "BYPASS", // switched bypass
        10: "BYPASS", // hardware failure bypass
        11: "OFF", // sleeping until power return
        12: "OL TRIM", // on smart trim

    },
    batteryStatus: {
        1: "", // Unknown
        2: "", // Normal
        3: "LB" // Low
    },
    calibrationStatus: {
        1: "", //Calibration successful
        2: "", //Calibration not done, battery capacity below 100%
        3: "CAL" //Calibration in progress
    },
    needBatteryReplaceStatus: {
        1: "", //Battery is not need replacement
        2: "RB" //Battery need to be replaced
    },

    statusTypes:  {
        "OL": "Online",
        "OB": "On Battery",
        "LB": "Low Battery",
        "HB": "High Battery",
        "RB": "Battery Needs Replaced",
        "CHRG": "Battery Charging",
        "DISCHRG": "Battery Discharging",
        "BYPASS": "Bypass Active",
        "CAL": "Runtime Calibration",
        "OFF": "Offline",
        "OVER": "Overloaded",
        "TRIM": "Trimming Voltage",
        "BOOST": "Boosting Voltage",
        "FSD": "Forced Shutdown",
        "ALARM": "Alarm",
    }
};