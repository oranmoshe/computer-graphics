/*
	Oran Moshe 300989480
	Shir Gabai 305278350
	Naama Kapach 305648610
*/

$(document).ready(function(){

	var c = document.getElementById("myCanvas"),
	ctx = c.getContext("2d"),
	rect = c.getBoundingClientRect();
	var polygonsArray = [];
	var PolyZSortArr = [];
	var CavalAndCabinProjAngle = 45;
	var ProjectionCheck = 0;
	var ValOpacity = 1;
	var CentreCanvasPoint = 600;
	var Rotation3DDeg = 45;
	var Zoom3d = 1.2;
	var inputValue = "";
	var minWidth=1200;
	var minHeight=1200;		//screen refreshing
	var flag = "";
	Get3DPic();

	// Make toolbox draggable
	$( "ul" ).draggable();

	// Color picker
	$(document).on('change','input',function(){
		color = '#'+($('input')).val();
	});

	// Click on Tollbox 
	$(document).on('click','li',function(){
		counter=0;
		if($(this).attr('id')!='title' && $(this).attr('id')!='color'){
			flag = $(this).attr('id');
			var type = $(this).attr('data-type');						
			$('li').css('font-weight','normal').css('color','silver');
			$(this).css('font-weight','bold').css('color','#ffffff');	
			$('#title').css('font-weight','bold');	
			dragMode = false;
			switch(type){
				case 'angle':{
					$('article').text("Please click on one point to determine the size of the picture");
					inputValue = null;
					while(!inputValue){
						var val = prompt('value:');
						if(Math.abs(val)<=360)
							inputValue = val;
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
			case 'perspective3d':{
				Perspective3D();
				break;	
			}
			case 'caval3d':{
				Caval3D(inputValue);
				break;	
			}
			case 'cabin3d':{
				Cabin3D(inputValue);
				break;	
			}
			case 'parallel3d':{
				Parallel3D();	
				break;	
			}
			case 'rotateX3d':{
				Rotation3DX(inputValue);
				break;	
			}
			case 'rotateY3d':{
				Rotation3DY(inputValue);
				break;	
			}
			case 'rotateZ3d':{
				Rotation3DZ(inputValue);
				break;	
			}
			case 'zoomIn':{
				Zoom3d = 1.1;
				Resize3D()	
				break;	
			}
			case 'zoomOut':{
				Zoom3d = 0.9;
				Resize3D()	
				break;	
			}
			case 'reload':{
				CavalAndCabinProjAngle = 45;
				ValOpacity = 1;
				CentreCanvasPoint = 600;
				Rotation3DDeg = 45;
				Zoom3d = 1.2;
				Get3DPic();
				break;	
			}	
		}
		e.preventDefault();
	});

	//clears canvas
	function clear(){
		ctx.clearRect(0, 0, c.width, c.height);
	}




	function Get3DPic ()		//Get the objects from the JSON
	{ 			
	
	  	var jsonUrl = "http://localhost/graphics/Ex3/includes/PolygonsList.json";
	  	$.getJSON( jsonUrl, {
	  	})
	    .done(function( data ) {
			if(data.shapes !== undefined)
			{
				for(var i=0; i<data.shapes.length; i++)											
				{	
					polygonsArray[i] = [];
					for(var j=0; j<data.shapes[i].length; j++)
					{
						polygonsArray[i][j]= data.shapes[i][j];
					}
				}

			}		
			normalization();
			fixMaxZ();
			Perspective3D();	
	    });	
	}

	
	

	function Draw3D(shapesArrayBoard)			//Drawing the objects on the screen
	{									
		console.log("Draw");
		ctx.globalAlpha = 1;
		clear();
		VisibPoly(shapesArrayBoard);													//the function checks which polygon to be displayed
		var i = 0;
		while(i<shapesArrayBoard.length)								//going through all polygons
		{
			if(shapesArrayBoard[i][shapesArrayBoard[i].length-4] == 1)		//if visibilty=1 -> draw polygon to screen
			{
				var k = 3;
				ctx.beginPath();   //first point of polygon
				ctx.moveTo(shapesArrayBoard[i][0]+CentreCanvasPoint, shapesArrayBoard[i][1]+CentreCanvasPoint);
				while(k<shapesArrayBoard[i].length-7)
				{
					ctx.lineTo(shapesArrayBoard[i][k]+CentreCanvasPoint, shapesArrayBoard[i][k+1]+CentreCanvasPoint);  //connect polygon points 
					k = k+3;
				}									
				ctx.closePath();    //close the polygon path
				ctx.globalAlpha = 1;
				ctx.stroke();
				ctx.globalAlpha = ValOpacity;
				ctx.fillStyle = shapesArrayBoard[i][shapesArrayBoard[i].length-6];
				ctx.fill();		
			}
			i++;	
		}
							
	}


	function Caval3D(angle)			//cavalier projection function
	{		
		var shapesArrayBoard = [];
		CavalAndCabinProjAngle = angle;
		console.log("Caval3D");
		ctx.globalAlpha = 1;
		clear();
		for(var i=0; i<polygonsArray.length; i++)					//copy from json array to temp array						
		{	
			shapesArrayBoard[i]=[];
			for(var k=0; k<polygonsArray[i].length; k++)
			{
				shapesArrayBoard[i][k] = polygonsArray[i][k];
			}
		}
		var Angle = 0;
		if(CavalAndCabinProjAngle == undefined)
		{
			Angle = 45;
		}
		else
		{
			Angle = CavalAndCabinProjAngle;
		}
		var ProjAngleX = Math.cos(-Angle*Math.PI/180);
		var ProjAngleY = Math.sin(-Angle*Math.PI/180);
		var i=0;
		while(i<shapesArrayBoard.length)
		{
			var k = 0;
			while(k<shapesArrayBoard[i].length-7)		//~where the point should be set on screen
			{
				shapesArrayBoard[i][k] = (shapesArrayBoard[i][k])+(shapesArrayBoard[i][k+2]*ProjAngleX);
				shapesArrayBoard[i][k+1] = (shapesArrayBoard[i][k+1])+(shapesArrayBoard[i][k+2]*ProjAngleY);
				k = k+3;
			}
			i++;
		}
		fixMaxZ();			//which maximale Z the polygon owns
		SortPolyZ(shapesArrayBoard);		//Sort polygons through their maximale Z
		Draw3D(shapesArrayBoard);			//Draw on screen
	}

	function Cabin3D(angle)		//cabinet projection function
	{		
		var shapesArrayBoard = [];
		CavalAndCabinProjAngle = angle;
		console.log("Caval3D");
		ctx.globalAlpha = 1;
		clear();
		for(var i=0; i<polygonsArray.length; i++)					//copy from json array to temp array						
		{	
			shapesArrayBoard[i] = [];
			for(var k=0; k<polygonsArray[i].length; k++)
			{
				shapesArrayBoard[i][k] = polygonsArray[i][k];
			}
		}
		var Angle;
		if(CavalAndCabinProjAngle == undefined)	//if the angle is set going to else if not to if.
		{
			Angle = 45;
		}
		else
		{
			Angle = CavalAndCabinProjAngle;
		}
		var ProjAngleX = Math.cos(-Angle*Math.PI/180);
		var ProjAngleY = Math.sin(-Angle*Math.PI/180);
		var i = 0;
		while(i<shapesArrayBoard.length)
		{
			var k = 0;
			while(k<shapesArrayBoard[i].length-7)
			{
				shapesArrayBoard[i][k] = (shapesArrayBoard[i][k])+(shapesArrayBoard[i][k+2]/2*ProjAngleX);
				shapesArrayBoard[i][k+1] = (shapesArrayBoard[i][k+1])+(shapesArrayBoard[i][k+2]/2*ProjAngleY);
				k = k+3;
			}
			i++;
		}
		fixMaxZ();			//which maximale Z the polygon owns
		SortPolyZ(shapesArrayBoard);		//Sort polygons through their maximale Z
		Draw3D(shapesArrayBoard);			//Draw on screen
							
	}

	function Perspective3D()		//perspective projection function
	{			
		var shapesArrayBoard = [];
		console.log("Perspective3D");
		clear();
		for(var i=0; i<polygonsArray.length; i++)			//copy from json array to temp array								
		{	
			shapesArrayBoard[i] = [];
			for(var k=0; k<polygonsArray[i].length; k++)
			{
				shapesArrayBoard[i][k] = polygonsArray[i][k];
			}
		}

		var i = 0;
		while(i<shapesArrayBoard.length)		//go through all polygons and calculate the coordinates
		{
			var k = 0;
			while(k<shapesArrayBoard[i].length-7)
			{
				shapesArrayBoard[i][k] = (shapesArrayBoard[i][k])/(1+shapesArrayBoard[i][k+2]/600);
				shapesArrayBoard[i][k+1] = (shapesArrayBoard[i][k+1])/(1+shapesArrayBoard[i][k+2]/600);
				k = k+3;
			}
			i++;
		}
		fixMaxZ();					//which maximale Z the polygon owns
		SortPolyZ(shapesArrayBoard);				//Sort polygons through their maximale Z
		Draw3D(shapesArrayBoard);					//Draw on screen
	}

	function Parallel3D(angle)		//parallel projection
	{	
		var shapesArrayBoard = [];
		CavalAndCabinProjAngle = angle;
		console.log("Parallel3D");
		clear();

		for(var i=0; i<polygonsArray.length; i++)			//copy from json array to temp array									
		{	
			shapesArrayBoard[i] = [];
			for(var k=0; k<polygonsArray[i].length; k++)
			{
				shapesArrayBoard[i][k] = polygonsArray[i][k];
			}
		}
		var i = 0;
		while(i<shapesArrayBoard.length)		//calculation
		{
			var k = 0;
			while(k<shapesArrayBoard[i].length-7)
			{
				shapesArrayBoard[i][k] = shapesArrayBoard[i][k];
				shapesArrayBoard[i][k+1] = shapesArrayBoard[i][k+1];
				k=k+3;
			}
			i++;
		}
		fixMaxZ();
		SortPolyZ(shapesArrayBoard);
		Draw3D(shapesArrayBoard);
	}


	function fixMaxZ()	//which maximale Z the polygon owns
	{			
		console.log("fixMaxZ");
		$(polygonsArray).each(function(key,value){					          	
			polygonsArray[key][polygonsArray[key].length-5] = -10000;	 // ZMax refreshing
			for (var i=2; i<polygonsArray[key].length-6; i+=3)
			{
		        if (polygonsArray[key][polygonsArray[key].length-5] < polygonsArray[key][i])
	          	{
	          		polygonsArray[key][polygonsArray[key].length-5] = polygonsArray[key][i];
	          	}
		    }
		});
	}

	function normalization() //calculate the normal from each polygon
	{			
		console.log("normalization");
		$(polygonsArray).each(function(key,value){
			var v1=[],v2=[];
			for(i=0;i<3;i++)
			{
			    v1[i] = polygonsArray[key][i+3]-polygonsArray[key][i];
			    v2[i] = polygonsArray[key][i+6]-polygonsArray[key][i+3];
			}
			polygonsArray[key][polygonsArray[key].length-3] = v1[1]*v2[2]-v1[2]*v2[1];
			polygonsArray[key][polygonsArray[key].length-2] = v1[2]*v2[0]-v1[0]*v2[2];
			polygonsArray[key][polygonsArray[key].length-1] = v1[0]*v2[1]-v1[1]*v2[0];
		});
	}

	function VisibPoly(shapesArrayBoard){		//visiability of polygons	
		console.log("VisibPoly");
		var NormX = 0;
		var NormY = 0;
		var NormZ = 0;
		var VectX = 0;
		var VectY = 0;
		var VectZ = 0;	
		var VisPol = 0;
		var AngleNormUser = 0;

		var Angle;
		if(CavalAndCabinProjAngle == undefined)
		{
			Angle = 45;
		}
		else
		{
			Angle = CavalAndCabinProjAngle;
		}
		var ProjAngleX = Math.cos(-Angle*Math.PI/180);
		var ProjAngleY = Math.sin(-Angle*Math.PI/180);
		var xtovec = 0;
		var ytovec = 0;
		var ztovec = 0;	

		switch(flag){
			case 'caval3d':// cavalier projection
			xtovec = 0+(5000*ProjAngleX);
			ytovec = 0+(5000*ProjAngleY);
			ztovec = 5000;
			break;
			case 'cabin3d':// cabinet projection
			xtovec = 0+(5000/2*ProjAngleX);
			ytovec = 0+(5000/2*ProjAngleY);
			ztovec = 5000;
			break;
			default://not caval & not cabinet
			xtovec = 0;
			ytovec = 0;
			ztovec = 800;
			break;
		}

		for(var i=0; i<shapesArrayBoard.length;i++)				//check the angle between C.O.P & Polygon Normal
		{			      
			var NormX = shapesArrayBoard[i][shapesArrayBoard[i].length-3];
			var NormY = shapesArrayBoard[i][shapesArrayBoard[i].length-2];
			var NormZ = shapesArrayBoard[i][shapesArrayBoard[i].length-1];
			var VectX = shapesArrayBoard[i][0]-(xtovec);
			var VectY = shapesArrayBoard[i][1]-(ytovec);
			var VectZ = shapesArrayBoard[i][2]-(-ztovec);
			var VisPol = Math.acos((VectX*NormX+VectY*NormY+VectZ*NormZ)/(Math.sqrt(Math.pow(VectX,2)+Math.pow(VectY,2)+Math.pow(VectZ,2))*Math.sqrt(Math.pow(NormX,2)+Math.pow(NormY,2)+Math.pow(NormZ,2)))); // calc angle between normal and C.O.P
			AngleNormUser = VisPol*(180/Math.PI); // from rad to deg
				  
			if(ValOpacity!==undefined && ValOpacity<1 && ValOpacity>=0)			//works with opacity
			{
		   		shapesArrayBoard[i][shapesArrayBoard[i].length-4]=1;
		    }
			else
		    {
				if(Math.cos(AngleNormUser*(Math.PI/180))<0)  
				{
					shapesArrayBoard[i][shapesArrayBoard[i].length-4] = 1;
				}
				else{shapesArrayBoard[i][shapesArrayBoard[i].length-4] = 0;}
		    }

		}
	}


	function Rotation3DX(angle)		//rotation function on X
	{	
		Rotation3DDeg = angle;
		console.log("Rotation3DX");
		var AngleRotXUser = 0;
		if(Rotation3DDeg == undefined)
		{
			AngleRotXUser = 5;
		}
		else
		{
			AngleRotXUser = Rotation3DDeg;
		}
		var Yrot = 0;
		var Zrot = 0;
		for(var i=0; i<polygonsArray.length;i++)
		{			         
			for(var k=0;k<polygonsArray[i].length-7;k+=3)
		    {
		        Yrot = polygonsArray[i][k+1];
		        Zrot = polygonsArray[i][k+2];
		        polygonsArray[i][k+1] = Yrot*Math.cos(AngleRotXUser*Math.PI/180)+Zrot*(-1*Math.sin(AngleRotXUser*Math.PI/180));
				polygonsArray[i][k+2] = Yrot*Math.sin(AngleRotXUser*Math.PI/180)+Zrot*Math.cos(AngleRotXUser*Math.PI/180);
		    }
			Yrot = polygonsArray[i][polygonsArray[i].length-2];
			Zrot = polygonsArray[i][polygonsArray[i].length-1];
			polygonsArray[i][polygonsArray[i].length-2] = Yrot*Math.cos(AngleRotXUser*Math.PI/180)+Zrot*(-1*Math.sin(AngleRotXUser*Math.PI/180)); // Y normal rotation
			polygonsArray[i][polygonsArray[i].length-1] = Yrot*Math.sin(AngleRotXUser*Math.PI/180)+Zrot*Math.cos(AngleRotXUser*Math.PI/180);	// Z normal rotation	          		
		}
		projection();
									
	}

	function Rotation3DY(angle)				//rotation on Y
	{
		Rotation3DDeg = angle;
		console.log("Rotation3DY");
		var AngleRotXUser = 0;
		if(Rotation3DDeg == undefined)
		{
			AngleRotXUser = 5;
		}
		else
		{
			AngleRotXUser = Rotation3DDeg;
		}
		var Xrot = 0;
		var Zrot = 0;
		for(var i=0; i<polygonsArray.length;i++)
		{			         
			for(var k=0;k<polygonsArray[i].length-7;k+=3)
			{
		    	Xrot = polygonsArray[i][k];
		    	Zrot = polygonsArray[i][k+2];
		    	polygonsArray[i][k] = Xrot*Math.cos(AngleRotXUser*Math.PI/180)+Zrot*(-1*Math.sin(AngleRotXUser*Math.PI/180));
				polygonsArray[i][k+2] = Xrot*Math.sin(AngleRotXUser*Math.PI/180)+Zrot*Math.cos(AngleRotXUser*Math.PI/180);
		    }
			Xrot = polygonsArray[i][polygonsArray[i].length-3];
			Zrot = polygonsArray[i][polygonsArray[i].length-1];
			polygonsArray[i][polygonsArray[i].length-3] = Xrot*Math.cos(AngleRotXUser*Math.PI/180)+Zrot*(-1*Math.sin(AngleRotXUser*Math.PI/180)); // X normal rotation
			polygonsArray[i][polygonsArray[i].length-1] = Xrot*Math.sin(AngleRotXUser*Math.PI/180)+Zrot*Math.cos(AngleRotXUser*Math.PI/180);	// Z normal rotation		          		
		}
		projection();
									
	}

	function Rotation3DZ(angle)			//rotation on Z
	{	
		Rotation3DDeg = angle;
		console.log("Rotate3DZ");
		var AngleRotXUser = 0;
		if(Rotation3DDeg == undefined)
		{
			AngleRotXUser = 5;
		}
		else
		{
			AngleRotXUser = Rotation3DDeg;
		}
		var Xrot = 0;
		var Yrot = 0;
		for(var i=0; i<polygonsArray.length;i++)
		{			         
			for(var k=0;k<polygonsArray[i].length-7;k+=3)
			{
		    	Xrot = polygonsArray[i][k];
		    	Yrot = polygonsArray[i][k+1];
		    	polygonsArray[i][k] = Xrot*Math.cos(AngleRotXUser*Math.PI/180)+Yrot*Math.sin(AngleRotXUser*Math.PI/180);
				polygonsArray[i][k+1] = Xrot*(-1*Math.sin(AngleRotXUser*Math.PI/180))+Yrot*Math.cos(AngleRotXUser*Math.PI/180);
		    }
			Xrot = polygonsArray[i][polygonsArray[i].length-3];
			Yrot = polygonsArray[i][polygonsArray[i].length-2];
			polygonsArray[i][polygonsArray[i].length-3] = Xrot*Math.cos(AngleRotXUser*Math.PI/180)+Yrot*Math.sin(AngleRotXUser*Math.PI/180); // Y normal rotation
			polygonsArray[i][polygonsArray[i].length-2] = Xrot*(-1*Math.sin(AngleRotXUser*Math.PI/180))+Yrot*Math.cos(AngleRotXUser*Math.PI/180);	// Z normal rotation			          		
		}
		projection();								
	}

	function SortPolyZ(shapesArrayBoard)				//sorting polygons by their maximale Z
	{
		console.log("SortPolyZ");
		for (var i=0;i<shapesArrayBoard.length-1;i++)
		{
			for (var j=0;j<shapesArrayBoard.length-i-1;j++)
			{
				if(shapesArrayBoard[j][shapesArrayBoard[j].length-5] < shapesArrayBoard[j+1][shapesArrayBoard[j].length-5])
				{
					if (shapesArrayBoard[j].length == shapesArrayBoard[j+1].length)     //if the arrays lengths are equal
					{
						for(var k=0;k<shapesArrayBoard[j].length;k++)
						{
							PolyZSortArr[k] = shapesArrayBoard[j][k];
							shapesArrayBoard[j][k] = shapesArrayBoard[j+1][k];
							shapesArrayBoard[j+1][k] = PolyZSortArr[k];
						}
					}
					else
					{
						var temp1 = [];
						var temp2 = [];					
						for(var s=0;s<shapesArrayBoard[j].length;s++)
						{
							temp1[s] = shapesArrayBoard[j][s];
						}
						for(var s=0;s<shapesArrayBoard[j+1].length;s++)
						{
							temp2[s] = shapesArrayBoard[j+1][s];
						}
						shapesArrayBoard[j] = [];
						shapesArrayBoard[j+1] = [];
						for(var s=0;s<temp2.length;s++)
						{
							shapesArrayBoard[j][s] = temp2[s];
						}
						for(var s=0;s<temp1.length;s++)
						{
							shapesArrayBoard[j+1][s] = temp1[s];
						}
					}
				}
			}	
		}
	}

	function Resize3D()					//resizing function
	{	
		console.log("Resize3D");
		for(var i=0; i<polygonsArray.length;i++)
		{			         
		   	for(var k=0;k<polygonsArray[i].length-7;k+=3)
			{
				polygonsArray[i][k] = polygonsArray[i][k]*Zoom3d;
				polygonsArray[i][k+1] = polygonsArray[i][k+1]*Zoom3d;
				polygonsArray[i][k+2] = polygonsArray[i][k+2]*Zoom3d;
			}
		}
		normalization();
		projection();

	}	


	function Move3D()				//moving objects on the grid
	{
		console.log("Move3D");
		for(var i=0; i<polygonsArray.length;i++)
		{			     
			for(var k=0;k<polygonsArray[i].length-7;k+=3)
			{
				polygonsArray[i][k] = polygonsArray[i][k]+parseFloat(Move3DValX);
				polygonsArray[i][k+1] = polygonsArray[i][k+1]+parseFloat(Move3DValY);
				polygonsArray[i][k+2] = polygonsArray[i][k+2]+parseFloat(Move3DValZ);
			}
		}	

		normalization();
		projection();

	}

	function projection(){
		fixMaxZ();
		switch(flag){
			case 'perspective3d':
			case 'reload':
			case 'rotateX3d':
			case 'rotateY3d':
			case 'rotateZ3d':
			case 'zoomIn':
			case 'zoomOut':
			Perspective3D();
			break;
			case 'caval3d':
			Caval3D();
			break;
			case 'cabin3d':
			Cabin3D();
			break;
			case 'parallel3d':
			Cabin3D();
			break;	
		}
	}

});
