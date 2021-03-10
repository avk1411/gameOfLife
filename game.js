var grid;
var ctx;
var shape = [];
var xSpan; 
var ySpan;
var size;
var loop;
var pattern;
var isRunning = false;
$(function () {
    grid = document.getElementById("grid");
    ctx = grid.getContext("2d");
    grid.addEventListener("click", clickCell, false);
    // https://stackoverflow.com/questions/6348494/addeventlistener-vs-onclick
    xSize = 20;
    ySize = 15;
    drawGrid(xSize, ySize);
    shape = [[1, 0], [2, 1], [2, 2], [1, 2], [0, 2]];
    console.log(shape);
    //drawShape(shape);
    console.log("jQuery function complete");
});

function drawGrid(xSize, ySize) {
    ctx.save();
    xSpan = grid.width / xSize;
    ySpan = grid.height / ySize;
    //create one grid elem
    var canvasPattern = document.createElement("canvas");
    canvasPattern.width = xSpan;
    canvasPattern.height = ySpan;
    var contextPattern = canvasPattern.getContext("2d");
    contextPattern.lineWidth = 1.0;
    contextPattern.strokeStyle= 'rgba(0,0,0,1.0)';
    contextPattern.fillStyle = 'rgba(255,255,255,1.0)';
    contextPattern.fillRect(0,0,xSpan,ySpan);
    contextPattern.strokeRect(0, 0, xSpan, ySpan);

    pattern = ctx.createPattern(canvasPattern, "repeat");
    ctx.fillStyle = pattern;
    ctx.globalCompositeOperation = "xor";
    ctx.clearRect(0,0,grid.width,grid.height);
    ctx.fillRect(0, 0, grid.width, grid.height);
    
    console.log("drawing complete");
    
}

function drawShape(shape) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,255,1.0)';
    ctx.strokeStyle = 'rgba(0,0,0,1.0)'; //todo
    ctx.lineWidth = 1.0;
    ctx.globalCompositeOperation = "xor";
    
    shape.forEach(function (cell, i) {
        ctx.clearRect(cell[0]*xSpan, cell[1]*ySpan, xSpan, ySpan);
        ctx.fillRect(cell[0]*xSpan, cell[1]*ySpan, xSpan, ySpan);
        ctx.strokeRect(cell[0]*xSpan, cell[1]*ySpan, xSpan, ySpan);
    });
  
}
function clickCell(event) {
    ctx.strokeStyle = 'rgba(0,0,0,1.0)'; //todo
    ctx.lineWidth = 1.0;
    
    var xVal = (event.pageX - grid.offsetLeft) / xSpan;
    xVal = Math.floor(xVal);
    var yVal = (event.pageY - grid.offsetTop) / ySpan;
    yVal = Math.floor(yVal);
    console.log(xVal, yVal);


    var imgData = ctx.getImageData((xVal * xSpan) + (xSpan/2) , (yVal * ySpan) + (ySpan/2), xSpan, ySpan).data;
    console.log(imgData);

    //Deslected Cell should get selected
    if(imgData[2]==0 || imgData[0]==255){
        console.log("SELECTING");
        console.log(imgData[3]);
        ctx.clearRect(xVal * xSpan, yVal * ySpan, xSpan, ySpan);
        ctx.fillStyle = 'rgba(37,5,130,1)';
        ctx.fillRect(xVal * xSpan, yVal * ySpan, xSpan, ySpan);
        ctx.lineWidth=1.0;
        ctx.strokeRect(xVal * xSpan, yVal * ySpan, xSpan, ySpan);
        shape.push([xVal,yVal]);
    }
    //selected cell needs to be deselected
    else{
        console.log("DESELECTED");
        //ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.clearRect(xVal * xSpan, yVal * ySpan, xSpan, ySpan);
        //ctx.fillRect(xVal * span, yVal * span, span, span);
        ctx.lineWidth=1.0;
        ctx.strokeRect(xVal * xSpan, yVal * ySpan, xSpan, ySpan);
        shape.splice(shape.indexOf([xVal,yVal]),1);
    }
}

function nextGen() {
    var deselect = [];
    var select =[];
    var visited = {};
    // forEach is very different form for loop. No return/continue/break stmt allowed
    for(var i = 0; i < shape.length; i++){
        var cell = shape[i];
        if ( visited[cell]== 1) {
            continue;
        }
        var n = countNeighbours(cell);
        var count = n[0];
        neighbours = n[1];

        if (count < 2 || count > 3) {
            deselect.push(cell);
        }
        for(var j=0; j< neighbours.length;j++){
            var cell = neighbours[j];
            if ( visited[cell] == 1) {
                continue;
            }
            var n = countNeighbours(cell);
            var count = n[0];
            if (count == 3) {
                select.push(cell);
            }
            visited[cell] = 1;
            
        }
        visited[cell] = 1;
    }
    
    deselect.forEach(function (cell, i) {

        //ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.clearRect(cell[0] * xSpan, cell[1] * ySpan, xSpan, ySpan);
       // ctx.fillRect(cell[0] * span, cell[1] * span, span, span);
        ctx.lineWidth = 1.0;
        ctx.strokeRect(cell[0] * xSpan, cell[1] * ySpan, xSpan, ySpan);
        shape.splice(shape.indexOf(cell), 1);        
    });
    select.forEach(function (cell,i) {

        ctx.clearRect(cell[0] * xSpan, cell[1] * ySpan, xSpan, ySpan);
        ctx.fillStyle = 'rgba(37,5,130,1)';
        ctx.fillRect(cell[0] * xSpan, cell[1] * ySpan, xSpan, ySpan);
        ctx.lineWidth = 1.0;
        ctx.strokeRect(cell[0] * xSpan, cell[1] * ySpan, xSpan, ySpan);
        shape.push(cell);
    });

    console.log("Next Gen computation complete");
    var count = document.getElementById("genCount").innerHTML;
    document.getElementById("genCount").innerHTML = ++count;

}
function countNeighbours(cell) {
    var count = 0;
    var neighbours = [];
    for(var i = -1;i<2;i++){
        for(var j = -1; j<2;j++){
            if(i ==j && i==0){
                continue;
            }
            var xVal = cell[0] +i;
            var yVal = cell[1] +j;
            if(xVal > -1 && yVal> -1 && xVal <xSize && yVal<ySize){
                var imgData = ctx.getImageData((xVal * xSpan) + (xSpan / 2), (yVal * ySpan) + (ySpan / 2), xSpan, ySpan).data;
                if (imgData[2] != 0 && imgData[0] != 255) {
                    count++;
                }
                else{
                    neighbours.push([xVal,yVal]);
                }
            }
        }
    }
    return [count,neighbours];
    
}

function  startSim() {
    if(isRunning){
        return;
    }
    isRunning= true;
    var count = document.getElementById("genCount").innerHTML;
    loop =setInterval(function name(params) {
        nextGen();
        count++;
        document.getElementById("genCount").innerHTML = count; 
        
    }, 100);
}
function stopSim() {
    clearInterval(loop);
    isRunning= false;
}
function clearGrid() {

    ctx.fillStyle = pattern;
    ctx.globalCompositeOperation = "xor";
    ctx.clearRect(0, 0, grid.width, grid.height);
    ctx.fillRect(0, 0, grid.width, grid.height);
    shape = [];
    document.getElementById("genCount").innerHTML = 0;
}