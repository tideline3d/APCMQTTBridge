const snmp = require ("net-snmp");
const mqtt = require('mqtt');

const config = require('./config.js');
const apcConst = require('./apc_const.js');

const isDebugEnabled = process.env.DEBUG === 'true';

let sessions = {};

const mqttClient = mqtt.connect('tls://' + process.env.MQTT_HOST || config.mqtt.host, {
  port: process.env.MQTT_PORT || config.mqtt.port,
  username: process.env.MQTT_USERNAME || config.mqtt.username,
  password: process.env.MQTT_PASSWORD || config.mqtt.password
});

mqttClient.on('connect', () => {
  console.log('MQTT client connected');
});

mqttClient.on('error', (error) => {
  console.error('MQTT connection error:', error);
});

mqttClient.on('close', () => {
  console.log('MQTT client connection closed');
});

const snmpTrapCallback = function (error, trap) {
    if(error) {
        console.log(error);
        return;
    }
    // console.log(trap);
    // let payload = [];
    // trap.pdu.varbinds.forEach((variable) => {
    //     payload.push({
    //         oid: variable.oid,
    //         typename: snmp.ObjectType[variable.type],
    //         value: variable.value,
    //         // eslint-disable-next-line camelcase
    //         string_value: variable.value.toString(),
    //     });
    // });
    //
    // console.log(payload);

    let ip = trap.rinfo.address;

    for(let device of Object.keys(config.devices)) {
        if(config.devices[device].ip===ip) {
            console.log('Trap from '+device);

            (async () => {
                await sendUpsData(device);
            })();
            setTimeout(function() {
                (async () => {
                    await sendUpsData(device);
                })();
            }, 5000); //Just in case
        }
    }
};

snmp.createReceiver({
    port: config.core.snmpPort,
    address: config.core.snmpAddress,
    disableAuthorization: true,
}, snmpTrapCallback);


/*
var options = {};
var user = {
    name: "apc snmp profile1",
    level: snmp.SecurityLevel.noAuthNoPriv,
    authProtocol: snmp.AuthProtocols.sma,
    authKey: "madeahash",
    privProtocol: snmp.PrivProtocols.des,
    privKey: "privycouncil"
};

//var session = snmp.createV3Session ("192.168.1.111", user, options);

 */

(async () => {
    await queryAll();
})();

async function queryAll() {
    for(let device of Object.keys(config.devices)) {
        await upsTimer(device);
    }
}

async function upsTimer(device) {
    await sendUpsData(device);

    setTimeout(function () {
        upsTimer(device);
    }, config.devices[device].interval*1000);
}

async function sendUpsData(device) {
    let params = await queryUps(device);

    if (params === null) {
        return;
    }

    for(let key of Object.keys(params)) {
        sendMQTT(device, key, params[key]);
    }
}

function queryUps(device) {
    return new Promise(function (resolve) {
        if(sessions[device]===undefined) {
            sessions[device] = snmp.createSession (config.devices[device].ip, config.devices[device].community);
        }
        sessions[device].get (Object.keys(apcConst.paramList), function (error, varbinds) {
            if(error) {
                console.error(error);
                resolve(null);
                return;
            }

            //Static params
            let retParams = {
                'ups.mfr': apcConst.manufacturer
            };

            for (let i = 0; i < varbinds.length; i++) {
                if (snmp.isVarbindError(varbinds[i])) {
                    console.error(snmp.varbindError(varbinds[i]));
                    continue;
                }
                retParams[apcConst.paramList[varbinds[i].oid]] = varbinds[i].value.toString();
            }

            retParams['ups.status'] = [
                apcConst.powerStatus[retParams['ups.power.status']],
                apcConst.batteryStatus[retParams['battery.status']],
                apcConst.calibrationStatus[retParams['battery.calibration.status']],
                apcConst.needBatteryReplaceStatus[retParams['battery.replace.status']],

            ].filter(function(e) { return e!==''}).join(' ');

            retParams['ups.status_text'] = retParams['ups.status'].split(' ').map(e => apcConst.statusTypes[e]).join(' ');

            resolve(retParams);
        });
    });
}

function sendMQTT(device, param, value) {
    try {
        //Move the decimal over on the numeric values for easier display in other systems.  
        //For example a Load of 175 is actually 17.5%  Volatge of 1256 is actually 125.6
        let numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
        numericValue /= 10;
        }

      let topic = config.mqtt.prefix + device + '/' + param;
      mqttClient.publish(topic, value.toString(), { retain: config.mqtt.retain });
  
      if (isDebugEnabled) {
        console.log('[' + topic + '] Send: ' + value.toString());
      }
    } catch (error) {
      console.error('An error occurred while sending MQTT message:', error);
    }
  }















