var TLght = flow.get("TLght");
var date = new Date();
if (TLght === undefined) {
    TLght = {
        BrightLevel: 101,
        MoonLamp: true,
        Lux: 0,
        Lightlevel: 0
    };
    flow.set("TLght", TLght);
}

//Отработал таймер
if (msg.payload === 1) {
    var log = `${date.getHours()}:${date.getMinutes()}  ${TLght.BrightLevel}  ${TLght.MoonLamp}  ${TLght.Lux}  ${TLght.Lightlevel}`;

    if (TLght.BrightLevel >= 100) {
        if (TLght.MoonLamp) {
            //Смена мода лампы
            flow.set("TLght.MoonLamp", false);
            flow.set("TLght.BrightLevel", 0);

            node.status({fill:"green", shape:"ring", text:`${TLght.BrightLevel}  ${TLght.MoonLamp}  ${TLght.Lux}  ${TLght.Lightlevel}`});
            return [{payload: 13, bright: 0}, { payload: log }, { payload: 1 }];
        } else {
            //Конец цикла
            flow.set("TLght.BrightLevel", 101);
            node.status({fill:"red", shape:"ring", text:``});
            return [null, { payload: log }, { payload: 100 }];
        }
    } else {        
        TLght.BrightLevel += 10;
        flow.set("TLght.BrightLevel", TLght.BrightLevel);
        node.status({fill:"green", shape:"ring", text:`${TLght.BrightLevel}  ${TLght.MoonLamp}  ${TLght.Lux}  ${TLght.Lightlevel}`});
        return [{payload: 10, bright: TLght.BrightLevel}, { payload: log }, { payload: 1 }];
    }
}

//Дачик освещенности
else if (msg.topic == "bedroom/light2" && TLght.BrightLevel !== 101) {
    flow.set("TLght.Lux", msg.payload.lux);
    flow.set("TLght.Lightlevel", msg.payload.lightlevel);
    node.status({fill:"green", shape:"ring", text:`${TLght.BrightLevel}  ${TLght.MoonLamp}  ${TLght.Lux}  ${TLght.Lightlevel}`});
    return;
}

//Запуск цикла
else if (msg.payload === -1) {

    TLght = {
        BrightLevel: 0,
        MoonLamp: true,
        Lux: 0,
        Lightlevel: 0
    };
    flow.set("TLght", TLght);
    node.status({fill:"green", shape:"ring", text:`${TLght.BrightLevel}  ${TLght.MoonLamp}  ${TLght.Lux}  ${TLght.Lightlevel}`});
    return [{payload: 12, bright: 0}, { payload: `=== Start Test (Under the lamp) ${date.getHours()}:${date.getMinutes()}`}, { payload: 1 }];
}

//Остановка цикла
else if (msg.payload === 100) {
    flow.set("TLght.BrightLevel", 101);
    node.status({fill:"red", shape:"ring", text:``});
    return [{payload: 13, bright: 100}, null, { payload: 100 }];
}

return;