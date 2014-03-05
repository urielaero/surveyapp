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
		localStorage[$('.hidden.id').html()] = JSON.stringify(score);
		window.location = 'index.html';
		//window.location = 'survey.html';
	})

	$('.hidden.id').html(localStorage.length)

	$('.box.on').trigger('click');

	$('a[href="#exportar"]').on('click',function(e){
		e.preventDefault();	
		var csv = '';
		for(var i in survey){
			csv += survey[i].en+',';
		}
		csv = csv.substr(0,csv.length-1);
		csv +='\n';
		var data;
		for(i in localStorage){
			if(isFinite(i)){
				data = JSON.parse(localStorage[i]);
				for(var j in data){
					if(data[j].constructor == Array){
						data[j] = '"'+data[j].toString() +'"';
					}
				}
				csv += data.toString()+'\n';
			}

		}
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
				for(var i in data){
					data[i][10][2] = d[i];
					localStorage[i] = JSON.stringify(data[i])
				}
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

	if($('#wrap').hasClass('main'))//index
		if(sessionStorage['mode_survey'])
			window.location = 'survey.html';
	*/
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
