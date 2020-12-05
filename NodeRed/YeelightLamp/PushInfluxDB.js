nmsg = {}
if (msg.topic == "server/power") {
    nmsg.topic = "pushinfluxdb/server/power"
    
    nmsg.payload = `server,sensor=heiman_soket,devicename=server_power_soket,device=heiman_soket_1 voltage=${msg.payload.voltage},power=${msg.payload.power},current=${msg.payload.current / 1000}`
}

else if (msg.topic == "server/consumption") {
    nmsg.topic = "pushinfluxdb/server/power"
    
    nmsg.payload = `server,sensor=heiman_soket,devicename=server_power_soket,device=heiman_soket_1 cunsumption=${msg.payload.consumption}`
}

else if (msg.topic == "aircheck/sensor/senseair_co2_value/state") {
    nmsg.topic = "pushinfluxdb/bedroom/co2"
    
    nmsg.payload = `bedroom,sensor=senseair,devicename=aircheck,device=esp32 co2=${msg.payload}`
} 

else if(msg.topic == "aircheck/sensor/bme280_temperature/state") {
    nmsg.topic = "pushinfluxdb/bedroom/temp"
    
    nmsg.payload = `bedroom,sensor=bme280,devicename=aircheck,device=esp32 temperature=${msg.payload}`
}


else if(msg.topic == "aircheck/sensor/bme280_pressure/state") {
    nmsg.topic = "pushinfluxdb/bedroom/pres"
    
    nmsg.payload = `bedroom,sensor=bme280,devicename=aircheck,device=esp32 pressure=${msg.payload}`
}

else if(msg.topic == "aircheck/sensor/bme280_humidity/state") {
    nmsg.topic = "pushinfluxdb/bedroom/hum"
    
    nmsg.payload = `bedroom,sensor=bme280,devicename=aircheck,device=esp32 humidity=${msg.payload}`
}

else if (msg.topic == "bedroom/light") {
    nmsg.topic = "pushinfluxdb/bedroom/lightlevel"
    
    nmsg.payload = `bedroom,sensor=ZHALightLevel,devicename=bedroom_motion_1,device=aqara_motion_sensor,location=high_wall lux=${msg.payload.lux},lightlevel=${msg.payload.lightlevel}`
}

else if (msg.topic == "bedroom/light2") {
    nmsg.topic = "pushinfluxdb/bedroom/lightlevel"
    
    nmsg.payload = `bedroom,sensor=GZCGQ01LM,devicename=bedroom_light_sensor,device=mijia_light_sensor,location=high_wall lux=${msg.payload.lux},lightlevel=${msg.payload.lightlevel}`
}

else if (msg.topic == "street/light") {
    nmsg.topic = "pushinfluxdb/street/lightlevel"
    
    nmsg.payload = `street,sensor=ZHALightLevel,devicename=street_motion_4,device=aqara_motion_sensor lux=${msg.payload.lux},lightlevel=${msg.payload.lightlevel}`
}

else if (msg.topic == "light/test/bright") {
    nmsg.topic = "pushinfluxdb/bedroom/lightbright"
    
    nmsg.payload = `bedroom,devicename=bedroom_lamp,device=yeelight_650 lightbright=${msg.bright}`
}
return nmsg;