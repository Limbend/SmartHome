var room = flow.get("Bedroom");
var msgStopTimer = { payload: 100 };
var msgStartTimer = { payload: 101 };
var date = new Date();
var minutes = date.getHours() * 60 + date.getMinutes();

function nmsg(obj) { return { payload: obj }; }
function nmsgPepIn(obj) { return room.PepIn ? { payload: obj } : { payload: 0 }; }


if (room === undefined) {
    room = {
        TVOn: false,
        InBed: false,
        SleepMode: false,
        Drowse: false,
        DoorOpen: false,
        PepIn: false,
        ManualLight: 0
    };
    flow.set("Bedroom", room);
}

if (room.ManualLight === 0) {

    //Нажатие на выключатель
    if (msg.topic == "Bedroom_Switch_1") {
        //Однократное нажатие на любую из кнопок
        if (msg.payload.buttonevent == 1002 || msg.payload.buttonevent == 2002) {
            flow.set("Bedroom.ManualLight", 4);
            return [nmsg(4), msgStopTimer, msgStopTimer, msgStopTimer, msgStopTimer, msgStartTimer, nmsg("ManualLight4 = 4")];
        }
        //Двойное нажате на любую из кнопок
        else if (msg.payload.buttonevent == 1004 || msg.payload.buttonevent == 2004) {
            flow.set("Bedroom.ManualLight", 2);
            return [nmsg(2), msgStopTimer, msgStopTimer, msgStopTimer, msgStopTimer, msgStartTimer, nmsg("ManualLight2 = 2")];
        }
        else {
            flow.set("Bedroom.ManualLight", 1);
            return [nmsg(1), msgStopTimer, msgStopTimer, msgStopTimer, msgStopTimer, msgStartTimer, nmsg("ManualLight1 = 1")];
        }
    }

    else if (minutes >= (6 * 60 + 20) && minutes <= (19 * 60 + 0)) {
        return [nmsg(1), msgStopTimer, msgStopTimer, msgStopTimer, msgStopTimer, null, nmsg("Daylight = 1")];
    } else {

        //Телевизор
        if (msg.payload.hasOwnProperty("TVBR")) {
            if (msg.payload.TVBR > 10 && !room.TVOn) {
                //Телевизор включили
                flow.set("Bedroom.TVOn", true);
                if (room.SleepMode && !room.Drowse) {
                    flow.set("Bedroom.Drowse", true);
                    flow.set("Bedroom.PepIn", true);
                    return [nmsg(2), msgStopTimer, msgStopTimer, msgStopTimer, null, null, nmsg("TVOn + SleepMode = 2")];
                }
            }
            else if (msg.payload.TVBR < 10 && room.TVOn) {
                //Телевизор выключили
                flow.set("Bedroom.TVOn", false);
                if (room.SleepMode && room.Drowse) {
                    flow.set("Bedroom.Drowse", false);
                    return [nmsgPepIn(1), null, null, null, null, null, nmsg("PepIn + !TVOn + SleepMode = 1")];
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
                    if (minutes >= (21 * 60 + 0) || minutes < (5 * 60 + 20)) {
                        room.SleepMode = true;
                        flow.set("Bedroom.SleepMode", true);
                    }
                }
                //В кровать легли
                if (!room.InBed) {
                    flow.set("Bedroom.InBed", true);
                    if (room.SleepMode) {
                        return [nmsg(2), msgStopTimer, msgStartTimer, msgStopTimer, msgStopTimer, null, nmsg("InBed + SleepMode + Drowse = 2")];
                    }
                }

            }

            //С кровати встали
            else if (msg.payload.BedChecker < 0 && room.InBed) {
                flow.set("Bedroom.InBed", false);
                if (room.SleepMode) {
                    if (!room.Drowse) { flow.set("Bedroom.Drowse", true); }
                    return [nmsg(2), null, null, null, msgStartTimer, null, nmsg("!InBed + SleepMode + Drowse = 2")];
                }
            }
            return null;
        }

        //Движение
        else if (msg.payload.hasOwnProperty("MotionDetected") && msg.payload.MotionDetected) {
            if (!room.PepIn) { flow.set("Bedroom.PepIn", true); }
            if (room.SleepMode && !room.TVOn) {
                if (!room.Drowse) { flow.set("Bedroom.Drowse", true); }
                return [nmsg(2), msgStopTimer, msgStartTimer, msgStopTimer, null, null, nmsg("Motion + SleepMode = 2")];
            } else if (!room.SleepMode) {
                return [nmsg(3), msgStopTimer, null, room.DoorOpen ? msgStartTimer : msgStopTimer, null, null, nmsg("Motion + !SleepMode = 3")];
            }
        }

        //Таймер
        else if (msg.payload.hasOwnProperty("timer")) {
            if ((msg.payload.timer === 1 || msg.payload.timer === 3) && !room.InBed) {
                flow.set("Bedroom.PepIn", false);
                return [nmsg(0), null, null, null, null, null, nmsg("Людей нет = 0")];
            } else if (msg.payload.timer === 2 && !room.TVOn && room.SleepMode) {
                flow.set("Bedroom.Drowse", false);
                return [nmsgPepIn(1), null, null, null, null, null, nmsg("PepIn + !Drowse + SleepMode = 1")];
            } else if (msg.payload.timer === 4 && room.SleepMode) {
                flow.set("Bedroom.SleepMode", false);
                return [nmsgPepIn(3), null, null, null, null, null, nmsg("PepIn + !SleepMode = 3")];
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
                    return [nmsg(2), msgStopTimer, msgStartTimer, msgStartTimer, null, null, nmsg("DoorOpen + SleepMode = 2")];
                } else {
                    return [nmsg(3), msgStopTimer, null, msgStartTimer, null, null, nmsg("DoorOpen + !SleepMode = 3")];
                }
            } else if (msg.payload.ContactSensorState === 0 && room.DoorOpen) {
                //Дверь закрылась
                if (!room.PepIn) { flow.set("Bedroom.PepIn", true); }
                flow.set("Bedroom.DoorOpen", false);
                if (room.SleepMode) {
                    if (!room.Drowse) { flow.set("Bedroom.Drowse", true); }
                    return [nmsg(2), msgStartTimer, msgStartTimer, msgStopTimer, null, null, nmsg("!DoorOpen + SleepMode = 2")];
                } else {
                    return [nmsg(3), msgStartTimer, null, msgStopTimer, null, null, nmsg("!DoorOpen + !SleepMode = 3")];
                }
            }
        }
    }
}

else if (msg.topic == "Bedroom_Switch_1") {
    //Однократное нажатие на любую из кнопок
    if (msg.payload.buttonevent == 1002 || msg.payload.buttonevent == 2002) {
        if (room.ManualLight == 4) {
            flow.set("Bedroom.ManualLight", 1);
            return [nmsg(1), msgStopTimer, msgStopTimer, msgStopTimer, msgStopTimer, msgStartTimer, nmsg("ManualLight1 = 1")];
        } else {
            flow.set("Bedroom.ManualLight", 4);
            return [nmsg(4), msgStopTimer, msgStopTimer, msgStopTimer, msgStopTimer, msgStartTimer, nmsg("ManualLight4 = 4")];
        }
    }
    //Двойное нажате на любую из кнопок
    else if (msg.payload.buttonevent == 1004 || msg.payload.buttonevent == 2004) {
        if (room.ManualLight == 2) {
            flow.set("Bedroom.ManualLight", 1);
            return [nmsg(1), msgStopTimer, msgStopTimer, msgStopTimer, msgStopTimer, msgStartTimer, nmsg("ManualLight1 = 1")];
        } else {
            flow.set("Bedroom.ManualLight", 2);
            return [nmsg(2), msgStopTimer, msgStopTimer, msgStopTimer, msgStopTimer, msgStartTimer, nmsg("ManualLight2 = 2")];
        }
    }

    //Зажатие любой из кнопок || Однократное нажатие 2 кнопок
    else if (msg.payload.buttonevent == 1001 || msg.payload.buttonevent == 2001 || msg.payload.buttonevent == 3002) {
        flow.set("Bedroom.ManualLight", 0);
        return [null, null, null, null, null, msgStopTimer, nmsg("ManualLight0 = null")];
    }
}

else if (msg.payload.hasOwnProperty("timer") && msg.payload.timer === 5) {
    flow.set("Bedroom.ManualLight", 0);
    return [null, null, null, null, null, msgStopTimer, nmsg("ManualLight0 = null")];
}



return [null, null, null, null, null, null, nmsg("End code = null")];