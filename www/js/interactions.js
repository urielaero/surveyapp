var score = [0,0,0,0,0,0,0,0,0,0,0];
$(function(){
	$('.box').on('click',function(e){
		e.preventDefault();
		var box = $(this);
		changeQuestion(box.html());
		$('.box.on').removeClass('on').addClass('completed');
		box.addClass('on');
	});
	
	$('.range .circle').on('click',function(e){
		e.preventDefault();
		var index = $('.box.on').html();
		$('.range .circle.select').removeClass('select');
		$(this).addClass('select');
		score[index-1] = $(this).parent().attr('class').split(' ')[1];
		//next
		setTimeout(function(){
			var box = $('.box');
			$(box[index]).trigger('click');	
		},200)
	})


	$('.type ul li input').on('click',function(e){
		$('.type ul li input.on').removeClass('on');
		$(this).addClass('on');
	})

	$('li .save').on('click',function(e){
		e.preventDefault();
		//save text
		score[9] = [];
		$('.input.text ul li input').each(saveText);
		score[10] = [];
		$('.input.save ul li input').each(saveText);
		//encuestador id
		score[11] = sessionStorage['pollster'];
		localStorage[$('.hidden.id').html()] = JSON.stringify(score);
		window.location = 'index.html';
		//window.location = 'survey.html';
	})

	var nextSurvey = 0;
	for(var i in localStorage){	
		if(isFinite(i))
			nextSurvey++;
	}

	$('.hidden.id').html(nextSurvey)

	$('.box.on').trigger('click');

	$('a[href="#exportar"]').on('click',function(e){
		e.preventDefault();	
		var csv = '';
		for(var i in survey){
			csv += survey[i].en+',';
		}
		//csv = csv.substr(0,csv.length-1);
		csv +="pollster";
		csv +='\n';
		var data,
		listPoll = JSON.parse(localStorage['pollster_list']);
		for(i in localStorage){
			if(isFinite(i)){
				data = JSON.parse(localStorage[i]);

				for(var j in data){
					if(j==11){
						data[j] = listPoll[data[j]];
					}else if(data[j].constructor == Array){
						data[j] = '"'+data[j].toString() +'"';
					}

				}
				csv += data.toString()+'\n';
			}

		}
		console.log(csv);
		var csvJson = JSON.stringify(csv),
		url = "http://yellowadmin.projects.spaceshiplabs.com/api/exportEmail/";
		//url = "http://yellowadmin/api/exportEmail/";
		$.ajax({
			url: url,
			crossDomain : true,
			type:'post',
			dataType : 'jsonp',
			data : {data:csvJson}, 
			success:function(d){
				if(d.status==true){
					alert('Datos enviados.');
				}else{
					alert('Error al exportar.');
				}

			},
			error:function(){
				alert('Error al exportar.');
			}
		})

	});

	$('a[href="#actualizar"]').on('click',function(e){
		e.preventDefault();
		var data = [],
		d;
		for(var i in localStorage){
			if(isFinite(i)){
				d = JSON.parse(localStorage[i]);
				data.push(d);		
			}

		}
		console.log(d);
		var temp = JSON.stringify(data),
		url = "http://yellowadmin.projects.spaceshiplabs.com/api/update/";
		//url = "http://yellowadmin/api/update/";
		$.ajax({
			url: url,
			crossDomain : true,
			type:'post',
			dataType : 'jsonp',
			data : {data:temp}, 
			success:function(d){
				console.log(data);
				for(var i in data){
					data[i][10][2] = d[i];
					localStorage[i] = JSON.stringify(data[i])
				}
				console.log(data);
				alert('Actualizado.');
			},
			error:function(d){
				alert('Problema al conectar.');
			}

		})
		
	});

	/*
	var wrap = $('#wrap');
	if(wrap.hasClass('init_survey')){//survey
		sessionStorage['mode_survey'] = 1;
		document.addEventListener('backbutton',function(){
			window.location = 'survey.html';
		},false)
	}
	
	*/
	if($('#wrap').hasClass('main')){//index
		if(sessionStorage['pollster'] && sessionStorage['pollster'] != -1){
			//window.location = 'survey.html';
			$('#pollster').css('display','none');
		}else{
			//list_poll = {value:'nombre'};
			var list_poll = localStorage['pollster_list'];
			if(list_poll){	
				addInputsSelect(JSON.parse(list_poll));
			}
		}
	}

	$('a[href="#actualizarPollster"]').on('click',function(e){
		e.preventDefault();
		var url = "http://yellowadmin.projects.spaceshiplabs.com/api/getPollsters/";
		//url = "http://yellowadmin/api/getPollsters/";
		$.ajax({
			url: url,
			crossDomain : true,
			type:'post',
			dataType : 'jsonp',
			success:function(d){
				localStorage['pollster_list'] = JSON.stringify(d);
				alert('Actualizado.');
				addInputsSelect(d);

			},
			error:function(d){
				alert('Problema al conectar.');
			}

		})


	});

	$('#pollster select').on('change',function(e){
		var val = $(this).val();
		if(val != -1){
			sessionStorage['pollster'] = val;
			$('#pollster').css('display','none');
		}
	});
});

function changeQuestion(index){
	var $survey = $('.survey');
	$survey.removeClass('on');
	$('.range .circle.select').removeClass('select');
	$survey.find('p').html(survey[index].es);
	$survey.find('hr + p').html(survey[index].en);
	if(score[index-1]!=0 && index<10){
		$('.'+score[index-1]).find('.circle').addClass('select');
	}
	$survey.find('.type.on').removeClass('on');
	$survey.find('.type.'+survey[index].type).addClass('on');
	$survey.addClass('on');
}

function saveText(i,val){
	var index = 9;
	if($(this).parent().parent().parent().parent().hasClass('save')){
		index = 10;
	}
	score[index].push($(val).val());
}

function addInputsSelect(list_poll){
	$('#pollster select option + option').remove();
	inputs = ""
	for(var i in list_poll){
		inputs += "<option value='"+i+"'>"+list_poll[i]+"</option>";
	}
	$('#pollster select').append(inputs);
}
