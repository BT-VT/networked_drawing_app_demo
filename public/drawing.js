
window.addEventListener('load', () => {

    var socket = io();

    // grab canvas element, get context of drawing type, and size canvas appropriately
    const canvas = document.querySelector("#canvas");
    const c = canvas.getContext('2d');
    resizeCanvas();

    // variables
    var painting = false;      // prevents drawing when mouse isnt clicked down
    let LOCKED = false;
    const mouseBuff = 2;       // moves line above mouse cursor

    // event listeners
    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", finishPosition);
    canvas.addEventListener("mousemove", draw);
    // window.addEventListener('resize', resizeCanvas);

    // socket listeners
    socket.on('mousePos', remoteDraw);
    socket.on('startPos', remoteStartPosition);
    socket.on('lock', lockDrawing);
    socket.on('finishPos', remoteFinishPosition);

    // gets mouse position relative to canvas in current viewport
    function  getMousePos(canvas, e) {
        // getBoundingClientRect returns dimensions of an HTML obj (like a div, or canvas)
        // relative to the viewport
        var rect = canvas.getBoundingClientRect(), // abs. size of element (usually viewport)
            scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
            scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

        // e.clientX & e.clientY are coordinates of e (canvas) relative to viewport
        // rect.left & rect.top are the distances of the canvas left & top borders to the viewport
        return {
            x: (e.clientX - rect.left) * scaleX - mouseBuff,   // scale mouse coordinates after they have
            y: (e.clientY - rect.top) * scaleY - mouseBuff     // been adjusted to be relative to element
      }
    }

    // set attributes for a canvas line
    // set rand = false to limit amount of random colors used
    function getLineAttributes(rand = true) {

        let colors = ["#8093F1", "#F9DC5C", "#EA526F", "#70F8BA", "#1B98E0", ];

        let lineWidth = 10;
        let lineCap = "round";
        let strokeStyle = colors[Math.floor(Math.random()*5)];
        if(rand == true) {
            strokeStyle = `rgba(${Math.random() * 255},
                                  ${Math.random() * 255},
                                  ${Math.random() * 255}, 1)`;
        }
        return {
            lineWidth: lineWidth,
            lineCap: lineCap,
            strokeStyle: strokeStyle
        }
    }

    // called by every other client when one client begins drawing.
    // prevents other clients from emitting drawing coordinates to server
    function lockDrawing() {
        LOCKED = true;
        console.log('*********** lock is LOCKED');
    }
    // called when mouse button is pressed down, allows draw() to start
    // emitting drawing coordinate data to server
    function startPosition(e) {
        if(LOCKED) {
            console.log('cant draw, lock is locked');
            return;
        }
        painting = true;
        let pos = getMousePos(canvas, e);
        let attr = getLineAttributes();
        let data = {
            pos: pos,
            attr: attr
        }
        socket.emit('startPos', data);       // this emit is only necessary for drawing single points
    }

    // called when socket detects incoming data labeled as 'startPos', indicating that
    // a client has clicked on the canvas to begin drawing (starting with a single point)
    function remoteStartPosition(data) {
        c.moveTo(data.pos.x, data.pos.y);   // go to start location of path
        remoteDraw(data);                   // call to draw point
    }

    // called when mouse is released, stops draw() from emiting Drawing
    // coordinates to server when mouse is moved without being clicked
    function finishPosition() {
        painting = false;
        socket.emit('finishPos');
    }

    // called when socket detects incoming data labeled as 'finishPos', indicating that
    // the client who has been drawing is finished
    function remoteFinishPosition() {
        c.beginPath();          // end the old drawing path
        LOCKED = false;
        console.log('lock is unlocked');
    }

    // called when mouse is moved. If permitted, sends drawing coordinates to server.
    function draw(e) {
        // if mouse isnt clicked down or someone else is drawing, return
        if(!painting || LOCKED) return;

        let pos = getMousePos(canvas, e);
        let attr = getLineAttributes();
        let data = {
            pos: pos,
            attr: attr
        }
        socket.emit('mousePos', data);
    }

    // called when socket detects incoming drawing coordinates from server ('mousePos').
    function remoteDraw(data) {
        // set line attributes according to data received from server
        c.lineWidth = data.attr.lineWidth;
        c.lineCap = data.attr.lineCap;
        c.strokeStyle = data.attr.strokeStyle;

        c.lineTo(data.pos.x, data.pos.y);
        c.stroke();
        //c.beginPath();              // makes each dot a unique color, instead of each line
        c.moveTo(data.pos.x, data.pos.y);
    }

    // not currently used
    function resizeCanvas(x=-1, y=-1) {
        if(x < 0 || y < 0) {
          canvas.width = window.innerWidth * 0.8;
          canvas.height = window.innerHeight * 0.8;
        }
        else {
          canvas.width = x;
          canvas.height = y;
        }
    }
    });
