/*
	Oran Moshe 300989480
	Shir Gabai 305278350
	Naama Kapach 305648610
*/

$(document).ready(function(){

	var flag = "";
	var centerPoint = {
		x: 750,
		y: 400	
	};         // center of canvas
	var ctxSize = 1200;			// size of canvas
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext('2d');
	var projectionType = 'perspective';
	var zoom = 0;
	var rotationAngle=0;
	var projectionAngle=45;
	var shapeRepository = [];
	var shapeBoard = [];
	var orderingArray = [];

	// Make toolbox draggable
	$( "ul" ).draggable();

	// Click on Tollbox 
	$(document).on('click','li',function(){
		counter=0;
		if($(this).attr('id')!='title' && $(this).attr('id')!='color'){
			flag = $(this).attr('id');
			if(flag=='reload'){
				window.location.reload();
			}	
			var type = $(this).attr('data-type');						
			$('li').css('font-weight','normal').css('color','silver');
			$(this).css('font-weight','bold').css('color','#ffffff');	
			$('#title').css('font-weight','bold');	
			switch(type){
				case 'type':{
					$('article').text("Please click at the screen");
					inputValue = null;
					while(!inputValue){
						var val = prompt('value:');
						if(Math.abs(val)<=360){	
							inputValue = val						
							projectionAngle = val;							
						}
					} 

					break;
				}
				case 'angle':{
					$('article').text("Please click at the screen");
					inputValue = null;
					while(!inputValue){
						var val = prompt('value:');
						if(Math.abs(val)<=360){
							inputValue = val
							rotationAngle = val;
						}
					} 
					break;
				}
			}
			$('article').fadeIn(1000);
		}else{
			counter=-1;
		}
	});

	// Click on canvas 
	$(document).on('mousedown','#myCanvas',function(e){	
		$('article').fadeOut(1000);
		//flag is the function the user picks
		switch(flag){
			case 'perspective':{
				projectionType = 'perspective';
				perspective();
				break;	
			}
			case 'caval':{
				projectionType = 'caval';
				caval();
				break;	
			}
			case 'cabin':{
				projectionType = 'cabin';
				cabin();
				break;	
			}
			case 'parallel':{
				projectionType = 'parallel';
				parallel();	
				break;	
			}
			case 'rotateX':{
				rotateX();
				break;	
			}
			case 'rotateY':{
				rotateY();
				break;	
			}
			case 'rotateZ':{
				rotateZ();
				break;	
			}
			case 'zoomIn':{
				zoom = 1.1;
				scale()	
				break;	
			}
			case 'zoomOut':{
				zoom = 0.9;
				scale()	
				break;	
			}
		}
		e.preventDefault();
	});

	//clears canvas
	function clear(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	loadJson ()
	function loadJson ()		//Get the objects from the JSON
	{ 
		// initialization - read data from txt file and puts it in an array
		readTextFile('includes/data.txt',function(data_){					 
		    var lines = data_.split('\n');
			for(var i=0; i<lines.length; i++)											
			{	
				shapeRepository[i] = [];
				for(var k=0; k<lines[i].split(',').length; k++)
				{
					shapeRepository[i][k]= lines[i].split(',')[k];
				}
			}	    		
	 		normalization();
	 		perspective();	
		});
	}


	//reads txt file
	function readTextFile(file,callback)
	{

	    httpRequest = new XMLHttpRequest();

	    if (!httpRequest) {
	      alert('Giving up :( Cannot create an XMLHTTP instance');
	      return false;
	    }
	    httpRequest.onreadystatechange = alertContents;
	    httpRequest.open('GET', file);
	    httpRequest.send();
		  
		  function alertContents() {
		    if (httpRequest.readyState === XMLHttpRequest.DONE) {
		      if (httpRequest.status === 200) {
		        callback(httpRequest.responseText);
		      } else {
		        callback('There was a problem with the request.');
		      }
		    }
		  }
	}

	function draw()			//Drawing the objects on the screen
	{									
		visible();													//the function checks which polygon to be displayed
		var i = 0;
		while(i<shapeBoard.length)								//going through all polygons
		{
			if(shapeBoard[i][shapeBoard[i].length-4] == 1)		//if visibilty=1 -> draw polygon to screen
			{
				var k = 3;
				ctx.beginPath();   //first point of polygon
				ctx.moveTo(parseFloat(shapeBoard[i][0])+parseFloat(centerPoint.x), parseFloat(shapeBoard[i][1])+parseFloat(centerPoint.y));
				while(k<shapeBoard[i].length-7)
				{
					ctx.lineTo(parseFloat(shapeBoard[i][k])+parseFloat(centerPoint.x), parseFloat(shapeBoard[i][k+1])+parseFloat(centerPoint.y));  //connect polygon points 
					k = k+3;
				}									
				ctx.closePath();    //close the polygon path
				ctx.globalAlpha = 1;
				ctx.stroke();
				ctx.fillStyle = shapeBoard[i][shapeBoard[i].length-6];
				ctx.fill();		
			}
			i++;	
		}
							
	}

	function caval()			//cavalier projection function
	{		
		projection('caval')
	}

	function cabin()		//cabinet projection function
	{		
		projection('cabin')						
	}

	function projection(type){
		prepareToDraw(function(){
			for (var i = 0; i < shapeBoard.length; i++) {
				for (var k = 0; k<shapeBoard[i].length-7; k = k+3) {
					shapeBoard[i][k] = parseFloat((shapeBoard[i][k]))+parseFloat((shapeBoard[i][k+2]/(type=='cabin'?2:1)*getCos(projectionAngle)));
					shapeBoard[i][k+1] = parseFloat((shapeBoard[i][k+1]))+parseFloat((shapeBoard[i][k+2]/2*getSin(projectionAngle)));
				}
			}
		});
	}

	function perspective()		//perspective projection function
	{			
		prepareToDraw(function(){	
			for (var i = 0; i < shapeBoard.length; i++) {		//go through all polygons and calculate the coordinates
				for (var k = 0; k<shapeBoard[i].length-7; k = k+3) {
					shapeBoard[i][k] = (shapeBoard[i][k])/(1+shapeBoard[i][k+2]/600);
					shapeBoard[i][k+1] = (shapeBoard[i][k+1])/(1+shapeBoard[i][k+2]/600);	
				}
			
			}	
		});
	}

	function parallel()		//parallel projection
	{		
		prepareToDraw(function(){		
		});
	}

	function prepareToDraw(callback){
		clear();
		cloneRepository();
		callback();
		setPolygonZMax(); 
		setMaxZ();
		draw();
	}

	function cloneRepository(){
		shapeBoard = [];
		for(var i=0; i<shapeRepository.length; i++)			//copy from json array to temp array									
		{	
			shapeBoard[i] = [];
			for(var k=0; k<shapeRepository[i].length; k++)
			{
				shapeBoard[i][k] = shapeRepository[i][k];
			}
		}
	}
	function getCos(angle){
		return Math.cos(-angle*Math.PI/180);
	}
	function getSin(angle){
		return  Math.sin(-angle*Math.PI/180);
	}
	function setPolygonZMax()			//which maximale Z the polygon owns
	{			
		for(var i=0; i<shapeRepository.length;i++)	
		{			          	
			shapeRepository[i][shapeRepository[i].length-5] = -10000;	 // ZMax refreshing
			for (var k=2; k<shapeRepository[i].length-6; k+=3)
			{
		        if (shapeRepository[i][shapeRepository[i].length-5] < shapeRepository[i][k])
	          	{
	          		shapeRepository[i][shapeRepository[i].length-5] = shapeRepository[i][k];
	          	}
		    }
		}
	}

	function normalization()		//calculate the normal from each polygon
	{			
		for(var i=0; i<shapeRepository.length;i++)
		{			         
			var vector1 = [];
			var vector2 = []; 	
			for(k=0;k<3;k++)
			{
			    vector1[k] = shapeRepository[i][k+3]-shapeRepository[i][k];
			    vector2[k] = shapeRepository[i][k+6]-shapeRepository[i][k+3];
			}
			shapeRepository[i][shapeRepository[i].length-3] = vector1[1]*vector2[2]-vector1[2]*vector2[1];
			shapeRepository[i][shapeRepository[i].length-2] = vector1[2]*vector2[0]-vector1[0]*vector2[2];
			shapeRepository[i][shapeRepository[i].length-1] = vector1[0]*vector2[1]-vector1[1]*vector2[0];
		}
	}

	function visible()		//visiability of polygons
	{		
		var vector = getVisibleVector();
		for(var i=0; i<shapeBoard.length;i++)				//check the angle between C.O.P & Polygon Normal
		{		
			var normal = {
				x:shapeBoard[i][shapeBoard[i].length-3],
				y:shapeBoard[i][shapeBoard[i].length-2],
				z:shapeBoard[i][shapeBoard[i].length-1]
			}
			var newVector = {
				x:parseFloat(shapeBoard[i][0])-parseFloat((vector.x)),
				y:parseFloat(shapeBoard[i][1])-parseFloat((vector.y)),
				z:parseFloat(shapeBoard[i][2])-parseFloat((-vector.z))
			}
			var arcos = Math.acos((newVector.x*normal.x+newVector.y*normal.y+newVector.z*normal.z)/(Math.sqrt(Math.pow(newVector.x,2)+Math.pow(newVector.y,2)+Math.pow(newVector.z,2))*Math.sqrt(Math.pow(normal.x,2)+Math.pow(normal.y,2)+Math.pow(normal.z,2)))); // calc angle between normal and C.O.P
			var deg = arcos*(180/Math.PI); // from rad to deg  
			if(Math.cos(deg*(Math.PI/180))<0)  
				shapeBoard[i][shapeBoard[i].length-4] = 1;
			else
				shapeBoard[i][shapeBoard[i].length-4] = 0;
		}
	}

	function rotateX()		//rotation function on X
	{			
		var rotation = {
			y:0,
			z:0
		}
		for(var i=0; i<shapeRepository.length;i++)
		{			         
			for(var k=0;k<shapeRepository[i].length-7;k+=3)
		    {
		        rotation.y = shapeRepository[i][k+1];
		        rotation.z = shapeRepository[i][k+2];
		        shapeRepository[i][k+1] = rotation.y*Math.cos(rotationAngle*Math.PI/180)+rotation.z*(-1*Math.sin(rotationAngle*Math.PI/180));
				shapeRepository[i][k+2] = rotation.y*Math.sin(rotationAngle*Math.PI/180)+rotation.z*Math.cos(rotationAngle*Math.PI/180);
		    }
			rotation.y = shapeRepository[i][shapeRepository[i].length-2];
			rotation.z = shapeRepository[i][shapeRepository[i].length-1];
			shapeRepository[i][shapeRepository[i].length-2] = rotation.y*Math.cos(rotationAngle*Math.PI/180)+rotation.z*(-1*Math.sin(rotationAngle*Math.PI/180)); // Y normal rotation
			shapeRepository[i][shapeRepository[i].length-1] = rotation.y*Math.sin(rotationAngle*Math.PI/180)+rotation.z*Math.cos(rotationAngle*Math.PI/180);	// Z normal rotation	          		
		}
		prepareToProjection();							
	}

	function rotateY()				//rotation on Y
	{
		var rotation = {
			x:0,
			z:0
		}
		for(var i=0; i<shapeRepository.length;i++)
		{			         
			for(var k=0;k<shapeRepository[i].length-7;k+=3)
			{
		    	rotation.x = shapeRepository[i][k];
		    	rotation.z = shapeRepository[i][k+2];
		    	shapeRepository[i][k] = rotation.x*Math.cos(rotationAngle*Math.PI/180)+rotation.z*(-1*Math.sin(rotationAngle*Math.PI/180));
				shapeRepository[i][k+2] = rotation.x*Math.sin(rotationAngle*Math.PI/180)+rotation.z*Math.cos(rotationAngle*Math.PI/180);
		    }
			rotation.x = shapeRepository[i][shapeRepository[i].length-3];
			rotation.z = shapeRepository[i][shapeRepository[i].length-1];
			shapeRepository[i][shapeRepository[i].length-3] = rotation.x*Math.cos(rotationAngle*Math.PI/180)+rotation.z*(-1*Math.sin(rotationAngle*Math.PI/180)); // X normal rotation
			shapeRepository[i][shapeRepository[i].length-1] = rotation.x*Math.sin(rotationAngle*Math.PI/180)+rotation.z*Math.cos(rotationAngle*Math.PI/180);	// Z normal rotation		          		
		}
		prepareToProjection();
	}

	function rotateZ()			//rotation on Z
	{	
		var rotation = {
			x:0,
			y:0
		}
		for(var i=0; i<shapeRepository.length;i++)
		{			         
			for(var k=0;k<shapeRepository[i].length-7;k+=3)
			{
		    	rotation.x = shapeRepository[i][k];
		    	rotation.y = shapeRepository[i][k+1];
		    	shapeRepository[i][k] = rotation.x*Math.cos(rotationAngle*Math.PI/180)+rotation.y*Math.sin(rotationAngle*Math.PI/180);
				shapeRepository[i][k+1] = rotation.x*(-1*Math.sin(rotationAngle*Math.PI/180))+rotation.y*Math.cos(rotationAngle*Math.PI/180);
		    }
			rotation.x = shapeRepository[i][shapeRepository[i].length-3];
			rotation.y = shapeRepository[i][shapeRepository[i].length-2];
			shapeRepository[i][shapeRepository[i].length-3] = rotation.x*Math.cos(rotationAngle*Math.PI/180)+rotation.y*Math.sin(rotationAngle*Math.PI/180); // Y normal rotation
			shapeRepository[i][shapeRepository[i].length-2] = rotation.x*(-1*Math.sin(rotationAngle*Math.PI/180))+rotation.y*Math.cos(rotationAngle*Math.PI/180);	// Z normal rotation			          		
		}
		prepareToProjection();
			
	}

	function prepareToProjection(){
		if (projectionType == 'caval')
		{
			caval();
		}
		else if(projectionType == 'cabin')
		{
			cabin();
		}
		else if(projectionType == 'parallel')
		{
			parallel();
		}
		else
		{		
			perspective();
		}		
	}


	function getVisibleVector(){
		switch(projectionType){
			case 'caval':{
				return {
					x:4444*getCos(projectionAngle),
					y:4444*getSin(projectionAngle),
					z:4444
				}
				break;
			}
			case 'cabin':{
				return {
					x:4444/2*getCos(projectionAngle),
					y:4444/2*getSin(projectionAngle),
					z:4444
				}
				break;
			}
			default:{
				return {
					x:0,
					y:0,
					z:777
				}	
				break;
			}
		}
	}

	function setMaxZ()				//sorting polygons by their maximale Z
	{
		for (var i=0;i<shapeBoard.length-1;i++)
		{
			for (var j=0;j<shapeBoard.length-i-1;j++)
			{
				if(shapeBoard[j][shapeBoard[j].length-5] < shapeBoard[j+1][shapeBoard[j].length-5])
				{
					if (shapeBoard[j].length == shapeBoard[j+1].length)     //if the arrays lengths are equal
					{
						for(var k=0;k<shapeBoard[j].length;k++)
						{
							orderingArray[k] = shapeBoard[j][k];
							shapeBoard[j][k] = shapeBoard[j+1][k];
							shapeBoard[j+1][k] = orderingArray[k];
						}
					}
					else
					{
						var temp1=[],temp2=[];					
						for(var s=0;s<shapeBoard[j].length;s++)
						{
							temp1[s] = shapeBoard[j][s];
						}
						for(var s=0;s<shapeBoard[j+1].length;s++)
						{
							temp2[s] = shapeBoard[j+1][s];
						}
						shapeBoard[j] = [];
						shapeBoard[j+1] = [];
						for(var s=0;s<temp2.length;s++)
						{
							shapeBoard[j][s] = temp2[s];
						}
						for(var s=0;s<temp1.length;s++)
						{
							shapeBoard[j+1][s] = temp1[s];
						}
					}
				}
			}	
		}
	}

	function scale()					//resizing function
	{	
		for(var i=0; i<shapeRepository.length;i++)
		{			         
		   	for(var k=0;k<shapeRepository[i].length-7;k+=3)
			{
				shapeRepository[i][k] = shapeRepository[i][k]*zoom;
				shapeRepository[i][k+1] = shapeRepository[i][k+1]*zoom;
				shapeRepository[i][k+2] = shapeRepository[i][k+2]*zoom;
			}
		}
		prepareToProjection();
	}	

});
