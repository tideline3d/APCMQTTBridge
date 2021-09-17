# APC UPS MQTT Bridge
Allows you to connect APC UPS with network card via MQTT.

# Hardware
Required APC Network Management card v1 or v2.

Tested with AP9617 (v1) and AP9630 (v2).

#Installation
**Network management card**

* Log in to the web interface
* Go to "Administration > Network > SNMPv1 > access" and enable SNMPv1 access
* Optionally, you can setup security options in "Administration > Network > SNMPv1 > access control"
* Go to "Administration > Notification > SNMP Traps > Trap Receivers" and add your host (SNMPv1)

**Server**
* Clone repository
* Install packages with `npm install` 
* Copy config.sample.js to config.js and edit it
* Run with `node main.js`
* Optionally, you can add it to the systemd (example unit in apc_mqtt_bridge.service)