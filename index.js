var five = require("johnny-five");
var mqtt = require('mqtt');

var board = new five.Board({ port: "COM3" });
var client = mqtt.connect('mqtt://iot.eclipse.org');

var connected = false;

client.on('connect', () => {
    connected = true;
});

board.on("ready", function() {
    var led = new five.Led(13);
    var proximity = new five.Proximity({
        controller: "HCSR04",
        pin: 7
    });
    var isOcupado = false;
    var isOcupadoOld = false;

    proximity.on("data", function() {
        if (this.cm < 10) {
            isOcupado = true;
        } else {
            isOcupado = false;
        }
    });
    
    proximity.on("change", function() {
        if (connected && (isOcupadoOld != isOcupado)) {
            isOcupadoOld = isOcupado;

            //liga ou desliga led
            isOcupadoOld ? led.on() : led.off();

            //prepara mensagem para publicar no tópico
            var msg = isOcupadoOld ? "ocupado" : "livre";
            client.publish('sensor31scj', msg);
        }
    });
});