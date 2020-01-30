var room = flow.get("Bedroom");
var msgStopTimer = { payload: 100 };
var msgStartTimer = { payload: 101 };
function nmsg(obj) { return { payload: obj }; }
function nmsgPepIn(obj) { return room.PepIn ? { payload: obj } : { payload: 0 }; }

if (room === undefined) {
    room = {
        TVOn: false,
        InBed: false,
        SleepMode: false,
        Drowse: false,
        DoorOpen: false,
        PepIn: false
    };
    flow.set("Bedroom", room);
}

//Телевизор
if (msg.payload.hasOwnProperty("TVBR")) {
    if (msg.payload.TVBR > 10 && !room.TVOn) {
        //Телевизор включили
        flow.set("Bedroom.TVOn", true);
        if (room.SleepMode && !room.Drowse) {
            flow.set("Bedroom.Drowse", true);
            flow.set("Bedroom.PepIn", true);
            return [nmsg(2), msgStopTimer, msgStopTimer, msgStopTimer, null, nmsg("TVOn + SleepMode = 2")];
        }
    }
    else if (msg.payload.TVBR < 10 && room.TVOn) {
        //Телевизор выключили
        flow.set("Bedroom.TVOn", false);
        if (room.SleepMode && room.Drowse) {
            flow.set("Bedroom.Drowse", false);
            return [nmsgPepIn(1), null, null, null, null, nmsg("PepIn + !TVOn + SleepMode = 1")];
        }
    }
    return null;
}

//Кровать
else if (msg.payload.hasOwnProperty("BedChecker")) {
    //В кровате лежат
    if (msg.payload.BedChecker > 0) {
        if (!room.PepIn) { flow.set("Bedroom.PepIn", true); }
        if (!room.SleepMode) {
            var date = new Date();
            if (date.getHours() > 21 || date.getHours() < 7) {
                room.SleepMode = true;
                flow.set("Bedroom.SleepMode", true);
            }
        }
        //В кровать легли
        if (!room.InBed) {
            flow.set("Bedroom.InBed", true);
            if (room.SleepMode) {
                return [nmsg(2), msgStopTimer, msgStartTimer, msgStopTimer, msgStopTimer, nmsg("InBed + SleepMode + Drowse = 2")];
            }
        }

    }

    //С кровати встали
    else if (msg.payload.BedChecker < 0 && room.InBed) {
        flow.set("Bedroom.InBed", false);
        if (room.SleepMode) {
            if (!room.Drowse) { flow.set("Bedroom.Drowse", true); }
            return [nmsg(2), null, null, null, msgStartTimer, nmsg("!InBed + SleepMode + Drowse = 2")];
        }
    }
    return null;
}

//Движение
else if (msg.payload.hasOwnProperty("MotionDetected") && msg.payload.MotionDetected) {
    if (!room.PepIn) { flow.set("Bedroom.PepIn", true); }
    if (room.SleepMode && !room.TVOn) {
        if (!room.Drowse) { flow.set("Bedroom.Drowse", true); }
        return [nmsg(2), msgStopTimer, msgStartTimer, msgStopTimer, null, nmsg("Motion + SleepMode = 2")];
    } else if (!room.SleepMode) {
        return [nmsg(3), msgStopTimer, null, room.DoorOpen ? msgStartTimer : msgStopTimer, null, nmsg("Motion + !SleepMode = 3")];
    }
}

//Таймер
else if (msg.payload.hasOwnProperty("timer")) {
    if (msg.payload.timer === 1 && msg.payload.timer === 3 && !room.InBed) {
        flow.set("Bedroom.PepIn", false);
        return [nmsg(0), null, null, null, null, nmsg("Людей нет = 0")];
    } else if (msg.payload.timer === 2 && !room.TVOn && room.SleepMode) {
        flow.set("Bedroom.Drowse", false);
        return [nmsgPepIn(1), null, null, null, null, nmsg("PepIn + !Drowse + SleepMode = 1")];
    } else if (msg.payload.timer === 4 && room.SleepMode) {
        flow.set("Bedroom.SleepMode", false);
        return [nmsgPepIn(3), null, null, null, null, nmsg("PepIn + !SleepMode = 3")];
    }
}

//Дверь
else if (msg.payload.hasOwnProperty("ContactSensorState")) {
    if (msg.payload.ContactSensorState === 1 && !room.DoorOpen) {
        //Дверь открылась
        if (!room.PepIn) { flow.set("Bedroom.PepIn", true); }
        flow.set("Bedroom.DoorOpen", true);
        if (room.SleepMode) {
            if (!room.Drowse) { flow.set("Bedroom.Drowse", true); }
            return [nmsg(2), msgStopTimer, msgStartTimer, msgStartTimer, null, nmsg("DoorOpen + SleepMode = 2")];
        } else {
            return [nmsg(3), msgStopTimer, null, msgStartTimer, null, nmsg("DoorOpen + !SleepMode = 3")];
        }
    } else if (msg.payload.ContactSensorState === 0 && room.DoorOpen) {
        //Дверь закрылась
        if (!room.PepIn) { flow.set("Bedroom.PepIn", true); }
        flow.set("Bedroom.DoorOpen", false);
        if (room.SleepMode) {
            if (!room.Drowse) { flow.set("Bedroom.Drowse", true); }
            return [nmsg(2), msgStartTimer, msgStartTimer, msgStopTimer, null, nmsg("!DoorOpen + SleepMode = 2")];
        } else {
            return [nmsg(3), msgStartTimer, null, msgStopTimer, null, nmsg("!DoorOpen + !SleepMode = 3")];
        }
    }
}

return [null, null, null, null, null, nmsg("End code = null")];