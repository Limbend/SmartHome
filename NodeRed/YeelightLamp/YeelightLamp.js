var payload = {};

function SetPower(on, mode) {
    return {
        payload: JSON.stringify({
            "id": 1,
            "method": "set_power",
            "params": [
                on,
                "smooth",
                1000,
                mode
            ]
        }) + '\r\n'
    };
}
function SetBright(bright) {
    return {
        payload: JSON.stringify({
            "id": 1,
            "method": "set_bright",
            "params": [
                bright,
                "smooth",
                3000
            ]
        }) + '\r\n'
    };
}
function SetBrightFast(bright) {
    return {
        payload: JSON.stringify({
            "id": 1,
            "method": "set_bright",
            "params": [
                bright,
                "sudden",
                1
            ]
        }) + '\r\n'
    };
}


if (msg.payload === 4 || msg.payload === 3) {
    return SetPower("on", 1);
}
else if (msg.payload === 2) {
    return SetPower("on", 5);
}
else if (msg.payload === 1 || msg.payload === 0) {
    return SetPower("off", 1);
}
else if (msg.payload === 10) {
    return SetBrightFast(msg.bright);
}