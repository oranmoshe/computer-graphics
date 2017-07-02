/*
	Oran Moshe 300989480
	Shir Gabai 305278350
	Naama Kapach 305648610
*/

$(document).ready(function(){

	var flag = "";
	var CentreCanvasPoint = 600;         // center of canvas
	var CanvasSizePoint = 1200;			// size of canvas
	var canvas = document.getElementById("myCanvas");
	var contex = canvas.getContext('2d');
	var ProjectionCheck = 'perspective';
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
			var type = $(this).attr('data-type');						
			$('li').css('font-weight','normal').css('color','silver');
			$(this).css('font-weight','bold').css('color','#ffffff');	
			$('#title').css('font-weight','bold');	
			switch(type){
				case 'type':{
					$('article').text("Please click on one point to determine the size of the picture");
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
					$('article').text("Please click on one point to determine the size of the picture");
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
				ProjectionCheck = 'perspective';
				perspective();
				break;	
			}
			case 'caval':{
				ProjectionCheck = 'caval';
				Caval3D();
				break;	
			}
			case 'cabin':{
				ProjectionCheck = 'cabin';
				Cabin3D();
				break;	
			}
			case 'parallel':{
				ProjectionCheck = 'parallel';
				Parallel3D();	
				break;	
			}
			case 'rotateX':{
				Rotation3DX();
				break;	
			}
			case 'rotateY':{
				Rotation3DY();
				break;	
			}
			case 'rotateZ':{
				Rotation3DZ();
				break;	
			}
			case 'zoomIn':{
				zoom = 1.1;
				Resize3D()	
				break;	
			}
			case 'zoomOut':{
				zoom = 0.9;
				Resize3D()	
				break;	
			}
			case 'reload':{
				projectionAngle = 45;
				opacity = 1;
				initCenter = 600;
				zoom = 1.2;
				loadJson();
				break;	
			}	
		}
		e.preventDefault();
	});

	//clears canvas
	function clear(){
		contex.clearRect(0, 0, canvas.width, canvas.height);
	}


	loadJson ()
	function loadJson ()		//Get the objects from the JSON
	{ 				
		$.getJSON('http://localhost/graphics/Ex3/computer-graphics/includes/PolygonsList.json', function(data) 
		{
			if(data.shapes !== undefined)
			{
				for(var i=0; i<data.shapes.length; i++)											
				{	
					shapeRepository[i] = [];
					for(var k=0; k<data.shapes[i].length; k++)
					{
						shapeRepository[i][k]= data.shapes[i][k];
					}
					for(j=0;j<5;j++)
					{
						shapeRepository[i][shapeRepository[i].length]=0;
					}
				}
			}		    
			normalization();
			setPolygonZMax();
			perspective();																		
		});
	}


	function draw()			//Drawing the objects on the screen
	{									
		VisibPoly();													//the function checks which polygon to be displayed
		var i = 0;
		while(i<shapeBoard.length)								//going through all polygons
		{
			if(shapeBoard[i][shapeBoard[i].length-4] == 1)		//if visibilty=1 -> draw polygon to screen
			{
				var k = 3;
				contex.beginPath();   //first point of polygon
				contex.moveTo(shapeBoard[i][0]+CentreCanvasPoint, shapeBoard[i][1]+CentreCanvasPoint);
				while(k<shapeBoard[i].length-7)
				{
					contex.lineTo(shapeBoard[i][k]+CentreCanvasPoint, shapeBoard[i][k+1]+CentreCanvasPoint);  //connect polygon points 
					k = k+3;
				}									
				contex.closePath();    //close the polygon path
				contex.globalAlpha = 1;
				contex.stroke();
				contex.fillStyle = shapeBoard[i][shapeBoard[i].length-6];
				contex.fill();		
			}
			i++;	
		}
							
	}


	function Caval3D()			//cavalier projection function
	{		
		projection('caval')
	}

	function Cabin3D()		//cabinet projection function
	{		
		projection('cabin')						
	}

	function projection(type){
		clear();
		cloneRepository();
		for (var i = 0; i < shapeBoard.length; i++) {
			for (var k = 0; k<shapeBoard[i].length-7; k = k+3) {
				shapeBoard[i][k] = (shapeBoard[i][k])+(shapeBoard[i][k+2]/(type=='cabin'?2:1)*getCos(projectionAngle));
				shapeBoard[i][k+1] = (shapeBoard[i][k+1])+(shapeBoard[i][k+2]/2*getSin(projectionAngle));
			}
		}
		setPolygonZMax();			//which maximale Z the polygon owns
		SortPolyZ();		//Sort polygons through their maximale Z
		draw();			//Draw on screen
	}

	function perspective()		//perspective projection function
	{			
		console.log("perspective");
		clear();
		cloneRepository();
		for (var i = 0; i < shapeBoard.length; i++) {		//go through all polygons and calculate the coordinates
			for (var k = 0; k<shapeBoard[i].length-7; k = k+3) {
				shapeBoard[i][k] = (shapeBoard[i][k])/(1+shapeBoard[i][k+2]/600);
				shapeBoard[i][k+1] = (shapeBoard[i][k+1])/(1+shapeBoard[i][k+2]/600);	
			}
		
		}
		setPolygonZMax();					//which maximale Z the polygon owns
		SortPolyZ();				//Sort polygons through their maximale Z
		draw();					//Draw on screen
	}

	function Parallel3D()		//parallel projection
	{		
		console.log("Parallel3D");
		clear();
		cloneRepository();
		for (var i = 0; i < shapeBoard.length; i++) {		//go through all polygons and calculate the coordinates
			for (var k = 0; k<shapeBoard[i].length-7; k = k+3) {
				shapeBoard[i][k] = shapeBoard[i][k];
				shapeBoard[i][k+1] = shapeBoard[i][k+1];
			}
		}
		setPolygonZMax();
		SortPolyZ();
		draw();
	}

	function cloneRepository(){
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
		console.log("setPolygonZMax");
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
		console.log("normalization");
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

	function VisibPoly()		//visiability of polygons
	{		
		console.log("VisibPoly");
		var NormX = 0;
		var NormY = 0;
		var NormZ = 0;
		var VectX = 0;
		var VectY = 0;
		var VectZ = 0;	
		var VisPol = 0;
		var AngleNormUser = 0;

	/////////////////////////caval or cabinet projection///////////
		var Angle;
		if(projectionAngle == undefined)
		{
			Angle = 45;
		}
		else
		{
			Angle = projectionAngle;
		}
		var ProjAngleX = Math.cos(-Angle*Math.PI/180);
		var ProjAngleY = Math.sin(-Angle*Math.PI/180);
		var xtovec = 0;
		var ytovec = 0;
		var ztovec = 0;
		var vector = {};
		if (ProjectionCheck == 'caval')    // cavalier projection
		{

			xtovec = 0+(5000*ProjAngleX);
			ytovec = 0+(5000*ProjAngleY);
			ztovec = 5000;
		}
		else if(ProjectionCheck == 'cabin')		// cabinet projection
		{
			xtovec = 0+(5000/2*ProjAngleX);
			ytovec = 0+(5000/2*ProjAngleY);
			ztovec = 5000;
		}
		else					//not caval & not cabinet
		{		
			xtovec = 0;
			ytovec = 0;
			ztovec = 800;
		}

		for(var i=0; i<shapeBoard.length;i++)				//check the angle between C.O.P & Polygon Normal
		{			      
			NormX = shapeBoard[i][shapeBoard[i].length-3];
			NormY = shapeBoard[i][shapeBoard[i].length-2];
			NormZ = shapeBoard[i][shapeBoard[i].length-1];
			VectX = shapeBoard[i][0]-(xtovec);
			VectY = shapeBoard[i][1]-(ytovec);
			VectZ = shapeBoard[i][2]-(-ztovec);

			VisPol = Math.acos((VectX*NormX+VectY*NormY+VectZ*NormZ)/(Math.sqrt(Math.pow(VectX,2)+Math.pow(VectY,2)+Math.pow(VectZ,2))*Math.sqrt(Math.pow(NormX,2)+Math.pow(NormY,2)+Math.pow(NormZ,2)))); // calc angle between normal and C.O.P
			AngleNormUser = VisPol*(180/Math.PI); // from rad to deg
				  
			if(Math.cos(AngleNormUser*(Math.PI/180))<0)  
			{
				shapeBoard[i][shapeBoard[i].length-4] = 1;
			}
			else{shapeBoard[i][shapeBoard[i].length-4] = 0;}

		}
	}


	function Rotation3DX()		//rotation function on X
	{			
		console.log("Rotation3DX");
		var AngleRotXUser = 0;
		if(rotationAngle == undefined)
		{
			AngleRotXUser = 5;
		}
		else
		{
			AngleRotXUser = rotationAngle;
		}
		var Yrot = 0;
		var Zrot = 0;
		for(var i=0; i<shapeRepository.length;i++)
		{			         
			for(var k=0;k<shapeRepository[i].length-7;k+=3)
		    {
		        Yrot = shapeRepository[i][k+1];
		        Zrot = shapeRepository[i][k+2];
		        shapeRepository[i][k+1] = Yrot*Math.cos(AngleRotXUser*Math.PI/180)+Zrot*(-1*Math.sin(AngleRotXUser*Math.PI/180));
				shapeRepository[i][k+2] = Yrot*Math.sin(AngleRotXUser*Math.PI/180)+Zrot*Math.cos(AngleRotXUser*Math.PI/180);
		    }
			Yrot = shapeRepository[i][shapeRepository[i].length-2];
			Zrot = shapeRepository[i][shapeRepository[i].length-1];
			shapeRepository[i][shapeRepository[i].length-2] = Yrot*Math.cos(AngleRotXUser*Math.PI/180)+Zrot*(-1*Math.sin(AngleRotXUser*Math.PI/180)); // Y normal rotation
			shapeRepository[i][shapeRepository[i].length-1] = Yrot*Math.sin(AngleRotXUser*Math.PI/180)+Zrot*Math.cos(AngleRotXUser*Math.PI/180);	// Z normal rotation	          		
		}

		setPolygonZMax();
		if (ProjectionCheck == 'caval')
		{
			Caval3D();
		}
		else if(ProjectionCheck == 'cabin')
		{
			Cabin3D();
		}
		else if(ProjectionCheck == 'parallel')
		{
			Parallel3D();
		}
		else
		{		
			perspective();
		}
									
	}

	function Rotation3DY()				//rotation on Y
	{
		console.log("Rotation3DY");
		var AngleRotXUser = 0;
		if(rotationAngle == undefined)
		{
			AngleRotXUser = 5;
		}
		else
		{
			AngleRotXUser = rotationAngle;
		}
		var Xrot = 0;
		var Zrot = 0;
		for(var i=0; i<shapeRepository.length;i++)
		{			         
			for(var k=0;k<shapeRepository[i].length-7;k+=3)
			{
		    	Xrot = shapeRepository[i][k];
		    	Zrot = shapeRepository[i][k+2];
		    	shapeRepository[i][k] = Xrot*Math.cos(AngleRotXUser*Math.PI/180)+Zrot*(-1*Math.sin(AngleRotXUser*Math.PI/180));
				shapeRepository[i][k+2] = Xrot*Math.sin(AngleRotXUser*Math.PI/180)+Zrot*Math.cos(AngleRotXUser*Math.PI/180);
		    }
			Xrot = shapeRepository[i][shapeRepository[i].length-3];
			Zrot = shapeRepository[i][shapeRepository[i].length-1];
			shapeRepository[i][shapeRepository[i].length-3] = Xrot*Math.cos(AngleRotXUser*Math.PI/180)+Zrot*(-1*Math.sin(AngleRotXUser*Math.PI/180)); // X normal rotation
			shapeRepository[i][shapeRepository[i].length-1] = Xrot*Math.sin(AngleRotXUser*Math.PI/180)+Zrot*Math.cos(AngleRotXUser*Math.PI/180);	// Z normal rotation		          		
		}
		setPolygonZMax();
		if (ProjectionCheck == 'caval')
		{
			Caval3D();
		}
		else if(ProjectionCheck == 'cabin')
		{
			Cabin3D();
		}
		else if(ProjectionCheck == 'parallel')
		{
			Parallel3D();
		}
		else
		{	
			perspective();
		}
									
	}

	function Rotation3DZ()			//rotation on Z
	{	
		console.log("Rotate3DZ");
		var AngleRotXUser = 0;
		if(rotationAngle == undefined)
		{
			AngleRotXUser = 5;
		}
		else
		{
			AngleRotXUser = rotationAngle;
		}
		var Xrot = 0;
		var Yrot = 0;
		for(var i=0; i<shapeRepository.length;i++)
		{			         
			for(var k=0;k<shapeRepository[i].length-7;k+=3)
			{
		    	Xrot = shapeRepository[i][k];
		    	Yrot = shapeRepository[i][k+1];
		    	shapeRepository[i][k] = Xrot*Math.cos(AngleRotXUser*Math.PI/180)+Yrot*Math.sin(AngleRotXUser*Math.PI/180);
				shapeRepository[i][k+1] = Xrot*(-1*Math.sin(AngleRotXUser*Math.PI/180))+Yrot*Math.cos(AngleRotXUser*Math.PI/180);
		    }
			Xrot = shapeRepository[i][shapeRepository[i].length-3];
			Yrot = shapeRepository[i][shapeRepository[i].length-2];
			shapeRepository[i][shapeRepository[i].length-3] = Xrot*Math.cos(AngleRotXUser*Math.PI/180)+Yrot*Math.sin(AngleRotXUser*Math.PI/180); // Y normal rotation
			shapeRepository[i][shapeRepository[i].length-2] = Xrot*(-1*Math.sin(AngleRotXUser*Math.PI/180))+Yrot*Math.cos(AngleRotXUser*Math.PI/180);	// Z normal rotation			          		
		}

		setPolygonZMax();

		if (ProjectionCheck == 'caval')
		{
			Caval3D();
		}
		else if(ProjectionCheck == 'cabin')
		{
			Cabin3D();
		}
		else if(ProjectionCheck == 'parallel')
		{
			Parallel3D();
		}
		else
		{		
			perspective();
		}								
	}

	function SortPolyZ()				//sorting polygons by their maximale Z
	{
		console.log("SortPolyZ");
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
						var temp1 = [];
						var temp2 = [];					
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


	function Resize3D()					//resizing function
	{	
		console.log("Resize3D");
		for(var i=0; i<shapeRepository.length;i++)
		{			         
		   	for(var k=0;k<shapeRepository[i].length-7;k+=3)
			{
				shapeRepository[i][k] = shapeRepository[i][k]*zoom;
				shapeRepository[i][k+1] = shapeRepository[i][k+1]*zoom;
				shapeRepository[i][k+2] = shapeRepository[i][k+2]*zoom;
			}
		}
		normalization();
		setPolygonZMax();
		if (ProjectionCheck == 'caval')
		{
			Caval3D();
		}
		else if(ProjectionCheck == 'cabin')
		{
			Cabin3D();
		}
		else if(ProjectionCheck == 'parallel')
		{
			Parallel3D();
		}
		else
		{		
			perspective();
		}

	}	


	function Move3D()				//moving objects on the grid
	{
		console.log("Move3D");
		for(var i=0; i<shapeRepository.length;i++)
		{			     
			for(var k=0;k<shapeRepository[i].length-7;k+=3)
			{
				shapeRepository[i][k] = shapeRepository[i][k]+parseFloat(0);
				shapeRepository[i][k+1] = shapeRepository[i][k+1]+parseFloat(0);
				shapeRepository[i][k+2] = shapeRepository[i][k+2]+parseFloat(0);
			}
		}	

		normalization();

		if (ProjectionCheck == 'caval')
		{
			Caval3D();
		}
		else if(ProjectionCheck == 'cabin')
		{
			Cabin3D();
		}
		else if(ProjectionCheck == 'parallel')
		{
			Parallel3D();
		}
		else
		{		
			perspective();
		}

	}


});
