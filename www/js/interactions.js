//var score = [0,0,0,0,0,0,0,0,0,0,0];
var score = [];
$(function(){
	$('#content').on('click','.box',function(e){
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
			survey = getSelectedSurvey()
			, q = survey[index]
			, box = $('.box');
			if(q && q.ifNoTo && score[index-1]=='no'){
				$(box[index]).trigger('click');
				$(box[index++]).addClass('completed');
			}
			$(box[index]).trigger('click');	
		},200);
	})


	$('.type ul li input').on('click',function(e){
		$('.type ul li span.on').removeClass('on');
		$(this).prev().addClass('on');
	})

	$('#content').on('click','li .save',function(e){
		e.preventDefault();
		//save text
		if($('.mail.valid').size()==0 && $('.mail').val()!=""){
			return 0;
		}
		
		var types = JSON.parse(localStorage['types']),
		survey = getSelectedSurvey();
		for(var i in survey){
			var type = survey[i].type_question,
			index = i-1;
			type = types[type]
			if(type.multiple == 0){
				score[index] = [];
				$('.input.'+(index+1)).find('ul li input').each(saveText);	
			}
		}

		score.push(sessionStorage['pollster']);
		score.push(sessionStorage['survey_selected']);
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

	$('a[href="#exportar"]').on('click',function(e){
		e.preventDefault();
		survey = getSelectedSurvey();
		var csv = '';
		for(var i in survey){
			csv += survey[i].en+',';
		}
		//csv = csv.substr(0,csv.length-1);
		csv +="pollster";
		csv +='\n';
		var data,
		listPoll = JSON.parse(localStorage['pollster_list']),
		listSurvey = JSON.parse(localStorage['survey_list']);
		for(i in localStorage){
			if(isFinite(i)){
				data = JSON.parse(localStorage[i]);
				for(var j in data){
					if(data[j].constructor == Array){
						data[j] = '"'+data[j].toString() +'"';
					}

				}
				var length = data.length-1;
				if(isFinite(parseInt(data[length-1]))){
					data[length-1] = listPoll[data[length-1]];
					data[length] = listSurvey[data[length]]
				}else{
					data[length] = listPoll[data[length]]
					data.push(listSurvey[1]);
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
					var length = data[i].length-1
					, survey_selected;
					if(isFinite(parseInt(data[i][length-1]))){
						survey_selected = data[i][length];
					}else{
						survey_selected = 1;
					}
					var survey = getSelectedSurvey(survey_selected)
					,position;
					for(var j in survey){
						if(survey[j].type_question == 4){
							position = j-1;
							break;
						}
					}
					if(position){
						data[i][position][2] = d[i];
						localStorage[i] = JSON.stringify(data[i]);
					}
				}
				alert('Actualizado.');
			},
			error:function(d){
				alert('Problema al conectar.');
			}

		})	
	});

	
	var wrap = $('#wrap');
	if(wrap.hasClass('init_survey')){//survey
		var survey = getSelectedSurvey();
		drawViewFromData(survey);
		$('.box.on').trigger('click');
		/*
		sessionStorage['mode_survey'] = 1;
		document.addEventListener('backbutton',function(){
			window.location = 'survey.html';
		},false)
		*/
	}
	
	
	if($('#wrap').hasClass('main')){//index
		if(sessionStorage['pollster'] && sessionStorage['pollster'] != -1 && sessionStorage['survey_selected'] != undefined){
			//window.location = 'survey.html';
			$('#pollster').css('display','none');
		}else{
			var list_poll = localStorage['pollster_list'],
			survey_list = localStorage['survey_list'];
			if(list_poll && list_poll!='undefined'){	
				addInputsSelect(JSON.parse(list_poll),'pollster-list');
			}
			if(survey_list && survey_list!='undefined'){
				addInputsSelect(JSON.parse(survey_list),'survey-list');
			}
		}
	}

	$('a[href="#actualizarPollster"]').on('click',function(e){
		e.preventDefault();
		var url = "http://yellowadmin.projects.spaceshiplabs.com/api/getSurveys/";
		//url = "http://yellowadmin/api/getSurveys";
		$.ajax({
			url: url,
			crossDomain : true,
			type:'post',
			dataType : 'jsonp',
			success:function(d){
				localStorage['pollster_list'] = JSON.stringify(d.pollster_list);
				localStorage['survey_data'] = JSON.stringify(d.surveys);
				localStorage['survey_list'] = JSON.stringify(d.heads);
				localStorage['types'] = JSON.stringify(d.type);
				addInputsSelect(d.pollster_list,'pollster-list');
				addInputsSelect(d.heads,'survey-list');
				alert('Actualizado.');
			},
			error:function(d){
				alert('Problema al conectar.');
			}

		})


	});

	$('#pollster select').on('change',function(e){
		if($('select.pollster-list').val() != -1 && $('select.survey-list').val() != -1)
			$('#pollster').css('display','none');
	});

	$('#pollster select.pollster-list').on('change',function(e){
		var val = $(this).val();
		if(val != -1){
			sessionStorage['pollster'] = val;
		}
	});

	$('#pollster select.survey-list').on('change',function(e){
		var val = $(this).val();
		if(val != -1){
			sessionStorage['survey_selected'] = val;
		}
	});

	$('#content').on("keyup",'.mail',function(e){
		var $this = $(this);
		$this.addClass('notvalid');
		if(isEmail($this.val()) || $this.val()==""){
			$this.addClass('valid')
				.removeClass('notvalid')
				.parent()
				.addClass('valid');
			$('li a.save').css('opacity',1);
		}else{
			$this.removeClass('valid').parent().removeClass('valid');
			$('li a.save').css('opacity',.5);
		}
	});

	$('#content').on('click','input',function(e){
		setTimeout(function(){
		 	$('html,body').scrollTop(10000);
		},190);
	});
});

function changeQuestion(index){
	var survey = getSelectedSurvey()
	, types = JSON.parse(localStorage['types']);
	$survey = $('.survey');
	$survey.removeClass('on');
	$('.range .circle.select').removeClass('select');
	$survey.find('p').html(survey[index].es);
	$survey.find('hr + p').html(survey[index].en);

	var type = types[survey[index].type_question],
	type_selected;
	
	var options_en = JSON.parse(type.answer_en || '[]')
	, options_es = JSON.parse(type.answer_es || '[]');

	var textType = $('.type.input.only').clone();
	textType.removeClass('only')
	if(+type.save){
		type_selected = survey[index].position;
		if(!$('.type.input.'+type_selected).size()){
			textType.addClass(type_selected)
			template = "<li><span class='circle'>$n</span><input type='text' placeholder='$en $es'></input></li>";
			setTextPlaceholder(template,textType,options_en,options_es);
			textType.find('ul').append('<li><a class="save" href="#">Guardar | Save</a></li>')
		}
	}else if(+type.multiple){
		if(options_en.length == 3){
			type_selected = 'buttons';
		}else{
			type_selected = 'button';
		}
	}else if(options_en.length){
		type_selected = survey[index].position;
		if(!$('.type.input.'+type_selected).size()){
			//var txt = $('.type.text ul'),
			textType.addClass(type_selected);
			template = '<li><span class="circle">$n</span><input type="text" placeholder="$en$es" /></li>';
			setTextPlaceholder(template,textType,options_en,options_es);	
		}
	}
	else
		return 0;

	if(score[index-1]!=undefined && score[index-1].constructor != Array ){
		$('.'+score[index-1]).find('.circle').addClass('select');
	}
	$survey.find('.type.on').removeClass('on');
	$survey.find('.type.'+type_selected).addClass('on');
	$survey.addClass('on');
	if(type_selected != 'buttons' && type_selected != 'button')
		$('html,body').scrollTop(10000);
}

function saveText(i,val){
	var index = $(this).parent().parent().parent().parent();
	index = +index.attr('class').replace('type','').replace('input','').replace('on','').trim()-1
	score[index].push($(val).val());
}

function addInputsSelect(list_poll,list){
	$('#pollster select.'+list+' option + option').remove();
	inputs = ""
	for(var i in list_poll){
		inputs += "<option value='"+i+"'>"+list_poll[i]+"</option>";
	}
	$('#pollster select.'+list).append(inputs);
}

function drawViewFromData(data){
	var num = $('#content .boxes'),
	j = 0;

	for(var i in data){
		j++;
		num.append('<a class="box" href="">'+i+'</a>');
	}

	var width = num.width()/(j);
	$('.boxes .box').width(width);
	
	score = new Array(j);
	num.find('a').eq(0).addClass('completed on');
}

function setTextPlaceholder(template,container,options_en,options_es){
	var ul = container.find('ul');
	if(ul.find('li').size())
		return 0;
	for(var i=0;i<options_en.length;i++){
		var tmp = template.replace("$n",i+1);
		tmp = tmp.replace("$en",options_en[i]);
		tmp = tmp.replace("$es",options_es[i]);
		if(options_en[i] == "E-mail")
			tmp = tmp.replace("input","input class='mail' ");
		ul.append(tmp);
	}
	$('.survey').append(container);
}

function getSelectedSurvey(survey_index){
	var survey = JSON.parse(localStorage['survey_data']),
	survey_selected = survey_index || sessionStorage['survey_selected'];
	survey = survey[survey_selected];
	return survey;
}

function isEmail(email){
	return  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(email);
}
