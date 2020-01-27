var msgStopTimer = { payload: 100 };
var msgStartTimer = { payload: 101 };
var msgOn = { payload: true };
var msgOff = { payload: false };

var room = flow.get("Toilet");
if (room === undefined) {
    room = {
        DoorOpen: false
    };
    flow.set("Toilet", room);
}


//Таймер закончился
if (msg.payload.hasOwnProperty("timer")) {
    if (msg.payload.timer < 3) {
        return [msgOff, null, null, null, msgStartTimer];
    } else //if (msg.payload.timer === 3)
        return [msgOff, msgOff, null, null, null];
}

//Датчик двери
else if (msg.payload.hasOwnProperty("ContactSensorState")) {
    if (!room.DoorOpen && msg.payload.ContactSensorState === 1 || room.DoorOpen && msg.payload.ContactSensorState === 0) {
        if (msg.payload.ContactSensorState === 1) {
            //Дверь открылась
            flow.set("Toilet.DoorOpen", true);
        } else {
            //Дерь закрылась
            flow.set("Toilet.DoorOpen", false);
        }
        return [msgOn, null, msgStartTimer, msgStopTimer, msgStopTimer];
    }
}

//Датчик движения
else if (msg.payload.hasOwnProperty("MotionDetected")) {
    //Если дверь закрыта и движение есть
    if (!room.DoorOpen && msg.payload.MotionDetected) {
        return [msgOn, msgOn, msgStopTimer, msgStopTimer, msgStopTimer];
    }
    //Если дверь открыта и движение есть
    if (room.DoorOpen && msg.payload.MotionDetected) {
        return [msgOn, null, msgStopTimer, msgStartTimer, null];
    }
    //Если движения нет
    if (!msg.payload.MotionDetected) {
        return [null, null, null, null, msgStartTimer];
    }
}

else if (msg.hasOwnProperty("topic") && msg.topic == "GoogleHome/Light") {
    return [msg, null, null, null, null];
}
else if (msg.hasOwnProperty("topic") && msg.topic == "GoogleHome/Fan") {
    return [null, msg, null, null, null];
}

return null;