google.load("visualization", "1", {packages:["corechart"]});
google.load('visualization', '1', {packages:['table']});
//google.setOnLoadCallback(drawChart);

$(function(){
	$('.box').on('click',function(e){
		e.preventDefault();
		$('.box.completed').removeClass('completed');
		$(this).addClass('completed');
		var index = $(this).html(),
		timeF = $($('.time')[0]),
		timeT = $($('.time')[1]),
		timeFrom = "",
		timeTo = "",
		separate = "";
		for(var i=2;i>=0;i--){
			timeFrom += separate + (timeF.find("input")[i].value).toString();
			timeTo += separate + (timeT.find("input")[i].value).toString();
			separate = "-";
		}
		url = "http://yellowadmin.projects.spaceshiplabs.com/api/getDataByQuestion/"
		//url = "http://yellowadmin/api/getDataByQuestion/"
		$.ajax({
			url: url,
			crossDomain : true,
			type:'post',
			dataType : 'jsonp',
			data : {
				question:index,
				from:timeFrom,
				to:timeTo
			}, 
			success:drawQuestion
		})
		//change question
		$('.survey p').html(survey[index].en);
	});


	$('.up').on('click',function(){
		//$(this).parent().prev()[0].stepUp();
		var input = $(this).parent().prev()[0];
		if(input.value == input.max)
			input.value = input.min-1;
		input.stepUp();
	});

	$('.down').on('click',function(){
		var input = $(this).parent().prev()[0];
		if(input.value == input.min)
			input.value = parseInt(input.max)+1;
		input.stepDown();
	});

	$('.month + .arrows,.year + .arrows').on('click',function(){
		select= $(this).parent().parent().find('input'),
		month = select[1].value - 1,
		day = 27,
		year = select[2].value,
		date = new Date(year,month,day);
		lastDayFind = false;
		while(!lastDayFind){
			date.setDate(++day);
			if(date.getMonth()!=month){
				lastDayFind = true;
				day--;
			}
		}
		console.log("last: "+day);
		console.log(day,year,month,date);
		select[0].max = day;
		if(select[0].value > day)
			select[0].value = day;
	});

	var day = new Date(),
	time = $('.time p input');
	var j=5;
	for(var i=2;i>0;i--){
		time.eq(j--).val(day.getFullYear());
		time.eq(j--).val(day.getMonth()+1);
		time.eq(j--).val(day.getDate());
		
		day.setMonth(day.getMonth()-1);
	}
	
	$('.month + .arrows, .down, .up').trigger('click');

	$('.box.completed').trigger('click');

});

function drawQuestion(question){
	var data = getQuestionTable(question),
	options, chart;
	if($('.completed').html()==10){
		chart = new google.visualization.Table(document.getElementById('chart'));
		options = {showRowNumber: true}
	}else{
		options = {
			pieHole: 0.5,
			backgroundColor: 'transparent',
			colors:['#FFDD02','#DBBE0B','#A38F0A'],
			pieSliceBorderColor:'none',
			pieSliceTextStyle:{color:'#888984',fontSize:18,fontWeight:'bold'},
			chartArea:{width:350,height:350,left:90},
			legend:{
					textStyle:{
					fontSize:20,
					color:'#888984'
				},
				position:'right',
				alignment:'center'
			},
			height:300
		};
		chart = new google.visualization.PieChart(document.getElementById('chart'));
	}
	chart.draw(data,options);
}

function getQuestionTable(question){
	var table = [
		['Name', 'percentage']
	];
	for(var i in question){
		table.push([i,question[i]]);
	}

	return google.visualization.arrayToDataTable(table);
}

function moveText(i,select){
	select = $(select);
	var svg = $("svg"),
	svgW = 236,
	x1 = svgW/2, 
	y1 = svg.height()/2,
	w = select.attr("x"),
	h = select.attr("y"),
	
	section = [[-1,-1],[1,-1],[1,1],[-1,1]];
	if(w <= x1 && h <= y1){
		s = 0;
	}else if(w > x1 && h <= y1){
		s = 1;
	}else if(w > x1 && h > y1){
		s = 2;
	}else{
		s = 3;
	}
	console.log(s);
	var path = select.prev();
	bounding = path[0].getBoundingClientRect();
	select.attr("x",parseFloat(w)+(section[s][0]*(55)));
	select.attr("y",parseFloat(h)+(section[s][1]*(55)));
}

function resetTime(select){

}
