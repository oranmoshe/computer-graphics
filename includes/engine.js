/*
	Oran Moshe 300989480
	Shir Gabai 305278350
	Naama Kapach 305648610
*/

$(document).ready(function(){

	// flag represents the action the user play
	var flag = "";
	// canvas settings
	var centerPoint = {
		x: 750,
		y: 400	
	}; 
	var ctxSize = 1200;	
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext('2d');
	// flag of current projectin 
	var projectionType = 'perspective';
	// zoom level
	var zoom = 0;
	// angles of rotation and projection
	var rotationAngle=0;
	var projectionAngle=45;
	// data storage
	var shapeRepository = []; // data from source file
	var shapeBoard = []; // holds data temporary for user manipulations
	var orderingArray = []; // holds data temporary for sorting polygons

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
			var invalidMessage = "invalid input! , "
			var regularMessage = "insert angle please:"
			var message = regularMessage;
			switch(type){
				case 'type':{
					$('article').text("Please click at the screen");
					inputValue = null;
					while(!inputValue){
						var val = prompt(message);
						if(Math.abs(val)<=360){	
							inputValue = val						
							projectionAngle = val;								
						}
						else
							message = invalidMessage + regularMessage;
						
					} 

					break;
				}
				case 'angle':{
					$('article').text("Please click at the screen");
					inputValue = null;
					while(!inputValue){
						var val = prompt(regularMessage);
						if(Math.abs(val)<=360){
							inputValue = val
							rotationAngle = val;
						}
						else
							message = invalidMessage + regularMessage;
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

	load ()

	//reads the text file and initializes the array that holds the shapes info
	function load ()
	{ 
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


	//creating an http request to read txt file
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

	//Drawing the shepes on the screen
	function draw()			
	{									
		visible();	

		//going over all of the shapes												
		var i = 0;
		while(i<shapeBoard.length)								
		{
			//if visibilty == 1 thw shape will be drawn on the screen
			if(shapeBoard[i][shapeBoard[i].length-4] == 1)		
			{
				//drawing the shape
				var k = 3;
				ctx.beginPath(); 
				ctx.moveTo(parseFloat(shapeBoard[i][0])+parseFloat(centerPoint.x), parseFloat(shapeBoard[i][1])+parseFloat(centerPoint.y));
				while(k<shapeBoard[i].length-7)
				{
					ctx.lineTo(parseFloat(shapeBoard[i][k])+parseFloat(centerPoint.x), parseFloat(shapeBoard[i][k+1])+parseFloat(centerPoint.y));  //connect polygon points 
					k = k+3;
				}									
				ctx.closePath();   
				ctx.globalAlpha = 1;
				ctx.stroke();
				ctx.fillStyle = shapeBoard[i][shapeBoard[i].length-6];
				ctx.fill();		
			}
			i++;	
		}
							
	}

	// call to cavalier projection
	function caval()			
	{		
		projection('caval')
	}

	// call to cabinet projection 
	function cabin()	
	{		
		projection('cabin')						
	}

	//activates the projection according to the type sent to it
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

	//perspective projection
	function perspective()		
	{			
		prepareToDraw(function(){	
			//calculating each shape coordinates	
			for (var i = 0; i < shapeBoard.length; i++) {		
				for (var k = 0; k<shapeBoard[i].length-7; k = k+3) {
					shapeBoard[i][k] = (shapeBoard[i][k])/(1+shapeBoard[i][k+2]/600);
					shapeBoard[i][k+1] = (shapeBoard[i][k+1])/(1+shapeBoard[i][k+2]/600);	
				}
			
			}	
		});
	}

	//parallel projection
	function parallel()		
	{		
		prepareToDraw(function(){		
		});
	}

	//prepearing the canvas to draw the shapes according to their new values
	function prepareToDraw(callback){
		clear();
		cloneRepository();
		callback();
		setPolygonZMax(); 
		setMaxZ();
		draw();
	}

	//creating temporary array for claculating purposes with the same shapes info
	function cloneRepository(){
		shapeBoard = [];
		for(var i=0; i<shapeRepository.length; i++)											
		{	
			shapeBoard[i] = [];
			for(var k=0; k<shapeRepository[i].length; k++)
			{
				shapeBoard[i][k] = shapeRepository[i][k];
			}
		}
	}

	//gets cosinos valur of a given angle
	function getCos(angle){
		return Math.cos(-angle*Math.PI/180);
	}

	//gets sinus value of a given angle
	function getSin(angle){
		return  Math.sin(-angle*Math.PI/180);
	}

	//determines the maximum z value of the shapes
	function setPolygonZMax()
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

	//normalizing the shapes
	function normalization()	
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

	//checks which shape will be displayed
	function visible()		
	{		
		var vector = getVisibleVector();
		for(var i=0; i<shapeBoard.length;i++)			
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
			//calculating the angle
			var arcos = Math.acos((newVector.x*normal.x+newVector.y*normal.y+newVector.z*normal.z)/(Math.sqrt(Math.pow(newVector.x,2)+Math.pow(newVector.y,2)+Math.pow(newVector.z,2))*Math.sqrt(Math.pow(normal.x,2)+Math.pow(normal.y,2)+Math.pow(normal.z,2)))); // calc angle between normal and C.O.P
			var deg = arcos*(180/Math.PI); // from rad to deg  
			if(Math.cos(deg*(Math.PI/180))<0)  
				shapeBoard[i][shapeBoard[i].length-4] = 1;
			else
				shapeBoard[i][shapeBoard[i].length-4] = 0;
		}
	}

	//rotation on X axis 
	function rotateX()		
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
			
			// Y normal rotation
			shapeRepository[i][shapeRepository[i].length-2] = rotation.y*Math.cos(rotationAngle*Math.PI/180)+rotation.z*(-1*Math.sin(rotationAngle*Math.PI/180)); // Y normal rotation
			
			// Z normal rotation
			shapeRepository[i][shapeRepository[i].length-1] = rotation.y*Math.sin(rotationAngle*Math.PI/180)+rotation.z*Math.cos(rotationAngle*Math.PI/180);	// Z normal rotation	          		
		}
		prepareToProjection();							
	}

	//rotation on Y axis
	function rotateY()			
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
			
			// X normal rotation
			shapeRepository[i][shapeRepository[i].length-3] = rotation.x*Math.cos(rotationAngle*Math.PI/180)+rotation.z*(-1*Math.sin(rotationAngle*Math.PI/180)); // X normal rotation
			
			// Z normal rotation
			shapeRepository[i][shapeRepository[i].length-1] = rotation.x*Math.sin(rotationAngle*Math.PI/180)+rotation.z*Math.cos(rotationAngle*Math.PI/180);	// Z normal rotation		          		
		}
		prepareToProjection();
	}

	//rotation on Z axis
	function rotateZ()			
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
			
			// Y normal rotation
			shapeRepository[i][shapeRepository[i].length-3] = rotation.x*Math.cos(rotationAngle*Math.PI/180)+rotation.y*Math.sin(rotationAngle*Math.PI/180); // Y normal rotation
			
			// Z normal rotation
			shapeRepository[i][shapeRepository[i].length-2] = rotation.x*(-1*Math.sin(rotationAngle*Math.PI/180))+rotation.y*Math.cos(rotationAngle*Math.PI/180);	// Z normal rotation			          		
		}
		prepareToProjection();
			
	}

	//after rotaton calculatin drawing rhe shape according to the projection
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

	//creates a vector according to projection angle
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

	//sorts the shapes by max z value
	function setMaxZ()			
	{
		for (var i=0;i<shapeBoard.length-1;i++)
		{
			for (var j=0;j<shapeBoard.length-i-1;j++)
			{
				if(shapeBoard[j][shapeBoard[j].length-5] < shapeBoard[j+1][shapeBoard[j].length-5])
				{
					if (shapeBoard[j].length == shapeBoard[j+1].length)  
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

	//resizing shape 
	function scale()	
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
