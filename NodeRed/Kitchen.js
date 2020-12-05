var msgStopTimer = { payload: 100 };
var msgStartTimer = { payload: 101 };
var msgOn = { payload: 3 };
var msgOff = { payload: 1 };

// var room = flow.get("Kitchen");
// if (room === undefined) {
//     room = {
//         DoorOpen: true
//     };
//     flow.set("Kitchen", room);
// }


//Таймер закончился
if (msg.topic.hasOwnProperty("timer")) {
    if (msg.payload.timer === 1) {
        return [msgOff, null];
    }

}

//Датчик движения
else if (msg.topic = "kithen_esp8266/binary_sensor/hfs-dc06h/state") {
    //Если движение есть
    if (msg.payload == "ON") {
        return [msgOn, msgStartTimer];
    }
}

return null;