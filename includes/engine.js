/*
	Oran Moshe 300989480
	Shir Gabai 305278350
	Naama Kapach 305648610
*/

$(document).ready(function(){

	var c = document.getElementById("myCanvas"),
	ctx = c.getContext("2d"),
	rect = c.getBoundingClientRect();
	var flag = "";
	var projectionType = "";

	/**/
	var CentreCanvasPoint = 600;         // center of canvas
	var CanvasSizePoint = 1200;			// size of canvas
	var canvas = document.getElementById("myCanvas");
	var contex = canvas.getContext('2d');
	var PageBackGround = "#369369";
	contex.fillStyle = PageBackGround;
	contex.fillRect(0, 0, CanvasSizePoint, CanvasSizePoint);
	var ProjectionCheck = 0;
	var zoom = 0;
	var rotationAngle=0;
	var projectionAngle=45;
	var ValOpacity = 1;
	var PolygonFromJson = [];
	var PolyTempJson = [];
	var PolyZSortArr = [];

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
				ProjectionCheck = 0;
				Perspective3D();
				break;	
			}
			case 'caval':{
				ProjectionCheck = 1;
				Caval3D();
				break;	
			}
			case 'cabin':{
				ProjectionCheck = 2;
				Cabin3D();
				break;	
			}
			case 'parallel':{
				ProjectionCheck = 3;
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


Get3DPic ()
function Get3DPic ()		//Get the objects from the JSON
{ 				
	console.log("Hohoho");
	$.getJSON('http://localhost/graphics/Ex3/computer-graphics/includes/PolygonsList.json', function(data) 
	{
		if(data.Polygon !== undefined)
		{
			for(var i=0; i<data.Polygon.length; i++)											
			{	
				PolygonFromJson[i] = [];
				for(var k=0; k<data.Polygon[i].length; k++)
				{
					PolygonFromJson[i][k]= data.Polygon[i][k];
				}
				for(j=0;j<5;j++)
				{
					PolygonFromJson[i][PolygonFromJson[i].length]=0;
				}
			}
		}		    
		PolyNormal();
		PolyZMax();
		Perspective3D();																		
	});
}


function Draw3D()			//Drawing the objects on the screen
{									
	console.log("Draw");
	VisibPoly();													//the function checks which polygon to be displayed
	var i = 0;
	while(i<PolyTempJson.length)								//going through all polygons
	{
		if(PolyTempJson[i][PolyTempJson[i].length-4] == 1)		//if visibilty=1 -> draw polygon to screen
		{
			var k = 3;
			contex.beginPath();   //first point of polygon
			contex.moveTo(PolyTempJson[i][0]+CentreCanvasPoint, PolyTempJson[i][1]+CentreCanvasPoint);
			while(k<PolyTempJson[i].length-7)
			{
				contex.lineTo(PolyTempJson[i][k]+CentreCanvasPoint, PolyTempJson[i][k+1]+CentreCanvasPoint);  //connect polygon points 
				k = k+3;
			}									
			contex.closePath();    //close the polygon path
			contex.globalAlpha = 1;
			contex.stroke();
			contex.globalAlpha = ValOpacity;
			contex.fillStyle = PolyTempJson[i][PolyTempJson[i].length-6];
			contex.fill();		
		}
		i++;	
	}
						
}


function Caval3D()			//cavalier projection function
{		
	console.log("Caval3D");
	contex.fillStyle = "#369369";
	contex.globalAlpha = 1;
	contex.fillRect(0, 0, CanvasSizePoint, CanvasSizePoint);
	for(var i=0; i<PolygonFromJson.length; i++)					//copy from json array to temp array						
	{	
		PolyTempJson[i]=[];
		for(var k=0; k<PolygonFromJson[i].length; k++)
		{
			PolyTempJson[i][k] = PolygonFromJson[i][k];
		}
	}
	var Angle = 0;
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
	var i=0;
	while(i<PolyTempJson.length)
	{
		var k = 0;
		while(k<PolyTempJson[i].length-7)		//~where the point should be set on screen
		{
			PolyTempJson[i][k] = (PolyTempJson[i][k])+(PolyTempJson[i][k+2]*ProjAngleX);
			PolyTempJson[i][k+1] = (PolyTempJson[i][k+1])+(PolyTempJson[i][k+2]*ProjAngleY);
			k = k+3;
		}
		i++;
	}
	PolyZMax();			//which maximale Z the polygon owns
	SortPolyZ();		//Sort polygons through their maximale Z
	Draw3D();			//Draw on screen
}

function Cabin3D()		//cabinet projection function
{		
	console.log("Caval3D");
	contex.fillStyle = "#369369";
	contex.globalAlpha = 1;
	contex.fillRect(0, 0, CanvasSizePoint, CanvasSizePoint);
	for(var i=0; i<PolygonFromJson.length; i++)					//copy from json array to temp array						
	{	
		PolyTempJson[i] = [];
		for(var k=0; k<PolygonFromJson[i].length; k++)
		{
			PolyTempJson[i][k] = PolygonFromJson[i][k];
		}
	}
	var Angle;
	if(projectionAngle == undefined)	//if the angle is set going to else if not to if.
	{
		Angle = 45;
	}
	else
	{
		Angle = projectionAngle;
	}
	var ProjAngleX = Math.cos(-Angle*Math.PI/180);
	var ProjAngleY = Math.sin(-Angle*Math.PI/180);
	var i = 0;
	while(i<PolyTempJson.length)
	{
		var k = 0;
		while(k<PolyTempJson[i].length-7)
		{
			PolyTempJson[i][k] = (PolyTempJson[i][k])+(PolyTempJson[i][k+2]/2*ProjAngleX);
			PolyTempJson[i][k+1] = (PolyTempJson[i][k+1])+(PolyTempJson[i][k+2]/2*ProjAngleY);
			k = k+3;
		}
		i++;
	}
	PolyZMax();			//which maximale Z the polygon owns
	SortPolyZ();		//Sort polygons through their maximale Z
	Draw3D();			//Draw on screen
						
}

function Perspective3D()		//perspective projection function
{			
	console.log("Perspective3D");
	contex.fillStyle = "#369369";
	contex.fillRect(0, 0, CanvasSizePoint, CanvasSizePoint);

	for(var i=0; i<PolygonFromJson.length; i++)			//copy from json array to temp array								
	{	
		PolyTempJson[i] = [];
		for(var k=0; k<PolygonFromJson[i].length; k++)
		{
			PolyTempJson[i][k] = PolygonFromJson[i][k];
		}
	}

	var i = 0;
	while(i<PolyTempJson.length)		//go through all polygons and calculate the coordinates
	{
		var k = 0;
		while(k<PolyTempJson[i].length-7)
		{
			PolyTempJson[i][k] = (PolyTempJson[i][k])/(1+PolyTempJson[i][k+2]/600);
			PolyTempJson[i][k+1] = (PolyTempJson[i][k+1])/(1+PolyTempJson[i][k+2]/600);
			k = k+3;
		}
		i++;
	}
	PolyZMax();					//which maximale Z the polygon owns
	SortPolyZ();				//Sort polygons through their maximale Z
	Draw3D();					//Draw on screen
}

function Parallel3D()		//parallel projection
{		
	console.log("Parallel3D");
	contex.fillStyle = "#369369";
	contex.fillRect(0, 0, CanvasSizePoint, CanvasSizePoint);

	for(var i=0; i<PolygonFromJson.length; i++)			//copy from json array to temp array									
	{	
		PolyTempJson[i] = [];
		for(var k=0; k<PolygonFromJson[i].length; k++)
		{
			PolyTempJson[i][k] = PolygonFromJson[i][k];
		}
	}
	var i = 0;
	while(i<PolyTempJson.length)		//calculation
	{
		var k = 0;
		while(k<PolyTempJson[i].length-7)
		{
			PolyTempJson[i][k] = PolyTempJson[i][k];
			PolyTempJson[i][k+1] = PolyTempJson[i][k+1];
			k=k+3;
		}
		i++;
	}
	PolyZMax();
	SortPolyZ();
	Draw3D();
}


function PolyZMax()			//which maximale Z the polygon owns
{			
	console.log("PolyZMax");
	for(var i=0; i<PolygonFromJson.length;i++)	
	{			          	
		PolygonFromJson[i][PolygonFromJson[i].length-5] = -10000;	 // ZMax refreshing
		for (var k=2; k<PolygonFromJson[i].length-6; k+=3)
		{
	        if (PolygonFromJson[i][PolygonFromJson[i].length-5] < PolygonFromJson[i][k])
          	{
          		PolygonFromJson[i][PolygonFromJson[i].length-5] = PolygonFromJson[i][k];
          	}
	    }
	}
}

function PolyNormal()		//calculate the normal from each polygon
{			
	console.log("PolyNormal");
	for(var i=0; i<PolygonFromJson.length;i++)
	{			         
		var vector1 = [];
		var vector2 = []; 	
		for(k=0;k<3;k++)
		{
		    vector1[k] = PolygonFromJson[i][k+3]-PolygonFromJson[i][k];
		    vector2[k] = PolygonFromJson[i][k+6]-PolygonFromJson[i][k+3];
		}
		PolygonFromJson[i][PolygonFromJson[i].length-3] = vector1[1]*vector2[2]-vector1[2]*vector2[1];
		PolygonFromJson[i][PolygonFromJson[i].length-2] = vector1[2]*vector2[0]-vector1[0]*vector2[2];
		PolygonFromJson[i][PolygonFromJson[i].length-1] = vector1[0]*vector2[1]-vector1[1]*vector2[0];
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
	if (ProjectionCheck == 1)    // cavalier projection
	{
		xtovec = 0+(5000*ProjAngleX);
		ytovec = 0+(5000*ProjAngleY);
		ztovec = 5000;
	}
	else if(ProjectionCheck == 2)		// cabinet projection
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

	for(var i=0; i<PolyTempJson.length;i++)				//check the angle between C.O.P & Polygon Normal
	{			      
		NormX = PolyTempJson[i][PolyTempJson[i].length-3];
		NormY = PolyTempJson[i][PolyTempJson[i].length-2];
		NormZ = PolyTempJson[i][PolyTempJson[i].length-1];
		VectX = PolyTempJson[i][0]-(xtovec);
		VectY = PolyTempJson[i][1]-(ytovec);
		VectZ = PolyTempJson[i][2]-(-ztovec);

		VisPol = Math.acos((VectX*NormX+VectY*NormY+VectZ*NormZ)/(Math.sqrt(Math.pow(VectX,2)+Math.pow(VectY,2)+Math.pow(VectZ,2))*Math.sqrt(Math.pow(NormX,2)+Math.pow(NormY,2)+Math.pow(NormZ,2)))); // calc angle between normal and C.O.P
		AngleNormUser = VisPol*(180/Math.PI); // from rad to deg
			  
		// if(ValOpacity!==undefined && ValOpacity<1 && ValOpacity>=0)			//works with opacity
		// {
	 //   		PolyTempJson[i][PolyTempJson[i].length-4]=1;
	 //    }
		// else
	 //    {
			if(Math.cos(AngleNormUser*(Math.PI/180))<0)  
			{
				PolyTempJson[i][PolyTempJson[i].length-4] = 1;
			}
			else{PolyTempJson[i][PolyTempJson[i].length-4] = 0;}
	    // }

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
	for(var i=0; i<PolygonFromJson.length;i++)
	{			         
		for(var k=0;k<PolygonFromJson[i].length-7;k+=3)
	    {
	        Yrot = PolygonFromJson[i][k+1];
	        Zrot = PolygonFromJson[i][k+2];
	        PolygonFromJson[i][k+1] = Yrot*Math.cos(AngleRotXUser*Math.PI/180)+Zrot*(-1*Math.sin(AngleRotXUser*Math.PI/180));
			PolygonFromJson[i][k+2] = Yrot*Math.sin(AngleRotXUser*Math.PI/180)+Zrot*Math.cos(AngleRotXUser*Math.PI/180);
	    }
		Yrot = PolygonFromJson[i][PolygonFromJson[i].length-2];
		Zrot = PolygonFromJson[i][PolygonFromJson[i].length-1];
		PolygonFromJson[i][PolygonFromJson[i].length-2] = Yrot*Math.cos(AngleRotXUser*Math.PI/180)+Zrot*(-1*Math.sin(AngleRotXUser*Math.PI/180)); // Y normal rotation
		PolygonFromJson[i][PolygonFromJson[i].length-1] = Yrot*Math.sin(AngleRotXUser*Math.PI/180)+Zrot*Math.cos(AngleRotXUser*Math.PI/180);	// Z normal rotation	          		
	}

	PolyZMax();
	if (ProjectionCheck == 1)
	{
		Caval3D();
	}
	else if(ProjectionCheck == 2)
	{
		Cabin3D();
	}
	else if(ProjectionCheck == 3)
	{
		Parallel3D();
	}
	else
	{		
		Perspective3D();
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
	for(var i=0; i<PolygonFromJson.length;i++)
	{			         
		for(var k=0;k<PolygonFromJson[i].length-7;k+=3)
		{
	    	Xrot = PolygonFromJson[i][k];
	    	Zrot = PolygonFromJson[i][k+2];
	    	PolygonFromJson[i][k] = Xrot*Math.cos(AngleRotXUser*Math.PI/180)+Zrot*(-1*Math.sin(AngleRotXUser*Math.PI/180));
			PolygonFromJson[i][k+2] = Xrot*Math.sin(AngleRotXUser*Math.PI/180)+Zrot*Math.cos(AngleRotXUser*Math.PI/180);
	    }
		Xrot = PolygonFromJson[i][PolygonFromJson[i].length-3];
		Zrot = PolygonFromJson[i][PolygonFromJson[i].length-1];
		PolygonFromJson[i][PolygonFromJson[i].length-3] = Xrot*Math.cos(AngleRotXUser*Math.PI/180)+Zrot*(-1*Math.sin(AngleRotXUser*Math.PI/180)); // X normal rotation
		PolygonFromJson[i][PolygonFromJson[i].length-1] = Xrot*Math.sin(AngleRotXUser*Math.PI/180)+Zrot*Math.cos(AngleRotXUser*Math.PI/180);	// Z normal rotation		          		
	}
	PolyZMax();
	if (ProjectionCheck == 1)
	{
		Caval3D();
	}
	else if(ProjectionCheck == 2)
	{
		Cabin3D();
	}
	else if(ProjectionCheck == 3)
	{
		Parallel3D();
	}
	else
	{	
		Perspective3D();
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
	for(var i=0; i<PolygonFromJson.length;i++)
	{			         
		for(var k=0;k<PolygonFromJson[i].length-7;k+=3)
		{
	    	Xrot = PolygonFromJson[i][k];
	    	Yrot = PolygonFromJson[i][k+1];
	    	PolygonFromJson[i][k] = Xrot*Math.cos(AngleRotXUser*Math.PI/180)+Yrot*Math.sin(AngleRotXUser*Math.PI/180);
			PolygonFromJson[i][k+1] = Xrot*(-1*Math.sin(AngleRotXUser*Math.PI/180))+Yrot*Math.cos(AngleRotXUser*Math.PI/180);
	    }
		Xrot = PolygonFromJson[i][PolygonFromJson[i].length-3];
		Yrot = PolygonFromJson[i][PolygonFromJson[i].length-2];
		PolygonFromJson[i][PolygonFromJson[i].length-3] = Xrot*Math.cos(AngleRotXUser*Math.PI/180)+Yrot*Math.sin(AngleRotXUser*Math.PI/180); // Y normal rotation
		PolygonFromJson[i][PolygonFromJson[i].length-2] = Xrot*(-1*Math.sin(AngleRotXUser*Math.PI/180))+Yrot*Math.cos(AngleRotXUser*Math.PI/180);	// Z normal rotation			          		
	}

	PolyZMax();

	if (ProjectionCheck == 1)
	{
		Caval3D();
	}
	else if(ProjectionCheck == 2)
	{
		Cabin3D();
	}
	else if(ProjectionCheck == 3)
	{
		Parallel3D();
	}
	else
	{		
		Perspective3D();
	}								
}

function SortPolyZ()				//sorting polygons by their maximale Z
{
	console.log("SortPolyZ");
	for (var i=0;i<PolyTempJson.length-1;i++)
	{
		for (var j=0;j<PolyTempJson.length-i-1;j++)
		{
			if(PolyTempJson[j][PolyTempJson[j].length-5] < PolyTempJson[j+1][PolyTempJson[j].length-5])
			{
				if (PolyTempJson[j].length == PolyTempJson[j+1].length)     //if the arrays lengths are equal
				{
					for(var k=0;k<PolyTempJson[j].length;k++)
					{
						PolyZSortArr[k] = PolyTempJson[j][k];
						PolyTempJson[j][k] = PolyTempJson[j+1][k];
						PolyTempJson[j+1][k] = PolyZSortArr[k];
					}
				}
				else
				{
					var temp1 = [];
					var temp2 = [];					
					for(var s=0;s<PolyTempJson[j].length;s++)
					{
						temp1[s] = PolyTempJson[j][s];
					}
					for(var s=0;s<PolyTempJson[j+1].length;s++)
					{
						temp2[s] = PolyTempJson[j+1][s];
					}
					PolyTempJson[j] = [];
					PolyTempJson[j+1] = [];
					for(var s=0;s<temp2.length;s++)
					{
						PolyTempJson[j][s] = temp2[s];
					}
					for(var s=0;s<temp1.length;s++)
					{
						PolyTempJson[j+1][s] = temp1[s];
					}
				}
			}
		}	
	}
}


function Resize3D()					//resizing function
{	
	console.log("Resize3D");
	for(var i=0; i<PolygonFromJson.length;i++)
	{			         
	   	for(var k=0;k<PolygonFromJson[i].length-7;k+=3)
		{
			PolygonFromJson[i][k] = PolygonFromJson[i][k]*zoom;
			PolygonFromJson[i][k+1] = PolygonFromJson[i][k+1]*zoom;
			PolygonFromJson[i][k+2] = PolygonFromJson[i][k+2]*zoom;
		}
	}
	PolyNormal();
	PolyZMax();
	if (ProjectionCheck == 1)
	{
		Caval3D();
	}
	else if(ProjectionCheck == 2)
	{
		Cabin3D();
	}
	else if(ProjectionCheck == 3)
	{
		Parallel3D();
	}
	else
	{		
		Perspective3D();
	}

}	


function Move3D()				//moving objects on the grid
{
	console.log("Move3D");
	for(var i=0; i<PolygonFromJson.length;i++)
	{			     
		for(var k=0;k<PolygonFromJson[i].length-7;k+=3)
		{
			PolygonFromJson[i][k] = PolygonFromJson[i][k]+parseFloat(0);
			PolygonFromJson[i][k+1] = PolygonFromJson[i][k+1]+parseFloat(0);
			PolygonFromJson[i][k+2] = PolygonFromJson[i][k+2]+parseFloat(0);
		}
	}	

	PolyNormal();

	if (ProjectionCheck == 1)
	{
		Caval3D();
	}
	else if(ProjectionCheck == 2)
	{
		Cabin3D();
	}
	else if(ProjectionCheck == 3)
	{
		Parallel3D();
	}
	else
	{		
		Perspective3D();
	}

}


});
