var bedroom = flow.get("Bedroom");
var msgStopTimer = { payload: 100 };
var msgStartTimer = { payload: 101 };
function nmsg(obj) { return { payload: obj }; }

if (bedroom === undefined) {
    bedroom = {
        TVOn: false,
        InBed: false,
        SleepMode: false,
        Drowse: false,
        DoorOpen: false
    };
    flow.set("Bedroom", bedroom);
}

//Телевизор
if (msg.payload.hasOwnProperty("TVBR")) {
    if (msg.payload.TVBR > 10 && !bedroom.TVOn) {
        flow.set("Bedroom.TVOn", true);
        if (bedroom.SleepMode && !bedroom.Drowse) {
            flow.set("Bedroom.Drowse", true);
            return [nmsg(2), null, msgStopTimer, msgStopTimer, msgStopTimer, nmsg("#01 TVOn + SleepMode = 2")];
        }
    }
    else if (msg.payload.TVBR < 10 && bedroom.TVOn) {
        flow.set("Bedroom.TVOn", false);
        if (bedroom.SleepMode && bedroom.Drowse) {
            flow.set("Bedroom.Drowse", false);
            return [nmsg(1), null, null, msgStopTimer, null, nmsg("#02 !TVOn + SleepMode = 2")];
        }
    }
    return null;
}

//Кровать
else if (msg.payload.hasOwnProperty("BedChecker")) {
    //В кровате лежат
    if (msg.payload.BedChecker > 0) {
        if (!bedroom.SleepMode) {
            var date = new Date();
            if (date.getHours() > 21 || date.getHours() < 7) {
                bedroom.SleepMode = true;
                flow.set("Bedroom.SleepMode", true);
            }
        }
        //В кровать легли
        if (!bedroom.InBed) {
            flow.set("Bedroom.InBed", true);
            if (bedroom.SleepMode) {
                return [nmsg(2), msgStopTimer, msgStopTimer, msgStartTimer, msgStopTimer, nmsg("#03 InBed + SleepMode + Drowse = 2")];
            }
        }

    }

    //С кровати встали
    else if (msg.payload.BedChecker < 0 && bedroom.InBed) {
        flow.set("Bedroom.InBed", false);
        if (bedroom.SleepMode) {
            if (!bedroom.Drowse) { flow.set("Bedroom.Drowse", true); }
            return [nmsg(2), msgStartTimer, null, null, null, nmsg("#03 !InBed + SleepMode + Drowse = 2")];
        }
    }
    return null;
}

//Движение
else if (msg.payload.hasOwnProperty("MotionDetected") && msg.payload.MotionDetected) {
    if (bedroom.SleepMode) {
        if (!bedroom.Drowse) { flow.set("Bedroom.Drowse", true); }
        return [nmsg(2), null, msgStopTimer, msgStartTimer, msgStopTimer, nmsg("#04 Motion + SleepMode = 2")];
    } else if (!bedroom.SleepMode) {
        return [nmsg(3), null, msgStopTimer, null, msgStopTimer, nmsg("#05 Motion + !SleepMode = 3")];
    }
}

//Таймер
else if (msg.payload.hasOwnProperty("timer")) {
    if (msg.payload.timer === 1 && bedroom.SleepMode) {
        flow.set("Bedroom.SleepMode", false);
    } else if (msg.payload.timer === 3 && !bedroom.TVOn) {
        flow.set("Bedroom.Drowse", false);
    } else if (msg.payload.timer === 2 && msg.payload.timer === 4) {
        return [nmsg(0), null, null, null, null, nmsg("#06 Людей нет = 0")];
    }
}

//Дверь
else if (msg.payload.hasOwnProperty("ContactSensorState")) {
    if (msg.payload.ContactSensorState === 0 && !bedroom.DoorOpen) {
        //Дверь открылась
        flow.set("Bedroom.DoorOpen", true);
        if (bedroom.SleepMode) {
            if (!bedroom.Drowse) { flow.set("Bedroom.Drowse", true); }
            return [nmsg(2), null, msgStartTimer, msgStartTimer, msgStopTimer, nmsg("#07 DoorOpen + SleepMode = 2")];
        } else if (!bedroom.SleepMode) {
            return [nmsg(3), null, msgStartTimer, null, msgStopTimer, nmsg("#08 DoorOpen + !SleepMode = 3")];
        }
    } else if (msg.payload.ContactSensorState === 1 && bedroom.DoorOpen) {
        //Дверь закрылась
        flow.set("Bedroom.DoorOpen", false);
        if (bedroom.SleepMode) {
            if (!bedroom.Drowse) { flow.set("Bedroom.Drowse", true); }
            return [nmsg(2), null, msgStopTimer, null, msgStartTimer, nmsg("#09 DoorOpen + SleepMode = 2")];
        } else if (!bedroom.SleepMode) {
            return [nmsg(3), null, msgStopTimer, null, msgStartTimer, nmsg("#10 DoorOpen + !SleepMode = 3")];
        }
    }
}

return [null, null, null, null, null, nmsg("#99 End code = null")];