const amqp = require('amqplib/callback_api');

//Create Connection
amqp.connect('amqp://localhost', (err, conn) => {
    if(err) {
        console.log(err);
        throw err;
    }
    //Create Channel
    conn.createChannel((err, ch) => {
        if(err) {
            console.log(err);
            throw err;
        }
        // Assert Queue
        const q = 'hello';
        ch.assertQueue(q, { durable: false });
        // Send Message
        ch.consume(q, (msg) => {
            if(msg !== null) {
                console.log(`Message Received: ${msg.content.toString()}`);
                ch.ack(msg);
            }
        });
    });
    setTimeout(() => { conn.close(); process.exit(0) }, 500);
})