const snmp = require ("net-snmp");
const mqtt = require('mqtt');

const config = require('./config.js');
const apcConst = require('./apc_const.js');

let sessions = {};

const mqttClient = mqtt.connect('mqtt://'+config.mqtt.host, {
    port: config.mqtt.port,
    username: config.mqtt.username,
    password: config.mqtt.password
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
    return new Promise(function (resolve, reject) {
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

            resolve(retParams);
        });
    });
}

function sendMQTT(device, param, value) {
    let topic = config.mqtt.prefix+'/'+device+'/'+param;
    mqttClient.publish(topic, value.toString(),{ retain: config.mqtt.retain });
    console.log('['+topic+'] Send: '+value.toString());
}
















